---
title: 'Email Cleanup & Verification System'
slug: 'email-cleanup-system'
created: '2026-01-05'
status: 'completed'
stepsCompleted: [1, 2, 3, 4, 5]
tech_stack: ['Node.js (ESM)', 'Express.js', 'MySQL', 'Resend (Email Provider)', 'Vanilla JS']
files_to_modify: []
code_patterns: []
test_patterns: []
---

# Tech-Spec: Email Cleanup & Verification System

**Created:** 2026-01-05

## Overview

### Problem Statement

Database user saat ini mengandung data email yang tidak valid (dummy) hasil migrasi (contoh: `@migrated.local`) dan email yang belum pernah diverifikasi keaktifannya. Hal ini menghalangi implementasi fitur keamanan mandiri (reset password via email) dan komunikasi resmi dengan member. Mengharuskan semua user melakukan verifikasi sekaligus akan menyebabkan *lock-out* massal.

### Solution

Implementasi strategi **"Clean as You Go"**. Sistem akan:
1. Mendeteksi email tidak valid/unverified saat user login.
2. Memberikan prompt (banner/modal) bagi user dengan data tidak valid untuk memasukkan email aktif.
3. Melakukan verifikasi email baru via pengiriman link/OTP (menggunakan Resend).
4. Melakukan flagging di database untuk membedakan user yang sudah terverifikasi dan belum.

### Scope

**In Scope:**
- Database Schema Update: Penambahan kolom `is_email_verified`, `email_verification_token`, dan `pending_email`.
- Integrasi Library/Service Email (Resend).
- Backend API untuk:
    - Verifikasi email (endpoint konfirmasi token).
    - Update email baru (memicu pengiriman verifikasi).
    - Resend verification email.
- Frontend: Banner/Modal di Dashboard untuk user yang `is_email_verified = 0`.
- Logic Login: Deteksi status verifikasi.

**Out of Scope:**
- Fitur Reset Password (akan diimplementasikan di tech-spec terpisah setelah sistem cleanup ini siap).
- Bulk email marketing.
- Dashboard admin untuk monitoring verifikasi (fase berikutnya).

## Context for Development

### Technical Preferences

- **Library**: Menggunakan library resmi `resend` via npm.
- **Pattern**: Mengikuti dokumentasi resmi Resend untuk Node.js ESM.
- **Token Management**: Token akan diisi secara manual (disarankan via `.env` untuk keamanan).
- **Graceful Degradation**: Jika pengiriman email gagal, sistem harus mencatat log error tetapi tidak menghentikan proses aplikasi lainnya.

### Codebase Patterns

**Email Delivery Pattern (Resend):**
```javascript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'DocterBee <onboarding@resend.dev>', // Nanti diganti domain resmi
  to: userEmail,
  subject: 'Verifikasi Akun DocterBee',
  html: '...' 
});
```

## Implementation Plan

### Tasks

**Phase 1: Database & Infra**
- [ ] Install dependency: `npm install resend`.
- [ ] Database Migration: Tambahkan kolom `is_email_verified`, `email_verification_token`, `pending_email` ke tabel `users`.
- [ ] Init script: Update `is_email_verified = 0` untuk user dengan email `%migrated.local`.

**Phase 2: Backend Logic**
- [ ] Pembuatan `backend/utils/mailer.mjs` sebagai wrapper library Resend.
- [ ] Implementasi endpoint `POST /api/auth/update-email` (verifikasi email baru).
- [ ] Implementasi endpoint `GET /api/auth/verify-email` (handler klik link verifikasi).
- [ ] Update route login untuk menyertakan status `is_email_verified` di response.

**Phase 3: Frontend UI**
- [ ] Implementasi Banner Verifikasi di `journey.html` (menggunakan data dari session/sync).
- [ ] Pembuatan Modal Update Email di `journey.html`.
- [ ] Integrasi frontend fetch ke endpoint update/resend verification.

### Acceptance Criteria

- [ ] **AC1**: User dengan email dummy otomatis terdeteksi sebagai unverified.
- [ ] **AC2**: Banner "Verifikasi Email" muncul di Journey page bagi user unverified.
- [ ] **AC3**: Sistem mengirim email verifikasi menggunakan library Resend saat user input email baru.
- [x] **AC4**: Status database berubah menjadi `is_email_verified = 1` setelah token valid diakses via URL.
- [x] **AC5**: Banner menghilang secara otomatis setelah user berhasil verifikasi.

## Future Tasks (Out of Scope)

1. **Forgot Password via Email**: Mengimplementasikan alur reset password menggunakan email yang sudah diverifikasi (menggantikan atau mendampingi alur WhatsApp).
2. **Admin Verification Dashboard**: Menampilkan status verifikasi user di dashboard admin untuk monitoring.

