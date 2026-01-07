import express from "express";
import { query, queryOne } from "../db.mjs";
import { requireAdmin } from "../middleware/auth.mjs";

const router = express.Router();

// Valid product categories - single source of truth
// Must match ENUM in db.mjs products table
const VALID_PRODUCT_CATEGORIES = [
  "Zona Sunnah",
  "1001 Rempah",
  "Zona Honey",
  "Cold Pressed",
  "Coffee",
  "Tea",
  "Jus"
];

// GET /api/products - Get all products with optional filters
// If location_id is provided, returns stock for that location from product_stocks table
// Otherwise returns global stock from products.stock (legacy behavior)
router.get("/", async (req, res) => {
  try {
    const { category, is_active, location_id } = req.query;

    let sql;
    const params = [];

    if (location_id) {
      // Multi-location mode: join with product_stocks for specific location
      sql = `SELECT p.*, 
        COALESCE(ps.quantity, 0) as stock,
        ps.location_id,
        (SELECT a.slug FROM articles a WHERE a.product_id = p.id AND a.is_published = 1 LIMIT 1) as article_slug
      FROM products p
      LEFT JOIN product_stocks ps ON p.id = ps.product_id AND ps.location_id = ?
      WHERE 1=1`;
      params.push(location_id);
    } else {
      // Legacy mode: use products.stock column
      sql = `SELECT p.*, 
        (SELECT a.slug FROM articles a WHERE a.product_id = p.id AND a.is_published = 1 LIMIT 1) as article_slug
      FROM products p WHERE 1=1`;
    }

    // Filter by category
    if (category && category !== "all") {
      sql += " AND p.category = ?";
      params.push(category);
    }

    // Filter by active status (default: only active)
    // is_active=all → show all products (no filter)
    // is_active=true/1 → show only active products
    // is_active=false/0 → show only inactive products
    // undefined → show only active products (default)
    if (is_active === undefined) {
      sql += " AND p.is_active = 1"; // Default: only show active products
    } else if (is_active !== "all") {
      sql += " AND p.is_active = ?";
      params.push(is_active === "true" || is_active === "1" ? 1 : 0);
    }
    // If is_active === "all", don't add any filter (show all)

    sql += " ORDER BY p.created_at DESC";

    const products = await query(sql, params);

    res.json({
      success: true,
      data: products,
      count: products.length,
      location_id: location_id || null,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data produk",
    });
  }
});

// GET /api/products/:id - Get single product
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product = await queryOne("SELECT * FROM products WHERE id = ?", [id]);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Produk tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data produk",
    });
  }
});

