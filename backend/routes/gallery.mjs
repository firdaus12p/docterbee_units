import express from "express";
import { pool } from "../db.mjs";

const router = express.Router();

// ============================================
// GALLERY API ROUTES
// ============================================

/**
 * GET /api/gallery - Get all active gallery images for public display
 * Returns images sorted by sort_order, then by created_at DESC
 */
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, description, image_url, sort_order, created_at
       FROM gallery_images
       WHERE is_active = 1
       ORDER BY sort_order ASC, created_at DESC`
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch gallery images",
    });
  }
});

/**
 * GET /api/gallery/admin - Get all gallery images for admin (including inactive)
 * Requires admin authentication
 */
router.get("/admin", async (req, res) => {
  // Check admin session
  if (!req.session?.isAdmin) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized - Admin access required",
    });
  }

  try {
    const [rows] = await pool.query(
      `SELECT id, title, description, image_url, sort_order, is_active, created_at, updated_at
       FROM gallery_images
       ORDER BY sort_order ASC, created_at DESC`
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching gallery images for admin:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch gallery images",
    });
  }
});

/**
 * POST /api/gallery - Create new gallery image
 * Requires admin authentication
 */
router.post("/", async (req, res) => {
  // Check admin session
  if (!req.session?.isAdmin) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized - Admin access required",
    });
  }

  const { title, description, image_url, sort_order = 0, is_active = true } = req.body;

  if (!image_url) {
    return res.status(400).json({
      success: false,
      error: "Image URL is required",
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO gallery_images (title, description, image_url, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [title || null, description || null, image_url, sort_order, is_active ? 1 : 0]
    );

    res.status(201).json({
      success: true,
      message: "Gallery image created successfully",
      data: {
        id: result.insertId,
        title,
        description,
        image_url,
        sort_order,
        is_active,
      },
    });
  } catch (error) {
    console.error("Error creating gallery image:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create gallery image",
    });
  }
});

/**
 * PUT /api/gallery/:id - Update gallery image
 * Requires admin authentication
 */
router.put("/:id", async (req, res) => {
  // Check admin session
  if (!req.session?.isAdmin) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized - Admin access required",
    });
  }

  const { id } = req.params;
  const { title, description, image_url, sort_order, is_active } = req.body;

  try {
    // Build dynamic update query
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push("title = ?");
      values.push(title);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }
    if (image_url !== undefined) {
      updates.push("image_url = ?");
      values.push(image_url);
    }
    if (sort_order !== undefined) {
      updates.push("sort_order = ?");
      values.push(sort_order);
    }
    if (is_active !== undefined) {
      updates.push("is_active = ?");
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    values.push(id);

    const [result] = await pool.query(
      `UPDATE gallery_images SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Gallery image not found",
      });
    }

    res.json({
      success: true,
      message: "Gallery image updated successfully",
    });
  } catch (error) {
    console.error("Error updating gallery image:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update gallery image",
    });
  }
});

/**
 * DELETE /api/gallery/:id - Delete gallery image
 * Requires admin authentication
 */
router.delete("/:id", async (req, res) => {
  // Check admin session
  if (!req.session?.isAdmin) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized - Admin access required",
    });
  }

  const { id } = req.params;

  try {
    const [result] = await pool.query(
      `DELETE FROM gallery_images WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Gallery image not found",
      });
    }

    res.json({
      success: true,
      message: "Gallery image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete gallery image",
    });
  }
});

export default router;
