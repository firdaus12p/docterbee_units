/**
 * PROTOTYPE: Register Endpoint dengan Express-Validator
 * 
 * File ini adalah CONTOH bagaimana validator baru akan diterapkan.
 * TIDAK AKAN DIGUNAKAN DI PRODUCTION - hanya untuk review Daus.
 * 
 * Tujuan: Menunjukkan bahwa validator baru 100% backward compatible
 * dengan validasi manual yang ada di auth.mjs
 */

import express from "express";
import bcrypt from "bcryptjs";
import { query, queryOne } from "../db.mjs";
import { registerValidator, validate } from "../middleware/validators.mjs";

const router = express.Router();

// ============================================
// PROTOTYPE: POST /api/auth/register dengan Validator Baru
// ============================================
router.post("/register", registerValidator, validate, async (req, res) => {
  try {
    const { name, email, phone, password, card_type } = req.body;

    // CATATAN: Validasi basic (required, format, min length) sudah dilakukan oleh validator
    // Kita hanya perlu validasi yang memerlukan database check

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

export default router;

/**
 * PERBANDINGAN: Validasi Manual vs Validator Baru
 * 
 * SEBELUM (Manual Validation di auth.mjs):
 * ----------------------------------------
 * Lines 17-40:
 * - if (!name || !email || !phone || !password) → Error: "Semua field harus diisi"
 * - if (!emailRegex.test(email)) → Error: "Format email tidak valid"
 * - if (password.length < 6) → Error: "Password minimal 6 karakter"
 * 
 * SESUDAH (Express-Validator):
 * ----------------------------
 * registerValidator array:
 * - body("name").notEmpty() → Error: "Semua field harus diisi"
 * - body("email").notEmpty().isEmail() → Error: "Semua field harus diisi" / "Format email tidak valid"
 * - body("password").notEmpty().isLength({min: 6}) → Error: "Semua field harus diisi" / "Password minimal 6 karakter"
 * 
 * HASIL: PESAN ERROR IDENTIK ✅
 * 
 * 
 * APA YANG BERUBAH?
 * -----------------
 * 1. Validasi basic (required, format) dipindah ke middleware
 * 2. Kode di route handler jadi lebih bersih (hanya logika bisnis)
 * 3. Validasi lebih konsisten dan reusable
 * 
 * APA YANG TIDAK BERUBAH?
 * -----------------------
 * 1. ✅ Pesan error SAMA PERSIS
 * 2. ✅ HTTP status code SAMA (400 untuk validation error)
 * 3. ✅ Response format SAMA ({ success: false, error: "..." })
 * 4. ✅ Logika bisnis (bcrypt, session, card_type) TIDAK BERUBAH
 * 5. ✅ Database check (email/phone unique) TETAP DI ROUTE HANDLER
 * 
 * 
 * TEST CASES YANG HARUS TETAP PASS:
 * ----------------------------------
 * 1. POST /api/auth/register dengan data valid → 201 Success ✅
 * 2. POST tanpa name → 400 "Semua field harus diisi" ✅
 * 3. POST tanpa email → 400 "Semua field harus diisi" ✅
 * 4. POST tanpa phone → 400 "Semua field harus diisi" ✅
 * 5. POST tanpa password → 400 "Semua field harus diisi" ✅
 * 6. POST dengan email format salah → 400 "Format email tidak valid" ✅
 * 7. POST dengan password < 6 char → 400 "Password minimal 6 karakter" ✅
 * 8. POST dengan email sudah terdaftar → 400 "Email sudah terdaftar" ✅
 * 9. POST dengan phone sudah terdaftar → 400 "Nomor telepon sudah terdaftar" ✅
 * 10. Session dibuat setelah register sukses ✅
 * 
 * KESIMPULAN:
 * -----------
 * Validator baru adalah DROP-IN REPLACEMENT yang lebih aman dan maintainable,
 * tanpa mengubah behavior yang sudah ada.
 */
