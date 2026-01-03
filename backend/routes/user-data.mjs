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
// Uses SQL UNION for database-level pagination (performance optimized)
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

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10)); // Cap at 50
    const offset = (pageNum - 1) * limitNum;

    // Build date filter conditions with proper timezone handling
    const buildDateFilter = (columnName) => {
      let filter = "";
      const params = [];
      if (startDate) {
        filter += ` AND ${columnName} >= ?`;
        params.push(startDate + " 00:00:00");
      }
      if (endDate) {
        filter += ` AND ${columnName} <= ?`;
        params.push(endDate + " 23:59:59");
      }
      return { filter, params };
    };

    let activities = [];
    let totalCount = 0;

    // Strategy: Use SQL UNION for 'all' type, single query otherwise
    if (type === 'all') {
      // Build UNION query for combined results with database-level pagination
      const orderDateInfo = buildDateFilter("created_at");
      const rewardDateInfo = buildDateFilter("redeemed_at");
      
      // Count query for total (needed for pagination info)
      const countParams = [userId, ...orderDateInfo.params, userId, ...rewardDateInfo.params];
      const countResult = await query(
        `SELECT 
          (SELECT COUNT(*) FROM orders WHERE user_id = ?${orderDateInfo.filter}) +
          (SELECT COUNT(*) FROM reward_redemptions WHERE user_id = ?${rewardDateInfo.filter}) 
         AS total`,
        countParams
      );
      totalCount = countResult[0]?.total || 0;

      // UNION query with pagination at SQL level
      const unionParams = [
        userId, ...orderDateInfo.params,
        userId, ...rewardDateInfo.params,
        limitNum, offset
      ];
      
      activities = await query(
        `(SELECT 
            id, 'order' AS type, created_at AS activity_date,
            order_number, total_amount, points_earned, status, payment_status,
            store_location, order_type, coupon_discount, items,
            NULL AS reward_name, NULL AS points_cost
          FROM orders 
          WHERE user_id = ?${orderDateInfo.filter})
         UNION ALL
         (SELECT 
            id, 'reward' AS type, redeemed_at AS activity_date,
            NULL AS order_number, NULL AS total_amount, NULL AS points_earned, status, NULL AS payment_status,
            NULL AS store_location, NULL AS order_type, NULL AS coupon_discount, NULL AS items,
            reward_name, points_cost
          FROM reward_redemptions 
          WHERE user_id = ?${rewardDateInfo.filter})
         ORDER BY activity_date DESC
         LIMIT ? OFFSET ?`,
        unionParams
      );

    } else if (type === 'order') {
      // Orders only
      const dateInfo = buildDateFilter("created_at");
      const params = [userId, ...dateInfo.params];
      
      const countResult = await query(
        `SELECT COUNT(*) AS total FROM orders WHERE user_id = ?${dateInfo.filter}`,
        params
      );
      totalCount = countResult[0]?.total || 0;

      activities = await query(
        `SELECT 
            id, 'order' AS type, created_at AS activity_date,
            order_number, total_amount, points_earned, status, payment_status,
            store_location, order_type, coupon_discount, items,
            NULL AS reward_name, NULL AS points_cost
          FROM orders 
          WHERE user_id = ?${dateInfo.filter}
          ORDER BY created_at DESC
          LIMIT ? OFFSET ?`,
        [...params, limitNum, offset]
      );

    } else if (type === 'reward') {
      // Rewards only
      const dateInfo = buildDateFilter("redeemed_at");
      const params = [userId, ...dateInfo.params];
      
      const countResult = await query(
        `SELECT COUNT(*) AS total FROM reward_redemptions WHERE user_id = ?${dateInfo.filter}`,
        params
      );
      totalCount = countResult[0]?.total || 0;

      activities = await query(
        `SELECT 
            id, 'reward' AS type, redeemed_at AS activity_date,
            NULL AS order_number, NULL AS total_amount, NULL AS points_earned, status, NULL AS payment_status,
            NULL AS store_location, NULL AS order_type, NULL AS coupon_discount, NULL AS items,
            reward_name, points_cost
          FROM reward_redemptions 
          WHERE user_id = ?${dateInfo.filter}
          ORDER BY redeemed_at DESC
          LIMIT ? OFFSET ?`,
        [...params, limitNum, offset]
      );
    }

    // Normalize results to consistent format
    const normalizedActivities = activities.map(row => {
      if (row.type === 'order') {
        return {
          id: row.id,
          type: 'order',
          activity_date: row.activity_date,
          order_number: row.order_number,
          total_amount: parseFloat(row.total_amount),
          points_earned: row.points_earned,
          status: row.status,
          payment_status: row.payment_status,
          store_location: row.store_location,
          order_type: row.order_type,
          coupon_discount: parseFloat(row.coupon_discount || 0),
          items: row.items
        };
      } else {
        return {
          id: row.id,
          type: 'reward',
          activity_date: row.activity_date,
          reward_name: row.reward_name,
          points_cost: row.points_cost,
          status: row.status
        };
      }
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: {
        activities: normalizedActivities,
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
