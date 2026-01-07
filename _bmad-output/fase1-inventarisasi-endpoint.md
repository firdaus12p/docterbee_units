# FASE 1: ANALISIS & DOKUMENTASI ENDPOINT API
**Proyek:** docterbee_units  
**Tanggal:** 2026-01-07  
**Status:** ANALISIS ONLY - BELUM ADA PERUBAHAN KODE

---

## PRINSIP UTAMA
**JANGAN RUSAK FUNGSIONALITAS YANG ADA**
- Setiap validator baru harus 100% backward compatible
- Pesan error harus tetap konsisten dengan yang lama
- Tidak ada perubahan logika bisnis
- Semua test case manual harus didokumentasikan terlebih dahulu

---

## INVENTARISASI ENDPOINT API

### ✅ SUDAH DIVALIDASI (Pilot Complete)
| Route | Method | File | Status |
|-------|--------|------|--------|
| `/api/bookings` | POST | `bookings.mjs:92` | ✅ Menggunakan `createBookingValidator` + `validate` |

---

### 🔴 PRIORITAS TINGGI (Critical User Flows)

#### A. Authentication & Security (auth.mjs)
| No | Route | Method | Line | Validasi Manual Saat Ini | Kritikalitas |
|----|-------|--------|------|---------------------------|--------------|
| 1 | `/api/auth/register` | POST | 13 | ✅ Ada (email, password, dll) | **CRITICAL** - User Registration |
| 2 | `/api/auth/login` | POST | 118 | ✅ Ada (email, password) | **CRITICAL** - User Login |
| 3 | `/api/auth/change-password` | POST | 287 | ✅ Ada (oldPassword, newPassword) | **HIGH** - Account Security |
| 4 | `/api/auth/update-email` | POST | 384 | ✅ Ada (newEmail) | **HIGH** - Email Change |
| 5 | `/api/auth/forgot-password` | POST | 524 | ✅ Ada (email) | **HIGH** - Password Recovery |
| 6 | `/api/auth/reset-password` | POST | ~580 | ✅ Ada (token, newPassword) | **HIGH** - Password Reset |
| 7 | `/api/auth/resend-verification` | POST | 483 | ✅ Ada (email) | **MEDIUM** - Email Verification |

**Catatan Penting:**
- Semua route auth sudah punya rate limiting (loginRateLimiter, emailRateLimiter)
- JANGAN UBAH rate limiter yang sudah ada
- Validator harus tetap return error message yang sama

---

#### B. Orders & Shopping (orders.mjs)
| No | Route | Method | Line | Validasi Manual Saat Ini | Kritikalitas |
|----|-------|--------|------|---------------------------|--------------|
| 8 | `/api/orders` | POST | 73 | ✅ Ada (items, location_id, dll) | **CRITICAL** - Order Creation |
| 9 | `/api/orders/:id/complete` | PATCH | 601 | ✅ Ada (admin only) | **HIGH** - Order Completion |
| 10 | `/api/orders/:id/cancel` | PATCH | 692 | ✅ Ada | **HIGH** - Order Cancellation |
| 11 | `/api/orders/:id/assign-points-by-phone` | POST | 775 | ✅ Ada (phone) | **MEDIUM** - Points Assignment |

**Catatan Penting:**
- Order creation menggunakan **TRANSACTION** untuk stock deduction
- JANGAN UBAH logika transaksi database
- Harus tetap support coupon validation

---

#### C. User Data & Progress (user-data.mjs)
| No | Route | Method | Line | Validasi Manual Saat Ini | Kritikalitas |
|----|-------|--------|------|---------------------------|--------------|
| 12 | `/api/user-data/progress` | POST | 45 | ✅ Ada (item_id, answer) | **HIGH** - Journey Progress |
| 13 | `/api/user-data/rewards/redeem` | POST | 104 | ✅ Ada (reward_id, location_id) | **HIGH** - Reward Redemption |
| 14 | `/api/user-data/cart` | POST | 225 | ✅ Ada (product_id, quantity) | **MEDIUM** - Add to Cart |

---

### 🟡 PRIORITAS SEDANG (Admin Operations)

