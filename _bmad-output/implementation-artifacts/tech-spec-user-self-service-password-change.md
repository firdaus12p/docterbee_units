---
title: 'User Self-Service Password Change'
slug: 'user-self-service-password-change'
created: '2026-01-05'
status: 'completed'
stepsCompleted: [1, 2, 3, 4, 5]
tech_stack: ['Node.js (ESM)', 'Express.js ^4.21.2', 'bcryptjs ^3.0.3', 'express-session ^1.18.2', 'mysql2 ^3.11.5', 'Vanilla HTML/CSS/JS', 'Tailwind CSS (CDN)']
files_to_modify: ['backend/routes/auth.mjs', 'profile.html', 'login.html']
code_patterns: ['Express route handlers with try/catch', 'bcrypt.compare() for password validation', 'Session-based authentication', 'Standardized JSON response format', 'Frontend fetch() with credentials: include']
test_patterns: ['Native Node.js test runner (node --test)', 'Tests in tests/ directory', 'Coverage focus on auth logic']
---

# Tech-Spec: User Self-Service Password Change

**Created:** 2026-01-05

## Overview

### Problem Statement

Saat ini, users tidak memiliki cara untuk mengganti password mereka sendiri. Jika lupa password, mereka harus menghubungi admin secara manual via chat (WhatsApp), dan admin me-reset password di dashboard. Ini tidak efisien untuk use case dimana user masih ingat password lama dan hanya ingin menggantinya untuk keamanan atau preferensi pribadi.

### Solution

Tambahkan fitur Self-Service Change Password di halaman Profil user, dengan validasi password lama untuk keamanan. Untuk use case "Lupa Password", tetap menggunakan alur manual via Admin (tidak ada perubahan di sisi admin dashboard).

### Scope

**In Scope:**
- Backend API endpoint `POST /api/user/change-password` dengan validasi password lama
- Frontend form ganti password di `profile.html` (3 input: Password Lama, Password Baru, Konfirmasi)
- Frontend link "Lupa Password?" di `login.html` yang membuka WhatsApp Admin dengan template pesan

**Out of Scope:**
- Fitur admin dashboard untuk reset password (sudah ada, tidak perlu modifikasi)
- Email/SMS verification untuk reset password
- Password strength meter UI (bisa ditambahkan di iterasi berikutnya)
- Force password change untuk password sementara dari admin

## Context for Development

### Technical Preferences

- **Security First**: Password lama HARUS divalidasi di backend sebelum mengizinkan perubahan
- **Backend Validation**: Semua validasi password (panjang minimum, format) dilakukan di backend, tidak hanya frontend
- **Session Handling**: Setelah password berhasil diganti, user tetap login (session tidak di-invalidate)
- **Error Messages**: Pesan error harus jelas dan user-friendly dalam Bahasa Indonesia

### Codebase Patterns

**Auth Route Pattern (from `backend/routes/auth.mjs`):**
- All routes use `async (req, res)` with try/catch error handling
- Password validation: minimum 6 characters (`password.length < 6`)
- Password hashing: `bcrypt.hash(password, 10)` for new passwords
- Password verification: `bcrypt.compare(plainPassword, hashedPassword)`
- Response format: `{ success: true/false, message/error: '...', data: {...} }`
- Session access: `req.session.userId`, `req.session.userName`, etc.
- Error logging: `console.error()` before returning 500 status

**Frontend Pattern (from `login.html`):**
- Uses `fetch('/api/...', { method: 'POST', credentials: 'include', headers: {...}, body: JSON.stringify({...}) })`
- Error display via global functions: `showError()`, `showSuccess()`, `showWarning()`
- Form validation before submission

**Profile Page Structure (from `profile.html`):**
- Uses Tailwind CSS classes extensively
- Card-based layout: `.profile-info-card` with `.info-row` sections
- Gradient header: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Responsive design with mobile breakpoints

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `backend/routes/auth.mjs` | Reference for auth endpoint patterns, password hashing/validation |
| `backend/db.mjs` | Database query helpers (`query`, `queryOne`) |
| `profile.html` | Target file for adding Change Password UI section |
| `login.html` | Target file for adding "Lupa Password?" link |
| `js/utils.js` | Global modal/notification functions (`showError`, `showSuccess`) |
| `_bmad-output/project-context.md` | Project rules (ESM imports, error handling, etc.) |

### Technical Decisions

