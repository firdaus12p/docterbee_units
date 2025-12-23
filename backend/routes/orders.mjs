import express from "express";
import { query, queryOne } from "../db.mjs";
import { generateOrderNumber, calculateExpiryTime, calculatePoints } from "../utils/helpers.mjs";
import { requireAdmin } from "../middleware/auth.mjs";

const router = express.Router();

// ============================================
// GET /api/orders/check-pending - Check if user has pending order
// ============================================
router.get("/check-pending", async (req, res) => {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      return res.json({
        success: true,
        has_pending: false,
        message: "Guest user - no pending order check",
      });
    }

    // Check for pending order
    const pendingOrder = await queryOne(
      `SELECT id, order_number, total_amount, items, qr_code_data, 
              expires_at, created_at, store_location, order_type
       FROM orders 
       WHERE user_id = ? AND status = 'pending'
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (!pendingOrder) {
      return res.json({
        success: true,
        has_pending: false,
      });
    }

    // Check if order expired
    const now = new Date();
    const expiresAt = new Date(pendingOrder.expires_at);

    if (now > expiresAt) {
      // Auto-expire order
      await query("UPDATE orders SET status = 'expired' WHERE id = ?", [pendingOrder.id]);

      return res.json({
        success: true,
        has_pending: false,
        message: "Previous pending order has expired",
      });
    }

    res.json({
      success: true,
      has_pending: true,
      data: pendingOrder,
    });
  } catch (error) {
    console.error("Error checking pending order:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengecek pending order",
    });
  }
});

// ============================================
// POST /api/orders - Create new order
// ============================================
router.post("/", async (req, res) => {
  try {
    const {
      guest_data,
      order_type,
      store_location,
      items,
      total_amount,
      coupon_code,
      coupon_discount,
    } = req.body;

    // Get user data from session OR guest_data
    const userId = req.session?.userId || null;
    let customerName = req.session?.userName || null;
    let customerPhone = req.session?.userPhone || null;
    let customerAddress = null;

    // If guest_data provided, use it
    if (guest_data) {
      customerName = guest_data.name;
      customerPhone = guest_data.phone;
      customerAddress = guest_data.address || null;
    }

    // Check for existing pending order (logged in users only)
    if (userId) {
      const pendingOrder = await queryOne(
        `SELECT id, order_number FROM orders 
         WHERE user_id = ? AND status = 'pending'
         LIMIT 1`,
        [userId]
      );

      if (pendingOrder) {
        return res.status(400).json({
          success: false,
          error: "Anda masih memiliki transaksi pending",
          pending_order: pendingOrder.order_number,
        });
      }
    }

    // Validation
    if (!order_type || !store_location || !items || !total_amount) {
      return res.status(400).json({
        success: false,
        error: "Order type, store location, items, dan total amount harus diisi",
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

    // Calculate original_total if coupon used
    const original_total =
      coupon_code && coupon_discount > 0 ? total_amount + coupon_discount : null;

    // ============================================
    // STOCK VALIDATION & DEDUCTION (with race condition prevention)
    // ============================================
    try {
      // Start transaction for atomic stock operations
      await query("START TRANSACTION");

      // Validate and lock stock for all products
      for (const item of items) {
        // Skip if not a product (could be service/booking)
        if (!item.product_id) continue;

        // Lock row to prevent concurrent modifications (race condition prevention)
        const product = await queryOne(
          "SELECT id, name, stock FROM products WHERE id = ? FOR UPDATE",
          [item.product_id]
        );

        if (!product) {
          throw new Error(`Produk dengan ID ${item.product_id} tidak ditemukan`);
        }

        // Check stock availability
        if (product.stock < item.quantity) {
          throw new Error(
            `Stok tidak cukup untuk ${product.name}. Tersedia: ${product.stock}, diminta: ${item.quantity}`
          );
        }
      }

      // Deduct stock for all products (atomic operation)
      for (const item of items) {
        if (!item.product_id) continue;

        await query("UPDATE products SET stock = stock - ? WHERE id = ?", [
          item.quantity,
          item.product_id,
        ]);
      }

      // Insert order
      const result = await query(
        `INSERT INTO orders 
       (order_number, user_id, customer_name, customer_phone, customer_address,
        order_type, store_location, items, total_amount, points_earned, 
        qr_code_data, expires_at, coupon_code, coupon_discount, original_total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber,
          userId,
          customerName,
          customerPhone,
          customerAddress,
          order_type,
          store_location,
          JSON.stringify(items),
          total_amount,
          pointsEarned,
          qrCodeData,
          expiresAt,
          coupon_code || null,
          coupon_discount || 0,
          original_total,
        ]
      );

      // Increment coupon used_count if coupon was used
      if (coupon_code) {
        await query(`UPDATE coupons SET used_count = used_count + 1 WHERE code = ?`, [
          coupon_code.toUpperCase(),
        ]);

        // Record coupon usage for logged-in users (one-time per user)
        if (userId) {
          const coupon = await queryOne("SELECT id FROM coupons WHERE code = ?", [
            coupon_code.toUpperCase(),
          ]);

          if (coupon) {
            // Insert into coupon_usage to track one-time usage per user
            await query(
              `INSERT INTO coupon_usage (user_id, coupon_id, order_type, order_id) 
             VALUES (?, ?, 'store', ?)`,
              [userId, coupon.id, result.insertId]
            );
          }
        }
      }

      // Commit transaction - all operations successful
      await query("COMMIT");

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
    } catch (stockError) {
      // Rollback transaction on any error
      await query("ROLLBACK");

      console.error("Error in stock validation/deduction:", stockError);

      // Return user-friendly error message
      return res.status(400).json({
        success: false,
        error: stockError.message || "Gagal memproses order",
      });
    }
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      error: "Gagal membuat order",
    });
  }
});

