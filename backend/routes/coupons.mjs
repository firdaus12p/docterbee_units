import express from "express";
import { query, queryOne } from "../db.mjs";

const router = express.Router();

// POST /api/coupons/validate - Validate promo code (public)
router.post("/validate", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: "Kode promo harus diisi",
      });
    }

    const coupon = await queryOne(
      `SELECT * FROM coupons 
       WHERE code = ? 
       AND is_active = 1 
       AND (expires_at IS NULL OR expires_at > NOW())
       AND (max_uses IS NULL OR used_count < max_uses)`,
      [code.toUpperCase()]
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        valid: false,
        error: "Kode promo tidak valid atau sudah kadaluarsa",
      });
    }

    res.json({
      success: true,
      valid: true,
      message: "Kode promo valid!",
      data: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        minBookingValue: coupon.min_booking_value,
      },
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    res.status(500).json({
      success: false,
      error: "Gagal memvalidasi kode promo",
    });
  }
});

// GET /api/coupons - List all coupons (admin only)
router.get("/", async (req, res) => {
  try {
    const { active, limit = 50 } = req.query;

    let sql = "SELECT * FROM coupons WHERE 1=1";
    const params = [];

    if (active !== undefined) {
      sql += " AND is_active = ?";
      params.push(active === "true" ? 1 : 0);
    }

    sql += " ORDER BY created_at DESC LIMIT ?";
    params.push(parseInt(limit));

    const coupons = await query(sql, params);

    res.json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data kode promo",
    });
  }
});

// GET /api/coupons/:id - Get single coupon (admin only)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await queryOne("SELECT * FROM coupons WHERE id = ?", [id]);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: "Kode promo tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil detail kode promo",
    });
  }
});

// POST /api/coupons - Create new coupon (admin only)
router.post("/", async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minBookingValue,
      maxUses,
      expiresAt,
    } = req.body;

    // Validation
    if (!code || !discountType || !discountValue) {
      return res.status(400).json({
        success: false,
        error: "Kode, tipe diskon, dan nilai diskon harus diisi",
      });
    }

    // Check if code already exists
    const existing = await queryOne("SELECT id FROM coupons WHERE code = ?", [
      code.toUpperCase(),
    ]);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Kode promo sudah ada",
      });
    }

    // Insert coupon
    const result = await query(
      `INSERT INTO coupons 
       (code, description, discount_type, discount_value, min_booking_value, max_uses, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        code.toUpperCase(),
        description || null,
        discountType,
        discountValue,
        minBookingValue || 0,
        maxUses || null,
        expiresAt || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Kode promo berhasil dibuat",
      data: {
        id: result.insertId,
        code: code.toUpperCase(),
      },
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({
      success: false,
      error: "Gagal membuat kode promo",
    });
  }
});

// PATCH /api/coupons/:id - Update coupon (admin only)
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      description,
      discountType,
      discountValue,
      minBookingValue,
      maxUses,
      isActive,
      expiresAt,
    } = req.body;

    // Check if coupon exists
    const existing = await queryOne("SELECT id FROM coupons WHERE id = ?", [
      id,
    ]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Kode promo tidak ditemukan",
      });
    }

    const updates = [];
    const params = [];

    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description);
    }
    if (discountType) {
      updates.push("discount_type = ?");
      params.push(discountType);
    }
    if (discountValue !== undefined) {
      updates.push("discount_value = ?");
      params.push(discountValue);
    }
    if (minBookingValue !== undefined) {
      updates.push("min_booking_value = ?");
      params.push(minBookingValue);
    }
    if (maxUses !== undefined) {
      updates.push("max_uses = ?");
      params.push(maxUses);
    }
    if (isActive !== undefined) {
      updates.push("is_active = ?");
      params.push(isActive ? 1 : 0);
    }
    if (expiresAt !== undefined) {
      updates.push("expires_at = ?");
      params.push(expiresAt);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Tidak ada data untuk diupdate",
      });
    }

    params.push(id);

    await query(
      `UPDATE coupons SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: "Kode promo berhasil diupdate",
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengupdate kode promo",
    });
  }
});

// DELETE /api/coupons/:id - Delete coupon (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if coupon exists
    const existing = await queryOne("SELECT id FROM coupons WHERE id = ?", [
      id,
    ]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Kode promo tidak ditemukan",
      });
    }

    // Hard delete - permanently remove from database
    await query("DELETE FROM coupons WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Kode promo berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menghapus kode promo",
    });
  }
});

export default router;