#### D. Products Management (products.mjs)
| No | Route | Method | Line | Validasi Manual Saat Ini | Kritikalitas |
|----|-------|--------|------|---------------------------|--------------|
| 15 | `/api/products` | POST | 112 | ✅ Ada (name, category, price, dll) | **MEDIUM** - Product Creation |
| 16 | `/api/products/:id` | PATCH | 215 | ✅ Ada | **MEDIUM** - Product Update |
| 17 | `/api/products/:id/stocks` | PATCH | 391 | ✅ Ada (location_id, quantity) | **HIGH** - Stock Management |
| 18 | `/api/products/:id/stocks/bulk` | POST | 516 | ✅ Ada (stocks array) | **MEDIUM** - Bulk Stock Update |

---

#### E. Services Management (services.mjs)
| No | Route | Method | Line | Validasi Manual Saat Ini | Kritikalitas |
|----|-------|--------|------|---------------------------|--------------|
| 19 | `/api/services` | POST | 99 | ✅ Ada (name, category, price, dll) | **MEDIUM** - Service Creation |
| 20 | `/api/services/:id` | PATCH | 162 | ✅ Ada | **MEDIUM** - Service Update |

---

#### F. Events Management (events.mjs)
| No | Route | Method | Line | Validasi Manual Saat Ini | Kritikalitas |
|----|-------|--------|------|---------------------------|--------------|
| 21 | `/api/events` | POST | 83 | ✅ Ada (title, eventDate, dll) | **MEDIUM** - Event Creation |
| 22 | `/api/events/:id` | PATCH | 146 | ✅ Ada | **MEDIUM** - Event Update |

---

#### G. Coupons Management (coupons.mjs)
| No | Route | Method | Line | Validasi Manual Saat Ini | Kritikalitas |
|----|-------|--------|------|---------------------------|--------------|
| 23 | `/api/coupons/validate` | POST | 8 | ✅ Ada (code) | **HIGH** - Coupon Validation |
| 24 | `/api/coupons` | POST | 168 | ✅ Ada (code, discountType, dll) | **MEDIUM** - Coupon Creation |
| 25 | `/api/coupons/:id` | PATCH | 243 | ✅ Ada | **MEDIUM** - Coupon Update |

---

### 🟢 PRIORITAS RENDAH (Content Management)

#### H. Insight/Articles (insight.mjs)
| No | Route | Method | Line | Validasi Manual Saat Ini | Kritikalitas |
|----|-------|--------|------|---------------------------|--------------|
| 26 | `/api/insight` | POST | 116 | ✅ Ada (title, content, dll) | **LOW** - Article Creation |
| 27 | `/api/insight/:id` | PATCH | 181 | ✅ Ada | **LOW** - Article Update |

---

#### I. Podcasts (podcasts.mjs)
| No | Route | Method | Line | Validasi Manual Saat Ini | Kritikalitas |
|----|-------|--------|------|---------------------------|--------------|
| 28 | `/api/podcasts` | POST | 115 | ✅ Ada (title, url, dll) | **LOW** - Podcast Creation |
| 29 | `/api/podcasts/:id` | PUT | 187 | ✅ Ada | **LOW** - Podcast Update |
| 30 | `/api/podcasts/:id/toggle` | PATCH | 332 | ✅ Ada (is_active) | **LOW** - Toggle Active |

---

#### J. Journeys (journeys.mjs)
| No | Route | Method | Line | Validasi Manual Saat Ini | Kritikalitas |
|----|-------|--------|------|---------------------------|--------------|
| 31 | `/api/journeys/admin` | POST | 191 | ✅ Ada (name, slug, dll) | **MEDIUM** - Journey Creation |
| 32 | `/api/journeys/admin/:id` | PATCH | 265 | ✅ Ada | **MEDIUM** - Journey Update |
| 33 | `/api/journeys/admin/units` | POST | 423 | ✅ Ada (journey_id, title) | **MEDIUM** - Unit Creation |
| 34 | `/api/journeys/admin/units/:id` | PATCH | 482 | ✅ Ada | **MEDIUM** - Unit Update |
| 35 | `/api/journeys/admin/items` | POST | 616 | ✅ Ada (unit_id, question, dll) | **MEDIUM** - Item Creation |
| 36 | `/api/journeys/admin/items/:id` | PATCH | 699 | ✅ Ada | **MEDIUM** - Item Update |

