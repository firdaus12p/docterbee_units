# Docterbee Units - Setup Guide

Panduan lengkap untuk menjalankan aplikasi Docterbee Units dengan backend + admin dashboard.

## 📋 Prerequisite

1. **Node.js** (v18 atau lebih baru)
2. **XAMPP** (untuk MySQL database)
3. **Text Editor** (VS Code recommended)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

Ini akan install:

- `express` - Web framework
- `mysql2` - MySQL client
- `@google/generative-ai` - Gemini API
- `cors` - CORS middleware
- `dotenv` - Environment variables

### 2. Setup MySQL Database (XAMPP)

1. Buka **XAMPP Control Panel**
2. Start **Apache** dan **MySQL**
3. Klik **Admin** pada MySQL (atau buka http://localhost/phpmyadmin)
4. Buat database baru:
   - Nama: `docterbee_units`
   - Collation: `utf8mb4_unicode_ci`

**Tabel akan dibuat otomatis** saat server pertama kali dijalankan!

### 3. Configure Environment Variables

Copy file `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Edit `.env` sesuai konfigurasi Anda:

```env
# Server Configuration
PORT=3000

# Google Gemini API (optional)
GEMINI_API_KEY=your_gemini_api_key_here

# MySQL Database Configuration (XAMPP)
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=docterbee_units

# Admin Dashboard
ADMIN_USER=admin
ADMIN_PASS=docterbee2025
```

**Note**:

- Default XAMPP MySQL: user=`root`, password=`''` (kosong)
- Gemini API key opsional, bisa dikosongkan jika tidak pakai fitur AI summarize

### 4. Start Backend Server

```bash
npm start
```

Output yang benar:

```
🔌 Connecting to database...
✅ Database connected successfully
📦 Database: docterbee_units
✅ Table: bookings
✅ Table: events
✅ Table: articles
✅ Table: coupons
📦 All tables initialized successfully
📦 Database ready

🚀 Docterbee Backend Server
📡 Server berjalan di http://localhost:3000
🔑 Gemini API: ✅ Configured
⏳ Menunggu request...
```

### 5. Open Application

Buka file HTML di browser:

- **Public Pages**:

  - `index.html` - Journey tracking
  - `services.html` - Service catalog (entry point booking)
  - `booking.html` - Booking form
  - `events.html` - Events/webinar list
  - `insight.html` - Articles
  - `media.html` - YouTube + Podcast + AI analysis

- **Admin Dashboard**:
  - `admin-dashboard.html`
  - Login: `admin` / `docterbee2025`

## 📁 Project Structure

```
docterbee_units/
├── backend/
│   ├── server.mjs              # Main Express server
│   ├── db.mjs                  # MySQL connection & initialization
│   └── routes/
│       ├── bookings.mjs        # Booking CRUD API
│       ├── events.mjs          # Events CRUD API
│       ├── insight.mjs         # Articles CRUD API
│       └── coupons.mjs         # Coupons + validation API
├── index.html                  # Journey page
├── services.html               # Services catalog
├── booking.html                # Booking form
├── events.html                 # Events list (load from API)
├── insight.html                # Articles list (load from API)
├── media.html                  # Media + AI analysis
├── admin-dashboard.html        # Admin dashboard
├── admin-dashboard.js          # Dashboard logic
├── script.js                   # Unified JavaScript (1700+ lines)
├── style.css                   # Custom CSS (1650+ lines)
├── server.mjs                  # Old server (can be deleted)
├── package.json
├── .env                        # Environment config (create from .env.example)
├── DATABASE_SCHEMA.md          # Database documentation
└── README.md                   # This file
```

## 🔌 API Endpoints

### Public Endpoints

**Events:**

- `GET /api/events` - List events
- `GET /api/events/:id` - Event detail

**Insight (Articles):**

- `GET /api/insight` - List articles
- `GET /api/insight/:slug` - Article detail

**Bookings:**

- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List all bookings (admin)

**Coupons:**

- `POST /api/coupons/validate` - Validate promo code

**Gemini AI:**

- `POST /api/summarize` - Analyze media content

### Admin Endpoints

**Events:**

- `POST /api/events` - Create event
- `PATCH /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event (soft delete)

**Articles:**

- `POST /api/insight` - Create article
- `PATCH /api/insight/:id` - Update article
- `DELETE /api/insight/:id` - Delete article (soft delete)

**Bookings:**

- `GET /api/bookings/:id` - Booking detail
- `PATCH /api/bookings/:id` - Update booking status

**Coupons:**

- `GET /api/coupons` - List all coupons
- `GET /api/coupons/:id` - Coupon detail
- `POST /api/coupons` - Create coupon
- `PATCH /api/coupons/:id` - Update coupon
- `DELETE /api/coupons/:id` - Delete coupon (soft delete)

## 📊 Database Schema

Tabel yang dibuat otomatis:

1. **bookings** - Data booking dari form
2. **events** - Webinar & workshop
3. **articles** - Artikel insight
4. **coupons** - Kode promo

Lihat detail skema di [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

### Sample Data (Optional)

Untuk testing, bisa insert sample data via phpMyAdmin:

```sql
-- Sample Events
INSERT INTO events (title, event_date, mode, topic, description, link) VALUES
('Webinar: Bekam Rasulullah & Sains', '2025-01-15', 'online', 'quranic', 'Memahami manfaat bekam dari perspektif Sunnah dan penelitian medis modern', 'https://zoom.us/j/12345'),
('Workshop: Meal Prep Qur\'ani', '2025-01-20', 'offline', 'nutrition', 'Praktik langsung memasak menu sehat berbasis nutrisi Al-Qur\'an', 'Jakarta Pusat');

-- Sample Articles
INSERT INTO articles (title, slug, content, excerpt, tags) VALUES
('7 Kebiasaan Rasulullah untuk Kesehatan Optimal', '7-kebiasaan-rasulullah', 'Konten lengkap artikel...', 'Pelajari 7 kebiasaan harian Rasulullah yang terbukti secara sains', 'Ibadah,Kebiasaan');

-- Sample Coupons
INSERT INTO coupons (code, description, discount_type, discount_value, max_uses, expires_at) VALUES
('WELCOME2025', 'Diskon selamat datang 15%', 'percentage', 15.00, 100, '2025-03-31 23:59:59');
```

## 🎯 Features

### Public Features

- ✅ Journey tracking (6 units with localStorage)
- ✅ Service catalog + booking flow
- ✅ Booking form with promo code validation
- ✅ Events list (dynamic from API)
- ✅ Articles list (dynamic from API)
- ✅ YouTube + Podcast player
- ✅ AI content analysis (Gemini)
- ✅ Points system

### Admin Features

- ✅ Dashboard with 4 sections
- ✅ Booking Monitor (view + update status)
- ✅ Insight Manager (CRUD articles)
- ✅ Events Manager (CRUD events)
- ✅ Coupon Manager (CRUD coupons + validation)
- ✅ Simple authentication

## 🐛 Troubleshooting

### Error: "Database connection failed"

**Solution:**

1. Pastikan XAMPP MySQL sudah running
2. Cek konfigurasi di `.env`:
   - `DB_HOST=localhost`
   - `DB_USER=root`
   - `DB_PASS=` (kosong untuk default XAMPP)
   - `DB_NAME=docterbee_units`

### Error: "Access denied for user"

**Solution:**

- Pastikan username dan password MySQL di `.env` sesuai dengan konfigurasi XAMPP
- Default XAMPP: user=`root`, password=`''` (kosong)

### Error: "Cannot GET /api/..."

**Solution:**

- Pastikan server backend berjalan: `npm start`
- Cek di console apakah ada error saat startup

### Error: "EADDRINUSE: address already in use"

**Solution:**

- Port 3000 sudah dipakai program lain
- Ganti port di `.env`: `PORT=3001`
- Atau matikan program yang pakai port 3000

### Events/Articles tidak muncul

**Solution:**

1. Pastikan server backend running
2. Buka browser console (F12) - lihat error network
3. Tambahkan sample data di database (lihat `DATABASE_SCHEMA.md`)
4. Atau gunakan admin dashboard untuk add data

### Promo code validation tidak bekerja

**Solution:**

1. Pastikan server backend running
2. Tambahkan sample coupon via dashboard atau SQL:
   ```sql
   INSERT INTO coupons (code, description, discount_type, discount_value, expires_at)
   VALUES ('TEST10', 'Test discount 10%', 'percentage', 10.00, '2025-12-31 23:59:59');
   ```
3. Coba validasi dengan code: `TEST10`

## 📱 Mobile Menu

Mobile menu tersedia di semua halaman dengan:

- Hamburger button (visible on mobile only)
- Slide-in drawer from right
- Consistent navigation
- Points display

## 🔒 Security Notes

**Current Implementation:**

- Simple hardcoded authentication (admin/docterbee2025)
- No JWT tokens
- No rate limiting
- No input sanitization on backend (SQL injection risk)

**Production Recommendations:**

1. Implement proper authentication (JWT/session)
2. Add input validation & sanitization
3. Use prepared statements (already done in mysql2)
4. Add rate limiting
5. Use HTTPS
6. Hash passwords (bcrypt)
7. Add CSRF protection

## 🚢 Deployment

### Option 1: VPS (Recommended)

1. Upload project ke VPS
2. Install Node.js + MySQL
3. Setup environment variables
4. Run with PM2:
   ```bash
   npm install -g pm2
   pm2 start backend/server.mjs --name docterbee
   pm2 save
   pm2 startup
   ```

### Option 2: Vercel + PlanetScale

1. Frontend: Deploy static HTML ke Vercel
2. Backend: Deploy Express API ke Vercel
3. Database: Use PlanetScale (MySQL cloud)

### Option 3: Heroku + JawsDB

1. Frontend + Backend: Deploy ke Heroku
2. Database: Use JawsDB MySQL addon

## 📝 License

© 2024-2025 Docterbee - Kesehatan berbasis Qur'an & Sunnah

---

**Need Help?**

- Check [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for database details
- Check [techdev.md](techdev.md) for technical overview
- Open browser console (F12) to see errors
