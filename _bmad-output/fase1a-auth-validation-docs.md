# FASE 1A: DOKUMENTASI VALIDASI MANUAL - AUTH ENDPOINTS
**File:** `backend/routes/auth.mjs`  
**Tanggal:** 2026-01-07  
**Status:** DOKUMENTASI ONLY - BELUM ADA PERUBAHAN KODE

---

## ENDPOINT 1: POST /api/auth/register

### Validasi Manual Saat Ini (Lines 17-66)

| Field | Validasi | Error Message | HTTP Status |
|-------|----------|---------------|-------------|
| `name` | Required (truthy check) | "Semua field harus diisi" | 400 |
| `email` | Required (truthy check) | "Semua field harus diisi" | 400 |
| `phone` | Required (truthy check) | "Semua field harus diisi" | 400 |
| `password` | Required (truthy check) | "Semua field harus diisi" | 400 |
| `email` | Format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) | "Format email tidak valid" | 400 |
| `password` | Min length 6 | "Password minimal 6 karakter" | 400 |
| `email` | Unique (DB check) | "Email sudah terdaftar" | 400 |
| `phone` | Unique (DB check) | "Nomor telepon sudah terdaftar" | 400 |
| `card_type` | Optional, default 'Active-Worker' if invalid | N/A | N/A |

### Logika Bisnis Tambahan
- Password di-hash dengan `bcrypt.hash(password, 10)`
- Session otomatis dibuat setelah registrasi sukses
- Valid card types: 'Active-Worker', 'Family-Member', 'Healthy-Smart-Kids', 'Mums-Baby', 'New-Couple', 'Pregnant-Preparation', 'Senja-Ceria'

### Response Format
**Success (201):**
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "id": 123,
    "name": "...",
    "email": "...",
    "phone": "...",
    "card_type": "..."
  }
}
```

**Error (400/500):**
```json
{
  "success": false,
  "error": "..."
}
```

### Test Cases yang Harus Tetap Berjalan
1. ✅ User bisa register dengan data valid
2. ✅ Error jika field kosong
3. ✅ Error jika email format salah
4. ✅ Error jika password < 6 karakter
5. ✅ Error jika email sudah terdaftar
6. ✅ Error jika phone sudah terdaftar
7. ✅ Session otomatis dibuat setelah register

---

## ENDPOINT 2: POST /api/auth/login

### Validasi Manual Saat Ini (Lines 122-128)

| Field | Validasi | Error Message | HTTP Status |
|-------|----------|---------------|-------------|
| `email` | Required (truthy check) | "Email dan password harus diisi" | 400 |
| `password` | Required (truthy check) | "Email dan password harus diisi" | 400 |

### Logika Bisnis Tambahan
- **Rate Limiting:** `loginRateLimiter.middleware()` (8 attempts / 2 min)
- Password verification dengan `bcrypt.compare()`
- User harus `is_active = 1`
- Rate limiter di-reset setelah login sukses
- Rate limiter record failure jika login gagal (dengan pesan attempts tersisa)

### Response Format
**Success (200):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "id": 123,
    "name": "...",
    "email": "...",
    "phone": "..."
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "error": "Email atau password salah (X percobaan tersisa)"
}
```

### Test Cases yang Harus Tetap Berjalan
1. ✅ User bisa login dengan kredensial valid
2. ✅ Error jika email/password kosong
3. ✅ Error jika email tidak ditemukan
4. ✅ Error jika password salah
5. ✅ Rate limiting berfungsi (attempts counter)
6. ✅ Session dibuat setelah login sukses
7. ✅ Rate limiter di-reset setelah login sukses

---

## ENDPOINT 3: POST /api/auth/change-password

### Validasi Manual Saat Ini (Lines 289-325)

