import express from "express";
import { query, queryOne } from "../db.mjs";
import { requireAdmin } from "../middleware/auth.mjs";

const router = express.Router();

// ============================================
// PUBLIC ROUTES (for frontend display)
// ============================================

// GET /api/rewards - Get all active rewards (public)
router.get("/", async (req, res) => {
  try {
    const rewards = await query(
      "SELECT id, name, description, points_cost, color_theme FROM rewards WHERE is_active = 1 ORDER BY sort_order ASC, id ASC"
    );
    res.json({ success: true, rewards });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    res.status(500).json({ success: false, error: "Gagal memuat rewards" });
  }
});

// ============================================
// ADMIN ROUTES (for management)
// ============================================

// ============================================
// REDEMPTION MANAGEMENT (Admin)
// ============================================

// GET /api/rewards/admin/redemptions - Get all redemptions with user details
router.get("/admin/redemptions", requireAdmin, async (req, res) => {
  try {
    const { status, user_id, start_date, end_date } = req.query;
    
    let queryStr = `
      SELECT 
        rr.id,
        rr.user_id,
        rr.reward_id,
        rr.reward_name,
        rr.points_cost,
        rr.status,
        rr.coupon_code,
        rr.expires_at,
        rr.coupon_id,
        rr.redeemed_at,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone
      FROM reward_redemptions rr
      JOIN users u ON rr.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];

    if (status) {
      queryStr += " AND rr.status = ?";
      params.push(status);
    }
    
    if (user_id) {
      queryStr += " AND rr.user_id = ?";
      params.push(user_id);
    }

    if (start_date && end_date) {
      queryStr += " AND DATE(rr.redeemed_at) BETWEEN ? AND ?";
      params.push(start_date, end_date);
    }

    queryStr += " ORDER BY rr.redeemed_at DESC LIMIT 100";

    const redemptions = await query(queryStr, params);

    res.json({ success: true, redemptions });
  } catch (error) {
    console.error("Error fetching redemptions:", error);
    res.status(500).json({ success: false, error: "Gagal memuat data redemption" });
  }
});

// PATCH /api/rewards/admin/redemptions/:id/status - Update redemption status
router.patch("/admin/redemptions/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Support both old and new status values
    const validStatuses = ['pending', 'approved', 'rejected', 'active', 'used', 'expired', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: "Status tidak valid" });
    }

    // Get redemption details before update
    const redemption = await queryOne(
      "SELECT user_id, points_cost, status as current_status, coupon_id, coupon_code FROM reward_redemptions WHERE id = ?", 
      [id]
    );
    
    if (!redemption) {
      return res.status(404).json({ success: false, error: "Redemption tidak ditemukan" });
    }

    // Map statuses - keep values that exist in current ENUM
    // Current ENUM: 'pending', 'approved', 'rejected'
    // New statuses will work after ENUM is updated
    let normalizedStatus = status;
    // For now, map new → old for compatibility
    if (status === 'active') normalizedStatus = 'pending';
    if (status === 'used') normalizedStatus = 'approved';
    if (status === 'cancelled' || status === 'expired') normalizedStatus = 'rejected';

    // Update status
    await query(
      "UPDATE reward_redemptions SET status = ? WHERE id = ?",
      [normalizedStatus, id]
    );
    
    // Refund points if cancelled/rejected (and not already cancelled/rejected)
    if ((normalizedStatus === 'rejected' || status === 'cancelled') && 
        redemption.current_status !== 'rejected' && 
        redemption.current_status !== 'cancelled') {
      await query("UPDATE user_progress SET points = points + ? WHERE user_id = ?", [
        redemption.points_cost,
        redemption.user_id
      ]);
      
      // Also deactivate the associated coupon
      if (redemption.coupon_id) {
        await query("UPDATE coupons SET is_active = 0 WHERE id = ?", [redemption.coupon_id]);
      }
      if (redemption.coupon_code) {
        await query("UPDATE coupons SET is_active = 0 WHERE code = ?", [redemption.coupon_code]);
      }
    }

    res.json({ success: true, message: `Status update: ${normalizedStatus}` });
  } catch (error) {
    console.error("Error updating redemption:", error);
    res.status(500).json({ success: false, error: "Gagal mengupdate status" });
  }
});

// GET /api/rewards/admin/all - Get all rewards including inactive (admin only)
router.get("/admin/all", requireAdmin, async (req, res) => {
  try {
    const rewards = await query(
      "SELECT * FROM rewards ORDER BY sort_order ASC, id ASC"
    );
    res.json({ success: true, rewards });
  } catch (error) {
    console.error("Error fetching all rewards:", error);
    res.status(500).json({ success: false, error: "Gagal memuat rewards" });
  }
});

// GET /api/rewards/admin/:id - Get single reward by ID (admin only)
router.get("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const reward = await queryOne("SELECT * FROM rewards WHERE id = ?", [
      req.params.id,
    ]);

    if (!reward) {
      return res
        .status(404)
        .json({ success: false, error: "Reward tidak ditemukan" });
    }

    res.json({ success: true, reward });
  } catch (error) {
    console.error("Error fetching reward:", error);
    res.status(500).json({ success: false, error: "Gagal memuat reward" });
  }
});

// POST /api/rewards/admin - Create new reward (admin only)
router.post("/admin", requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      points_cost,
      color_theme,
      is_active,
      sort_order,
      reward_type,
      target_product_id,
    } = req.body;

    // Validation
    if (!name || !points_cost) {
      return res.status(400).json({
        success: false,
        error: "Nama dan poin diperlukan",
      });
    }

    if (points_cost < 1) {
      return res.status(400).json({
        success: false,
        error: "Poin harus lebih dari 0",
      });
    }

    const result = await query(
      `INSERT INTO rewards (name, description, points_cost, color_theme, is_active, sort_order, reward_type, target_product_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || null,
        points_cost,
        color_theme || "amber",
        is_active !== undefined ? is_active : 1,
        sort_order || 0,
        reward_type || 'discount',
        target_product_id || null,
      ]
    );

    res.json({
      success: true,
      message: "Reward berhasil ditambahkan",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating reward:", error);
    res.status(500).json({ success: false, error: "Gagal menambahkan reward" });
  }
});

// PATCH /api/rewards/admin/:id - Update reward (admin only)
router.patch("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      points_cost,
      color_theme,
      is_active,
      sort_order,
      reward_type,
      target_product_id,
    } = req.body;
    const rewardId = req.params.id;

    // Check if reward exists
    const existing = await queryOne("SELECT id FROM rewards WHERE id = ?", [
      rewardId,
    ]);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: "Reward tidak ditemukan" });
    }

    // Validation
    if (points_cost !== undefined && points_cost < 1) {
      return res.status(400).json({
        success: false,
        error: "Poin harus lebih dari 0",
      });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description || null);
    }
    if (points_cost !== undefined) {
      updates.push("points_cost = ?");
      values.push(points_cost);
    }
    if (color_theme !== undefined) {
      updates.push("color_theme = ?");
      values.push(color_theme);
    }
    if (is_active !== undefined) {
      updates.push("is_active = ?");
      values.push(is_active);
    }
    if (sort_order !== undefined) {
      updates.push("sort_order = ?");
      values.push(sort_order);
    }
    // NEW: Handle reward_type and target_product_id
    if (reward_type !== undefined) {
      updates.push("reward_type = ?");
      values.push(reward_type);
    }
    if (target_product_id !== undefined) {
      updates.push("target_product_id = ?");
      values.push(target_product_id || null);
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Tidak ada data untuk diupdate" });
    }

    values.push(rewardId);

    await query(
      `UPDATE rewards SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    res.json({ success: true, message: "Reward berhasil diupdate" });
  } catch (error) {
    console.error("Error updating reward:", error);
    res.status(500).json({ success: false, error: "Gagal mengupdate reward" });
  }
});

// DELETE /api/rewards/admin/:id - Delete reward (admin only)
router.delete("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const rewardId = req.params.id;

    // Check if reward exists
    const existing = await queryOne("SELECT id FROM rewards WHERE id = ?", [
      rewardId,
    ]);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: "Reward tidak ditemukan" });
    }

    await query("DELETE FROM rewards WHERE id = ?", [rewardId]);

    res.json({ success: true, message: "Reward berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting reward:", error);
    res.status(500).json({ success: false, error: "Gagal menghapus reward" });
  }
});



export default router;
