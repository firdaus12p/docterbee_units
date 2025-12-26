import express from "express";
import { query, queryOne } from "../db.mjs";
import { requireAdmin } from "../middleware/auth.mjs";

const router = express.Router();

// ==================== PUBLIC ENDPOINTS ====================

/**
 * GET /api/journeys
 * Get all active journeys
 */
router.get("/", async (req, res) => {
  try {
    const journeys = await query(
      `SELECT id, slug, name, description, sort_order 
       FROM journeys 
       WHERE is_active = 1 
       ORDER BY sort_order ASC, created_at ASC`
    );

    res.json({
      success: true,
      data: journeys,
      count: journeys.length,
    });
  } catch (error) {
    console.error("Error fetching journeys:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data journey",
    });
  }
});

/**
 * GET /api/journeys/:slug
 * Get journey detail with units and items
 */
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    // Validate slug format (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({
        success: false,
        error: "Format slug tidak valid",
      });
    }

    // Get journey
    const journey = await queryOne(
      `SELECT id, slug, name, description 
       FROM journeys 
       WHERE slug = ? AND is_active = 1`,
      [slug]
    );

    if (!journey) {
      return res.status(404).json({
        success: false,
        error: "Journey tidak ditemukan",
      });
    }

    // Get units for this journey
    const units = await query(
      `SELECT id, title, color_class, sort_order 
       FROM journey_units 
       WHERE journey_id = ? AND is_active = 1 
       ORDER BY sort_order ASC`,
      [journey.id]
    );

    // Get items for each unit
    for (const unit of units) {
      const items = await query(
        `SELECT id, item_key, question, dalil, sains, nbsn, sort_order 
         FROM unit_items 
         WHERE unit_id = ? AND is_active = 1 
         ORDER BY sort_order ASC`,
        [unit.id]
      );
      unit.items = items;
    }

    journey.units = units;

    res.json({
      success: true,
      data: journey,
    });
  } catch (error) {
    console.error("Error fetching journey:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data journey",
    });
  }
});

// ==================== ADMIN ENDPOINTS ====================

/**
 * GET /api/journeys/admin/all
 * Get all journeys including inactive (admin only)
 */
router.get("/admin/all", requireAdmin, async (req, res) => {
  try {
    const journeys = await query(
      `SELECT * FROM journeys ORDER BY sort_order ASC, created_at DESC`
    );

    res.json({
      success: true,
      data: journeys,
      count: journeys.length,
    });
  } catch (error) {
    console.error("Error fetching admin journeys:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data journey",
    });
  }
});

/**
 * GET /api/journeys/admin/:id
 * Get single journey with units and items (admin only)
 */
router.get("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const journeyId = parseInt(id);

    if (isNaN(journeyId) || journeyId <= 0) {
      return res.status(400).json({
        success: false,
        error: "ID journey tidak valid",
      });
    }

    const journey = await queryOne(
      `SELECT * FROM journeys WHERE id = ?`,
      [journeyId]
    );

    if (!journey) {
      return res.status(404).json({
        success: false,
        error: "Journey tidak ditemukan",
      });
    }

    // Get units
    const units = await query(
      `SELECT * FROM journey_units WHERE journey_id = ? ORDER BY sort_order ASC`,
      [journeyId]
    );

    // Get items for each unit
    for (const unit of units) {
      const items = await query(
        `SELECT * FROM unit_items WHERE unit_id = ? ORDER BY sort_order ASC`,
        [unit.id]
      );
      unit.items = items;
    }

    journey.units = units;

    res.json({
      success: true,
      data: journey,
    });
  } catch (error) {
    console.error("Error fetching admin journey:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data journey",
    });
  }
});

/**
 * POST /api/journeys/admin
 * Create new journey (admin only)
 */
