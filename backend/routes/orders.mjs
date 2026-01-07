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

    // Resolve location_id from request body or derive from store_location string
    let locationId = req.body.location_id || null;
    
    if (!locationId && store_location) {
      // Try to find location by name (case-insensitive match)
      const location = await queryOne(
        "SELECT id FROM locations WHERE LOWER(name) = LOWER(?) AND is_active = 1",
        [store_location]
      );
      if (location) {
        locationId = location.id;
      }
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
    // Supports multi-location inventory via product_stocks table
    // ============================================
    try {
      // Start transaction for atomic stock operations
      await query("START TRANSACTION");

      // Validate and lock stock for all products
      for (const item of items) {
        // Skip if not a product (could be service/booking)
        if (!item.product_id) continue;

        // Check if product exists
        const product = await queryOne(
          "SELECT id, name FROM products WHERE id = ?",
          [item.product_id]
        );

        if (!product) {
          throw new Error(`Produk dengan ID ${item.product_id} tidak ditemukan`);
        }

        // Check stock availability based on location
        if (locationId) {
          // Multi-location mode: check product_stocks table
          const locationStock = await queryOne(
            "SELECT id, quantity FROM product_stocks WHERE product_id = ? AND location_id = ? FOR UPDATE",
            [item.product_id, locationId]
          );

          const availableStock = locationStock?.quantity || 0;

          if (availableStock < item.quantity) {
            throw new Error(
              `Stok tidak cukup untuk ${product.name} di lokasi ini. Tersedia: ${availableStock}, diminta: ${item.quantity}`
            );
          }
        } else {
          // Legacy mode: check products.stock column
          const productWithStock = await queryOne(
            "SELECT stock FROM products WHERE id = ? FOR UPDATE",
            [item.product_id]
          );

          if (productWithStock.stock < item.quantity) {
            throw new Error(
              `Stok tidak cukup untuk ${product.name}. Tersedia: ${productWithStock.stock}, diminta: ${item.quantity}`
            );
          }
        }
      }

      // Deduct stock for all products (atomic operation)
      for (const item of items) {
        if (!item.product_id) continue;

        if (locationId) {
          // Multi-location mode: deduct from product_stocks
          const result = await query(
            "UPDATE product_stocks SET quantity = quantity - ?, updated_at = NOW() WHERE product_id = ? AND location_id = ?",
            [item.quantity, item.product_id, locationId]
          );

          // If no row was updated (stock record doesn't exist yet), this means 0 stock
          if (result.affectedRows === 0) {
            throw new Error(`Stok tidak tersedia untuk produk ID ${item.product_id} di lokasi ini`);
          }
        } else {
          // Legacy mode: deduct from products.stock
          await query("UPDATE products SET stock = stock - ? WHERE id = ?", [
            item.quantity,
            item.product_id,
          ]);
        }
      }

      // Insert order (with location_id if available)
      const result = await query(
        `INSERT INTO orders 
       (order_number, user_id, customer_name, customer_phone, customer_address,
        order_type, store_location, location_id, items, total_amount, points_earned, 
        qr_code_data, expires_at, coupon_code, coupon_discount, original_total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber,
          userId,
          customerName,
          customerPhone,
          customerAddress,
          order_type,
          store_location,
          locationId,
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
// Excludes soft-deleted orders (deleted_at IS NOT NULL) if column exists
// ============================================
router.get("/", requireAdmin, async (req, res) => {
  try {
    const { status, payment_status, limit = 50, offset = 0 } = req.query;

    // Check if deleted_at column exists (graceful fallback for migration)
    let hasDeletedAtColumn = false;
    try {
      const columnCheck = await query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'deleted_at'"
      );
      hasDeletedAtColumn = columnCheck.length > 0;
    } catch (e) {
      // If check fails, assume column doesn't exist
      hasDeletedAtColumn = false;
    }

    // Build WHERE clause - filter out soft-deleted orders if column exists
    let whereClause = hasDeletedAtColumn ? "WHERE deleted_at IS NULL" : "WHERE 1=1";
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
// GET /api/orders/id/:id - Get order by ID (requires auth)
// ============================================
router.get("/id/:id", async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const userId = req.session?.userId;
    const isAdmin = req.session?.isAdmin === true;

    // Must be logged in (either as user or admin)
    if (!userId && !isAdmin) {
      return res.status(401).json({
        success: false,
        error: "Silakan login untuk melihat order",
      });
    }

    const order = await queryOne("SELECT * FROM orders WHERE id = ?", [orderId]);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order tidak ditemukan",
      });
    }

    // Authorization: Admin can see all, user can only see their own orders
    const isOwner = userId && order.user_id && order.user_id === userId;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        error: "Anda tidak memiliki akses ke order ini",
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
// GET /api/orders/status/:orderNumber - Get order status by order number
// IMPORTANT: This route MUST be defined BEFORE /:orderNumber
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

// ============================================
// GET /api/orders/:orderNumber - Get order by number (for QR scanning)
// Full data for admin/owner, limited data for others
// ============================================
router.get("/:orderNumber", async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const userId = req.session?.userId;
    const isAdmin = req.session?.isAdmin === true;

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

    // Check if requester is admin or owner
    const isOwner = userId && order.user_id && order.user_id === userId;
    const hasFullAccess = isAdmin || isOwner;

    if (hasFullAccess) {
      // Admin or owner gets full data
      res.json({
        success: true,
        data: order,
      });
    } else {
      // Others get limited data (for cashier scanning, etc.)
      // Hide sensitive customer information
      const limitedOrder = {
        id: order.id,
        order_number: order.order_number,
        order_type: order.order_type,
        store_location: order.store_location,
        items: order.items,
        total_amount: order.total_amount,
        status: order.status,
        qr_code_data: order.qr_code_data,
        expires_at: order.expires_at,
        created_at: order.created_at,
        points_earned: order.points_earned,
        // Mask sensitive data
        customer_name: order.customer_name ? order.customer_name.charAt(0) + "***" : null,
        customer_phone: order.customer_phone ? order.customer_phone.slice(0, 4) + "****" + order.customer_phone.slice(-2) : null,
        // Hide address completely
        customer_address: null,
        // Include coupon info for display but not sensitive
        coupon_code: order.coupon_code,
        coupon_discount: order.coupon_discount,
      };

      res.json({
        success: true,
        data: limitedOrder,
        limited: true, // Flag indicating limited data
      });
    }
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
// PATCH /api/orders/:id/cancel - Cancel order (auth required)
// ============================================
router.patch("/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session?.userId;
    const isAdmin = req.session?.isAdmin === true;

    // Get order to verify ownership
    const order = await queryOne("SELECT * FROM orders WHERE id = ?", [id]);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order tidak ditemukan",
      });
    }

    // Authorization check:
    // - Admin can cancel any order
    // - Logged-in user can cancel their own orders (user_id matches)
    // - Guest orders (user_id is null) can only be cancelled by admin
    const isOwner = userId && order.user_id && order.user_id === userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        error: "Anda tidak memiliki akses untuk membatalkan order ini. Silakan login atau hubungi admin.",
      });
    }

    // Only allow canceling pending orders
    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: `Order dengan status ${order.status} tidak dapat dibatalkan`,
      });
    }

    // Restore stock when order is cancelled
    // Supports multi-location inventory via product_stocks table
    try {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      const locationId = order.location_id;
      
      for (const item of items) {
        if (item.product_id) {
          if (locationId) {
            // Multi-location mode: restore to product_stocks
            await query(
              "UPDATE product_stocks SET quantity = quantity + ?, updated_at = NOW() WHERE product_id = ? AND location_id = ?",
              [item.quantity, item.product_id, locationId]
            );
          } else {
            // Legacy mode: restore to products.stock
            await query("UPDATE products SET stock = stock + ? WHERE id = ?", [
              item.quantity,
              item.product_id,
            ]);
          }
        }
      }
    } catch (stockError) {
      console.error("Error restoring stock on cancel:", stockError);
      // Continue with cancellation even if stock restore fails
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
// DELETE /api/orders/:id - Soft delete order (admin only)
// Sets deleted_at timestamp instead of removing the row
// User's order history is preserved, but order won't appear in admin list
// Falls back to hard delete if deleted_at column doesn't exist yet
// ============================================
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if deleted_at column exists (graceful fallback for migration)
    let hasDeletedAtColumn = false;
    try {
      const columnCheck = await query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'deleted_at'"
      );
      hasDeletedAtColumn = columnCheck.length > 0;
    } catch (e) {
      hasDeletedAtColumn = false;
    }

    // Check if order exists
    const checkQuery = hasDeletedAtColumn 
      ? "SELECT * FROM orders WHERE id = ? AND deleted_at IS NULL"
      : "SELECT * FROM orders WHERE id = ?";
    
    const order = await queryOne(checkQuery, [id]);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order tidak ditemukan atau sudah dihapus",
      });
    }

    // Soft delete if column exists, hard delete otherwise
    if (hasDeletedAtColumn) {
      await query("UPDATE orders SET deleted_at = NOW() WHERE id = ?", [id]);
    } else {
      await query("DELETE FROM orders WHERE id = ?", [id]);
    }

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
