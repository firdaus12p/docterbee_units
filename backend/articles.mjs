import express from "express";
import { query, queryOne } from "./db.mjs";

const router = express.Router();

// Helper function to generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// GET /api/articles - Get all articles (published only for public)
router.get("/", async (req, res) => {
  try {
    const { category, published } = req.query;
    
    let sql = "SELECT * FROM articles WHERE 1=1";
    const params = [];

    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }

    if (published !== undefined) {
      sql += " AND is_published = ?";
      params.push(published === "true" ? 1 : 0);
    } else {
      // Default: only show published articles
      sql += " AND is_published = 1";
    }

    sql += " ORDER BY created_at DESC";

    const articles = await query(sql, params);
    res.json({ success: true, data: articles });
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/articles/:id - Get single article by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const article = await queryOne("SELECT * FROM articles WHERE id = ?", [id]);

    if (!article) {
      return res.status(404).json({ success: false, error: "Article not found" });
    }

    // Increment views
    await query("UPDATE articles SET views = views + 1 WHERE id = ?", [id]);
    article.views += 1;

    res.json({ success: true, data: article });
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/articles/slug/:slug - Get single article by slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await queryOne("SELECT * FROM articles WHERE slug = ?", [slug]);

    if (!article) {
      return res.status(404).json({ success: false, error: "Article not found" });
    }

    // Increment views
    await query("UPDATE articles SET views = views + 1 WHERE slug = ?", [slug]);
    article.views += 1;

    res.json({ success: true, data: article });
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/articles - Create new article
router.post("/", async (req, res) => {
  try {
    const { title, content, excerpt, header_image, category, author } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        error: "Title, content, and category are required",
      });
    }

    // Generate slug from title
    let slug = generateSlug(title);
    
    // Check if slug exists, if yes, append number
    let slugExists = await queryOne("SELECT id FROM articles WHERE slug = ?", [slug]);
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(title)}-${counter}`;
      slugExists = await queryOne("SELECT id FROM articles WHERE slug = ?", [slug]);
      counter++;
    }

    const result = await query(
      `INSERT INTO articles (title, slug, content, excerpt, header_image, category, author) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, content, excerpt || null, header_image || null, category, author || "Admin"]
    );

    res.json({
      success: true,
      data: { id: result.insertId, slug },
      message: "Article created successfully",
    });
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/articles/:id - Update article
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, header_image, category, author, is_published } = req.body;

    // Check if article exists
    const existing = await queryOne("SELECT id FROM articles WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Article not found" });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push("title = ?");
      params.push(title);
      
      // Regenerate slug if title changed
      const newSlug = generateSlug(title);
      updates.push("slug = ?");
      params.push(newSlug);
    }
    if (content !== undefined) {
      updates.push("content = ?");
      params.push(content);
    }
    if (excerpt !== undefined) {
      updates.push("excerpt = ?");
      params.push(excerpt);
    }
    if (header_image !== undefined) {
      updates.push("header_image = ?");
      params.push(header_image);
    }
    if (category !== undefined) {
      updates.push("category = ?");
      params.push(category);
    }
    if (author !== undefined) {
      updates.push("author = ?");
      params.push(author);
    }
    if (is_published !== undefined) {
      updates.push("is_published = ?");
      params.push(is_published ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: "No fields to update" });
    }

    params.push(id);
    await query(`UPDATE articles SET ${updates.join(", ")} WHERE id = ?`, params);

    res.json({ success: true, message: "Article updated successfully" });
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/articles/:id - Delete article permanently
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID is a number
    const articleId = parseInt(id);
    if (isNaN(articleId) || articleId <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: "ID artikel tidak valid" 
      });
    }

    // Check if article exists and get info for logging
    const existing = await queryOne(
      "SELECT id, title FROM articles WHERE id = ?", 
      [articleId]
    );
    if (!existing) {
      return res.status(404).json({ 
        success: false, 
        error: "Article not found" 
      });
    }

    // Hard delete - permanently remove from database
    await query("DELETE FROM articles WHERE id = ?", [articleId]);
    
    // Log deletion for audit trail
    console.log(`📝 Article deleted: ID=${articleId}, Title="${existing.title}"`);

    res.json({ 
      success: true, 
      message: "Article deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
