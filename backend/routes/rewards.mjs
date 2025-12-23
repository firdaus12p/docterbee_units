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
      `INSERT INTO rewards (name, description, points_cost, color_theme, is_active, sort_order) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || null,
        points_cost,
        color_theme || "amber",
        is_active !== undefined ? is_active : 1,
        sort_order || 0,
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
