/**
 * Migration: Advanced Rewards System
 * Version: 002
 * Date: 2026-01-08
 * 
 * Changes:
 * 1. rewards table: Add reward_type, target_product_id, discount_value, discount_type
 * 2. coupons table: Add target_product_id, source_redemption_id, owner_user_id, modify discount_type ENUM
 * 3. reward_redemptions table: Change status ENUM, add coupon_code, expires_at, coupon_id
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

/**
 * Safe column add - ignores if column already exists
 */
async function safeAddColumn(connection, table, column, definition) {
  try {
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column]
    );
    
    if (columns.length === 0) {
      await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      console.log(`  ✅ Added column: ${table}.${column}`);
      return true;
    } else {
      console.log(`  ⏭️ Column exists: ${table}.${column}`);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ Error adding ${table}.${column}:`, error.message);
    return false;
  }
}

/**
 * Safe index add - ignores if index already exists
 */
async function safeAddIndex(connection, table, indexName, column) {
  try {
    const [indexes] = await connection.query(
      `SHOW INDEX FROM ${table} WHERE Key_name = ?`,
      [indexName]
    );
    
    if (indexes.length === 0) {
      await connection.query(`ALTER TABLE ${table} ADD INDEX ${indexName} (${column})`);
      console.log(`  ✅ Added index: ${table}.${indexName}`);
      return true;
    } else {
      console.log(`  ⏭️ Index exists: ${table}.${indexName}`);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ Error adding index ${table}.${indexName}:`, error.message);
    return false;
  }
}

/**
 * Safe unique index add
 */
