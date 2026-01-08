import express from "express";
import { query, queryOne } from "../db.mjs";
import { requireAdmin } from "../middleware/auth.mjs";

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// GET /api/event-registrations/event/:eventId - Get event details for registration form
router.get("/event/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await queryOne(
      `SELECT id, title, event_date, mode, topic, description, speaker, 
              registration_fee, registration_deadline, location, link
       FROM events 
       WHERE id = ? AND is_active = 1`,
      [eventId]
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event tidak ditemukan atau sudah tidak aktif",
      });
    }

    // Check if registration deadline has passed
    if (event.registration_deadline) {
      const deadline = new Date(event.registration_deadline);
      const now = new Date();
      if (now > deadline) {
        return res.status(400).json({
          success: false,
          error: "Pendaftaran untuk event ini sudah ditutup",
        });
      }
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error fetching event for registration:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data event",
    });
  }
});

// POST /api/event-registrations - Register for an event (public)
router.post("/", async (req, res) => {
  try {
    const {
      eventId,
      customerName,
      customerPhone,
      customerEmail,
      customerAge,
      customerGender,
      customerAddress,
      promoCode,
      notes,
    } = req.body;

    // Validation
    if (!eventId || !customerName || !customerPhone) {
      return res.status(400).json({
        success: false,
        error: "Event ID, Nama, dan No. HP wajib diisi",
      });
    }

    // Phone validation (Indonesian format)
    const phoneRegex = /^(08|\+?628)[0-9]{8,13}$/;
    if (!phoneRegex.test(customerPhone.replace(/[\s-]/g, ""))) {
      return res.status(400).json({
        success: false,
        error: "Format nomor HP tidak valid",
      });
    }

    // Check if event exists and is active
    const event = await queryOne(
      `SELECT id, title, registration_fee, registration_deadline 
       FROM events 
       WHERE id = ? AND is_active = 1`,
      [eventId]
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event tidak ditemukan atau sudah tidak aktif",
      });
    }

    // Check registration deadline
    if (event.registration_deadline) {
      const deadline = new Date(event.registration_deadline);
      const now = new Date();
      if (now > deadline) {
        return res.status(400).json({
          success: false,
          error: "Pendaftaran untuk event ini sudah ditutup",
        });
      }
    }

    // Check if already registered (same phone for same event)
    const existingReg = await queryOne(
      `SELECT id FROM event_registrations 
       WHERE event_id = ? AND customer_phone = ? AND status != 'cancelled'`,
      [eventId, customerPhone.replace(/[\s-]/g, "")]
    );

    if (existingReg) {
      return res.status(400).json({
        success: false,
        error: "Nomor HP ini sudah terdaftar untuk event ini",
      });
    }

    // Get registration fee from event
    const registrationFee = event.registration_fee || 0;
    let discountAmount = 0;
    let finalFee = registrationFee;

    // Calculate discount if promo code is provided
    if (promoCode && registrationFee > 0) {
      const coupon = await queryOne(
        `SELECT * FROM coupons 
         WHERE code = ? 
         AND is_active = 1 
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (max_uses IS NULL OR used_count < max_uses)
         AND (coupon_type = 'services' OR coupon_type = 'both')`,
        [promoCode.toUpperCase()]
      );

      if (coupon) {
        // Check minimum value
        if (coupon.min_booking_value && registrationFee < coupon.min_booking_value) {
          return res.status(400).json({
            success: false,
            error: `Minimum biaya untuk kupon ini adalah Rp ${coupon.min_booking_value.toLocaleString("id-ID")}`,
          });
        }

        // Calculate discount
        if (coupon.discount_type === "percentage") {
          discountAmount = Math.round((registrationFee * coupon.discount_value) / 100);
        } else {
          discountAmount = coupon.discount_value;
        }

        finalFee = Math.max(0, registrationFee - discountAmount);

        // Increment coupon usage
        await query("UPDATE coupons SET used_count = used_count + 1 WHERE id = ?", [coupon.id]);
      }
    }

    // Insert registration
    const result = await query(
      `INSERT INTO event_registrations 
       (event_id, customer_name, customer_phone, customer_email, customer_age, 
        customer_gender, customer_address, registration_fee, promo_code, 
        discount_amount, final_fee, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventId,
        customerName,
        customerPhone.replace(/[\s-]/g, ""),
        customerEmail || null,
        customerAge || null,
        customerGender || null,
        customerAddress || null,
        registrationFee,
        promoCode ? promoCode.toUpperCase() : null,
        discountAmount,
        finalFee,
        notes || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Pendaftaran berhasil!",
      data: {
        id: result.insertId,
        eventTitle: event.title,
        customerName,
        customerPhone,
        registrationFee,
        discountAmount,
        finalFee,
      },
    });
  } catch (error) {
    console.error("Error creating event registration:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mendaftar event",
    });
  }
});

// ==================== ADMIN ROUTES ====================

// GET /api/event-registrations - List all registrations (admin only)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const { eventId, status, limit = 100, offset = 0 } = req.query;

    let sql = `
      SELECT er.*, e.title as event_title, e.event_date, e.mode as event_mode
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (eventId) {
      sql += " AND er.event_id = ?";
      params.push(eventId);
    }

    if (status) {
      sql += " AND er.status = ?";
      params.push(status);
    }

    sql += " ORDER BY er.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const registrations = await query(sql, params);

    res.json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data pendaftaran",
    });
  }
});

