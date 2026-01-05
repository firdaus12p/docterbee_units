import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { query, queryOne } from "../db.mjs";
import { loginRateLimiter } from "../utils/rate-limiter.mjs";
import { sendVerificationEmail } from "../utils/mailer.mjs";

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

    // Find user - explicitly select needed columns only (security: exclude loading unnecessary data)
    const user = await queryOne(
      "SELECT id, name, email, phone, password FROM users WHERE email = ? AND is_active = 1",
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
router.get("/check", async (req, res) => {
  if (!req.session.userId) {
    return res.json({ success: true, loggedIn: false, user: null });
  }

  try {
    const user = await queryOne(
      "SELECT id, name, email, phone, is_email_verified FROM users WHERE id = ? AND is_active = 1",
      [req.session.userId]
    );

    res.json({
      success: true,
      loggedIn: !!user,
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        is_email_verified: !!user.is_email_verified
      } : null,
    });
  } catch (error) {
    res.json({ success: true, loggedIn: true, user: { id: req.session.userId, name: req.session.userName } });
  }
});

// ============================================
// POST /api/auth/change-password - Self-service password change
// ============================================
router.post("/change-password", async (req, res) => {
  try {
    // Validate user is logged in
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        error: "Silakan login terlebih dahulu",
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Validation - required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Password saat ini dan password baru harus diisi",
      });
    }

    // Trim password inputs to prevent whitespace issues
    const trimmedCurrentPassword = currentPassword.trim();
    const trimmedNewPassword = newPassword.trim();

    // Validate new password minimum length
    if (trimmedNewPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password minimal 6 karakter",
      });
    }

    // Validate new password is different from current
    if (trimmedNewPassword === trimmedCurrentPassword) {
      return res.status(400).json({
        success: false,
        error: "Password baru harus berbeda dari password saat ini",
      });
    }

    // Get user from database
    const user = await queryOne(
      "SELECT id, password FROM users WHERE id = ? AND is_active = 1",
      [req.session.userId]
    );

    // Security: Return same error for "user not found" to prevent user enumeration
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Password saat ini tidak sesuai. Silakan coba lagi.",
      });
    }

    // Verify current password using bcrypt.compare (constant-time by design)
    const isValidPassword = await bcrypt.compare(trimmedCurrentPassword, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Password saat ini tidak sesuai. Silakan coba lagi.",
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(trimmedNewPassword, 10);

    // Update password in database (simple query - transaction optional for single UPDATE)
    await query(
      "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?",
      [hashedNewPassword, req.session.userId]
    );

    // Session remains active (do NOT destroy session)
    res.json({
      success: true,
      message: "Password berhasil diubah. Gunakan password baru untuk login berikutnya.",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      error: "Terjadi kesalahan. Jika Anda tidak yakin apakah password berhasil diubah, coba login dengan password baru Anda.",
    });
  }
});

// ============================================
// POST /api/auth/update-email - Update & Send verification
// ============================================
router.post("/update-email", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, error: "Silakan login terlebih dahulu" });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email harus diisi" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.endsWith('.local')) {
      return res.status(400).json({ success: false, error: "Format email tidak valid" });
    }

    // Check if email taken
    const existing = await queryOne("SELECT id FROM users WHERE email = ? AND id != ?", [email, req.session.userId]);
    if (existing) {
      return res.status(400).json({ success: false, error: "Email ini sudah digunakan oleh akun lain" });
    }

    const token = crypto.randomBytes(32).toString('hex');
    
    // Update pending_token and verification status
    await query(
      "UPDATE users SET pending_email = ?, email_verification_token = ?, is_email_verified = 0 WHERE id = ?",
      [email, token, req.session.userId]
    );

    // Get user name for email
    const user = await queryOne("SELECT name FROM users WHERE id = ?", [req.session.userId]);

    // Send the email
    await sendVerificationEmail(email, user.name, token);

    res.json({
      success: true,
      message: "Link verifikasi telah dikirim ke email baru Anda. Silakan cek inbox (atau spam)."
    });
  } catch (error) {
    console.error("Error updating email:", error);
    res.status(500).json({ success: false, error: "Gagal mengirim email verifikasi" });
  }
});

// ============================================
// GET /api/auth/verify-email - Verify token
// ============================================
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.send("<h1>Token tidak valid</h1>");
    }

    const user = await queryOne(
      "SELECT id, pending_email FROM users WHERE email_verification_token = ?",
      [token]
    );

    if (!user) {
      return res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #ef4444;">Link Kadaluarsa atau Tidak Valid</h1>
          <p>Silakan minta link verifikasi baru dari dashboard Anda.</p>
          <a href="/journey" style="color: #6366f1;">Kembali ke Dashboard</a>
        </div>
      `);
    }

    // Success! Update email and mark as verified
    await query(
      "UPDATE users SET email = ?, pending_email = NULL, email_verification_token = NULL, is_email_verified = 1 WHERE id = ?",
      [user.pending_email || 'check_db', user.id]
    );

    // If it's a current session, update session email
    if (req.session.userId === user.id && user.pending_email) {
      req.session.userEmail = user.pending_email;
    }

    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #22c55e;">Email Berhasil Diverifikasi! 🎉</h1>
        <p>Akun Anda sekarang sudah aktif dan aman.</p>
        <a href="/journey" style="background: #6366f1; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; margin-top: 20px;">Masuk ke Dashboard</a>
      </div>
    `);
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).send("Terjadi kesalahan server");
  }
});

export default router;
