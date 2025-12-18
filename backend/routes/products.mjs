import express from "express";
import { query, queryOne } from "../db.mjs";

const router = express.Router();

// GET /api/products - Get all products with optional filters
router.get("/", async (req, res) => {
  try {
    const { category, is_active } = req.query;

    let sql = `SELECT p.*, 
      (SELECT a.slug FROM articles a WHERE a.product_id = p.id AND a.is_published = 1 LIMIT 1) as article_slug
    FROM products p WHERE 1=1`;
    const params = [];

    // Filter by category
    if (category && category !== "all") {
      sql += " AND p.category = ?";
      params.push(category);
    }

    // Filter by active status (default: only active)
    if (is_active !== undefined) {
      sql += " AND p.is_active = ?";
      params.push(is_active === "true" || is_active === "1" ? 1 : 0);
    } else {
      sql += " AND p.is_active = 1"; // Default: only show active products
    }

    sql += " ORDER BY p.created_at DESC";

    const products = await query(sql, params);

    res.json({
      success: true,
      data: products,
      count: products.length,
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

// POST /api/products - Create new product
router.post("/", async (req, res) => {
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
    const validCategories = ["Zona Sunnah", "1001 Rempah", "Zona Honey", "Cold Pressed"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: "Kategori tidak valid",
      });
    }

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
        stock || 0,
      ]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        name,
        category,
        price,
        description,
        image_url,
        stock,
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

// PATCH /api/products/:id - Update product
router.patch("/:id", async (req, res) => {
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
      const validCategories = ["Zona Sunnah", "1001 Rempah", "Zona Honey", "Cold Pressed"];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          error: "Kategori tidak valid",
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

// DELETE /api/products/:id - Permanently delete product from database
router.delete("/:id", async (req, res) => {
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
