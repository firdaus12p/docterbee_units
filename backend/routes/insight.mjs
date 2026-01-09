import express from "express";
import { query, queryOne } from "../db.mjs";
import { requireAdmin, requireUser } from "../middleware/auth.mjs";

const router = express.Router();

/**
 * Helper: Check if user has unlocked a specific article
 * @param {number} userId - User ID
 * @param {number} articleId - Article ID
 * @returns {Promise<boolean>} True if unlocked
 */
async function hasUserUnlockedArticle(userId, articleId) {
  if (!userId) return false;
  const unlock = await queryOne(
    "SELECT id FROM user_unlocked_articles WHERE user_id = ? AND article_id = ?",
    [userId, articleId]
  );
  return !!unlock;
}

// GET /api/insight - List all published articles with unlock status
router.get("/", async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const userId = req.session?.userId || null;

    const articles = await query(
      `SELECT id, title, slug, excerpt, header_image, tags, category, article_type, product_id, 
              points_cost, is_free, created_at, updated_at 
       FROM articles 
       WHERE is_published = 1 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    // Add unlock status for each article (per-user isolation)
    const articlesWithStatus = await Promise.all(
      articles.map(async (article) => {
        // Free articles are always unlocked
        if (article.is_free || article.points_cost === 0) {
          return { ...article, is_unlocked: true };
        }
        
        // Check if user has unlocked this specific article
        const isUnlocked = await hasUserUnlockedArticle(userId, article.id);
        return { ...article, is_unlocked: isUnlocked };
      })
    );

    res.json({
      success: true,
      count: articlesWithStatus.length,
      data: articlesWithStatus,
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data artikel",
    });
  }
});

// GET /api/insight/id/:id - Get single article by ID (admin only, no published filter)
router.get("/id/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const article = await queryOne("SELECT * FROM articles WHERE id = ?", [id]);

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

// GET /api/insight/product/:productId - Get article by product ID
router.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    const article = await queryOne(
      "SELECT * FROM articles WHERE product_id = ? AND is_published = 1",
      [productId]
    );

    res.json({
      success: true,
      data: article || null,
    });
  } catch (error) {
    console.error("Error fetching article by product:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil artikel produk",
    });
  }
});

// GET /api/insight/:slug - Get single article by slug (with access control)
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.session?.userId || null;

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

    // Check access: free articles are always accessible
    const isFree = article.is_free || article.points_cost === 0;
    const isUnlocked = isFree || await hasUserUnlockedArticle(userId, article.id);

    if (!isUnlocked) {
      // Return metadata only (no content) for locked articles
      return res.json({
        success: true,
        locked: true,
        data: {
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          header_image: article.header_image,
          tags: article.tags,
          category: article.category,
          points_cost: article.points_cost,
          is_free: article.is_free,
          created_at: article.created_at,
          // CONTENT HIDDEN - user must unlock first
          content: null,
        },
      });
    }

    // Full access - return complete article
    res.json({
      success: true,
      locked: false,
      data: { ...article, is_unlocked: true },
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
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { title, slug, content, excerpt, tags, category, header_image, article_type, product_id } =
      req.body;

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

    // Validate article_type
    const validArticleType = article_type === "product" ? "product" : "general";
    const validProductId = validArticleType === "product" && product_id ? parseInt(product_id) : null;

    // Extract points_cost and is_free from request body
    const { points_cost, is_free } = req.body;
    const validPointsCost = parseInt(points_cost) || 0;
    const validIsFree = validPointsCost === 0 ? 1 : (is_free === false || is_free === 0 ? 0 : 1);

    // Insert article
    const result = await query(
      `INSERT INTO articles 
       (title, slug, content, excerpt, tags, category, header_image, article_type, product_id, points_cost, is_free)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        content,
        excerpt || null,
        tags || null,
        category || null,
        header_image || null,
        validArticleType,
        validProductId,
        validPointsCost,
        validIsFree,
      ]
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
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      content,
      excerpt,
      tags,
      category,
      header_image,
      isPublished,
      article_type,
      product_id,
      points_cost,
      is_free,
    } = req.body;

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
    if (article_type !== undefined) {
      const validArticleType = article_type === "product" ? "product" : "general";
      updates.push("article_type = ?");
      params.push(validArticleType);
    }
    if (product_id !== undefined) {
      updates.push("product_id = ?");
      params.push(product_id ? parseInt(product_id) : null);
    }
    // Handle points_cost update
    if (points_cost !== undefined) {
      const validPointsCost = parseInt(points_cost) || 0;
      updates.push("points_cost = ?");
      params.push(validPointsCost);
      // Auto-set is_free based on points_cost if is_free is not explicitly provided
      if (is_free === undefined) {
        updates.push("is_free = ?");
        params.push(validPointsCost === 0 ? 1 : 0);
      }
    }
    // Handle is_free update
    if (is_free !== undefined) {
      updates.push("is_free = ?");
      params.push(is_free === true || is_free === 1 ? 1 : 0);
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

// DELETE /api/insight/:id - Delete article permanently (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID is a number
    const articleId = parseInt(id);
    if (isNaN(articleId) || articleId <= 0) {
      return res.status(400).json({
        success: false,
        error: "ID artikel tidak valid",
      });
    }

    // Check if article exists and get header_image for potential cleanup
    const existing = await queryOne(
      "SELECT id, title, header_image FROM articles WHERE id = ?",
      [articleId]
    );
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Artikel tidak ditemukan",
      });
    }

    // Hard delete - permanently remove from database
    await query("DELETE FROM articles WHERE id = ?", [articleId]);

    // Log deletion for audit trail
    console.log(`📝 Article deleted: ID=${articleId}, Title="${existing.title}"`);

    res.json({
      success: true,
      message: "Artikel berhasil dihapus secara permanen",
    });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menghapus artikel",
    });
  }
});

