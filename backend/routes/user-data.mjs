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

// === USER ACTIVITY HISTORY ===

// GET /api/user-data/activities - Get unified activity history (orders + redemptions)
router.get("/activities", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { 
      page = 1, 
      limit = 10, 
      type = 'all', 
      startDate, 
      endDate 
    } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    let orders = [];
    let redemptions = [];

    // Build date filter conditions
    let orderDateFilter = "";
    let redemptionDateFilter = "";
    const orderParams = [userId];
    const redemptionParams = [userId];

    if (startDate) {
      orderDateFilter += " AND created_at >= ?";
      redemptionDateFilter += " AND redeemed_at >= ?";
      orderParams.push(startDate);
      redemptionParams.push(startDate);
    }
    if (endDate) {
      // Add 1 day to include the end date fully
      orderDateFilter += " AND created_at <= ?";
      redemptionDateFilter += " AND redeemed_at <= ?";
      orderParams.push(endDate + " 23:59:59");
      redemptionParams.push(endDate + " 23:59:59");
    }

    // Query orders if type is 'all' or 'order'
    if (type === 'all' || type === 'order') {
      orders = await query(
        `SELECT id, order_number, total_amount, points_earned, status, payment_status, 
                store_location, order_type, created_at, items, coupon_discount
         FROM orders 
         WHERE user_id = ?${orderDateFilter}
         ORDER BY created_at DESC`,
        orderParams
      );
    }

    // Query redemptions if type is 'all' or 'reward'
    if (type === 'all' || type === 'reward') {
      redemptions = await query(
        `SELECT id, reward_name, points_cost, status, redeemed_at
         FROM reward_redemptions 
         WHERE user_id = ?${redemptionDateFilter}
         ORDER BY redeemed_at DESC`,
        redemptionParams
      );
    }

    // Normalize orders to unified format
    const normalizedOrders = orders.map(order => ({
      id: order.id,
      type: 'order',
      activity_date: order.created_at,
      order_number: order.order_number,
      total_amount: parseFloat(order.total_amount),
      points_earned: order.points_earned,
      status: order.status,
      payment_status: order.payment_status,
      store_location: order.store_location,
      order_type: order.order_type,
      coupon_discount: parseFloat(order.coupon_discount || 0),
      items: order.items
    }));

    // Normalize redemptions to unified format
    const normalizedRedemptions = redemptions.map(redemption => ({
      id: redemption.id,
      type: 'reward',
      activity_date: redemption.redeemed_at,
      reward_name: redemption.reward_name,
      points_cost: redemption.points_cost,
      status: redemption.status
    }));

    // Merge and sort by activity_date DESC
    const allActivities = [...normalizedOrders, ...normalizedRedemptions]
      .sort((a, b) => new Date(b.activity_date) - new Date(a.activity_date));

    // Calculate pagination
    const totalCount = allActivities.length;
    const totalPages = Math.ceil(totalCount / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedActivities = allActivities.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        activities: paginatedActivities,
        totalCount,
        currentPage: pageNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error("Error fetching user activities:", error);
    res.status(500).json({ 
      success: false, 
      error: "Gagal memuat riwayat aktivitas" 
    });
  }
});

// GET /api/user-data/activities/order/:orderId - Get order detail for receipt modal
router.get("/activities/order/:orderId", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const orderId = parseInt(req.params.orderId);

    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID"
      });
    }

    // Query order with ownership verification
    const order = await queryOne(
      `SELECT id, order_number, user_id, customer_name, customer_phone, 
              total_amount, points_earned, status, payment_status, 
              store_location, order_type, created_at, completed_at, 
              items, coupon_code, coupon_discount, original_total, qr_code_data
       FROM orders 
       WHERE id = ? AND user_id = ?`,
      [orderId, userId]
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order tidak ditemukan"
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error("Error fetching order detail:", error);
    res.status(500).json({ 
      success: false, 
      error: "Gagal memuat detail order" 
    });
  }
});

// GET /api/user-data/activities/reward/:redemptionId - Get reward redemption detail
router.get("/activities/reward/:redemptionId", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const redemptionId = parseInt(req.params.redemptionId);

    if (isNaN(redemptionId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid redemption ID"
      });
    }

    // Query redemption with ownership verification
    const redemption = await queryOne(
      `SELECT id, user_id, reward_id, reward_name, points_cost, status, redeemed_at
       FROM reward_redemptions 
       WHERE id = ? AND user_id = ?`,
      [redemptionId, userId]
    );

    if (!redemption) {
      return res.status(404).json({
        success: false,
        error: "Penukaran reward tidak ditemukan"
      });
    }

    res.json({
      success: true,
      data: redemption
    });
  } catch (error) {
    console.error("Error fetching reward detail:", error);
    res.status(500).json({ 
      success: false, 
      error: "Gagal memuat detail reward" 
    });
  }
});

export default router;