---

#### K. Rewards (rewards.mjs)
| No | Route | Method | Line | Validasi Manual Saat Ini | Kritikalitas |
|----|-------|--------|------|---------------------------|--------------|
| 37 | `/api/rewards/admin` | POST | 150 | ✅ Ada (name, points_required, dll) | **MEDIUM** - Reward Creation |
| 38 | `/api/rewards/admin/:id` | PATCH | 201 | ✅ Ada | **MEDIUM** - Reward Update |
| 39 | `/api/rewards/admin/redemptions/:id/status` | PATCH | 83 | ✅ Ada (status) | **HIGH** - Redemption Approval |

---

#### L. Locations (locations.mjs)
| No | Route | Method | Line | Validasi Manual Saat Ini | Kritikalitas |
|----|-------|--------|------|---------------------------|--------------|
| 40 | `/api/locations/admin` | POST | 62 | ✅ Ada (name, address, type) | **MEDIUM** - Location Creation |
| 41 | `/api/locations/admin/:id` | PATCH | 117 | ✅ Ada | **MEDIUM** - Location Update |
| 42 | `/api/locations/admin/:id/reactivate` | POST | 249 | ✅ Ada | **LOW** - Location Reactivation |

---

#### M. Users Management (users.mjs)
| No | Route | Method | Line | Validasi Manual Saat Ini | Kritikalitas |
|----|-------|--------|------|---------------------------|--------------|
| 43 | `/api/users/:id/password` | PATCH | 77 | ✅ Ada (newPassword) | **HIGH** - Admin Password Reset |
| 44 | `/api/users/:id/toggle` | PATCH | 134 | ✅ Ada (is_active) | **MEDIUM** - Toggle User Active |
| 45 | `/api/users/:userId/rewards/:redemptionId/approve` | PATCH | 250 | ✅ Ada (status) | **HIGH** - Approve Redemption |

---

#### N. Member Check (member-check.mjs)
| No | Route | Method | Line | Validasi Manual Saat Ini | Kritikalitas |
|----|-------|--------|------|---------------------------|--------------|
| 46 | `/api/member-check` | POST | 91 | ✅ Ada (phone) | **MEDIUM** - Member Verification |

---

#### O. Upload (upload.mjs)
| No | Route | Method | Line | Validasi Manual Saat Ini | Kritikalitas |
|----|-------|--------|------|---------------------------|--------------|
| 47 | `/api/upload` | POST | 63 | ✅ Ada (multer validation) | **LOW** - File Upload |
| 48 | `/api/upload/product-image` | POST | 118 | ✅ Ada (multer validation) | **LOW** - Product Image Upload |

---

## RINGKASAN STATISTIK

**Total Endpoint yang Perlu Validasi:** 48 endpoint
- ✅ Sudah Divalidasi: 1 (Bookings)
- 🔴 Prioritas Tinggi: 25 endpoint
- 🟡 Prioritas Sedang: 14 endpoint
- 🟢 Prioritas Rendah: 8 endpoint

---

## LANGKAH SELANJUTNYA (Menunggu Approval Daus)

### Fase 1A: Dokumentasi Validasi Manual (NEXT)
Untuk setiap endpoint, kami akan:
1. Baca kode validasi manual yang ada
2. Dokumentasikan semua field yang divalidasi
3. Dokumentasikan pesan error yang dikembalikan
4. Buat test case manual untuk setiap endpoint

### Fase 1B: Mapping ke User Flow
Pastikan setiap endpoint terhubung ke Critical User Flow yang tidak boleh rusak.

### Fase 1C: Review dengan Daus
Presentasikan hasil analisis lengkap sebelum menyentuh kode apapun.

---

**Catatan Penting:**
- Dokumen ini adalah ANALISIS ONLY
- BELUM ADA PERUBAHAN KODE
- Menunggu approval Daus untuk lanjut ke Fase 1A
