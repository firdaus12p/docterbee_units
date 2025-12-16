/**
 * Migration: Add coupon_usage table for one-time coupon usage per user
 *
 * This ensures each user can only use a specific coupon once across all services and store.
 * Security: UNIQUE constraint on (user_id, coupon_id) prevents duplicate usage.
 */

import { query } from "../db.mjs";

export async function up() {
  console.log("🔄 Creating coupon_usage table...");

  await query(`
    CREATE TABLE IF NOT EXISTS coupon_usage (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      coupon_id INT NOT NULL,
      order_type ENUM('store', 'service') NOT NULL,
      order_id INT DEFAULT NULL,
      used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      UNIQUE KEY unique_user_coupon (user_id, coupon_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
      
      INDEX idx_user_id (user_id),
      INDEX idx_coupon_id (coupon_id),
      INDEX idx_used_at (used_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  console.log("✅ coupon_usage table created successfully");
}

export async function down() {
  console.log("🔄 Dropping coupon_usage table...");
  await query("DROP TABLE IF EXISTS coupon_usage");
  console.log("✅ coupon_usage table dropped");
}
