# ==========================================
# PANDUAN TROUBLESHOOTING ERROR 500
# Database tidak terhubung atau tabel belum ada
# ==========================================

## MASALAH YANG ANDA ALAMI:
Error: "Failed to load resource: the server responded with a status of 500"
Error di console: "Error loading services: Error: Gagal mengambil data layanan"

## PENYEBAB:
1. Tabel `services` (dan tabel lainnya) belum dibuat di database `unitdocterbee`
2. Server Node.js sudah jalan, tapi database masih kosong

## SOLUSI LENGKAP:

### LANGKAH 1: Cek Log Server di Plesk
1. Buka Plesk → Node.js
2. Klik tombol **"Logs"** atau **"Application Logs"**
3. Cari pesan seperti ini:
   - ✅ "Database connected successfully" → Database terhubung
   - ✅ "Table: bookings" → Tabel dibuat otomatis
   - ❌ "Database connection failed" → Database TIDAK terhubung

### LANGKAH 2: Jika Database TIDAK Terhubung
Periksa file `.env` di Plesk:
1. Buka File Manager di Plesk
2. Pastikan file `.env` ada di root folder (sejajar dengan `package.json`)
3. Isi file `.env` HARUS PERSIS seperti ini (tanpa spasi di sekitar tanda =):

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=zona_english_admin
DB_PASSWORD=Alanwalker009#
DB_NAME=unitdocterbee
GEMINI_API_KEY=AIzaSyCwVp4VL1jdRB5JOyfHsg1FPqfE_CpW50s
ADMIN_USER=zonaengl
ADMIN_PASS=Alanwalker009#
```

4. Setelah edit, klik **Restart App** di halaman Node.js

### LANGKAH 3: Jika Database Terhubung Tapi Tabel Belum Ada
Aplikasi seharusnya membuat tabel otomatis saat pertama kali jalan.

**CARA PAKSA BUAT TABEL:**
1. Buka **phpMyAdmin** di Plesk
2. Pilih database `unitdocterbee`
3. Klik tab **SQL**
4. Copy-paste SQL di bawah ini, lalu klik **Go**:

```sql
-- Buat tabel services
CREATE TABLE IF NOT EXISTS services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  category ENUM('manual', 'klinis', 'konsultasi', 'perawatan') NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  branch VARCHAR(255) NOT NULL COMMENT 'Comma-separated branches: Kolaka, Makassar, Kendari',
  mode ENUM('online', 'offline', 'both') NOT NULL DEFAULT 'both',
  practitioner VARCHAR(255) DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_active (is_active),
  INDEX idx_mode (mode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Buat tabel bookings
CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  service_name VARCHAR(255) NOT NULL,
  branch VARCHAR(100) NOT NULL,
  practitioner VARCHAR(255) NOT NULL,
  booking_date DATE NOT NULL,
  booking_time VARCHAR(20) NOT NULL,
  mode ENUM('online', 'offline') NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0,
  customer_name VARCHAR(255) DEFAULT NULL,
  customer_phone VARCHAR(20) DEFAULT NULL,
  customer_age INT DEFAULT NULL,
  customer_gender ENUM('Laki-laki', 'Perempuan') DEFAULT NULL,
  customer_address TEXT DEFAULT NULL,
  promo_code VARCHAR(50) DEFAULT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  final_price DECIMAL(10, 2) DEFAULT 0,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date (booking_date),
  INDEX idx_status (status),
  INDEX idx_branch (branch)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Buat tabel events
CREATE TABLE IF NOT EXISTS events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  mode ENUM('online', 'offline') NOT NULL,
  topic VARCHAR(100) NOT NULL,
  description TEXT,
  link VARCHAR(500),
  speaker VARCHAR(255) DEFAULT NULL,
  registration_fee DECIMAL(10, 2) DEFAULT 0,
  registration_deadline DATE DEFAULT NULL,
  location VARCHAR(500) DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date (event_date),
  INDEX idx_mode (mode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Buat tabel articles
CREATE TABLE IF NOT EXISTS articles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  tags VARCHAR(500),
  is_published TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Buat tabel coupons
CREATE TABLE IF NOT EXISTS coupons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  discount_type ENUM('percentage', 'fixed') NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  min_booking_value DECIMAL(10, 2) DEFAULT 0,
  max_uses INT DEFAULT NULL,
  used_count INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  expires_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Buat tabel products
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  category ENUM('Zona Sunnah', '1001 Rempah', 'Zona Honey', 'Cold Pressed') NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  stock INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

5. Setelah SQL berhasil dijalankan, klik **Restart App** di Node.js Plesk
6. Refresh halaman admin dashboard Anda

### LANGKAH 4: Verifikasi
1. Buka admin dashboard lagi
2. Jika masih error, buka **Browser Console** (F12)
3. Cek tab **Network** → klik request yang error → lihat **Response**
4. Screenshot error tersebut dan kirim ke saya

## CATATAN PENTING:
- Username database: `zona_english_admin` (BUKAN `adminer`)
- Password: `Alanwalker009#`
- Database name: `unitdocterbee`
- Port: `3306` (bukan 3307 seperti XAMPP lokal)

Jika masih error setelah langkah ini, beritahu saya apa yang muncul di **Application Logs** Plesk.
