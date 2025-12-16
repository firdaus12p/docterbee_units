import express from "express";
import { query, queryOne } from "../db.mjs";

const router = express.Router();

/**
 * Get service price from database
 * @param {string} serviceName - Name of the service
 * @returns {Promise<number>} Price in IDR (0 if not found)
 */
async function getServicePrice(serviceName) {
  const service = await queryOne(
    "SELECT price FROM services WHERE name = ? AND is_active = 1 LIMIT 1",
    [serviceName]
  );
  return service?.price || 0;
}

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
      // Accept prices from frontend (already calculated with promo)
      price: frontendPrice,
      discountAmount: frontendDiscountAmount,
      finalPrice: frontendFinalPrice,
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

    // Use frontend prices if provided, otherwise get from database
    const price = frontendPrice || (await getServicePrice(serviceName));
    let discountAmount = frontendDiscountAmount || 0;
    let finalPrice = frontendFinalPrice || price;

    // Only recalculate if frontend didn't provide prices AND promo code exists
    if (!frontendPrice && promoCode) {
      const coupon = await queryOne(
        `SELECT * FROM coupons 
         WHERE code = ? 
         AND is_active = 1 
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (max_uses IS NULL OR used_count < max_uses)`,
        [promoCode]
      );

      if (coupon) {
        // Calculate discount in Rupiah
        if (coupon.discount_type === "percentage") {
          discountAmount = Math.round((price * coupon.discount_value) / 100);
        } else {
          discountAmount = coupon.discount_value;
        }

        // Calculate final price
        finalPrice = Math.max(0, price - discountAmount);

        // Increment usage count
        await query(
          "UPDATE coupons SET used_count = used_count + 1 WHERE id = ?",
          [coupon.id]
        );
      }
    } else if (frontendPrice && promoCode) {
      // If frontend provided prices with promo code, still increment coupon usage
      const coupon = await queryOne(
        `SELECT * FROM coupons 
         WHERE code = ? 
         AND is_active = 1`,
        [promoCode]
      );

      if (coupon) {
        await query(
          "UPDATE coupons SET used_count = used_count + 1 WHERE id = ?",
          [coupon.id]
        );
      }
    }

    // Insert booking
    const result = await query(
      `INSERT INTO bookings 
       (service_name, branch, practitioner, booking_date, booking_time, mode, price, customer_name, customer_phone, customer_age, customer_gender, customer_address, promo_code, discount_amount, final_price, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        serviceName,
        branch,
        practitioner,
        date,
        time,
        mode,
        price,
        customerName || null,
        customerPhone || null,
        customerAge || null,
        customerGender || null,
        customerAddress || null,
        promoCode || null,
        discountAmount,
        finalPrice,
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
        price,
        customerName,
        customerPhone,
        customerAge,
        customerGender,
        customerAddress,
        promoCode,
        discountAmount,
        finalPrice,
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

// GET /api/bookings/prices/:serviceName - Get service price
// IMPORTANT: This must be before /:id routes to avoid conflict
router.get("/prices/:serviceName", async (req, res) => {
  try {
    const { serviceName } = req.params;
    const decodedServiceName = decodeURIComponent(serviceName);

    // Get price from database
    const price = await getServicePrice(decodedServiceName);

    if (price === 0) {
      return res.status(404).json({
        success: false,
        error: "Service tidak ditemukan atau harga belum tersedia",
      });
    }

    res.json({
      success: true,
      data: {
        serviceName: decodedServiceName,
        price,
      },
    });
  } catch (error) {
    console.error("Error getting service price:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil harga service",
    });
  }
});

// DELETE /api/bookings/:id - Delete booking permanently
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

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

    // Hard delete
    await query("DELETE FROM bookings WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Booking berhasil dihapus secara permanen",
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menghapus booking",
    });
  }
});

export default router;
