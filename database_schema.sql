-- ==========================================
-- DATABASE SCHEMA UNTUK DOCTERBEE UNITS
-- Import file ini ke phpMyAdmin jika tabel belum terbuat otomatis
-- ==========================================

-- Gunakan database yang benar
USE unitdocterbee;

-- Hapus tabel lama jika ada (HATI-HATI: ini akan menghapus semua data!)
-- DROP TABLE IF EXISTS services;
-- DROP TABLE IF EXISTS bookings;
-- DROP TABLE IF EXISTS events;
-- DROP TABLE IF EXISTS articles;
-- DROP TABLE IF EXISTS coupons;
-- DROP TABLE IF EXISTS products;

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
  price DECIMAL(10, 2) DEFAULT 0 COMMENT 'Harga asli service',
  customer_name VARCHAR(255) DEFAULT NULL,
  customer_phone VARCHAR(20) DEFAULT NULL,
  customer_age INT DEFAULT NULL,
  customer_gender ENUM('Laki-laki', 'Perempuan') DEFAULT NULL,
  customer_address TEXT DEFAULT NULL,
  promo_code VARCHAR(50) DEFAULT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0 COMMENT 'Nilai diskon (Rp)',
  final_price DECIMAL(10, 2) DEFAULT 0 COMMENT 'Harga setelah diskon',
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date (booking_date),
  INDEX idx_status (status),
  INDEX idx_branch (branch),
  INDEX idx_customer_phone (customer_phone)
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
  speaker VARCHAR(255) DEFAULT NULL COMMENT 'Nama pemateri/host',
  registration_fee DECIMAL(10, 2) DEFAULT 0 COMMENT 'Biaya pendaftaran (0 = gratis)',
  registration_deadline DATE DEFAULT NULL COMMENT 'Tanggal akhir pendaftaran',
  location VARCHAR(500) DEFAULT NULL COMMENT 'Lokasi offline atau link Zoom',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date (event_date),
  INDEX idx_mode (mode),
  INDEX idx_topic (topic)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Buat tabel articles
CREATE TABLE IF NOT EXISTS articles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  tags VARCHAR(500),
  category VARCHAR(100) DEFAULT 'Nutrisi',
  header_image VARCHAR(500) DEFAULT NULL,
  is_published TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_published (is_published)
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
  INDEX idx_code (code),
  INDEX idx_active (is_active)
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
  INDEX idx_active (is_active),
  INDEX idx_stock (stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Buat tabel users (HARUS PERTAMA - tabel lain reference ini)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Buat tabel orders
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  user_id INT,
  customer_name VARCHAR(100),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(100),
  order_type ENUM('dine_in', 'take_away') NOT NULL,
  store_location ENUM('kolaka', 'makassar', 'kendari') NOT NULL,
  items JSON NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  points_earned INT DEFAULT 0,
  status ENUM('pending', 'completed', 'expired', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('pending', 'paid') DEFAULT 'pending',
  qr_code_data TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order_number (order_number),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_payment_status (payment_status),
  INDEX idx_expires_at (expires_at),
  INDEX idx_created (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Buat tabel user_progress (untuk menyimpan progress Journey user)
CREATE TABLE IF NOT EXISTS user_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  unit_data JSON NOT NULL,
  points INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Buat tabel user_cart (untuk menyimpan keranjang belanja user)
CREATE TABLE IF NOT EXISTS user_cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  cart_data JSON NOT NULL,
  last_qr_code TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_cart (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verifikasi tabel yang sudah dibuat
SHOW TABLES;

-- Pesan sukses
SELECT 'Database schema berhasil dibuat! Semua tabel sudah siap.' AS status;
