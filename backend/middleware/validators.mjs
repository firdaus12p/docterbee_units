import { body, validationResult } from "express-validator";

/**
 * Middleware helper to check validation results
 * Returns 400 if there are validation errors
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "Data tidak valid: " + errors.array()[0].msg, // Return the first error message
      validationErrors: errors.array(),
    });
  }
  next();
};

/**
 * Validation rules for creating a booking
 */
export const createBookingValidator = [
  body("serviceName")
    .trim()
    .notEmpty()
    .withMessage("Nama layanan harus diisi"),
  
  body("branch")
    .trim()
    .notEmpty()
    .withMessage("Cabang harus dipilih"),
  
  body("practitioner")
    .trim()
    .notEmpty()
    .withMessage("Praktisi harus dipilih"),
  
  body("date")
    .trim()
    .notEmpty()
    .withMessage("Tanggal harus diisi")
    .isDate()
    .withMessage("Format tanggal tidak valid (YYYY-MM-DD)"),
  
  body("time")
    .trim()
    .notEmpty()
    .withMessage("Waktu harus diisi")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/)
    .withMessage("Format waktu tidak valid (HH:mm)"),
  
  body("mode")
    .trim()
    .notEmpty()
    .isIn(["online", "offline"])
    .withMessage("Mode harus 'online' atau 'offline'"),
  
  // Optional customer data validation (only strictly validate if provided)
  body("customerName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Nama pelanggan tidak boleh kosong jika disertakan"),

  body("customerPhone")
    .optional()
    .trim()
    .isMobilePhone("id-ID") // validating for Indonesian numbers primarily
    .withMessage("Nomor telepon tidak valid"),
    
  body("customerAge")
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage("Umur harus berupa angka valid"),
];

/**
 * Validation rules for user registration
 * CRITICAL: These rules MUST match the manual validation in auth.mjs exactly
 * to ensure 100% backward compatibility
 */
export const registerValidator = [
  // Required fields validation - matches: if (!name || !email || !phone || !password)
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Semua field harus diisi"),
  
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Semua field harus diisi")
    // Email format validation - matches: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .isEmail()
    .withMessage("Format email tidak valid")
    .normalizeEmail(),
  
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Semua field harus diisi"),
  
  body("password")
    .notEmpty()
    .withMessage("Semua field harus diisi")
    // Password minimum length - matches: if (password.length < 6)
    .isLength({ min: 6 })
    .withMessage("Password minimal 6 karakter"),
  
  // card_type is optional - will be validated/defaulted in route handler
  body("card_type")
    .optional()
    .trim(),
];

/**
 * Validation rules for user login
 * Matches: auth.mjs lines 122-128
 */
export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email dan password harus diisi"),
  
  body("password")
    .notEmpty()
    .withMessage("Email dan password harus diisi"),
];

/**
 * Validation rules for change password
 * Matches: auth.mjs lines 299-325
 */
export const changePasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Password saat ini dan password baru harus diisi"),
  
  body("newPassword")
    .notEmpty()
    .withMessage("Password saat ini dan password baru harus diisi")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password minimal 6 karakter")
    .custom((value, { req }) => {
      // Validate new password is different from current
      if (value.trim() === req.body.currentPassword?.trim()) {
        throw new Error("Password baru harus berbeda dari password saat ini");
      }
      return true;
    }),
];

/**
 * Validation rules for update email
 * Matches: auth.mjs lines 390-398
 */
export const updateEmailValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email harus diisi")
    .isEmail()
    .withMessage("Format email tidak valid")
    .custom((value) => {
      // Reject .local domains
      if (value.endsWith('.local')) {
        throw new Error("Format email tidak valid");
      }
      return true;
    })
    .normalizeEmail(),
];

/**
 * Validation rules for forgot password
 * Matches: auth.mjs lines 526-528
 */
export const forgotPasswordValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email harus diisi"),
];

/**
 * Validation rules for reset password
 * Matches: auth.mjs lines 566-574
 */
export const resetPasswordValidator = [
  body("token")
    .trim()
    .notEmpty()
    .withMessage("Token dan password baru harus diisi"),
  
  body("newPassword")
    .notEmpty()
    .withMessage("Token dan password baru harus diisi")
    .isLength({ min: 6 })
    .withMessage("Password minimal 6 karakter"),
];

// ============================================
// ORDER VALIDATORS
// ============================================

/**
 * Validation rules for creating an order
 * Matches: orders.mjs lines 117-129
 */
export const createOrderValidator = [
  body("order_type")
    .trim()
    .notEmpty()
    .withMessage("Order type, store location, items, dan total amount harus diisi"),
  
  body("store_location")
    .trim()
    .notEmpty()
    .withMessage("Order type, store location, items, dan total amount harus diisi"),
  
  body("items")
    .notEmpty()
    .withMessage("Order type, store location, items, dan total amount harus diisi")
    .isArray({ min: 1 })
    .withMessage("Items harus berupa array dan tidak boleh kosong"),
  
  body("total_amount")
    .notEmpty()
    .withMessage("Order type, store location, items, dan total amount harus diisi")
    .isNumeric()
    .withMessage("Total amount harus berupa angka"),
  
  // Optional fields
  body("guest_data")
    .optional(),
  
  body("coupon_code")
    .optional()
    .trim(),
  
  body("coupon_discount")
    .optional()
    .isNumeric()
    .withMessage("Coupon discount harus berupa angka"),
  
  body("location_id")
    .optional()
    .isInt()
    .withMessage("Location ID harus berupa angka"),
];

/**
 * Validation rules for assigning points by phone
 * Matches: orders.mjs lines 780-785
 */
export const assignPointsByPhoneValidator = [
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Nomor HP harus diisi"),
];

