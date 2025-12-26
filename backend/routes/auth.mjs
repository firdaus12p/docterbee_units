import express from "express";
import bcrypt from "bcryptjs";
import { query, queryOne } from "../db.mjs";
import { loginRateLimiter } from "../utils/rate-limiter.mjs";

const router = express.Router();

// ============================================
// POST /api/auth/register - Register new user
// ============================================
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, card_type } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: "Semua field harus diisi",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Format email tidak valid",
      });
    }

    // Password minimum length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password minimal 6 karakter",
      });
    }

    // Check if email already exists
    const existingUser = await queryOne(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email sudah terdaftar",
      });
    }

    // Check if phone number already exists
    const existingPhone = await queryOne(
      "SELECT id FROM users WHERE phone = ?",
      [phone]
    );

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        error: "Nomor telepon sudah terdaftar",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate card_type or use default
    const validCardTypes = [
      'Active-Worker',
      'Family-Member',
      'Healthy-Smart-Kids',
      'Mums-Baby',
      'New-Couple',
      'Pregnant-Preparation',
      'Senja-Ceria'
    ];
    const finalCardType = validCardTypes.includes(card_type) ? card_type : 'Active-Worker';

    // Insert user
    const result = await query(
      `INSERT INTO users (name, email, phone, password, card_type) VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone, hashedPassword, finalCardType]
    );

    // Create session
    req.session.userId = result.insertId;
    req.session.userName = name;
    req.session.userEmail = email;
    req.session.userPhone = phone;

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: {
        id: result.insertId,
        name,
        email,
        phone,
        card_type: finalCardType,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mendaftar",
    });
  }
});

// ============================================
// POST /api/auth/login - Login user (with rate limiting)
// ============================================
router.post("/login", loginRateLimiter.middleware(), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email dan password harus diisi",
      });
    }

    // Find user
    const user = await queryOne(
      "SELECT * FROM users WHERE email = ? AND is_active = 1",
      [email]
    );

    if (!user) {
      // Record failed attempt
      const result = req.rateLimiter.recordFailure();
      const attemptsMsg = result.attemptsLeft > 0 
        ? ` (${result.attemptsLeft} percobaan tersisa)` 
        : '';
      
      return res.status(401).json({
        success: false,
        error: `Email atau password salah${attemptsMsg}`,
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      // Record failed attempt
      const result = req.rateLimiter.recordFailure();
      const attemptsMsg = result.attemptsLeft > 0 
        ? ` (${result.attemptsLeft} percobaan tersisa)` 
        : '';
      
      return res.status(401).json({
        success: false,
        error: `Email atau password salah${attemptsMsg}`,
      });
    }

    // Successful login - reset rate limiter
    req.rateLimiter.reset();

    // Create session
    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    req.session.userPhone = user.phone;

    res.json({
      success: true,
      message: "Login berhasil",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      success: false,
      error: "Gagal login",
    });
  }
});

// ============================================
// POST /api/auth/logout - Logout user
// ============================================
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: "Gagal logout",
      });
    }

    res.clearCookie("connect.sid");
    res.json({
      success: true,
      message: "Logout berhasil",
    });
  });
});

// ============================================
// GET /api/auth/me - Get current user
// ============================================
router.get("/me", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        error: "Belum login",
      });
    }

    const user = await queryOne(
      "SELECT id, name, email, phone, card_type, created_at FROM users WHERE id = ? AND is_active = 1",
      [req.session.userId]
    );

    if (!user) {
      req.session.destroy();
      return res.status(401).json({
        success: false,
        error: "User tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data user",
    });
  }
});

// ============================================
// GET /api/auth/check - Check if logged in
// ============================================
router.get("/check", (req, res) => {
  res.json({
    success: true,
    loggedIn: !!req.session.userId,
    user: req.session.userId
      ? {
          id: req.session.userId,
          name: req.session.userName,
          email: req.session.userEmail,
          phone: req.session.userPhone,
        }
      : null,
  });
});

export default router;
