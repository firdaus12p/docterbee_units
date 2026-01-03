-- Migration: Add soft delete support for orders table
-- Run this SQL in your MySQL database to enable soft delete functionality

-- Add deleted_at column for soft delete (NULL = not deleted, DATETIME = deleted at that time)
ALTER TABLE orders ADD COLUMN deleted_at DATETIME NULL DEFAULT NULL;

-- Add index for faster filtering on deleted_at
CREATE INDEX idx_orders_deleted_at ON orders(deleted_at);

-- Note: This migration is safe to run multiple times (existing data is preserved)
-- Existing orders will have deleted_at = NULL (not deleted)