router.post("/admin", requireAdmin, async (req, res) => {
  try {
    const { slug, name, description, is_active, sort_order } = req.body;

    // Validation
    if (!slug || !name) {
      return res.status(400).json({
        success: false,
        error: "Field slug dan name wajib diisi",
      });
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({
        success: false,
        error: "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)",
      });
    }

    // Sanitize inputs
    const sanitizedSlug = slug.toLowerCase().trim();
    const sanitizedName = name.trim().substring(0, 255);
    const sanitizedDesc = description ? description.trim() : null;

    // Check for duplicate slug
    const existing = await queryOne(
      "SELECT id FROM journeys WHERE slug = ?",
      [sanitizedSlug]
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Slug sudah digunakan, pilih slug lain",
      });
    }

    // Insert journey
    const result = await query(
      `INSERT INTO journeys (slug, name, description, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
      [
        sanitizedSlug,
        sanitizedName,
        sanitizedDesc,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        sort_order || 0,
      ]
    );

    const newJourney = await queryOne(
      "SELECT * FROM journeys WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Journey berhasil ditambahkan",
      data: newJourney,
    });
  } catch (error) {
    console.error("Error creating journey:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menambahkan journey",
    });
  }
});

/**
 * PATCH /api/journeys/admin/:id
 * Update journey (admin only)
 */
router.patch("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const journeyId = parseInt(id);

    if (isNaN(journeyId) || journeyId <= 0) {
      return res.status(400).json({
        success: false,
        error: "ID journey tidak valid",
      });
    }

    // Check if journey exists
    const existing = await queryOne(
      "SELECT * FROM journeys WHERE id = ?",
      [journeyId]
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Journey tidak ditemukan",
      });
    }

    const { slug, name, description, is_active, sort_order } = req.body;

    // Build dynamic update query
    const updates = [];
    const params = [];

    if (slug !== undefined) {
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return res.status(400).json({
          success: false,
          error: "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)",
        });
      }
      // Check for duplicate slug (excluding current journey)
      const duplicateSlug = await queryOne(
        "SELECT id FROM journeys WHERE slug = ? AND id != ?",
        [slug.toLowerCase().trim(), journeyId]
      );
      if (duplicateSlug) {
        return res.status(400).json({
          success: false,
          error: "Slug sudah digunakan oleh journey lain",
        });
      }
      updates.push("slug = ?");
      params.push(slug.toLowerCase().trim());
    }

    if (name !== undefined) {
      updates.push("name = ?");
      params.push(name.trim().substring(0, 255));
    }

    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description ? description.trim() : null);
    }

    if (is_active !== undefined) {
      updates.push("is_active = ?");
      params.push(is_active ? 1 : 0);
    }

    if (sort_order !== undefined) {
      updates.push("sort_order = ?");
      params.push(parseInt(sort_order) || 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Tidak ada data yang diupdate",
      });
    }

    params.push(journeyId);

    await query(
      `UPDATE journeys SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    const updatedJourney = await queryOne(
      "SELECT * FROM journeys WHERE id = ?",
      [journeyId]
    );

    res.json({
      success: true,
      message: "Journey berhasil diupdate",
      data: updatedJourney,
    });
  } catch (error) {
    console.error("Error updating journey:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengupdate journey",
    });
  }
});

/**
 * DELETE /api/journeys/admin/:id
 * Delete journey (admin only)
 */
router.delete("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const journeyId = parseInt(id);

    if (isNaN(journeyId) || journeyId <= 0) {
      return res.status(400).json({
        success: false,
        error: "ID journey tidak valid",
      });
    }

    const existing = await queryOne(
      "SELECT id, name FROM journeys WHERE id = ?",
      [journeyId]
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Journey tidak ditemukan",
      });
    }

    // Delete journey (cascade will delete units and items)
    await query("DELETE FROM journeys WHERE id = ?", [journeyId]);

    console.log(`📝 Journey deleted: ID=${journeyId}, Name="${existing.name}"`);

    res.json({
      success: true,
      message: "Journey berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting journey:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menghapus journey",
    });
  }
});

// ==================== UNIT ENDPOINTS ====================

/**
 * POST /api/journeys/admin/units
 * Create new unit (admin only)
 */