async function safeAddUniqueIndex(connection, table, indexName, column) {
  try {
    const [indexes] = await connection.query(
      `SHOW INDEX FROM ${table} WHERE Key_name = ?`,
      [indexName]
    );
    
    if (indexes.length === 0) {
      await connection.query(`ALTER TABLE ${table} ADD UNIQUE INDEX ${indexName} (${column})`);
      console.log(`  ✅ Added unique index: ${table}.${indexName}`);
      return true;
    } else {
      console.log(`  ⏭️ Unique index exists: ${table}.${indexName}`);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ Error adding unique index ${table}.${indexName}:`, error.message);
    return false;
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'docterbee_units',
    port: parseInt(process.env.DB_PORT) || 3307
  });

  console.log('🚀 Starting Migration 002: Advanced Rewards System');
  console.log('================================================\n');

  try {
    // ============================================
    // 1. REWARDS TABLE
    // ============================================
    console.log('📦 Migrating: rewards table');
    
    await safeAddColumn(connection, 'rewards', 'reward_type',
      "ENUM('discount', 'free_product') DEFAULT 'discount' AFTER description");
    
    await safeAddColumn(connection, 'rewards', 'target_product_id',
      "INT DEFAULT NULL COMMENT 'Product ID for free_product type' AFTER reward_type");
    
    await safeAddColumn(connection, 'rewards', 'discount_value',
      "DECIMAL(10,2) DEFAULT NULL COMMENT 'Discount amount for discount type' AFTER target_product_id");
    
    await safeAddColumn(connection, 'rewards', 'discount_type',
      "ENUM('percentage', 'fixed') DEFAULT NULL COMMENT 'Discount type for discount rewards' AFTER discount_value");
    
    await safeAddIndex(connection, 'rewards', 'idx_reward_type', 'reward_type');
    await safeAddIndex(connection, 'rewards', 'idx_target_product', 'target_product_id');

    // ============================================
    // 2. COUPONS TABLE
    // ============================================
    console.log('\n📦 Migrating: coupons table');
    
    // Modify ENUM for discount_type (add free_product)
    try {
      await connection.query(
        "ALTER TABLE coupons MODIFY COLUMN discount_type ENUM('percentage', 'fixed', 'free_product') NOT NULL"
      );
      console.log("  ✅ Modified discount_type ENUM to include 'free_product'");
    } catch (e) {
      console.log("  ⏭️ discount_type ENUM already has free_product or error:", e.message);
    }
    
    await safeAddColumn(connection, 'coupons', 'target_product_id',
      "INT DEFAULT NULL COMMENT 'Product ID for free_product coupon' AFTER discount_value");
    
    await safeAddColumn(connection, 'coupons', 'source_redemption_id',
      "INT DEFAULT NULL COMMENT 'Links to reward_redemptions.id for traceability' AFTER target_product_id");
    
    await safeAddColumn(connection, 'coupons', 'owner_user_id',
      "INT DEFAULT NULL COMMENT 'User who owns this personal coupon' AFTER source_redemption_id");
    
    await safeAddIndex(connection, 'coupons', 'idx_target_product', 'target_product_id');
    await safeAddIndex(connection, 'coupons', 'idx_source_redemption', 'source_redemption_id');
    await safeAddIndex(connection, 'coupons', 'idx_owner_user', 'owner_user_id');

    // ============================================
    // 3. REWARD_REDEMPTIONS TABLE
    // ============================================
    console.log('\n📦 Migrating: reward_redemptions table');
    
    // Check current status column type
    const [statusInfo] = await connection.query(
      `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'reward_redemptions' AND COLUMN_NAME = 'status'`
    );
    
    if (statusInfo.length > 0) {
      const currentType = statusInfo[0].COLUMN_TYPE;
      
      // Check if we need to update the ENUM
      if (!currentType.includes('active')) {
        console.log('  🔄 Updating status ENUM values...');
        
        // Step 1: Add new column with new ENUM
        await safeAddColumn(connection, 'reward_redemptions', 'new_status',
          "ENUM('active', 'used', 'expired', 'cancelled') DEFAULT 'active' AFTER points_cost");
        
        // Step 2: Migrate data
        await connection.query(`
          UPDATE reward_redemptions SET new_status = CASE 
            WHEN status = 'approved' THEN 'used' 
            WHEN status = 'rejected' THEN 'cancelled'
            WHEN status = 'pending' THEN 'active'
            ELSE 'active' 
          END
        `);
        console.log('  ✅ Migrated status data to new ENUM values');
        
        // Step 3: Drop old column and rename new
        await connection.query('ALTER TABLE reward_redemptions DROP COLUMN status');
        await connection.query('ALTER TABLE reward_redemptions CHANGE COLUMN new_status status ENUM(\'active\', \'used\', \'expired\', \'cancelled\') DEFAULT \'active\'');
        console.log('  ✅ Replaced status column with new ENUM');
      } else {
        console.log('  ⏭️ Status ENUM already updated');
      }
    }
    
    // Add new columns
    await safeAddColumn(connection, 'reward_redemptions', 'coupon_code',
      "VARCHAR(50) DEFAULT NULL COMMENT 'Generated unique coupon code' AFTER status");
    
    await safeAddColumn(connection, 'reward_redemptions', 'expires_at',
      "DATETIME DEFAULT NULL COMMENT 'Expiry date (30 days from redemption)' AFTER coupon_code");
    
    await safeAddColumn(connection, 'reward_redemptions', 'coupon_id',
      "INT DEFAULT NULL COMMENT 'Links to coupons.id' AFTER expires_at");
    
    await safeAddUniqueIndex(connection, 'reward_redemptions', 'idx_coupon_code', 'coupon_code');
    await safeAddIndex(connection, 'reward_redemptions', 'idx_expires_at', 'expires_at');
    await safeAddIndex(connection, 'reward_redemptions', 'idx_coupon_id', 'coupon_id');

    // ============================================
    // VERIFICATION
    // ============================================
    console.log('\n🔍 Verifying migration...');
    
    const [rewardsCols] = await connection.query('DESCRIBE rewards');
    const [couponsCols] = await connection.query('DESCRIBE coupons');
    const [redemptionsCols] = await connection.query('DESCRIBE reward_redemptions');
    
    console.log('\nrewards columns:', rewardsCols.map(c => c.Field).join(', '));
    console.log('coupons columns:', couponsCols.map(c => c.Field).join(', '));
    console.log('reward_redemptions columns:', redemptionsCols.map(c => c.Field).join(', '));

    console.log('\n================================================');
    console.log('✅ Migration 002 completed successfully!');
    console.log('================================================');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run migration
runMigration().catch(console.error);