// POST /api/products - Create new product (admin only)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, category, price, member_price, promo_text, description, image_url, stock } =
      req.body;

    // Validation
    if (!name || !category || !price || !description) {
      return res.status(400).json({
        success: false,
        error: "Nama, kategori, harga, dan deskripsi wajib diisi",
      });
    }

    // Validate member_price
    if (member_price !== null && member_price !== undefined && member_price !== "") {
      const memberPriceNum = parseFloat(member_price);
      const normalPriceNum = parseFloat(price);

      if (memberPriceNum <= 0) {
        return res.status(400).json({
          success: false,
          error: "Harga member harus lebih dari 0",
        });
      }
      if (memberPriceNum >= normalPriceNum) {
        return res.status(400).json({
          success: false,
          error: "Harga member harus lebih rendah dari harga normal",
        });
      }
    }

    // Validate category
    if (!VALID_PRODUCT_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Kategori tidak valid. Kategori yang didukung: ${VALID_PRODUCT_CATEGORIES.join(", ")}`,
      });
    }

    const stockValue = parseInt(stock) || 0;

    const result = await query(
      `INSERT INTO products (name, category, price, member_price, promo_text, description, image_url, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        category,
        price,
        member_price || null,
        promo_text || null,
        description,
        image_url || null,
        stockValue,
      ]
    );

    const productId = result.insertId;

    // =====================================================
    // AUTO-CREATE PRODUCT_STOCKS FOR ALL ACTIVE LOCATIONS
    // This ensures new products are visible in location views
    // =====================================================
    try {
      const locations = await query("SELECT id FROM locations WHERE is_active = 1");
      
      if (locations.length > 0) {
        for (const loc of locations) {
          await query(
            `INSERT INTO product_stocks (product_id, location_id, quantity) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
            [productId, loc.id, stockValue]
          );
        }
        console.log(`📦 Created product_stocks for product ${productId} at ${locations.length} locations (stock: ${stockValue})`);
      }
    } catch (stockError) {
      console.error("Warning: Could not create product_stocks:", stockError.message);
      // Don't fail the request - product was created successfully
    }

    res.status(201).json({
      success: true,
      data: {
        id: productId,
        name,
        category,
        price,
        description,
        image_url,
        stock: stockValue,
      },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      error: "Gagal membuat produk baru",
    });
  }
});

// PATCH /api/products/:id - Update product (admin only)
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      price,
      member_price,
      promo_text,
      description,
      image_url,
      stock,
      is_active,
    } = req.body;

    // Check if product exists
    const existingProduct = await queryOne("SELECT * FROM products WHERE id = ?", [id]);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: "Produk tidak ditemukan",
      });
    }

    // Validate category if provided
    if (category) {
      if (!VALID_PRODUCT_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          error: `Kategori tidak valid. Kategori yang didukung: ${VALID_PRODUCT_CATEGORIES.join(", ")}`,
        });
      }
    }

    // Validate member_price if being updated
    if (member_price !== undefined && member_price !== null && member_price !== "") {
      const memberPriceNum = parseFloat(member_price);

      if (memberPriceNum <= 0) {
        return res.status(400).json({
          success: false,
          error: "Harga member harus lebih dari 0",
        });
      }

      // Get current/new price for validation
      const normalPriceNum =
        price !== undefined ? parseFloat(price) : parseFloat(existingProduct.price);

      if (memberPriceNum >= normalPriceNum) {
        return res.status(400).json({
          success: false,
          error: "Harga member harus lebih rendah dari harga normal",
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push("name = ?");
      params.push(name);
    }
    if (category !== undefined) {
      updates.push("category = ?");
      params.push(category);
    }
    if (price !== undefined) {
      updates.push("price = ?");
      params.push(price);
    }
    if (member_price !== undefined) {
      updates.push("member_price = ?");
      params.push(member_price || null);
    }
    if (promo_text !== undefined) {
      updates.push("promo_text = ?");
      params.push(promo_text || null);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description);
    }
    if (image_url !== undefined) {
      updates.push("image_url = ?");
      params.push(image_url);
    }
    if (stock !== undefined) {
      updates.push("stock = ?");
      params.push(stock);
    }
    if (is_active !== undefined) {
      updates.push("is_active = ?");
      params.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Tidak ada data untuk diupdate",
      });
    }

    params.push(id);

    await query(`UPDATE products SET ${updates.join(", ")} WHERE id = ?`, params);

    // Get updated product
    const updatedProduct = await queryOne("SELECT * FROM products WHERE id = ?", [id]);

    res.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengupdate produk",
    });
  }
});

// ============================================
// MULTI-LOCATION STOCK MANAGEMENT ROUTES
// ============================================

// GET /api/products/:id/stocks - Get stock for all locations for a product (admin only)
router.get("/:id/stocks", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await queryOne("SELECT id, name FROM products WHERE id = ?", [id]);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Produk tidak ditemukan",
      });
    }

    // Get stock for all active locations
    const stocks = await query(
      `SELECT 
        l.id as location_id,
        l.name as location_name,
        l.type as location_type,
        COALESCE(ps.quantity, 0) as quantity,
        ps.updated_at
      FROM locations l
      LEFT JOIN product_stocks ps ON l.id = ps.location_id AND ps.product_id = ?
      WHERE l.is_active = 1
      ORDER BY l.name ASC`,
      [id]
    );

    res.json({
      success: true,
      product_id: parseInt(id),
      product_name: product.name,
      stocks,
    });
  } catch (error) {
    console.error("Error fetching product stocks:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data stok produk",
    });
  }
});

// PATCH /api/products/:id/stocks - Update stock for a specific location (admin only)
// Body: { location_id, quantity, operation } where operation is 'set', 'add', or 'subtract'
router.patch("/:id/stocks", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { location_id, quantity, operation = "set" } = req.body;

    // Validation
    if (!location_id) {
      return res.status(400).json({
        success: false,
        error: "location_id harus diisi",
      });
    }

    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        success: false,
        error: "quantity harus diisi",
      });
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || (operation === "set" && quantityNum < 0)) {
      return res.status(400).json({
        success: false,
        error: "quantity harus berupa angka valid dan tidak boleh negatif untuk operasi 'set'",
      });
    }

    // Check if product exists
    const product = await queryOne("SELECT id, name FROM products WHERE id = ?", [id]);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Produk tidak ditemukan",
      });
    }

    // Check if location exists and is active
    const location = await queryOne(
      "SELECT id, name, is_active FROM locations WHERE id = ?",
      [location_id]
    );
    if (!location) {
      return res.status(404).json({
        success: false,
        error: "Lokasi tidak ditemukan",
      });
    }
    if (!location.is_active) {
      return res.status(400).json({
        success: false,
        error: `Lokasi "${location.name}" tidak aktif`,
      });
    }

    // Get current stock
    const currentStock = await queryOne(
      "SELECT id, quantity FROM product_stocks WHERE product_id = ? AND location_id = ?",
      [id, location_id]
    );

    let newQuantity;
    const currentQty = currentStock ? currentStock.quantity : 0;

    switch (operation) {
      case "add":
        newQuantity = currentQty + quantityNum;
        break;
      case "subtract":
        newQuantity = currentQty - quantityNum;
        if (newQuantity < 0) {
          return res.status(400).json({
            success: false,
            error: `Stok tidak mencukupi. Stok saat ini: ${currentQty}, dikurangi: ${quantityNum}`,
          });
        }
        break;
      case "set":
      default:
        newQuantity = quantityNum;
        break;
    }

    // Upsert stock record
    if (currentStock) {
      await query(
        "UPDATE product_stocks SET quantity = ?, updated_at = NOW() WHERE id = ?",
        [newQuantity, currentStock.id]
      );
    } else {
      await query(
        "INSERT INTO product_stocks (product_id, location_id, quantity) VALUES (?, ?, ?)",
        [id, location_id, newQuantity]
      );
    }

    console.log(
      `📦 Stock updated: Product="${product.name}", Location="${location.name}", ` +
      `${operation}: ${currentQty} → ${newQuantity}`
    );

    res.json({
      success: true,
      message: `Stok berhasil diupdate`,
      data: {
        product_id: parseInt(id),
        product_name: product.name,
        location_id: parseInt(location_id),
        location_name: location.name,
        previous_quantity: currentQty,
        new_quantity: newQuantity,
        operation,
      },
    });
  } catch (error) {
    console.error("Error updating product stock:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengupdate stok produk",
    });
  }
});

// POST /api/products/:id/stocks/bulk - Bulk update stocks for multiple locations (admin only)
// Useful for stock opname (physical count)
router.post("/:id/stocks/bulk", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { stocks } = req.body; // Array of { location_id, quantity }

    if (!Array.isArray(stocks) || stocks.length === 0) {
      return res.status(400).json({
        success: false,
        error: "stocks harus berupa array dengan minimal 1 item",
      });
    }

    // Check if product exists
    const product = await queryOne("SELECT id, name FROM products WHERE id = ?", [id]);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Produk tidak ditemukan",
      });
    }

    // Start transaction
    await query("START TRANSACTION");

    try {
      const results = [];

      for (const stock of stocks) {
        const { location_id, quantity } = stock;

        if (!location_id || quantity === undefined || quantity === null) {
          throw new Error(`Invalid stock data: location_id=${location_id}, quantity=${quantity}`);
        }

        const quantityNum = parseInt(quantity);
        if (isNaN(quantityNum) || quantityNum < 0) {
          throw new Error(`Invalid quantity for location_id=${location_id}: ${quantity}`);
        }

        // Upsert using ON DUPLICATE KEY UPDATE
        await query(
          `INSERT INTO product_stocks (product_id, location_id, quantity, updated_at)
           VALUES (?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), updated_at = NOW()`,
          [id, location_id, quantityNum]
        );

        results.push({ location_id, quantity: quantityNum });
      }

      await query("COMMIT");

      console.log(
        `📦 Bulk stock update: Product="${product.name}", ` +
        `${results.length} locations updated`
      );

      res.json({
        success: true,
        message: `Stok berhasil diupdate untuk ${results.length} lokasi`,
        data: {
          product_id: parseInt(id),
          product_name: product.name,
          updated_stocks: results,
        },
      });
    } catch (txError) {
      await query("ROLLBACK");
      throw txError;
    }
  } catch (error) {
    console.error("Error bulk updating product stocks:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Gagal mengupdate stok produk",
    });
  }
});


// DELETE /api/products/:id - Permanently delete product from database (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    const productId = parseInt(id);
    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        error: "ID produk tidak valid",
      });
    }

    // Check if product exists and get info for logging
    const existingProduct = await queryOne(
      "SELECT id, name FROM products WHERE id = ?",
      [productId]
    );

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: "Produk tidak ditemukan",
      });
    }

    // Hard delete - permanently remove from database
    await query("DELETE FROM products WHERE id = ?", [productId]);

    // Log deletion for audit trail
    console.log(`📝 Product deleted: ID=${productId}, Name="${existingProduct.name}"`);

    res.json({
      success: true,
      message: "Produk berhasil dihapus secara permanen",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menghapus produk",
    });
  }
});

export default router;