router.post("/admin/units", requireAdmin, async (req, res) => {
  try {
    const { journey_id, title, color_class, sort_order, is_active } = req.body;

    if (!journey_id || !title) {
      return res.status(400).json({
        success: false,
        error: "Field journey_id dan title wajib diisi",
      });
    }

    // Check journey exists
    const journey = await queryOne(
      "SELECT id FROM journeys WHERE id = ?",
      [parseInt(journey_id)]
    );

    if (!journey) {
      return res.status(400).json({
        success: false,
        error: "Journey tidak ditemukan",
      });
    }

    const result = await query(
      `INSERT INTO journey_units (journey_id, title, color_class, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [
        parseInt(journey_id),
        title.trim().substring(0, 255),
        color_class || "text-amber-500",
        sort_order || 0,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
      ]
    );

    const newUnit = await queryOne(
      "SELECT * FROM journey_units WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Unit berhasil ditambahkan",
      data: newUnit,
    });
  } catch (error) {
    console.error("Error creating unit:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menambahkan unit",
    });
  }
});

/**
 * PATCH /api/journeys/admin/units/:id
 * Update unit (admin only)
 */
router.patch("/admin/units/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const unitId = parseInt(id);

    if (isNaN(unitId) || unitId <= 0) {
      return res.status(400).json({
        success: false,
        error: "ID unit tidak valid",
      });
    }

    const existing = await queryOne(
      "SELECT * FROM journey_units WHERE id = ?",
      [unitId]
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Unit tidak ditemukan",
      });
    }

    const { title, color_class, sort_order, is_active } = req.body;

    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push("title = ?");
      params.push(title.trim().substring(0, 255));
    }

    if (color_class !== undefined) {
      updates.push("color_class = ?");
      params.push(color_class);
    }

    if (sort_order !== undefined) {
      updates.push("sort_order = ?");
      params.push(parseInt(sort_order) || 0);
    }

    if (is_active !== undefined) {
      updates.push("is_active = ?");
      params.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Tidak ada data yang diupdate",
      });
    }

    params.push(unitId);

    await query(
      `UPDATE journey_units SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    const updatedUnit = await queryOne(
      "SELECT * FROM journey_units WHERE id = ?",
      [unitId]
    );

    res.json({
      success: true,
      message: "Unit berhasil diupdate",
      data: updatedUnit,
    });
  } catch (error) {
    console.error("Error updating unit:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengupdate unit",
    });
  }
});

/**
 * DELETE /api/journeys/admin/units/:id
 * Delete unit (admin only)
 */
router.delete("/admin/units/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const unitId = parseInt(id);

    if (isNaN(unitId) || unitId <= 0) {
      return res.status(400).json({
        success: false,
        error: "ID unit tidak valid",
      });
    }

    const existing = await queryOne(
      "SELECT id, title FROM journey_units WHERE id = ?",
      [unitId]
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Unit tidak ditemukan",
      });
    }

    // Delete unit (cascade will delete items)
    await query("DELETE FROM journey_units WHERE id = ?", [unitId]);

    console.log(`📝 Unit deleted: ID=${unitId}, Title="${existing.title}"`);

    res.json({
      success: true,
      message: "Unit berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting unit:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menghapus unit",
    });
  }
});

// ==================== ITEM ENDPOINTS ====================

/**
 * POST /api/journeys/admin/items
 * Create new item (admin only)
 */