// GET /api/event-registrations/:id - Get single registration detail (admin only)
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await queryOne(
      `SELECT er.*, e.title as event_title, e.event_date, e.mode as event_mode, 
              e.speaker, e.location
       FROM event_registrations er
       JOIN events e ON er.event_id = e.id
       WHERE er.id = ?`,
      [id]
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: "Pendaftaran tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error("Error fetching registration detail:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil detail pendaftaran",
    });
  }
});

// PATCH /api/event-registrations/:id - Update registration status (admin only)
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Check if registration exists
    const existing = await queryOne("SELECT id FROM event_registrations WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Pendaftaran tidak ditemukan",
      });
    }

    const updates = [];
    const params = [];

    if (status) {
      updates.push("status = ?");
      params.push(status);
    }

    if (notes !== undefined) {
      updates.push("notes = ?");
      params.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Tidak ada data untuk diupdate",
      });
    }

    params.push(id);

    await query(`UPDATE event_registrations SET ${updates.join(", ")} WHERE id = ?`, params);

    res.json({
      success: true,
      message: "Pendaftaran berhasil diupdate",
    });
  } catch (error) {
    console.error("Error updating registration:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengupdate pendaftaran",
    });
  }
});

// DELETE /api/event-registrations/:id - Delete registration (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if registration exists
    const existing = await queryOne("SELECT id FROM event_registrations WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Pendaftaran tidak ditemukan",
      });
    }

    await query("DELETE FROM event_registrations WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Pendaftaran berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting registration:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menghapus pendaftaran",
    });
  }
});

// GET /api/event-registrations/stats/by-event - Get registration stats per event (admin only)
router.get("/stats/by-event", requireAdmin, async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        e.id as event_id,
        e.title,
        e.event_date,
        e.mode,
        COUNT(er.id) as total_registrations,
        SUM(CASE WHEN er.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_count,
        SUM(CASE WHEN er.status = 'attended' THEN 1 ELSE 0 END) as attended_count,
        SUM(er.final_fee) as total_revenue
      FROM events e
      LEFT JOIN event_registrations er ON e.id = er.event_id AND er.status != 'cancelled'
      WHERE e.is_active = 1
      GROUP BY e.id
      ORDER BY e.event_date DESC
    `);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching registration stats:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil statistik pendaftaran",
    });
  }
});

export default router;
