import express from "express";
import { query, queryOne } from "../db.mjs";
import { requireAdmin } from "../middleware/auth.mjs";

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// GET /api/locations - Get all active locations (public)
router.get("/", async (req, res) => {
  try {
    const locations = await query(
      "SELECT id, name, address, type FROM locations WHERE is_active = 1 ORDER BY name ASC"
    );
    res.json({ success: true, locations });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ success: false, error: "Gagal memuat lokasi" });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// GET /api/locations/admin/all - Get all locations including inactive (admin only)
router.get("/admin/all", requireAdmin, async (req, res) => {
  try {
    const locations = await query(
      "SELECT * FROM locations ORDER BY is_active DESC, name ASC"
    );
    res.json({ success: true, locations });
  } catch (error) {
    console.error("Error fetching all locations:", error);
    res.status(500).json({ success: false, error: "Gagal memuat lokasi" });
  }
});

// GET /api/locations/admin/:id - Get single location by ID (admin only)
router.get("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const location = await queryOne("SELECT * FROM locations WHERE id = ?", [
      req.params.id,
    ]);

    if (!location) {
      return res
        .status(404)
        .json({ success: false, error: "Lokasi tidak ditemukan" });
    }

    res.json({ success: true, location });
  } catch (error) {
    console.error("Error fetching location:", error);
    res.status(500).json({ success: false, error: "Gagal memuat lokasi" });
  }
});

// POST /api/locations/admin - Create new location (admin only)
router.post("/admin", requireAdmin, async (req, res) => {
  try {
    const { name, address, type, is_active } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: "Nama lokasi harus diisi",
      });
    }

    // Validate type
    const validTypes = ["store", "warehouse"];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Tipe lokasi tidak valid. Pilih: ${validTypes.join(", ")}`,
      });
    }

    // Check for duplicate name
    const existing = await queryOne(
      "SELECT id FROM locations WHERE LOWER(name) = LOWER(?)",
      [name.trim()]
    );
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Lokasi dengan nama tersebut sudah ada",
      });
    }

    const result = await query(
      `INSERT INTO locations (name, address, type, is_active) VALUES (?, ?, ?, ?)`,
      [
        name.trim(),
        address || null,
        type || "store",
        is_active !== undefined ? is_active : 1,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Lokasi berhasil ditambahkan",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating location:", error);
    res.status(500).json({ success: false, error: "Gagal menambahkan lokasi" });
  }
});

// PATCH /api/locations/admin/:id - Update location (admin only)
router.patch("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const { name, address, type, is_active } = req.body;
    const locationId = req.params.id;

    // Check if location exists
    const existing = await queryOne("SELECT id FROM locations WHERE id = ?", [
      locationId,
    ]);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: "Lokasi tidak ditemukan" });
    }

    // Validate type if provided
    const validTypes = ["store", "warehouse"];
    if (type !== undefined && !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Tipe lokasi tidak valid. Pilih: ${validTypes.join(", ")}`,
      });
    }

    // Check for duplicate name if name is being updated
    if (name !== undefined && name.trim()) {
      const duplicateName = await queryOne(
        "SELECT id FROM locations WHERE LOWER(name) = LOWER(?) AND id != ?",
        [name.trim(), locationId]
      );
      if (duplicateName) {
        return res.status(400).json({
          success: false,
          error: "Lokasi dengan nama tersebut sudah ada",
        });
      }
    }

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name.trim());
    }
    if (address !== undefined) {
      updates.push("address = ?");
      values.push(address || null);
    }
    if (type !== undefined) {
      updates.push("type = ?");
      values.push(type);
    }
    if (is_active !== undefined) {
      updates.push("is_active = ?");
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Tidak ada data untuk diupdate" });
    }

    values.push(locationId);

    await query(
      `UPDATE locations SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    // Get updated location
    const updatedLocation = await queryOne(
      "SELECT * FROM locations WHERE id = ?",
      [locationId]
    );

    res.json({
      success: true,
      message: "Lokasi berhasil diupdate",
      location: updatedLocation,
    });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ success: false, error: "Gagal mengupdate lokasi" });
  }
});

// DELETE /api/locations/admin/:id - Soft delete location (admin only)
// Sets is_active = 0 instead of actual deletion to preserve data integrity
router.delete("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const locationId = req.params.id;

    // Check if location exists
    const existing = await queryOne("SELECT id, name FROM locations WHERE id = ?", [
      locationId,
    ]);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: "Lokasi tidak ditemukan" });
    }

    // Check if there are active stocks at this location
    const stockCount = await queryOne(
      "SELECT COUNT(*) as count FROM product_stocks WHERE location_id = ? AND quantity > 0",
      [locationId]
    );

    if (stockCount && stockCount.count > 0) {
      return res.status(400).json({
        success: false,
        error: `Tidak dapat menonaktifkan lokasi "${existing.name}" karena masih memiliki ${stockCount.count} produk dengan stok aktif`,
      });
    }

    // Soft delete: set is_active = 0
    await query("UPDATE locations SET is_active = 0 WHERE id = ?", [locationId]);

    res.json({
      success: true,
      message: `Lokasi "${existing.name}" berhasil dinonaktifkan`,
    });
  } catch (error) {
    console.error("Error deactivating location:", error);
    res.status(500).json({ success: false, error: "Gagal menonaktifkan lokasi" });
  }
});

// POST /api/locations/admin/:id/reactivate - Reactivate a disabled location (admin only)
router.post("/admin/:id/reactivate", requireAdmin, async (req, res) => {
  try {
    const locationId = req.params.id;

    // Check if location exists
    const existing = await queryOne("SELECT id, name, is_active FROM locations WHERE id = ?", [
      locationId,
    ]);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: "Lokasi tidak ditemukan" });
    }

    if (existing.is_active === 1) {
      return res.status(400).json({
        success: false,
        error: "Lokasi sudah aktif",
      });
    }

    await query("UPDATE locations SET is_active = 1 WHERE id = ?", [locationId]);

    res.json({
      success: true,
      message: `Lokasi "${existing.name}" berhasil diaktifkan kembali`,
    });
  } catch (error) {
    console.error("Error reactivating location:", error);
    res.status(500).json({ success: false, error: "Gagal mengaktifkan lokasi" });
  }
});

export default router;
