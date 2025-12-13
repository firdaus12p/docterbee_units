import express from "express";
import { query, queryOne } from "../db.mjs";

const router = express.Router();

// GET /api/insight - List all published articles
router.get("/", async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const articles = await query(
      `SELECT id, title, slug, excerpt, tags, header_image, category, created_at, updated_at 
       FROM articles 
       WHERE is_published = 1 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data artikel",
    });
  }
});

// GET /api/insight/id/:id - Get single article by ID (for admin editing)
router.get("/id/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const article = await queryOne(
      "SELECT * FROM articles WHERE id = ?",
      [id]
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        error: "Artikel tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error("Error fetching article by ID:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil detail artikel",
    });
  }
});

// GET /api/insight/:slug - Get single article by slug
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const article = await queryOne(
      "SELECT * FROM articles WHERE slug = ? AND is_published = 1",
      [slug]
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        error: "Artikel tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil detail artikel",
    });
  }
});

// POST /api/insight - Create new article (admin only)
router.post("/", async (req, res) => {
  try {
    const { title, slug, content, excerpt, tags, category, header_image } = req.body;

    // Validation
    if (!title || !slug || !content) {
      return res.status(400).json({
        success: false,
        error: "Judul, slug, dan konten harus diisi",
      });
    }

    // Check if slug already exists
    const existing = await queryOne("SELECT id FROM articles WHERE slug = ?", [
      slug,
    ]);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Slug sudah digunakan",
      });
    }

    // Insert article
    const result = await query(
      `INSERT INTO articles 
       (title, slug, content, excerpt, tags, category, header_image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, content, excerpt || null, tags || null, category || null, header_image || null]
    );

    res.status(201).json({
      success: true,
      message: "Artikel berhasil dibuat",
      data: {
        id: result.insertId,
        title,
        slug,
      },
    });
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({
      success: false,
      error: "Gagal membuat artikel",
    });
  }
});

// PATCH /api/insight/:id - Update article (admin only)
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, excerpt, tags, category, header_image, isPublished } = req.body;

    // Check if article exists
    const existing = await queryOne(
      "SELECT id, slug FROM articles WHERE id = ?",
      [id]
    );
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Artikel tidak ditemukan",
      });
    }

    // If slug is being changed, check uniqueness
    if (slug && slug !== existing.slug) {
      const slugExists = await queryOne(
        "SELECT id FROM articles WHERE slug = ? AND id != ?",
        [slug, id]
      );
      if (slugExists) {
        return res.status(400).json({
          success: false,
          error: "Slug sudah digunakan",
        });
      }
    }

    const updates = [];
    const params = [];

    if (title) {
      updates.push("title = ?");
      params.push(title);
    }
    if (slug) {
      updates.push("slug = ?");
      params.push(slug);
    }
    if (content) {
      updates.push("content = ?");
      params.push(content);
    }
    if (excerpt !== undefined) {
      updates.push("excerpt = ?");
      params.push(excerpt);
    }
    if (tags !== undefined) {
      updates.push("tags = ?");
      params.push(tags);
    }
    if (category !== undefined) {
      updates.push("category = ?");
      params.push(category);
    }
    if (header_image !== undefined) {
      updates.push("header_image = ?");
      params.push(header_image);
    }
    if (isPublished !== undefined) {
      updates.push("is_published = ?");
      params.push(isPublished ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Tidak ada data untuk diupdate",
      });
    }

    params.push(id);

    await query(
      `UPDATE articles SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: "Artikel berhasil diupdate",
    });
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengupdate artikel",
    });
  }
});

// DELETE /api/insight/:id - Delete article (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if article exists
    const existing = await queryOne("SELECT id FROM articles WHERE id = ?", [
      id,
    ]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Artikel tidak ditemukan",
      });
    }

    // Soft delete by setting is_published = 0
    await query("UPDATE articles SET is_published = 0 WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Artikel berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menghapus artikel",
    });
  }
});

export default router;