router.post("/admin/items", requireAdmin, async (req, res) => {
  try {
    const { unit_id, item_key, question, dalil, sains, nbsn, sort_order, is_active } = req.body;

    if (!unit_id || !item_key || !question || !dalil || !sains || !nbsn) {
      return res.status(400).json({
        success: false,
        error: "Field unit_id, item_key, question, dalil, sains, dan nbsn wajib diisi",
      });
    }

    // Validate item_key format (alphanumeric and camelCase)
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(item_key)) {
      return res.status(400).json({
        success: false,
        error: "Item key hanya boleh berisi huruf dan angka, dimulai dengan huruf",
      });
    }

    // Check unit exists
    const unit = await queryOne(
      "SELECT id FROM journey_units WHERE id = ?",
      [parseInt(unit_id)]
    );

    if (!unit) {
      return res.status(400).json({
        success: false,
        error: "Unit tidak ditemukan",
      });
    }

    // Check for duplicate item_key in same unit
    const duplicateKey = await queryOne(
      "SELECT id FROM unit_items WHERE unit_id = ? AND item_key = ?",
      [parseInt(unit_id), item_key.trim()]
    );

    if (duplicateKey) {
      return res.status(400).json({
        success: false,
        error: "Item key sudah ada dalam unit ini",
      });
    }

    const result = await query(
      `INSERT INTO unit_items (unit_id, item_key, question, dalil, sains, nbsn, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parseInt(unit_id),
        item_key.trim(),
        question.trim(),
        dalil.trim(),
        sains.trim(),
        nbsn.trim(),
        sort_order || 0,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
      ]
    );

    const newItem = await queryOne(
      "SELECT * FROM unit_items WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Item berhasil ditambahkan",
      data: newItem,
    });
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menambahkan item",
    });
  }
});

/**
 * PATCH /api/journeys/admin/items/:id
 * Update item (admin only)
 */
router.patch("/admin/items/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const itemId = parseInt(id);

    if (isNaN(itemId) || itemId <= 0) {
      return res.status(400).json({
        success: false,
        error: "ID item tidak valid",
      });
    }

    const existing = await queryOne(
      "SELECT * FROM unit_items WHERE id = ?",
      [itemId]
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Item tidak ditemukan",
      });
    }

    const { item_key, question, dalil, sains, nbsn, sort_order, is_active } = req.body;

    const updates = [];
    const params = [];

    if (item_key !== undefined) {
      if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(item_key)) {
        return res.status(400).json({
          success: false,
          error: "Item key hanya boleh berisi huruf dan angka, dimulai dengan huruf",
        });
      }
      // Check for duplicate item_key in same unit (excluding current item)
      const duplicateKey = await queryOne(
        "SELECT id FROM unit_items WHERE unit_id = ? AND item_key = ? AND id != ?",
        [existing.unit_id, item_key.trim(), itemId]
      );
      if (duplicateKey) {
        return res.status(400).json({
          success: false,
          error: "Item key sudah ada dalam unit ini",
        });
      }
      updates.push("item_key = ?");
      params.push(item_key.trim());
    }

    if (question !== undefined) {
      updates.push("question = ?");
      params.push(question.trim());
    }

    if (dalil !== undefined) {
      updates.push("dalil = ?");
      params.push(dalil.trim());
    }

    if (sains !== undefined) {
      updates.push("sains = ?");
      params.push(sains.trim());
    }

    if (nbsn !== undefined) {
      updates.push("nbsn = ?");
      params.push(nbsn.trim());
    }

    if (sort_order !== undefined) {
      updates.push("sort_order = ?");
      params.push(parseInt(sort_order) || 0);
    }

    if (is_active !== undefined) {
      updates.push("is_active = ?");
      params.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Tidak ada data yang diupdate",
      });
    }

    params.push(itemId);

    await query(
      `UPDATE unit_items SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    const updatedItem = await queryOne(
      "SELECT * FROM unit_items WHERE id = ?",
      [itemId]
    );

    res.json({
      success: true,
      message: "Item berhasil diupdate",
      data: updatedItem,
    });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengupdate item",
    });
  }
});

/**
 * DELETE /api/journeys/admin/items/:id
 * Delete item (admin only)
 */
router.delete("/admin/items/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const itemId = parseInt(id);

    if (isNaN(itemId) || itemId <= 0) {
      return res.status(400).json({
        success: false,
        error: "ID item tidak valid",
      });
    }

    const existing = await queryOne(
      "SELECT id, item_key FROM unit_items WHERE id = ?",
      [itemId]
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Item tidak ditemukan",
      });
    }

    await query("DELETE FROM unit_items WHERE id = ?", [itemId]);

    console.log(`📝 Item deleted: ID=${itemId}, Key="${existing.item_key}"`);

    res.json({
      success: true,
      message: "Item berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menghapus item",
    });
  }
});

export default router;
