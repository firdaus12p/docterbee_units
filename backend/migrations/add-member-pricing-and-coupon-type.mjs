import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", "..", ".env") });

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "",
  database: process.env.DB_NAME || "docterbee_units",
  port: parseInt(process.env.DB_PORT) || 3307,
};

async function runMigration() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to database");

    // 1. Add member_price and promo_text to products table
    console.log("📦 Adding member_price and promo_text to products table...");
    await connection.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS member_price DECIMAL(10, 2) DEFAULT NULL 
        COMMENT 'Harga khusus member (NULL = tidak ada harga member)',
      ADD COLUMN IF NOT EXISTS promo_text VARCHAR(255) DEFAULT NULL 
        COMMENT 'Teks promosi produk (opsional)'
    `);
    console.log("✅ products: member_price, promo_text added");

    // 2. Add coupon_type to coupons table
    console.log("📦 Adding coupon_type to coupons table...");

    // Check if column exists first
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM coupons LIKE 'coupon_type'
    `);

    if (columns.length === 0) {
      await connection.query(`
        ALTER TABLE coupons 
        ADD COLUMN coupon_type ENUM('store', 'services', 'both') NOT NULL DEFAULT 'both' 
          COMMENT 'Tipe kupon: store (produk), services (layanan), atau both'
      `);
      console.log("✅ coupons: coupon_type added");
    } else {
      console.log("⚠️  coupons: coupon_type already exists, skipping");
    }

    // 3. Add coupon fields to orders table
    console.log("📦 Adding coupon fields to orders table...");
    await connection.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50) DEFAULT NULL 
        COMMENT 'Kode kupon yang digunakan',
      ADD COLUMN IF NOT EXISTS coupon_discount DECIMAL(10, 2) DEFAULT 0 
        COMMENT 'Total diskon dari kupon',
      ADD COLUMN IF NOT EXISTS original_total DECIMAL(10, 2) DEFAULT NULL 
        COMMENT 'Total sebelum diskon kupon'
    `);
    console.log("✅ orders: coupon_code, coupon_discount, original_total added");

    console.log("\n🎉 Migration completed successfully!");
    console.log("\n📋 Summary:");
    console.log("   - products: Added member_price (DECIMAL), promo_text (VARCHAR)");
    console.log("   - coupons: Added coupon_type (ENUM: store/services/both)");
    console.log("   - orders: Added coupon_code, coupon_discount, original_total");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}

// Run migration
runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