1. **Endpoint Location**: Add new route in `backend/routes/auth.mjs` (not a separate file) since it's authentication-related
2. **Password Minimum Length**: Keep 6 characters (consistent with registration endpoint)
3. **WhatsApp Link Format**: `https://wa.me/6281234567890?text=Halo%20admin%2C%20saya%20lupa%20password%20akun%20DocterBee%20saya.%20Mohon%20bantuannya.` (use ENV variable `ADMIN_WHATSAPP_NUMBER` or hardcode temporary for MVP)
4. **UI Placement**: Add Change Password card in `profile.html` **immediately after Profile Info Card** (sebelum Activity History section)
5. **Frontend Validation**: Match password confirmation field on frontend before API call (reduce unnecessary requests)
6. **Input Sanitization**: **Always `.trim()` password inputs** in backend before validation/hashing to prevent accidental whitespace
7. **Password Uniqueness**: Password baru **MUST** be different from password lama (backend validation required)
8. **UI Labels**: Use "Password Saat Ini" instead of "Password Lama" for better clarity (especially for non-technical users)
9. **Password Visibility**: Add "Show/Hide Password" toggle for all 3 password fields (improve UX, reduce typos)
10. **Session Handling**: User remains logged in after password change (session NOT invalidated for better UX)

## Implementation Plan

### Tasks

**Task breakdown ordered by dependency (lowest level first):**

- [x] **Task 1: Backend - Add Change Password Endpoint**
  - File: `backend/routes/auth.mjs`
  - Action: Add new `POST /api/user/change-password` route handler after the `/me` endpoint
  - Implementation:
    - Extract `currentPassword`, `newPassword` from request body
    - Validate user is logged in (`req.session.userId`) - if not, return 401 immediately
    - Query user from DB: `SELECT id, password FROM users WHERE id = ? AND is_active = 1`
    - **If user not found**: Return same 401 error as "not logged in" (prevent user enumeration)
    - Trim all password inputs: `currentPassword.trim()`, `newPassword.trim()`
    - Validate `newPassword.trim().length >= 6`
    - Validate `newPassword !== currentPassword` (prevent same password)
    - Verify current password: `bcrypt.compare(currentPassword, user.password)`
    - **Security Note**: `bcrypt.compare()` is constant-time by design, preventing timing attacks
    - **If password wrong**: Return 401 with generic error (do NOT reveal if user exists)
    - Hash new password: `bcrypt.hash(newPassword, 10)`
    - **Use Transaction**: Wrap UPDATE in database transaction for atomicity
      ```js
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      try {
        await connection.query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hashedPassword, userId]);
        await connection.commit();
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
      ```
    - Return success response with message
  - Error Handling:
    - 401 if not logged in
    - 401 if current password wrong
    - 400 if new password too short
    - 400 if new password same as current
    - 500 for server errors
  - Notes: Follow existing auth.mjs patterns (try/catch, response format, error logging)

- [x] **Task 2: Frontend - Add Change Password Card to Profile Page**
  - File: `profile.html`
  - Action: Add new "Keamanan Akun" card section after Profile Info Card (before Activity History section)
  - Implementation:
    - Find the closing `</div>` of Profile Info Card (around line 1100-1200 range)
    - Insert new card with class `profile-info-card`
    - Card structure:
      ```html
      <div class="profile-info-card">
        <h2>Keamanan Akun</h2>
        <form id="changePasswordForm">
          <!-- 3 password inputs + submit button -->
        </form>
      </div>
      ```
    - Add 3 input fields **IN THIS EXACT ORDER**:
      1. **First**: "Password Saat Ini" (type="password", id="currentPassword", required, autocomplete="current-password")
      2. **Second**: "Password Baru" (type="password", id="newPassword", required, minlength="6", autocomplete="new-password")
      3. **Third**: "Konfirmasi Password Baru" (type="password", id="confirmPassword", required, autocomplete="new-password")
    - Add hint text below "Password Baru": `<small class="text-gray-500">Minimal 6 karakter</small>`
    - Add submit button with Tailwind classes (match existing button styles)
  - Notes: Use existing `.profile-info-card` styling for consistency

- [x] **Task 3: Frontend - Add Show/Hide Password Toggle**
  - File: `profile.html` (same card from Task 2)
  - Action: Add eye icon buttons for each password field to toggle visibility
  - Implementation:
    - Wrap each password input in a `position: relative` container
    - Add SVG eye icon button positioned absolute (top-right of input)
    - Add click handler to toggle `type` between "password" and "text"
    - Use lucide icons if available, or inline SVG
  - Notes: Optional for MVP if time-constrained (can be added in iteration)

