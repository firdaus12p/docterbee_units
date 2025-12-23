import express from "express";
import bcrypt from "bcryptjs";
import { query, queryOne } from "../db.mjs";
import { requireAdmin } from "../middleware/auth.mjs";

const router = express.Router();

// ============================================
// ALL ROUTES BELOW REQUIRE ADMIN AUTHENTICATION
// These are admin-only user management operations
// ============================================

// ============================================
// GET /api/users - Get all users
// ============================================
router.get("/", requireAdmin, async (req, res) => {
  try {
    const users = await query(`
      SELECT u.id, u.name, u.email, u.phone, u.created_at, u.is_active,
             COALESCE(up.points, 0) as points
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data users",
    });
  }
});

// ============================================
// GET /api/users/:id - Get single user
// ============================================
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await queryOne(
      `SELECT id, name, email, phone, created_at, is_active
       FROM users
       WHERE id = ?`,
      [id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data user",
    });
  }
});

// ============================================
// PATCH /api/users/:id/password - Reset user password
// ============================================
router.patch("/:id/password", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    // Validation
    if (!password) {
      return res.status(400).json({
        success: false,
        error: "Password harus diisi",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password minimal 6 karakter",
      });
    }

    // Check if user exists
    const user = await queryOne("SELECT id, email FROM users WHERE id = ?", [
      id,
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User tidak ditemukan",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    await query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      id,
    ]);

    res.json({
      success: true,
      message: "Password berhasil direset",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      error: "Gagal reset password",
    });
  }
});

// ============================================
// PATCH /api/users/:id/toggle - Toggle user active status
// ============================================
router.patch("/:id/toggle", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await queryOne(
      "SELECT id, is_active FROM users WHERE id = ?",
      [id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User tidak ditemukan",
      });
    }

    // Toggle active status
    const newStatus = user.is_active === 1 ? 0 : 1;
    await query("UPDATE users SET is_active = ? WHERE id = ?", [newStatus, id]);

    res.json({
      success: true,
      message: `User berhasil ${
        newStatus === 1 ? "diaktifkan" : "dinonaktifkan"
      }`,
      data: { is_active: newStatus },
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengubah status user",
    });
  }
});

// ============================================
// DELETE /api/users/:id - Delete user (hard delete)
// ============================================
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await queryOne("SELECT id, email FROM users WHERE id = ?", [
      id,
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User tidak ditemukan",
      });
    }

    // Delete user
    await query("DELETE FROM users WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "User berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menghapus user",
    });
  }
});

// ============================================
// GET /api/users/:id/rewards - Get user reward redemptions history (admin)
// ============================================
router.get("/:id/rewards", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await queryOne("SELECT id, name FROM users WHERE id = ?", [
      id,
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User tidak ditemukan",
      });
    }

    // Get reward redemptions
    const rewards = await query(
      "SELECT id, reward_name, points_cost, redeemed_at, status FROM reward_redemptions WHERE user_id = ? ORDER BY redeemed_at DESC",
      [id]
    );

    res.json({
      success: true,
      data: {
        user: user,
        rewards: rewards,
      },
    });
  } catch (error) {
    console.error("Error fetching user rewards:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil riwayat reward",
    });
  }
});

// ============================================
// PATCH /api/users/:userId/rewards/:redemptionId/approve - Approve reward redemption (admin)
// ============================================
router.patch("/:userId/rewards/:redemptionId/approve", requireAdmin, async (req, res) => {
  try {
    const { userId, redemptionId } = req.params;

    // Check if redemption exists
    const redemption = await queryOne(
      "SELECT id, user_id, reward_name, status FROM reward_redemptions WHERE id = ? AND user_id = ?",
      [redemptionId, userId]
    );

    if (!redemption) {
      return res.status(404).json({
        success: false,
        error: "Redemption tidak ditemukan",
      });
    }

    if (redemption.status === "approved") {
      return res.status(400).json({
        success: false,
        error: "Redemption sudah di-approve",
      });
    }

    // Update status to approved
    await query(
      "UPDATE reward_redemptions SET status = 'approved' WHERE id = ?",
      [redemptionId]
    );

    res.json({
      success: true,
      message: "Redemption berhasil di-approve",
    });
  } catch (error) {
    console.error("Error approving redemption:", error);
    res.status(500).json({
      success: false,
      error: "Gagal approve redemption",
    });
  }
});

export default router;
