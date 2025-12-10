-- ============================================
-- FIX: Add missing 'views' column to articles table
-- ============================================

-- Option 1: ALTER TABLE (jika tabel sudah ada dan ada data yang ingin dipertahankan)
ALTER TABLE articles 
ADD COLUMN views INT DEFAULT 0 AFTER is_published;

-- Option 2: DROP dan RECREATE (jika tidak ada data penting)
-- DROP TABLE IF EXISTS articles;
-- 
-- CREATE TABLE articles (
--   id INT PRIMARY KEY AUTO_INCREMENT,
--   title VARCHAR(255) NOT NULL,
--   slug VARCHAR(255) NOT NULL UNIQUE,
--   content LONGTEXT NOT NULL,
--   excerpt TEXT,
--   header_image VARCHAR(500) DEFAULT NULL,
--   category ENUM('Nutrisi', 'Ibadah', 'Kebiasaan', 'Sains') NOT NULL,
--   author VARCHAR(100) DEFAULT 'Admin',
--   is_published TINYINT(1) DEFAULT 1,
--   views INT DEFAULT 0,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   INDEX idx_slug (slug),
--   INDEX idx_category (category),
--   INDEX idx_published (is_published),
--   INDEX idx_created (created_at)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