| Field | Validasi | Error Message | HTTP Status |
|-------|----------|---------------|-------------|
| Session | Must be logged in | "Silakan login terlebih dahulu" | 401 |
| `currentPassword` | Required (truthy check) | "Password saat ini dan password baru harus diisi" | 400 |
| `newPassword` | Required (truthy check) | "Password saat ini dan password baru harus diisi" | 400 |
| `newPassword` | Min length 6 (after trim) | "Password minimal 6 karakter" | 400 |
| `newPassword` | Must differ from current | "Password baru harus berbeda dari password saat ini" | 400 |
| User | `is_email_verified` must be 1 | "Email Anda belum diverifikasi..." | 403 |
| `currentPassword` | Must match DB (bcrypt) | "Password saat ini tidak sesuai..." | 401 |

### Logika Bisnis Tambahan
- Password di-trim sebelum validasi
- Current password diverifikasi dengan `bcrypt.compare()`
- **CRITICAL:** Email harus sudah diverifikasi (`is_email_verified = 1`)
- Session TIDAK di-destroy setelah password change

### Response Format
**Success (200):**
```json
{
  "success": true,
  "message": "Password berhasil diubah. Gunakan password baru untuk login berikutnya."
}
```

### Test Cases yang Harus Tetap Berjalan
1. ✅ User bisa change password dengan data valid
2. ✅ Error jika belum login
3. ✅ Error jika field kosong
4. ✅ Error jika new password < 6 karakter
5. ✅ Error jika new password sama dengan current
6. ✅ Error jika email belum verified
7. ✅ Error jika current password salah
8. ✅ Session tetap aktif setelah change password

---

## ENDPOINT 4: POST /api/auth/update-email

### Validasi Manual Saat Ini (Lines 386-404)

| Field | Validasi | Error Message | HTTP Status |
|-------|----------|---------------|-------------|
| Session | Must be logged in | "Silakan login terlebih dahulu" | 401 |
| `email` | Required (truthy check) | "Email harus diisi" | 400 |
| `email` | Format (regex) | "Format email tidak valid" | 400 |
| `email` | Not ending with '.local' | "Format email tidak valid" | 400 |
| `email` | Unique (excluding current user) | "Email ini sudah digunakan oleh akun lain" | 400 |

### Logika Bisnis Tambahan
- **Rate Limiting:** `emailRateLimiter.middleware()` (3 attempts / 10 min)
- Email baru disimpan di `pending_email` (tidak langsung replace)
- Token verification dibuat (valid 24 jam)
- `is_email_verified` di-set ke 0
- Verification email dikirim via `sendVerificationEmail()`

### Response Format
**Success (200):**
```json
{
  "success": true,
  "message": "Link verifikasi telah dikirim ke email baru Anda..."
}
```

### Test Cases yang Harus Tetap Berjalan
1. ✅ User bisa request email change dengan email valid
2. ✅ Error jika belum login
3. ✅ Error jika email kosong
4. ✅ Error jika email format salah
5. ✅ Error jika email sudah dipakai user lain
6. ✅ Rate limiting berfungsi
7. ✅ Verification email terkirim

---

## ENDPOINT 5: POST /api/auth/forgot-password

### Validasi Manual Saat Ini (Lines 526-528)

| Field | Validasi | Error Message | HTTP Status |
|-------|----------|---------------|-------------|
| `email` | Required (truthy check) | "Email harus diisi" | 400 |

### Logika Bisnis Tambahan
- **Rate Limiting:** `loginRateLimiter.middleware()` (8 attempts / 2 min)
- **Security:** Response sama baik email ada atau tidak (prevent user enumeration)
- Token reset dibuat (valid 1 jam)
- Reset email dikirim via `sendForgotPasswordEmail()`

### Response Format
**Success (200) - ALWAYS:**
```json
{
  "success": true,
  "message": "Jika email tersebut terdaftar, link reset password akan segera dikirim."
}
```