- [x] **Task 4: Frontend - Add Change Password Form Logic**
  - File: `profile.html` (inline `<script>` at bottom, or separate `js/profile-password.js`)
  - Action: Implement form submission logic with validation
  - Implementation:
    - Get form element: `document.getElementById('changePasswordForm')`
    - Add submit event listener
    - Prevent default form submission
    - Get input values and trim: `currentPassword.trim()`, `newPassword.trim()`, `confirmPassword.trim()`
    - Frontend validation:
      - Check all fields filled: `if (!currentPassword || !newPassword || !confirmPassword)`
      - Check new password length: `if (newPassword.length < 6)`
      - Check passwords match: `if (newPassword !== confirmPassword)` → `showError('Password baru dan konfirmasi tidak cocok')`
    - Send POST request to `/api/user/change-password`:
      ```js
      fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword })
      })
      ```
    - Handle response:
      - Success: `showSuccess('Password berhasil diubah. Gunakan password baru untuk login berikutnya.')` + clear form
      - Error: `showError(data.error)` with specific error message from backend
    - Handle network errors: Show helpful message asking user to try login with new password
  - Notes: Use existing `showSuccess()`, `showError()` functions from `js/utils.js`

- [x] **Task 5: Frontend - Add "Lupa Password?" Link to Login Page**
  - File: `login.html`
  - Action: Add WhatsApp link below login form (after "Belum punya akun?" text)
  - Implementation:
    - Find the `<p class="text-center text-sm text-slate-600 mt-6">` section (around line 171)
    - Add new paragraph after it:
      ```html
      <p class="text-center text-sm text-slate-600 mt-3">
        Lupa password?
        <a href="https://wa.me/6281234567890?text=Halo%20admin%2C%20saya%20lupa%20password%20akun%20DocterBee%20saya.%20Mohon%20bantuannya." 
           target="_blank"
           class="text-amber-600 hover:text-amber-700 font-semibold">
          Hubungi Admin
        </a>
      </p>
      ```
    - Replace `6281234567890` with actual admin WhatsApp number (or use ENV variable if available)
  - Notes: Opens WhatsApp in new tab with pre-filled message

### Acceptance Criteria

**Backend API (`POST /api/user/change-password`):**

- [x] **AC1**: Given user is logged in and provides correct current password and valid new password (min 6 chars, different from current), when user submits change password request, then password is updated in database with bcrypt hash and response returns `{ success: true, message: 'Password berhasil diubah...' }`

- [x] **AC2**: Given user is NOT logged in, when user attempts to access change password endpoint, then API returns 401 status with error message "Silakan login terlebih dahulu"

- [x] **AC3**: Given user is logged in but provides incorrect current password, when user submits change password request, then API returns 401 status with error message "Password saat ini tidak sesuai. Silakan coba lagi."

- [x] **AC4**: Given user is logged in and provides correct current password but new password is less than 6 characters, when user submits request, then API returns 400 status with error message "Password minimal 6 karakter"

- [x] **AC5**: Given user is logged in and provides new password that is identical to current password, when user submits request, then API returns 400 status with error message "Password baru harus berbeda dari password saat ini"

- [x] **AC6**: Given user successfully changes password, when user checks their session, then session remains active (user NOT logged out)

- [x] **AC7**: Given leading/trailing whitespace in password inputs, when backend processes them, then whitespace is trimmed before validation and hashing

**Frontend Profile Page:**

- [x] **AC8**: Given user is on profile page, when page loads, then "Keamanan Akun" card is visible immediately after Profile Info Card

- [x] **AC9**: Given user sees the change password form, when user views field labels, then labels are "Password Saat Ini", "Password Baru", "Konfirmasi Password Baru" (user-friendly Indonesian)

- [x] **AC10**: Given user fills all 3 password fields correctly, when user submits form, then form data is sent to `/api/user/change-password` endpoint with `currentPassword` and `newPassword` in JSON body

- [x] **AC11**: Given user enters mismatched passwords in "Password Baru" and "Konfirmasi" fields, when user submits form, then frontend shows error "Password baru dan konfirmasi tidak cocok" WITHOUT making API call

- [x] **AC12**: Given user successfully changes password (200 response from API), when response is received, then success message "Password berhasil diubah..." is displayed and form fields are cleared

- [x] **AC13**: Given API returns error (e.g., current password wrong), when error response is received, then error message from backend is displayed to user via `showError()`

**Frontend Login Page:**

- [x] **AC14**: Given user is on login page, when user looks below the form, then "Lupa password? Hubungi Admin" link is visible

- [x] **AC15**: Given user clicks "Hubungi Admin" link, when clicked, then WhatsApp opens in new tab with pre-filled message "Halo admin, saya lupa password akun DocterBee saya. Mohon bantuannya."

**Integration:**

- [x] **AC16**: Given user has password changed by admin (manual reset), when user changes their own password using new endpoint, then old temporary password no longer works and new self-set password works for login

- [x] **AC17**: Given user changes password successfully, when user logs out and attempts to login with OLD password, then login fails with "Email atau password salah"

- [x] **AC18**: Given user changes password successfully, when user logs out and attempts to login with NEW password, then login succeeds and user is redirected to journey page

**Error Scenarios to Handle:**

1. **User Not Logged In (401)**
   - Error: "Silakan login terlebih dahulu"
   - Frontend should redirect to `/login`

