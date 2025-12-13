-- ==========================================
-- ADD UNIQUE CONSTRAINT TO PHONE COLUMN
-- Run this to add phone number uniqueness validation
-- ==========================================

USE docterbee_units;

-- Add UNIQUE constraint to phone column
ALTER TABLE users ADD UNIQUE KEY unique_phone (phone);

-- Verify the constraint was added
SHOW INDEX FROM users WHERE Key_name = 'unique_phone';

SELECT 'UNIQUE constraint added to phone column successfully!' AS status;
