-- Migration: Add coupons and coupon_usage tables
-- Run this SQL script manually on your database

-- Create coupons table for promo codes
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(10, 2) NOT NULL,
  min_booking_value DECIMAL(10, 2) DEFAULT 0,
  max_uses INT DEFAULT NULL COMMENT 'NULL = unlimited',
  used_count INT DEFAULT 0,
  expires_at TIMESTAMP NULL,
  coupon_type ENUM('store', 'services', 'both') DEFAULT 'both' COMMENT 'Where coupon can be used',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_active (is_active),
  INDEX idx_expires (expires_at),
  INDEX idx_type (coupon_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create coupon_usage table to track one-time-per-user usage
CREATE TABLE IF NOT EXISTS coupon_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  coupon_id INT NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_coupon (user_id, coupon_id),
  INDEX idx_user (user_id),
  INDEX idx_coupon (coupon_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