### Test Cases yang Harus Tetap Berjalan
1. ✅ User bisa request reset dengan email valid
2. ✅ Error jika email kosong
3. ✅ Response sama baik email ada atau tidak
4. ✅ Rate limiting berfungsi
5. ✅ Reset email terkirim jika email valid

---

## ENDPOINT 6: POST /api/auth/reset-password

### Validasi Manual Saat Ini (Lines 566-574)

| Field | Validasi | Error Message | HTTP Status |
|-------|----------|---------------|-------------|
| `token` | Required (truthy check) | "Token dan password baru harus diisi" | 400 |
| `newPassword` | Required (truthy check) | "Token dan password baru harus diisi" | 400 |
| `newPassword` | Min length 6 | "Password minimal 6 karakter" | 400 |
| `token` | Valid & not expired (DB check) | "Token tidak valid atau sudah kadaluarsa" | 400 |

### Logika Bisnis Tambahan
- Token harus valid dan `reset_password_expires > NOW()`
- Password di-hash dengan `bcrypt.hash()`
- Token di-clear setelah reset sukses
- `is_email_verified` di-set ke 1 (auto-verify)

### Response Format
**Success (200):**
```json
{
  "success": true,
  "message": "Password berhasil diubah. Silakan login dengan password baru Anda."
}
```

### Test Cases yang Harus Tetap Berjalan
1. ✅ User bisa reset password dengan token valid
2. ✅ Error jika token/password kosong
3. ✅ Error jika password < 6 karakter
4. ✅ Error jika token invalid/expired
5. ✅ Email auto-verified setelah reset
6. ✅ Token di-clear setelah reset sukses

---

## ENDPOINT 7: POST /api/auth/resend-verification

### Validasi Manual Saat Ini (Lines 485-497)

| Field | Validasi | Error Message | HTTP Status |
|-------|----------|---------------|-------------|
| Session | Must be logged in | "Silakan login terlebih dahulu" | 401 |
| User | Must exist in DB | "User tidak ditemukan" | 404 |
| User | `is_email_verified` must be 0 | "Email sudah terverifikasi" | 400 |

### Logika Bisnis Tambahan
- **Rate Limiting:** `emailRateLimiter.middleware()` (3 attempts / 10 min)
- Token baru dibuat (invalidates old token)
- `pending_email` di-set ke current email
- Verification email dikirim

### Response Format
**Success (200):**
```json
{
  "success": true,
  "message": "Link verifikasi baru telah dikirim ke [email]"
}
```

### Test Cases yang Harus Tetap Berjalan
1. ✅ User bisa resend verification
2. ✅ Error jika belum login
3. ✅ Error jika user tidak ditemukan
4. ✅ Error jika email sudah verified
5. ✅ Rate limiting berfungsi
6. ✅ Verification email terkirim

---

## RINGKASAN POLA VALIDASI AUTH

### Pola yang Konsisten
1. **Response Format:** Selalu `{ success: true/false, message/error: "..." }`
2. **Required Fields:** Menggunakan truthy check (`if (!field)`)
3. **Email Format:** Regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
4. **Password Min Length:** 6 karakter
5. **Rate Limiting:** Login (8/2min), Email (3/10min)
6. **Password Hashing:** `bcrypt.hash(password, 10)`
7. **Password Verification:** `bcrypt.compare(input, hashed)`

### Catatan Penting untuk Validator Baru
1. **JANGAN UBAH** pesan error yang sudah ada
2. **JANGAN UBAH** HTTP status code
3. **JANGAN UBAH** logika rate limiting
4. **JANGAN UBAH** logika session management
5. **JANGAN UBAH** logika bcrypt hashing/verification
6. **PASTIKAN** validator baru return error format yang sama

---

## NEXT STEP
Setelah approval Daus, kami akan:
1. Buat validator chains untuk semua endpoint auth
2. Test di local environment
3. Presentasikan hasil untuk review sebelum apply

**Status:** MENUNGGU APPROVAL DAUS
