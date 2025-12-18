-- Migration: Fix admin_login_history table to allow NULL admin_id
-- This allows logging failed login attempts when admin doesn't exist

-- Drop existing foreign key constraint
ALTER TABLE admin_login_history DROP FOREIGN KEY admin_login_history_ibfk_1;

-- Modify admin_id to allow NULL
ALTER TABLE admin_login_history 
MODIFY COLUMN admin_id INT DEFAULT NULL COMMENT 'NULL for failed attempts when admin not found';

-- Re-add foreign key with ON DELETE SET NULL
ALTER TABLE admin_login_history 
ADD CONSTRAINT admin_login_history_ibfk_1 
FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL;
