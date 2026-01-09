import express from "express";
import { query, queryOne } from "../db.mjs";
import { requireAdmin, requireUser } from "../middleware/auth.mjs";

import crypto from "crypto";

const router = express.Router();

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate a unique ticket code with signature for security
 * Format: EVTK-{registrationId}-{randomHex}-{signature}
 */
function generateTicketCode(registrationId, eventId) {
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();
  const payload = `${registrationId}-${eventId}-${randomPart}`;
  const secretKey = process.env.TICKET_SECRET || "docterbee-event-2026";
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(payload)
    .digest("hex")
    .substring(0, 8)
    .toUpperCase();
  return `EVTK-${payload}-${signature}`;
}

/**
 * Verify ticket code signature
 */
function verifyTicketCode(ticketCode) {
  if (!ticketCode || !ticketCode.startsWith("EVTK-")) return false;
  const parts = ticketCode.split("-");
  if (parts.length < 5) return false;
  // Extract: EVTK, registrationId, eventId, randomPart, signature
  const regId = parts[1];
  const eventId = parts[2];
  const randomPart = parts[3];
  const providedSig = parts[4];
  const payload = `${regId}-${eventId}-${randomPart}`;
  const secretKey = process.env.TICKET_SECRET || "docterbee-event-2026";
  const expectedSig = crypto
    .createHmac("sha256", secretKey)
    .update(payload)
    .digest("hex")
    .substring(0, 8)
    .toUpperCase();
  return providedSig === expectedSig;
}

// ==================== PUBLIC ROUTES ====================

// GET /api/event-registrations/lookup/:phone - Lookup user's registrations by phone (public)
router.get("/lookup/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    
    // Normalize phone number
    const normalizedPhone = phone.replace(/[\s-]/g, "");
    
    if (!normalizedPhone || normalizedPhone.length < 10) {
      return res.status(400).json({
        success: false,
        error: "Nomor HP tidak valid",
      });
    }

    // Fetch all registrations for this phone number (not cancelled)
    const registrations = await query(
      `SELECT er.id, er.event_id, er.customer_name, er.customer_phone, 
              er.registration_fee, er.discount_amount, er.final_fee,
              er.status, er.ticket_code, er.created_at,
              e.title as event_title, e.event_date, e.mode as event_mode,
              e.location, e.speaker
       FROM event_registrations er
       JOIN events e ON er.event_id = e.id
       WHERE er.customer_phone = ? AND er.status != 'cancelled'
       ORDER BY e.event_date DESC`,
      [normalizedPhone]
    );

    // Add validity info to each registration
    const now = new Date();
    const enrichedRegistrations = registrations.map((reg) => {
      const eventDate = new Date(reg.event_date);
      // Set to end of event day
      eventDate.setHours(23, 59, 59, 999);
      const isExpired = now > eventDate;
      const isPending = reg.status === "pending";
      const isConfirmed = reg.status === "confirmed";
      const isAttended = reg.status === "attended";
      
      return {
        ...reg,
        is_expired: isExpired,
        is_pending: isPending,
        is_confirmed: isConfirmed,
        is_attended: isAttended,
        can_use_ticket: isConfirmed && !isExpired,
      };
    });

    res.json({
      success: true,
      count: enrichedRegistrations.length,
      data: enrichedRegistrations,
    });
  } catch (error) {
    console.error("Error looking up registrations:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data pendaftaran",
    });
  }
});

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
    // Allow registration until the END of the deadline day (23:59:59)
    if (event.registration_deadline) {
      const deadline = new Date(event.registration_deadline);
      // Set deadline to end of day (23:59:59.999)
      deadline.setHours(23, 59, 59, 999);
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

// ==================== AUTHENTICATED ROUTES ====================

// GET /api/event-registrations/my-tickets - Get logged-in user's tickets
router.get("/my-tickets", requireUser, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Fetch registrations for this user
    const registrations = await query(
      `SELECT er.id, er.event_id, er.customer_name, er.customer_phone, 
              er.registration_fee, er.discount_amount, er.final_fee,
              er.status, er.ticket_code, er.created_at,
              e.title as event_title, e.event_date, e.mode as event_mode,
              e.location, e.speaker
       FROM event_registrations er
       JOIN events e ON er.event_id = e.id
       WHERE er.user_id = ? AND er.status != 'cancelled'
       ORDER BY e.event_date DESC`,
      [userId]
    );

    // Add validity info to each registration
    const now = new Date();
    const enrichedRegistrations = registrations.map((reg) => {
      const eventDate = new Date(reg.event_date);
      // Set to end of event day
      eventDate.setHours(23, 59, 59, 999);
      const isExpired = now > eventDate;
      const isPending = reg.status === "pending";
      const isConfirmed = reg.status === "confirmed";
      const isAttended = reg.status === "attended";
      
      return {
        ...reg,
        is_expired: isExpired,
        is_pending: isPending,
        is_confirmed: isConfirmed,
        is_attended: isAttended,
        can_use_ticket: isConfirmed && !isExpired,
      };
    });

    res.json({
      success: true,
      data: enrichedRegistrations,
    });
  } catch (error) {
    console.error("Error fetching my tickets:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil tiket saya",
    });
  }
});

// POST /api/event-registrations - Create a new registration
router.post("/", requireUser, async (req, res) => {
  try {
    const userId = req.session.userId;
    const {
      eventId,
      customerName,
      customerPhone,
      customerEmail,
      customerAge,
      gender: customerGender,
      address: customerAddress,
      promoCode,
      notes,
    } = req.body;

    // Validate required fields
    if (!eventId || !customerName || !customerPhone) {
      return res.status(400).json({
        success: false,
        error: "Data wajib harus diisi (Event, Nama, No. HP)",
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
    // Allow registration until the END of the deadline day (23:59:59)
    if (event.registration_deadline) {
      const deadline = new Date(event.registration_deadline);
      // Set deadline to end of day (23:59:59.999)
      deadline.setHours(23, 59, 59, 999);
      const now = new Date();
      if (now > deadline) {
        return res.status(400).json({
          success: false,
          error: "Pendaftaran untuk event ini sudah ditutup",
        });
      }
    }

    // Check existing confirmed/pending registration for this user
    // We check either by user_id OR by phone number to be safe
    const existingReg = await queryOne(
      `SELECT id FROM event_registrations 
       WHERE event_id = ? AND status IN ('pending', 'confirmed') 
       AND (user_id = ? OR customer_phone = ?)`,
      [eventId, userId, customerPhone.replace(/[\s-]/g, "")]
    );

    if (existingReg) {
      return res.status(400).json({
        success: false,
        error: "Anda sudah terdaftar di event ini",
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
       (event_id, user_id, customer_name, customer_phone, customer_email, customer_age, 
        customer_gender, customer_address, registration_fee, promo_code, 
        discount_amount, final_fee, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventId,
        userId,
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

    // Generate and save ticket code
    const ticketCode = generateTicketCode(result.insertId, eventId);
    await query(
      "UPDATE event_registrations SET ticket_code = ? WHERE id = ?",
      [ticketCode, result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Pendaftaran berhasil!",
      data: {
        id: result.insertId,
        eventTitle: event.title,
        customerName,
        customerPhone: customerPhone.replace(/[\s-]/g, ""),
        registrationFee,
        discountAmount,
        finalFee,
        ticketCode,
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