2. **Password Saat Ini Salah (401)**
   - Error: "Password saat ini tidak sesuai. Silakan coba lagi."
   - Do NOT reveal whether user exists (security)

3. **Password Baru Sama dengan Password Lama (400)**
   - Error: "Password baru harus berbeda dari password saat ini"
   - Backend validation: `if (newPassword === oldPassword) throw error`

4. **Password Baru Terlalu Pendek (400)**
   - Error: "Password minimal 6 karakter"
   - Validation: `newPassword.trim().length < 6`

5. **Password Baru ≠ Konfirmasi (400 - Frontend Only)**
   - Error: "Password baru dan konfirmasi tidak cocok"
   - Frontend validation before sending request

6. **Network/Server Error (500)**
   - Error: "Terjadi kesalahan. Jika Anda tidak yakin apakah password berhasil diubah, coba login dengan password baru Anda."
   - Helpful untuk edge case: request succeed tapi response failed

**Success Scenario:**
- Status: 200 OK
- Message: "Password berhasil diubah. Gunakan password baru untuk login berikutnya."
- User tetap login (session tidak di-destroy)

(Detailed AC will be generated in Step 3)

## Additional Context

### UI/UX Requirements

**Password Requirements Display (Frontend):**
- Show hint text below "Password Baru" input: *"Minimal 6 karakter"*
- Optional (future): Password strength indicator (weak/medium/strong)

**Field Labels (User-Friendly):**
- "Password Saat Ini" (bukan "Password Lama")
- "Password Baru"
- "Konfirmasi Password Baru"

**Show/Hide Password Toggle:**
- Add eye icon button for each password field
- Toggles between `type="password"` and `type="text"`
- Use existing pattern from codebase if available

**Form Placement:**
- New card section in `profile.html`
- Title: "Keamanan Akun" atau "Ganti Password"
- Positioned after "Profile Info Card", before "Activity History"
- Same card styling as existing `.profile-info-card`

### Dependencies

- Existing authentication system (`bcryptjs` for password hashing)
- Session management (`express-session`)
- User database table with `password` column

### Testing Strategy

**Unit Tests (Backend):**
- **File:** `tests/auth-change-password.test.js` (to be created)
- **Framework:** Native Node.js test runner (`node --test`)
- **Test Coverage:**
  1. Test endpoint returns 401 when user not logged in
  2. Test endpoint returns 401 when current password is incorrect
  3. Test endpoint returns 400 when new password < 6 characters
  4. Test endpoint returns 400 when new password === current password
  5. Test successful password change returns 200 with success message
  6. Test password is correctly hashed with bcrypt after update
  7. Test `.trim()` is applied to password inputs (test with leading/trailing spaces)
  8. Test session remains active after password change (userId still in session)

**Integration Tests (Manual):**
1. **Happy Path:**
   - Login as test user
   - Navigate to Profile page
   - Fill change password form with correct current password and valid new password
   - Verify success message displayed
   - Verify form cleared after success
   - Logout and login with NEW password → should succeed

2. **Error Path - Wrong Current Password:**
   - Login as test user
   - Navigate to Profile page
   - Fill form with WRONG current password
   - Verify error message "Password saat ini tidak sesuai..."
   - Verify password NOT changed (login with old password still works)

3. **Error Path - Password Too Short:**
   - Login as test user
   - Try to change password to "12345" (5 chars)
   - Verify error message "Password minimal 6 karakter"

4. **Error Path - Same Password:**
   - Login as test user
   - Try to change password to same as current
   - Verify error message "Password baru harus berbeda dari password saat ini"

5. **Error Path - Mismatched Confirmation:**
   - Fill "Password Baru" with "newpass123"
   - Fill "Konfirmasi" with "newpass456"
   - Verify frontend error WITHOUT API call

6. **WhatsApp Link Test:**
   - Navigate to `/login`
   - Click "Hubungi Admin" link
   - Verify WhatsApp Web/App opens with pre-filled message

### Notes

- Admin dashboard reset password functionality already exists and should not be modified
- WhatsApp link format needs to be confirmed during implementation
- Admin phone number should ideally come from ENV variable for flexibility
- **Admin Manual Process**: Admin akan mengirimkan notifikasi manual via WhatsApp ke user jika password di-reset oleh admin (manual/forgot password flow). Untuk self-service change password, tidak ada notifikasi otomatis.

**Future Enhancements (Out of Scope for MVP):**
1. **Password Strength Meter**: Visual indicator (weak/medium/strong) saat user mengetik password baru
2. **Logout All Other Sessions**: Option "Logout dari semua device lain" setelah ganti password (protect against session hijacking)
3. **Audit Log**: Display "Terakhir diganti: [tanggal]" di profile untuk user awareness
4. **Password History**: Prevent reuse of last 3 passwords (enterprise security feature)


