import express from "express";
import { query, queryOne } from "../db.mjs";
import crypto from "crypto";

const router = express.Router();

// ============================================
// HELPER: Generate Order Number
// ============================================
function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `ORD-${year}${month}${day}-${random}`;
}

// ============================================
// HELPER: Calculate Expiry Time
// ============================================
function calculateExpiryTime(orderType) {
  const now = new Date();
  if (orderType === "dine_in") {
    // 30 minutes for dine in
    now.setMinutes(now.getMinutes() + 30);
  } else {
    // 2 hours for take away
    now.setHours(now.getHours() + 2);
  }
  return now;
}

// ============================================
// HELPER: Calculate Points
// ============================================
function calculatePoints(totalAmount) {
  // 1 point per 10,000 IDR
  return Math.floor(totalAmount / 10000);
}

// ============================================
// POST /api/orders - Create new order
// ============================================
router.post("/", async (req, res) => {
  try {
    const { customer_email, order_type, store_location, items, total_amount } =
      req.body;

    // Get user data from session
    const userId = req.session?.userId || null;
    const customerName = req.session?.userName || null;
    const customerPhone = req.session?.userPhone || null;

    // Validation
    if (!order_type || !store_location || !items || !total_amount) {
      return res.status(400).json({
        success: false,
        error:
          "Order type, store location, items, dan total amount harus diisi",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Items harus berupa array dan tidak boleh kosong",
      });
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Calculate expiry time
    const expiresAt = calculateExpiryTime(order_type);

    // Calculate points
    const pointsEarned = calculatePoints(total_amount);

    // QR code data (order number)
    const qrCodeData = orderNumber;

    // Insert order
    const result = await query(
      `INSERT INTO orders 
       (order_number, user_id, customer_name, customer_phone, customer_email, 
        order_type, store_location, items, total_amount, points_earned, 
        qr_code_data, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        userId,
        customerName,
        customerPhone,
        customer_email || null,
        order_type,
        store_location,
        JSON.stringify(items),
        total_amount,
        pointsEarned,
        qrCodeData,
        expiresAt,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Order berhasil dibuat",
      data: {
        id: result.insertId,
        order_number: orderNumber,
        qr_code_data: qrCodeData,
        expires_at: expiresAt,
        points_earned: pointsEarned,
        status: "pending",
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      error: "Gagal membuat order",
    });
  }
});

// ============================================
// GET /api/orders - Get all orders (admin)
// ============================================
router.get("/", async (req, res) => {
  try {
    const { status, payment_status, limit = 50, offset = 0 } = req.query;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (status) {
      whereClause += " AND status = ?";
      params.push(status);
    }

    if (payment_status) {
      whereClause += " AND payment_status = ?";
      params.push(payment_status);
    }

    params.push(parseInt(limit), parseInt(offset));

    const orders = await query(
      `SELECT * FROM orders 
       ${whereClause}
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      params
    );

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data orders",
    });
  }
});

// ============================================
// GET /api/orders/id/:id - Get order by ID
// ============================================
router.get("/id/:id", async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);

    const order = await queryOne("SELECT * FROM orders WHERE id = ?", [
      orderId,
    ]);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order tidak ditemukan",
      });
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(order.expires_at);

    if (now > expiresAt && order.status === "pending") {
      // Auto-expire order
      await query("UPDATE orders SET status = 'expired' WHERE id = ?", [
        order.id,
      ]);
      order.status = "expired";
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil order",
    });
  }
});

// ============================================
// GET /api/orders/:orderNumber - Get order by number
// ============================================
router.get("/:orderNumber", async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const order = await queryOne(
      "SELECT * FROM orders WHERE order_number = ?",
      [orderNumber]
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order tidak ditemukan",
      });
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(order.expires_at);

    if (now > expiresAt && order.status === "pending") {
      // Auto-expire order
      await query("UPDATE orders SET status = 'expired' WHERE id = ?", [
        order.id,
      ]);
      order.status = "expired";
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil detail order",
    });
  }
});

// ============================================
// PATCH /api/orders/:id/complete - Complete order (kasir scan)
// ============================================
router.patch("/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;

    // Get order
    const order = await queryOne("SELECT * FROM orders WHERE id = ?", [id]);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order tidak ditemukan",
      });
    }

    // Check if already completed
    if (order.status === "completed") {
      return res.status(400).json({
        success: false,
        error: "Order sudah selesai",
      });
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(order.expires_at);

    if (now > expiresAt) {
      await query("UPDATE orders SET status = 'expired' WHERE id = ?", [id]);
      return res.status(400).json({
        success: false,
        error: "Order sudah kadaluarsa",
      });
    }

    // Update order status
    await query(
      `UPDATE orders 
       SET status = 'completed', 
           payment_status = 'paid',
           completed_at = NOW()
       WHERE id = ?`,
      [id]
    );

    // Add points to user in database
    if (order.user_id && order.points_earned > 0) {
      try {
        // Get current user progress
        const userProgress = await queryOne(
          "SELECT unit_data, points FROM user_progress WHERE user_id = ?",
          [order.user_id]
        );

        if (userProgress) {
          // User has existing progress - add points
          const newPoints = userProgress.points + order.points_earned;
          await query("UPDATE user_progress SET points = ? WHERE user_id = ?", [
            newPoints,
            order.user_id,
          ]);
          console.log(
            `✅ Added ${order.points_earned} points to user ${order.user_id} (total: ${newPoints})`
          );
        } else {
          // New user - create progress record with initial points
          await query(
            "INSERT INTO user_progress (user_id, unit_data, points) VALUES (?, ?, ?)",
            [order.user_id, JSON.stringify({}), order.points_earned]
          );
          console.log(
            `✅ Created progress for user ${order.user_id} with ${order.points_earned} points`
          );
        }
      } catch (pointError) {
        console.error("❌ Error adding points to user:", pointError);
        // Don't fail the whole request, order is already completed
      }
    }

    res.json({
      success: true,
      message: "Order berhasil diselesaikan",
      points_added: order.points_earned || 0,
    });
  } catch (error) {
    console.error("Error completing order:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menyelesaikan order",
    });
  }
});

// ============================================
// PATCH /api/orders/:id/cancel - Cancel order
// ============================================
router.patch("/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;

    await query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Order berhasil dibatalkan",
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({
      success: false,
      error: "Gagal membatalkan order",
    });
  }
});

// ============================================
// DELETE /api/orders/:id - Delete order (hard delete)
// ============================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if order exists
    const order = await queryOne("SELECT * FROM orders WHERE id = ?", [id]);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order tidak ditemukan",
      });
    }

    // Delete order
    await query("DELETE FROM orders WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Order berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menghapus order",
    });
  }
});

export default router;
