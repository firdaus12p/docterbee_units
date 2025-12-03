# Database Schema - Docterbee Units

Database ini digunakan untuk menyimpan data booking, events, articles, dan coupons untuk aplikasi Docterbee.

## Setup XAMPP

1. Buka XAMPP Control Panel
2. Start **Apache** dan **MySQL**
3. Klik **Admin** pada MySQL (atau buka http://localhost/phpmyadmin)
4. Buat database baru dengan nama: `docterbee_units`
5. Pilih Collation: `utf8mb4_unicode_ci`

## Auto-Initialize Tables

Tabel akan dibuat otomatis saat server dijalankan pertama kali melalui `backend/db.mjs`.

Jalankan:

```bash
npm install
npm start
```

Server akan membuat 4 tabel otomatis jika belum ada:

- `bookings`
- `events`
- `articles`
- `coupons`

## Manual SQL (Opsional)

Jika ingin membuat tabel manual, jalankan SQL berikut di phpMyAdmin:

### 1. Table: bookings

```sql
CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  service_name VARCHAR(255) NOT NULL,
  branch VARCHAR(100) NOT NULL,
  practitioner VARCHAR(255) NOT NULL,
  booking_date DATE NOT NULL,
  booking_time VARCHAR(20) NOT NULL,
  mode ENUM('online', 'offline') NOT NULL,
  promo_code VARCHAR(50) DEFAULT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date (booking_date),
  INDEX idx_status (status),
  INDEX idx_branch (branch)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Kolom:**

- `id`: Primary key auto increment
- `service_name`: Nama layanan (Bekam, Pijat Refleksi, dll.)
- `branch`: Cabang Docterbee (Jakarta Pusat, Bandung, dll.)
- `practitioner`: Nama praktisi yang dipilih
- `booking_date`: Tanggal booking (DATE)
- `booking_time`: Waktu booking (VARCHAR, misal "09:00 - 10:00")
- `mode`: Mode konsultasi (online/offline)
- `promo_code`: Kode promo yang digunakan (nullable)
- `discount_amount`: Jumlah diskon yang didapat (DECIMAL)
- `status`: Status booking (pending/confirmed/completed/cancelled)
- `notes`: Catatan tambahan dari admin (TEXT, nullable)
- `created_at`: Timestamp pembuatan
- `updated_at`: Timestamp update terakhir

### 2. Table: events

```sql
CREATE TABLE IF NOT EXISTS events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  mode ENUM('online', 'offline') NOT NULL,
  topic VARCHAR(100) NOT NULL,
  description TEXT,
  link VARCHAR(500),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date (event_date),
  INDEX idx_mode (mode),
  INDEX idx_topic (topic)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Kolom:**

- `id`: Primary key auto increment
- `title`: Judul event/webinar/workshop
- `event_date`: Tanggal pelaksanaan event (DATE)
- `mode`: Mode event (online/offline)
- `topic`: Topik event (quranic, nutrition, science, parenting, productivity)
- `description`: Deskripsi lengkap event (TEXT)
- `link`: Link Zoom/lokasi offline (VARCHAR)
- `is_active`: Status aktif (1=tampil, 0=hidden)
- `created_at`: Timestamp pembuatan
- `updated_at`: Timestamp update terakhir

### 3. Table: articles

```sql
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
  INDEX idx_slug (slug),
  INDEX idx_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Kolom:**

- `id`: Primary key auto increment
- `title`: Judul artikel
- `slug`: URL-friendly unique identifier
- `content`: Konten lengkap artikel (TEXT)
- `excerpt`: Ringkasan artikel (TEXT, nullable)
- `tags`: Tag artikel (VARCHAR, comma-separated)
- `is_published`: Status publish (1=published, 0=draft)
- `created_at`: Timestamp pembuatan
- `updated_at`: Timestamp update terakhir

### 4. Table: coupons

```sql
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
  INDEX idx_code (code),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Kolom:**

- `id`: Primary key auto increment
- `code`: Kode promo (VARCHAR 50, unique, uppercase)
- `description`: Deskripsi promo
- `discount_type`: Tipe diskon (percentage=%, fixed=nominal)
- `discount_value`: Nilai diskon (10.00 untuk 10% atau Rp 10.000)
- `min_booking_value`: Minimal nilai booking untuk pakai promo
- `max_uses`: Maksimal penggunaan (NULL = unlimited)
- `used_count`: Jumlah sudah digunakan
- `is_active`: Status aktif (1=aktif, 0=nonaktif)
- `expires_at`: Tanggal kadaluarsa (DATETIME, nullable)
- `created_at`: Timestamp pembuatan
- `updated_at`: Timestamp update terakhir

## Sample Data (Opsional)

### Sample Events

```sql
INSERT INTO events (title, event_date, mode, topic, description, link) VALUES
('Webinar: Bekam Rasulullah & Sains', '2025-01-15', 'online', 'quranic', 'Memahami manfaat bekam dari perspektif Sunnah dan penelitian medis modern', 'https://zoom.us/j/12345'),
('Workshop: Meal Prep Qur\'ani', '2025-01-20', 'offline', 'nutrition', 'Praktik langsung memasak menu sehat berbasis nutrisi Al-Qur\'an', 'Jakarta Pusat'),
('Seminar: Parenting Islami', '2025-02-05', 'online', 'parenting', 'Mendidik anak dengan nilai-nilai Islam dan pendekatan psikologi modern', 'https://zoom.us/j/67890');
```

### Sample Articles

```sql
INSERT INTO articles (title, slug, content, excerpt, tags) VALUES
('7 Kebiasaan Rasulullah untuk Kesehatan Optimal', '7-kebiasaan-rasulullah', 'Konten lengkap artikel...', 'Pelajari 7 kebiasaan harian Rasulullah yang terbukti secara sains', 'Ibadah,Kebiasaan'),
('Bekam: Terapi Sunnah yang Didukung Sains', 'bekam-terapi-sunnah', 'Konten lengkap artikel...', 'Mengenal lebih dalam manfaat bekam dari perspektif medis', 'Nutrisi,Sains'),
('Nutrisi Qur\'ani untuk Stamina Maksimal', 'nutrisi-qurani-stamina', 'Konten lengkap artikel...', 'Panduan nutrisi berdasarkan makanan yang disebutkan dalam Al-Qur\'an', 'Nutrisi,Kebiasaan');
```

### Sample Coupons

```sql
INSERT INTO coupons (code, description, discount_type, discount_value, max_uses, expires_at) VALUES
('WELCOME2025', 'Diskon selamat datang 15%', 'percentage', 15.00, 100, '2025-03-31 23:59:59'),
('RAMADAN50K', 'Diskon Ramadan Rp 50.000', 'fixed', 50000.00, 50, '2025-05-31 23:59:59'),
('MEMBER10', 'Diskon member 10%', 'percentage', 10.00, NULL, NULL);
```

## API Endpoints

Setelah database setup:

- **Bookings**: `/api/bookings` (GET, POST, PATCH)
- **Events**: `/api/events` (GET, POST, PATCH, DELETE)
- **Articles**: `/api/insight` (GET, POST, PATCH, DELETE)
- **Coupons**: `/api/coupons` (GET, POST, PATCH, DELETE) + `/api/coupons/validate` (POST)

## Troubleshooting

### Error: "Database connection failed"

- Pastikan XAMPP MySQL sudah running
- Periksa konfigurasi di file `.env`:
  ```
  DB_HOST=localhost
  DB_USER=root
  DB_PASS=
  DB_NAME=docterbee_units
  ```

### Error: "Access denied for user"

- Pastikan `DB_USER` dan `DB_PASS` sesuai dengan konfigurasi MySQL di XAMPP
- Default XAMPP: user=`root`, password=`''` (kosong)

### Error: "Unknown database"

- Buat database `docterbee_units` secara manual di phpMyAdmin
- Atau jalankan SQL:
  ```sql
  CREATE DATABASE docterbee_units CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

## Backup & Restore

### Backup

```bash
mysqldump -u root -p docterbee_units > backup.sql
```

### Restore

```bash
mysql -u root -p docterbee_units < backup.sql
```
