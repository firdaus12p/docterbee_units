-- ==========================================
-- FIX ARTICLES TABLE - ADD ALL MISSING COLUMNS
-- Run this SQL on your server to fix the articles table
-- ==========================================

USE docterbee;

-- Add tags column if it doesn't exist
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags VARCHAR(500) DEFAULT NULL;

-- Add category column if it doesn't exist  
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Nutrisi';

-- Add header_image column if it doesn't exist
ALTER TABLE articles ADD COLUMN IF NOT EXISTS header_image VARCHAR(500) DEFAULT NULL;

-- Add excerpt column if it doesn't exist
ALTER TABLE articles ADD COLUMN IF NOT EXISTS excerpt TEXT DEFAULT NULL;

-- Add is_published column if it doesn't exist
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_published TINYINT(1) DEFAULT 1;

-- Verify columns were added
DESCRIBE articles;

SELECT 'Articles table columns have been fixed!' AS status;
