import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads/products");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random hash
    const uniqueSuffix = `${Date.now()}-${crypto
      .randomBytes(6)
      .toString("hex")}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

// File filter for security
const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

  const ext = path.extname(file.originalname).toLowerCase();
  const mimeValid = allowedMimes.includes(file.mimetype);
  const extValid = allowedExts.includes(ext);

  if (mimeValid && extValid) {
    cb(null, true);
  } else {
    cb(
      new Error("Hanya file gambar (JPG, PNG, WebP, GIF) yang diperbolehkan!"),
      false
    );
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

// Generic upload endpoint (for articles, insights, etc.)
router.post("/", (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      // Multer error
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: "Ukuran file terlalu besar. Maksimal 5MB",
          });
        }
        return res.status(400).json({
          success: false,
          error: err.message,
        });
      }
      
      // Custom error (file filter)
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Tidak ada file yang diupload",
        });
      }

      // Return relative URL path
      const filePath = `/uploads/products/${req.file.filename}`;

      res.json({
        success: true,
        filePath: filePath, // For compatibility with articles-manager.js
        data: {
          url: filePath,
          filename: req.file.filename,
          size: req.file.size,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Gagal mengupload gambar",
      });
    }
  });
});

// Upload endpoint (for products - legacy)
router.post("/product-image", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Tidak ada file yang diupload",
      });
    }

    // Return relative URL path
    const imageUrl = `/uploads/products/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Gagal mengupload gambar",
    });
  }
});

// Delete image endpoint
router.delete("/product-image/:filename", (req, res) => {
  try {
    const { filename } = req.params;

    // Security: prevent path traversal
    if (
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid filename",
      });
    }

    const filePath = path.join(uploadsDir, filename);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: "Gambar berhasil dihapus",
      });
    } else {
      res.status(404).json({
        success: false,
        error: "File tidak ditemukan",
      });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menghapus gambar",
    });
  }
});

export default router;
