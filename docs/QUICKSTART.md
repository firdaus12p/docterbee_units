# 🚀 Cara Menjalankan Docterbee Units

## Langkah Singkat

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database (XAMPP)

1. Buka **XAMPP Control Panel**
2. Start **Apache** dan **MySQL**
3. Klik **Admin** pada MySQL
4. Buat database baru: `docterbee_units`
5. Selesai! (Tabel akan dibuat otomatis)

### 3. Konfigurasi Environment

Copy `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Edit `.env` jika perlu (default sudah oke untuk XAMPP):

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=docterbee_units
```

### 4. Jalankan Server

```bash
npm start
```

✅ **Output sukses:**

```
✅ Database connected successfully
✅ Table: bookings
✅ Table: events
✅ Table: articles
✅ Table: coupons
🚀 Docterbee Backend Server
📡 Server berjalan di http://localhost:3000
```

### 5. Buka Aplikasi

**Halaman Publik:**

- `index.html` - Journey tracking
- `services.html` - Pilih layanan
- `booking.html` - Form booking
- `events.html` - Daftar event
- `insight.html` - Artikel
- `media.html` - Media & AI

**Admin Dashboard:**

- `admin-dashboard.html`
- Login: `admin` / `docterbee2025`

## 📦 Yang Sudah Dibuat

✅ **Backend API:**

- `/api/bookings` - CRUD booking
- `/api/events` - CRUD events
- `/api/insight` - CRUD articles
- `/api/coupons` - CRUD + validasi promo
- `/api/summarize` - AI Gemini

✅ **Database (MySQL):**

- Tabel `bookings`
- Tabel `events`
- Tabel `articles`
- Tabel `coupons`

✅ **Frontend Integration:**

- `booking.html` → POST ke `/api/bookings` + validasi promo
- `events.html` → GET dari `/api/events`
- `insight.html` → GET dari `/api/insight`

✅ **Admin Dashboard:**

- Booking Monitor (view + update status)
- Insight Manager (add/edit/delete articles)
- Events Manager (add/edit/delete events)
- Coupon Manager (add/edit/delete coupons)

## 🐛 Error? Cek Ini

### Database connection failed

→ Pastikan MySQL di XAMPP sudah running

### Cannot GET /api/...

→ Pastikan server backend running (`npm start`)

### Events/Articles kosong

→ Tambah data via admin dashboard atau SQL sample data (lihat `DATABASE_SCHEMA.md`)

### Port already in use

→ Ganti `PORT=3001` di `.env`

## 📚 Dokumentasi Lengkap

- `SETUP_GUIDE.md` - Panduan lengkap
- `DATABASE_SCHEMA.md` - Schema database + sample data
- `techdev.md` - Technical overview
- `buatdashboard.md` - Prompt template untuk AI

## ✨ Next Steps

1. **Tambah sample data** via admin dashboard
2. **Test booking flow**: services.html → booking.html → WhatsApp
3. **Test promo code**: gunakan admin untuk buat coupon baru
4. **Test events**: tambah event via dashboard, cek di events.html
5. **Test articles**: tambah artikel via dashboard, cek di insight.html

Selesai! 🎉
