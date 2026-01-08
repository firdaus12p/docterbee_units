# Rencana Implementasi: Sistem Reward & Penukaran Poin Lanjutan

## 1. Tujuan Bisnis & User Experience
Meningkatkan engagement pengguna dengan memungkinkan penukaran poin menjadi reward yang lebih variatif (Diskon & Produk Gratis) dengan mekanisme yang transparan, aman, dan mendesak (expiry date).

## 2. Fitur Utama

### A. Tipe Reward Baru: "Gratis Produk"
*   **Logic:** Admin dapat membuat reward yang spesifik memberikan produk tertentu secara gratis (misal: "Gratis 1x Aurora Gold").
*   **Mekanisme:** Saat reward ini ditukarkan -> User dapat kupon -> Saat kupon dipakai di keranjang -> Harga produk target otomatis jadi Rp 0.
*   **Safety:** Jika produk belum ada di keranjang, sistem menolak kupon & meminta user memasukkannya terlebih dahulu (TIDAK Auto-Add).

### B. Masa Berlaku Reward (Expiry Date)
*   **Logic:** Setiap penukaran poin memiliki masa aktif 30 hari.
*   **Mekanisme:** Saat redeem -> `expires_at` diset `NOW() + 30 Hari`.
*   **Validasi:** Kupon tidak bisa dipakai lewat dari tanggal ini.
*   **Display:** User bisa melihat countdown/tanggal kadaluarsa di halaman profilnya.

### C. Manajemen Kode Kupon (User-Facing)
*   **Penyimpanan:** Kode unik disimpan dan terkait dengan user.
*   **Akses:** User bisa melihat kode yang sudah ditukarkan di menu "Voucher Saya" atau "History".
*   **Status Clear:** Kode memiliki status visual: Aktif (Hijau), Terpakai (Merah/Abu), Kadaluarsa (Abu-abu).

### D. Perubahan Admin Dashboard
*   **Hapus Tombol "Claim":** Admin tidak perlu manual klik "Claim". Status berubah otomatis by-system saat kode dipakai.
*   **Aksi Admin:** Hanya tombol "Hapus/Batalkan" untuk koreksi data.

## 3. Spesifikasi Teknis & Database Migration

### Database Changes
1.  **Table `rewards`**
    *   Add `reward_type`: ENUM('discount', 'free_product') DEFAULT 'discount'
    *   Add `target_product_id`: INT (Nullable) - *ID Produk yang digratiskan*

2.  **Table `coupons`**
    *   Add `target_product_id`: INT (Nullable)
    *   Modify `discount_type`: Add 'free_product' to ENUM.

3.  **Table `reward_redemptions`**
    *   Add `coupon_code`: VARCHAR(50) - *Menyimpan kode unik hasil generate*
    *   Add `expires_at`: DATETIME - *Batas waktu pemakaian*

### Backend Logic (`backend/routes/`)
1.  **`rewards.mjs` (Admin Create):** Update logic untuk support input `target_product_id`.
2.  **`user-data.mjs` (Redeem):**
    *   Generate Unique Code: `RWD-[USERID]-[RANDOM]`.
    *   Insert `expires_at` (+30 hari).
    *   Insert ke tabel `coupons` juga (agar bisa divalidasi sistem kupon yang ada).
3.  **`coupons.mjs` (Validate):**
    *   Handle logic `free_product`.
    *   Return `target_product_id` ke frontend.

### Frontend Logic (`js/`)
1.  **`store-cart.js`:**
    *   Validasi manual: Cek apakah item target ada di cart.
    *   Jika ada -> Set diskon = harga item.
2.  **`users-manager.js` (Admin):**
    *   Hapus tombol approve.
    *   Ganti logic display status.

## 4. Langkah Implementasi (Step-by-Step)
1.  [x] **Database Migration** - Schema changes added to db.mjs
2.  [x] **Update Backend API** (Reward Creation & Redemption Logic - user-data.mjs, coupons.mjs, rewards.mjs)
3.  [x] **Update Backend Orders** (Mark redemption as used - orders.mjs)
4.  [x] **Update Frontend Store** (Cart Validation Logic - store-cart.js)
5.  [x] **Update Admin Dashboard** (Remove Claim Button, show code/expiry - users-manager.js, admin-dashboard.html)
6.  [x] **Update User Dashboard** (View History & Active Vouchers - store-enhancements.js, user-data.mjs)
7.  [x] **Testing Full Flow** (Redeem -> Checkout -> Admin View)

---
*Dokumen ini dibuat berdasarkan diskusi dengan Daus (User) pada 8 Jan 2026.*
*Last updated: 8 Jan 2026 - Implementation FULLY COMPLETED and TESTED*
