// ============================================
// FIX ARTICLES TABLE - Add ALL missing columns
// ============================================

import { pool } from "../db.mjs";

async function fixArticlesTableComplete() {
  const connection = await pool.getConnection();

  try {
    console.log("🔧 Checking articles table structure...\n");

    // Check if table exists
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'articles'
    `);

    if (tables.length === 0) {
      console.log('❌ Table "articles" does not exist!');
      console.log("💡 Solution: Restart server to create table automatically.\n");
      return;
    }

    // Get current columns
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'articles'
    `);

    const existingColumns = columns.map((col) => col.COLUMN_NAME);
    console.log("📊 Existing columns:", existingColumns.join(", "));

    // Define required columns
    const requiredColumns = {
      views: {
        sql: "ADD COLUMN views INT DEFAULT 0 AFTER is_published",
        description: "View counter",
      },
      category: {
        sql: "ADD COLUMN category ENUM('Nutrisi', 'Ibadah', 'Kebiasaan', 'Sains') NOT NULL DEFAULT 'Nutrisi' AFTER header_image",
        description: "Article category",
      },
      author: {
        sql: "ADD COLUMN author VARCHAR(100) DEFAULT 'Admin' AFTER category",
        description: "Article author",
      },
      is_published: {
        sql: "ADD COLUMN is_published TINYINT(1) DEFAULT 1 AFTER author",
        description: "Published status",
      },
    };

    let hasChanges = false;

    // Check and add missing columns
    for (const [columnName, columnInfo] of Object.entries(requiredColumns)) {
      if (!existingColumns.includes(columnName)) {
        console.log(`\n⚠️  Column "${columnName}" is missing!`);
        console.log(`   Description: ${columnInfo.description}`);
        console.log(`   Adding column...`);

        try {
          await connection.query(`ALTER TABLE articles ${columnInfo.sql}`);
          console.log(`   ✅ Column "${columnName}" added successfully!`);
          hasChanges = true;
        } catch (error) {
          console.log(`   ❌ Error adding column "${columnName}":`, error.message);
        }
      } else {
        console.log(`✅ Column "${columnName}" exists`);
      }
    }

    if (hasChanges) {
      console.log("\n📊 Table structure updated successfully!");
    } else {
      console.log("\n✅ All required columns already exist. No changes needed.");
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

fixArticlesTableComplete();
