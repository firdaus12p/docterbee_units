/**
 * Migration: Add Coffee category to products table
 * This migration adds "Coffee" as a new product category option
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", "..", ".env") });

async function up() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log("🚀 Running migration: Add Coffee category...");

    // Alter the ENUM to include Coffee
    await connection.execute(`
      ALTER TABLE products 
      MODIFY COLUMN category ENUM('Zona Sunnah', '1001 Rempah', 'Zona Honey', 'Cold Pressed', 'Coffee') NOT NULL
    `);

    console.log("✅ Migration successful: Coffee category added to products table");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

async function down() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log("🔄 Rolling back migration: Remove Coffee category...");

    // Check if there are products with Coffee category
    const [products] = await connection.execute(
      "SELECT COUNT(*) as count FROM products WHERE category = 'Coffee'"
    );

    if (products[0].count > 0) {
      console.log("⚠️  Warning: There are products with Coffee category. Please reassign them first.");
      throw new Error("Cannot remove Coffee category while products exist with this category");
    }

    // Revert the ENUM
    await connection.execute(`
      ALTER TABLE products 
      MODIFY COLUMN category ENUM('Zona Sunnah', '1001 Rempah', 'Zona Honey', 'Cold Pressed') NOT NULL
    `);

    console.log("✅ Rollback successful: Coffee category removed");
  } catch (error) {
    console.error("❌ Rollback failed:", error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run migration if called directly
if (process.argv[2] === "up") {
  up().catch(console.error);
} else if (process.argv[2] === "down") {
  down().catch(console.error);
}

export { up, down };
