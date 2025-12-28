import express from "express";
import { query, queryOne } from "../db.mjs";
import { requireUser as requireAuth } from "../middleware/auth.mjs";

const router = express.Router();

// === USER PROGRESS (Journey + Points) ===

// GET user progress and points
router.get("/progress", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const progress = await queryOne(
      "SELECT unit_data, points, updated_at FROM user_progress WHERE user_id = ?",
      [userId]
    );

    if (!progress) {
      // Return empty state for new users
      return res.json({
        success: true,
        data: {
          unitData: {},
          points: 0,
          updatedAt: null,
        },
      });
    }

    res.json({
      success: true,
      data: {
        unitData: progress.unit_data,
        points: progress.points,
        updatedAt: progress.updated_at,
      },
    });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    res.status(500).json({ success: false, error: "Failed to fetch progress" });
  }
});

// POST save user progress and points
router.post("/progress", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { unitData, points } = req.body;

    // Validate input
    if (typeof unitData !== "object") {
      return res
        .status(400)
        .json({ success: false, error: "unitData must be an object" });
    }
    if (typeof points !== "number" || points < 0) {
      return res.status(400).json({
        success: false,
        error: "points must be a non-negative number",
      });
    }

    // Insert or update
    await query(
      `INSERT INTO user_progress (user_id, unit_data, points) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       unit_data = VALUES(unit_data),
       points = VALUES(points)`,
      [userId, JSON.stringify(unitData), points]
    );

    res.json({ success: true, message: "Progress saved successfully" });
  } catch (error) {
    console.error("Error saving user progress:", error);
    res.status(500).json({ success: false, error: "Failed to save progress" });
  }
});

// === REWARD REDEMPTIONS ===

// GET user reward redemptions history
router.get("/rewards", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const rewards = await query(
      "SELECT id, reward_name, points_cost, redeemed_at, status FROM reward_redemptions WHERE user_id = ? ORDER BY redeemed_at DESC",
      [userId]
    );

    res.json({
      success: true,
      data: rewards,
    });
  } catch (error) {
    console.error("Error fetching reward redemptions:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch reward history" });
  }
});

// POST redeem reward
router.post("/rewards/redeem", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { rewardName, pointsCost, rewardId } = req.body;

    // Validate input
    if (!rewardName || typeof pointsCost !== "number" || pointsCost <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid reward data",
      });
    }

    // ============================================
    // TRANSACTION + LOCKING (Race Condition Prevention)
    // ============================================
    try {
      // Start transaction
      await query("START TRANSACTION");

      // Lock user_progress row to prevent concurrent redemptions
      const progress = await queryOne(
        "SELECT points FROM user_progress WHERE user_id = ? FOR UPDATE",
        [userId]
      );

      const currentPoints = progress ? progress.points : 0;

      // Check if user has enough points
      if (currentPoints < pointsCost) {
        await query("ROLLBACK");
        return res.status(400).json({
          success: false,
          error: "Insufficient points",
        });
      }

      // Deduct points atomically
      const newPoints = currentPoints - pointsCost;
      await query(
        `INSERT INTO user_progress (user_id, unit_data, points) 
         VALUES (?, '{}', ?)
         ON DUPLICATE KEY UPDATE points = ?`,
        [userId, newPoints, newPoints]
      );

      // Record redemption
      const redemptionResult = await query(
        "INSERT INTO reward_redemptions (user_id, reward_id, reward_name, points_cost) VALUES (?, ?, ?, ?)",
        [userId, rewardId || null, rewardName, pointsCost]
      );

      // Commit transaction
      await query("COMMIT");

      res.json({
        success: true,
        message: "Reward redeemed successfully",
        newPoints,
        redemptionId: redemptionResult.insertId,
      });
    } catch (txError) {
      // Rollback on any error
      await query("ROLLBACK");
      throw txError;
    }
  } catch (error) {
    console.error("Error redeeming reward:", error);
    res.status(500).json({ success: false, error: "Failed to redeem reward" });
  }
});

// === USER CART ===

// GET user cart
router.get("/cart", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const cart = await queryOne(
      "SELECT cart_data, last_qr_code, updated_at FROM user_cart WHERE user_id = ?",
      [userId]
    );

    if (!cart) {
      // Return empty cart for new users
      return res.json({
        success: true,
        data: {
          cartData: [],
          lastQrCode: null,
          updatedAt: null,
        },
      });
    }

    res.json({
      success: true,
      data: {
        cartData: cart.cart_data,
        lastQrCode: cart.last_qr_code,
        updatedAt: cart.updated_at,
      },
    });
  } catch (error) {
    console.error("Error fetching user cart:", error);
    res.status(500).json({ success: false, error: "Failed to fetch cart" });
  }
});

// POST save user cart
router.post("/cart", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { cartData, lastQrCode } = req.body;

    // Validate input
    if (!Array.isArray(cartData)) {
      return res
        .status(400)
        .json({ success: false, error: "cartData must be an array" });
    }

    // Insert or update
    await query(
      `INSERT INTO user_cart (user_id, cart_data, last_qr_code) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       cart_data = VALUES(cart_data),
       last_qr_code = VALUES(last_qr_code)`,
      [userId, JSON.stringify(cartData), lastQrCode || null]
    );

    res.json({ success: true, message: "Cart saved successfully" });
  } catch (error) {
    console.error("Error saving user cart:", error);
    res.status(500).json({ success: false, error: "Failed to save cart" });
  }
});

// DELETE clear user cart (after order completion)
router.delete("/cart", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    await query("DELETE FROM user_cart WHERE user_id = ?", [userId]);
    res.json({ success: true, message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ success: false, error: "Failed to clear cart" });
  }
});

export default router;