// ============================================
// ARTICLE UNLOCK SYSTEM (POINTS-BASED)
// ============================================

/**
 * POST /api/insight/:id/unlock - Unlock article by paying points
 * SECURE: Uses database transaction to ensure atomic point deduction
 * User A cannot see articles unlocked by User B (per-user isolation)
 */
router.post("/:id/unlock", requireUser, async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const userId = req.session.userId;

    // Validate article ID
    if (isNaN(articleId) || articleId <= 0) {
      return res.status(400).json({
        success: false,
        error: "ID artikel tidak valid",
      });
    }

    // Get article details
    const article = await queryOne(
      "SELECT id, title, points_cost, is_free, is_published FROM articles WHERE id = ?",
      [articleId]
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        error: "Artikel tidak ditemukan",
      });
    }

    if (!article.is_published) {
      return res.status(400).json({
        success: false,
        error: "Artikel tidak tersedia",
      });
    }

    // Check if article is free
    if (article.is_free || article.points_cost === 0) {
      return res.json({
        success: true,
        message: "Artikel ini gratis, tidak perlu membayar poin",
        already_free: true,
      });
    }

    // Check if already unlocked
    const existingUnlock = await queryOne(
      "SELECT id FROM user_unlocked_articles WHERE user_id = ? AND article_id = ?",
      [userId, articleId]
    );

    if (existingUnlock) {
      return res.json({
        success: true,
        message: "Artikel sudah dibeli sebelumnya",
        already_unlocked: true,
      });
    }

    // ============================================
    // ATOMIC TRANSACTION: Point deduction + unlock record
    // ============================================
    try {
      await query("START TRANSACTION");

      // Lock user_progress row and get current points
      const progress = await queryOne(
        "SELECT points FROM user_progress WHERE user_id = ? FOR UPDATE",
        [userId]
      );

      const currentPoints = progress ? progress.points : 0;
      const pointsCost = article.points_cost;

      // Check if user has enough points
      if (currentPoints < pointsCost) {
        await query("ROLLBACK");
        return res.status(400).json({
          success: false,
          error: "INSUFFICIENT_POINTS",
          message: `Poin tidak cukup. Dibutuhkan ${pointsCost} poin, Anda memiliki ${currentPoints} poin.`,
          required: pointsCost,
          available: currentPoints,
        });
      }

      // Deduct points
      const newPoints = currentPoints - pointsCost;
      await query(
        `INSERT INTO user_progress (user_id, unit_data, points) 
         VALUES (?, '{}', ?)
         ON DUPLICATE KEY UPDATE points = ?`,
        [userId, newPoints, newPoints]
      );

      // Record unlock (per-user isolation - only this user can access)
      await query(
        `INSERT INTO user_unlocked_articles (user_id, article_id, points_paid) 
         VALUES (?, ?, ?)`,
        [userId, articleId, pointsCost]
      );

      // Commit transaction
      await query("COMMIT");

      console.log(`📖 Article unlocked: User=${userId}, Article=${articleId}, Points=${pointsCost}`);

      res.json({
        success: true,
        message: `Artikel "${article.title}" berhasil dibeli dengan ${pointsCost} poin!`,
        points_spent: pointsCost,
        new_balance: newPoints,
      });
    } catch (txError) {
      await query("ROLLBACK");
      throw txError;
    }
  } catch (error) {
    console.error("Error unlocking article:", error);
    res.status(500).json({
      success: false,
      error: "Gagal membeli artikel",
    });
  }
});

/**
 * GET /api/insight/unlocked/my - Get list of articles unlocked by current user
 */
router.get("/unlocked/my", requireUser, async (req, res) => {
  try {
    const userId = req.session.userId;

    const unlockedArticles = await query(
      `SELECT ua.id, ua.article_id, ua.points_paid, ua.unlocked_at,
              a.title, a.slug, a.excerpt, a.header_image, a.category
       FROM user_unlocked_articles ua
       JOIN articles a ON ua.article_id = a.id
       WHERE ua.user_id = ?
       ORDER BY ua.unlocked_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      count: unlockedArticles.length,
      data: unlockedArticles,
    });
  } catch (error) {
    console.error("Error fetching unlocked articles:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil daftar artikel yang dibeli",
    });
  }
});

export default router;
