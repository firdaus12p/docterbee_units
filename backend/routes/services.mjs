import express from "express";
import { query, queryOne } from "../db.mjs";

const router = express.Router();

/**
 * GET /api/services
 * Get all services with optional filters
 * Query params: category, branch, mode, is_active
 */
router.get("/", async (req, res) => {
  try {
    const { category, branch, mode, is_active } = req.query;

    let sql = "SELECT * FROM services WHERE 1=1";
    const params = [];

    // Filter by category
    if (category && category !== "all") {
      sql += " AND category = ?";
      params.push(category);
    }

    // Filter by branch (partial match since branch is comma-separated)
    if (branch && branch !== "all") {
      sql += " AND branch LIKE ?";
      params.push(`%${branch}%`);
    }

    // Filter by mode
    if (mode && mode !== "all") {
      sql += " AND (mode = ? OR mode = 'both')";
      params.push(mode);
    }

    // Filter by is_active (default to active only)
    if (is_active !== undefined) {
      sql += " AND is_active = ?";
      params.push(is_active === "true" || is_active === "1" ? 1 : 0);
    } else {
      // Default: show only active services
      sql += " AND is_active = 1";
    }

    sql += " ORDER BY created_at DESC";

    const services = await query(sql, params);

    res.json({
      success: true,
      data: services,
      count: services.length,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data layanan",
    });
  }
});

/**
 * GET /api/services/:id
 * Get single service by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const service = await queryOne("SELECT * FROM services WHERE id = ?", [id]);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Layanan tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data layanan",
    });
  }
});

/**
 * POST /api/services
 * Create new service
 * Body: { name, category, price, description, branch, mode, practitioner }
 */
router.post("/", async (req, res) => {
  try {
    const { name, category, price, description, branch, mode, practitioner } =
      req.body;

    // Validation
    if (!name || !category || !price || !description || !branch || !mode) {
      return res.status(400).json({
        success: false,
        error:
          "Data tidak lengkap. Field wajib: name, category, price, description, branch, mode",
      });
    }

    // Validate category
    const validCategories = ["manual", "klinis", "konsultasi", "perawatan"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Kategori tidak valid. Pilihan: ${validCategories.join(", ")}`,
      });
    }

    // Validate mode
    const validModes = ["online", "offline", "both"];
    if (!validModes.includes(mode)) {
      return res.status(400).json({
        success: false,
        error: `Mode tidak valid. Pilihan: ${validModes.join(", ")}`,
      });
    }

    // Insert service
    const result = await query(
      `INSERT INTO services (name, category, price, description, branch, mode, practitioner, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [name, category, price, description, branch, mode, practitioner || null]
    );

    // Get the newly created service
    const newService = await queryOne("SELECT * FROM services WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json({
      success: true,
      message: "Layanan berhasil ditambahkan",
      data: newService,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menambahkan layanan",
    });
  }
});

/**
 * PATCH /api/services/:id
 * Update existing service
 * Body: { name?, category?, price?, description?, branch?, mode?, practitioner?, is_active? }
 */
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      price,
      description,
      branch,
      mode,
      practitioner,
      is_active,
    } = req.body;

    // Check if service exists
    const existing = await queryOne("SELECT * FROM services WHERE id = ?", [
      id,
    ]);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Layanan tidak ditemukan",
      });
    }

    // Build dynamic update query
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push("name = ?");
      params.push(name);
    }

    if (category !== undefined) {
      const validCategories = ["manual", "klinis", "konsultasi", "perawatan"];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          error: `Kategori tidak valid. Pilihan: ${validCategories.join(", ")}`,
        });
      }
      updates.push("category = ?");
      params.push(category);
    }

    if (price !== undefined) {
      updates.push("price = ?");
      params.push(price);
    }

    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description);
    }

    if (branch !== undefined) {
      updates.push("branch = ?");
      params.push(branch);
    }

    if (mode !== undefined) {
      const validModes = ["online", "offline", "both"];
      if (!validModes.includes(mode)) {
        return res.status(400).json({
          success: false,
          error: `Mode tidak valid. Pilihan: ${validModes.join(", ")}`,
        });
      }
      updates.push("mode = ?");
      params.push(mode);
    }

    if (practitioner !== undefined) {
      updates.push("practitioner = ?");
      params.push(practitioner || null);
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

    // Add id to params
    params.push(id);

    // Execute update
    await query(
      `UPDATE services SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    // Get updated service
    const updatedService = await queryOne(
      "SELECT * FROM services WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Layanan berhasil diupdate",
      data: updatedService,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengupdate layanan",
    });
  }
});

/**
 * DELETE /api/services/:id
 * Permanently delete service from database
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    const serviceId = parseInt(id);
    if (isNaN(serviceId) || serviceId <= 0) {
      return res.status(400).json({
        success: false,
        error: "ID layanan tidak valid",
      });
    }

    // Check if service exists and get info for logging
    const existing = await queryOne(
      "SELECT id, name FROM services WHERE id = ?",
      [serviceId]
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Layanan tidak ditemukan",
      });
    }

    // Hard delete - permanently remove from database
    await query("DELETE FROM services WHERE id = ?", [serviceId]);

    // Log deletion for audit trail
    console.log(`📝 Service deleted: ID=${serviceId}, Name="${existing.name}"`);

    res.json({
      success: true,
      message: "Layanan berhasil dihapus secara permanen",
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menghapus layanan",
    });
  }
});

export default router;
