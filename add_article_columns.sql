-- ==========================================
-- ADD MISSING COLUMNS TO ARTICLES TABLE
-- Run this SQL on your server to add header_image and category columns
-- ==========================================

USE docterbee;

-- Add header_image column if it doesn't exist
ALTER TABLE articles ADD COLUMN IF NOT EXISTS header_image VARCHAR(500) DEFAULT NULL;

-- Add category column if it doesn't exist  
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Nutrisi';

-- Verify columns were added
DESCRIBE articles;

SELECT 'Columns header_image and category added to articles table!' AS status;
