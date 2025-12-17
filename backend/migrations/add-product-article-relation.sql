-- ==========================================
-- MIGRATION: Add Product-Article Relation
-- Menambahkan kolom untuk menghubungkan artikel dengan produk
-- ==========================================

-- Tambahkan kolom article_type untuk membedakan artikel umum dan artikel produk
ALTER TABLE articles 
ADD COLUMN article_type ENUM('general', 'product') NOT NULL DEFAULT 'general' AFTER category;

-- Tambahkan kolom product_id untuk relasi ke tabel products
ALTER TABLE articles 
ADD COLUMN product_id INT DEFAULT NULL AFTER article_type;

-- Tambahkan index untuk optimasi query
ALTER TABLE articles 
ADD INDEX idx_product_id (product_id),
ADD INDEX idx_article_type (article_type);

-- Verifikasi perubahan
DESCRIBE articles;

SELECT 'Migration add-product-article-relation berhasil!' AS status;
