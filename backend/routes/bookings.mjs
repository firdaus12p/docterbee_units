import express from "express";
import { query, queryOne } from "../db.mjs";

const router = express.Router();

// GET /api/bookings - List all bookings with optional filters
router.get("/", async (req, res) => {
  try {
    const { status, date, branch, limit = 100, offset = 0 } = req.query;

    let sql = "SELECT * FROM bookings WHERE 1=1";
    const params = [];

    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }

    if (date) {
      sql += " AND booking_date = ?";
      params.push(date);
    }

    if (branch) {
      sql += " AND branch = ?";
      params.push(branch);
    }

    sql += " ORDER BY booking_date DESC, booking_time DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const bookings = await query(sql, params);

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data booking",
    });
  }
});

// GET /api/bookings/:id - Get single booking detail
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await queryOne("SELECT * FROM bookings WHERE id = ?", [id]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil detail booking",
    });
  }
});

// POST /api/bookings - Create new booking
router.post("/", async (req, res) => {
  try {
    const {
      serviceName,
      branch,
      practitioner,
      date,
      time,
      mode,
      customerName,
      customerPhone,
      customerAge,
      customerGender,
      customerAddress,
      promoCode,
      notes,
    } = req.body;

    // Validation
    if (!serviceName || !branch || !practitioner || !date || !time || !mode) {
      return res.status(400).json({
        success: false,
        error: "Data booking tidak lengkap",
      });
    }

    // Validate customer data if provided
    if (
      customerName ||
      customerPhone ||
      customerAge ||
      customerGender ||
      customerAddress
    ) {
      if (
        !customerName ||
        !customerPhone ||
        !customerAge ||
        !customerGender ||
        !customerAddress
      ) {
        return res.status(400).json({
          success: false,
          error: "Data pribadi harus diisi lengkap",
        });
      }
    }

    // Calculate discount if promo code provided
    let discountAmount = 0;
    if (promoCode) {
      const coupon = await queryOne(
        `SELECT * FROM coupons 
         WHERE code = ? 
         AND is_active = 1 
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (max_uses IS NULL OR used_count < max_uses)`,
        [promoCode]
      );

      if (coupon) {
        // Simple discount calculation (can be enhanced)
        if (coupon.discount_type === "percentage") {
          discountAmount = coupon.discount_value; // Store percentage value
        } else {
          discountAmount = coupon.discount_value; // Store fixed amount
        }

        // Increment usage count
        await query(
          "UPDATE coupons SET used_count = used_count + 1 WHERE id = ?",
          [coupon.id]
        );
      }
    }

    // Insert booking
    const result = await query(
      `INSERT INTO bookings 
       (service_name, branch, practitioner, booking_date, booking_time, mode, customer_name, customer_phone, customer_age, customer_gender, customer_address, promo_code, discount_amount, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        serviceName,
        branch,
        practitioner,
        date,
        time,
        mode,
        customerName || null,
        customerPhone || null,
        customerAge || null,
        customerGender || null,
        customerAddress || null,
        promoCode || null,
        discountAmount,
        notes || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Booking berhasil dibuat",
      data: {
        id: result.insertId,
        serviceName,
        branch,
        practitioner,
        date,
        time,
        mode,
        customerName,
        customerPhone,
        customerAge,
        customerGender,
        customerAddress,
        promoCode,
        discountAmount,
      },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      error: "Gagal membuat booking",
    });
  }
});

// PATCH /api/bookings/:id - Update booking status or notes
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Check if booking exists
    const existing = await queryOne("SELECT id FROM bookings WHERE id = ?", [
      id,
    ]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Booking tidak ditemukan",
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

    await query(
      `UPDATE bookings SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: "Booking berhasil diupdate",
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengupdate booking",
    });
  }
});

export default router;
