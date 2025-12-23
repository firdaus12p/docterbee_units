import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { query, queryOne } from "../db.mjs";
import { requireAdmin } from "../middleware/auth.mjs";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads/podcasts directory exists
const uploadsDir = path.join(__dirname, "../../uploads/podcasts");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage for podcasts
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random hash
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `podcast-${uniqueSuffix}${ext}`);
  },
});

// File filter for audio files only
const audioFileFilter = (req, file, cb) => {
  const allowedMimes = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/wave",
    "audio/x-wav",
    "audio/ogg",
    "audio/vorbis",
  ];
  const allowedExts = [".mp3", ".wav", ".ogg"];

  const ext = path.extname(file.originalname).toLowerCase();
  const mimeValid = allowedMimes.includes(file.mimetype);
  const extValid = allowedExts.includes(ext);

  if (mimeValid && extValid) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file audio (MP3, WAV, OGG) yang diperbolehkan!"), false);
  }
};

// Configure multer for audio uploads
const uploadAudio = multer({
  storage: storage,
  fileFilter: audioFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max for audio files
  },
});

// ========================================
// PUBLIC ENDPOINTS
// ========================================

// GET /api/podcasts - Get all active podcasts (public)
router.get("/", async (req, res) => {
  try {
    const podcasts = await query(
      "SELECT id, title, audio_url FROM podcasts WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC"
    );

    res.json({
      success: true,
      data: podcasts,
    });
  } catch (error) {
    console.error("Error fetching podcasts:", error);
    res.status(500).json({
      success: false,
      error: "Gagal memuat podcast",
    });
  }
});

// ========================================
// ADMIN ENDPOINTS
// ========================================

// GET /api/podcasts/admin - Get all podcasts including inactive (admin only)
router.get("/admin", requireAdmin, async (req, res) => {
  try {
    const podcasts = await query(
      "SELECT * FROM podcasts ORDER BY sort_order ASC, created_at DESC"
    );

    res.json({
      success: true,
      data: podcasts,
    });
  } catch (error) {
    console.error("Error fetching podcasts for admin:", error);
    res.status(500).json({
      success: false,
      error: "Gagal memuat podcast",
    });
  }
});

// POST /api/podcasts - Create new podcast (admin only)
router.post("/", requireAdmin, (req, res) => {
  uploadAudio.single("audio")(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            error: "Ukuran file terlalu besar. Maksimal 50MB",
          });
        }
        return res.status(400).json({
          success: false,
          error: err.message,
        });
      }
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    try {
      const { title, is_active, sort_order } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          error: "Judul podcast harus diisi",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "File audio harus diupload",
        });
      }

      const audioUrl = `/uploads/podcasts/${req.file.filename}`;

      const result = await query(
        `INSERT INTO podcasts (title, audio_url, is_active, sort_order) VALUES (?, ?, ?, ?)`,
        [
          title.trim(),
          audioUrl,
          is_active === "false" || is_active === "0" ? 0 : 1,
          parseInt(sort_order) || 0,
        ]
      );

      res.json({
        success: true,
        message: "Podcast berhasil ditambahkan",
        data: {
          id: result.insertId,
          title: title.trim(),
          audio_url: audioUrl,
          is_active: is_active !== "false" && is_active !== "0",
          sort_order: parseInt(sort_order) || 0,
        },
      });
    } catch (error) {
      console.error("Error creating podcast:", error);
      res.status(500).json({
        success: false,
        error: "Gagal menambahkan podcast",
      });
    }
  });
});

// PUT /api/podcasts/:id - Update podcast (admin only)
router.put("/:id", requireAdmin, (req, res) => {
  uploadAudio.single("audio")(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            error: "Ukuran file terlalu besar. Maksimal 50MB",
          });
        }
        return res.status(400).json({
          success: false,
          error: err.message,
        });
      }
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    try {
      const { id } = req.params;
      const { title, is_active, sort_order } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          error: "Judul podcast harus diisi",
        });
      }

      // Get existing podcast
      const existing = await queryOne("SELECT * FROM podcasts WHERE id = ?", [id]);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: "Podcast tidak ditemukan",
        });
      }

      let audioUrl = existing.audio_url;

      // If new audio file uploaded, delete old one and use new
      if (req.file) {
        // Delete old audio file
        if (existing.audio_url) {
          const oldFilename = path.basename(existing.audio_url);
          const oldFilePath = path.join(uploadsDir, oldFilename);
          if (fs.existsSync(oldFilePath)) {
            try {
              fs.unlinkSync(oldFilePath);
            } catch (unlinkError) {
              console.warn("Could not delete old audio file:", unlinkError.message);
            }
          }
        }
        audioUrl = `/uploads/podcasts/${req.file.filename}`;
      }

      await query(
        `UPDATE podcasts SET title = ?, audio_url = ?, is_active = ?, sort_order = ?, updated_at = NOW() WHERE id = ?`,
        [
          title.trim(),
          audioUrl,
          is_active === "false" || is_active === "0" ? 0 : 1,
          parseInt(sort_order) || 0,
          id,
        ]
      );

      res.json({
        success: true,
        message: "Podcast berhasil diperbarui",
        data: {
          id: parseInt(id),
          title: title.trim(),
          audio_url: audioUrl,
          is_active: is_active !== "false" && is_active !== "0",
          sort_order: parseInt(sort_order) || 0,
        },
      });
    } catch (error) {
      console.error("Error updating podcast:", error);
      res.status(500).json({
        success: false,
        error: "Gagal memperbarui podcast",
      });
    }
  });
});

// DELETE /api/podcasts/:id - Delete podcast (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get podcast to find audio file
    const podcast = await queryOne("SELECT * FROM podcasts WHERE id = ?", [id]);
    if (!podcast) {
      return res.status(404).json({
        success: false,
        error: "Podcast tidak ditemukan",
      });
    }

    // Delete audio file
    if (podcast.audio_url) {
      const filename = path.basename(podcast.audio_url);
      
      // Security: prevent path traversal
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(400).json({
          success: false,
          error: "Invalid filename",
        });
      }

      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkError) {
          console.warn("Could not delete audio file:", unlinkError.message);
        }
      }
    }

    // Delete from database
    await query("DELETE FROM podcasts WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Podcast berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting podcast:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menghapus podcast",
    });
  }
});

// PATCH /api/podcasts/:id/toggle - Toggle podcast active status (admin only)
router.patch("/:id/toggle", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const podcast = await queryOne("SELECT * FROM podcasts WHERE id = ?", [id]);
    if (!podcast) {
      return res.status(404).json({
        success: false,
        error: "Podcast tidak ditemukan",
      });
    }

    const newStatus = podcast.is_active ? 0 : 1;
    await query("UPDATE podcasts SET is_active = ?, updated_at = NOW() WHERE id = ?", [
      newStatus,
      id,
    ]);

    res.json({
      success: true,
      message: `Podcast ${newStatus ? "diaktifkan" : "dinonaktifkan"}`,
      data: {
        id: parseInt(id),
        is_active: !!newStatus,
      },
    });
  } catch (error) {
    console.error("Error toggling podcast status:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengubah status podcast",
    });
  }
});

export default router;