// ============================================
// GET /api/orders - Get all orders (admin only)
// ============================================
router.get("/", requireAdmin, async (req, res) => {
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

    const order = await queryOne("SELECT * FROM orders WHERE id = ?", [orderId]);

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
      await query("UPDATE orders SET status = 'expired' WHERE id = ?", [order.id]);
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

    const order = await queryOne("SELECT * FROM orders WHERE order_number = ?", [orderNumber]);

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
      await query("UPDATE orders SET status = 'expired' WHERE id = ?", [order.id]);
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
// PATCH /api/orders/:id/complete - Complete order (admin/kasir scan)
// ============================================
router.patch("/:id/complete", requireAdmin, async (req, res) => {
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
        } else {
          // New user - create progress record with initial points
          await query("INSERT INTO user_progress (user_id, unit_data, points) VALUES (?, ?, ?)", [
            order.user_id,
            JSON.stringify({}),
            order.points_earned,
          ]);
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
    const userId = req.session?.userId;

    // Get order to verify ownership
    const order = await queryOne("SELECT * FROM orders WHERE id = ?", [id]);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order tidak ditemukan",
      });
    }

    // Verify ownership (allow admin or order owner)
    if (userId && order.user_id && order.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: "Anda tidak memiliki akses untuk membatalkan order ini",
      });
    }

    // Only allow canceling pending orders
    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: `Order dengan status ${order.status} tidak dapat dibatalkan`,
      });
    }

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
// POST /api/orders/:id/assign-points-by-phone - Assign points to user by phone (admin only)
// ============================================
router.post("/:id/assign-points-by-phone", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: "Nomor HP harus diisi",
      });
    }

    // Check if order exists
    const order = await queryOne("SELECT * FROM orders WHERE id = ?", [id]);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order tidak ditemukan",
      });
    }

    // Check if order is completed
    if (order.status !== "completed") {
      return res.status(400).json({
        success: false,
        error: "Hanya order completed yang bisa di-assign points",
      });
    }

    // Check if order already assigned to a user
    if (order.user_id) {
      return res.status(400).json({
        success: false,
        error: "Order ini sudah ter-assign ke user",
      });
    }

    // Find user by phone number
    const user = await queryOne(
      "SELECT id, name, email, phone FROM users WHERE phone = ? AND is_active = 1",
      [phone]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User dengan nomor HP ini tidak terdaftar. Points tidak dapat di-assign.",
      });
    }

    // Get current user progress
    const progress = await queryOne("SELECT points FROM user_progress WHERE user_id = ?", [
      user.id,
    ]);

    let currentPoints = 0;
    if (progress) {
      currentPoints = progress.points || 0;
    } else {
      // Create user_progress if not exists
      await query("INSERT INTO user_progress (user_id, unit_data, points) VALUES (?, '{}', 0)", [
        user.id,
      ]);
    }

    // Calculate new points
    const pointsToAdd = order.points_earned || 0;
    const newPoints = currentPoints + pointsToAdd;

    // Update user_progress with new points
    await query("UPDATE user_progress SET points = ?, updated_at = NOW() WHERE user_id = ?", [
      newPoints,
      user.id,
    ]);

    // Update order with user_id
    await query("UPDATE orders SET user_id = ? WHERE id = ?", [user.id, id]);

    res.json({
      success: true,
      message: `Points berhasil di-assign ke ${user.name}`,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        points_added: pointsToAdd,
        new_total_points: newPoints,
      },
    });
  } catch (error) {
    console.error("Error assigning points:", error);
    res.status(500).json({
      success: false,
      error: "Gagal assign points",
    });
  }
});

// ============================================
// DELETE /api/orders/:id - Delete order (admin only)
// ============================================
router.delete("/:id", requireAdmin, async (req, res) => {
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

// ============================================
// GET /api/orders/status/:orderNumber - Get order status by order number
// ============================================
router.get("/status/:orderNumber", async (req, res) => {
  try {
    const { orderNumber } = req.params;

    if (!orderNumber) {
      return res.status(400).json({
        success: false,
        error: "Order number is required",
      });
    }

    // Fetch order by order_number
    const order = await queryOne(
      `SELECT id, order_number, user_id, customer_name, customer_phone, 
              total_amount, items, status, qr_code_data, expires_at, 
              store_location, order_type, created_at
       FROM orders 
       WHERE order_number = ?`,
      [orderNumber]
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Calculate points earned
    const pointsEarned = calculatePoints(order.total_amount);

    // Check if order expired
    const now = new Date();
    const expiresAt = new Date(order.expires_at);

    // Auto-expire if needed
    if (order.status === "pending" && now > expiresAt) {
      await query("UPDATE orders SET status = 'expired' WHERE id = ?", [order.id]);
      order.status = "expired";
    }

    return res.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        total_amount: order.total_amount,
        items: order.items,
        qr_code_data: order.qr_code_data,
        expires_at: order.expires_at,
        store_location: order.store_location,
        order_type: order.order_type,
        points_earned: pointsEarned,
        created_at: order.created_at,
      },
    });
  } catch (error) {
    console.error("Error fetching order status:", error);
    return res.status(500).json({
      success: false,
      error: "Gagal mengecek status order",
    });
  }
});

export default router;
