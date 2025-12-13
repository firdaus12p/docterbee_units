// ============================================
// Migration: Add tags column to articles table
// ============================================

import { query } from "../db.mjs";

async function addTagsColumn() {
  try {
    console.log("🔄 Adding tags column to articles table...");

    // Check if column already exists
    const checkColumn = await query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'articles' 
       AND COLUMN_NAME = 'tags'`
    );

    if (checkColumn.length > 0) {
      console.log("✅ Column tags already exists");
      return;
    }

    // Add tags column after excerpt
    await query(
      `ALTER TABLE articles 
       ADD COLUMN tags TEXT NULL 
       AFTER excerpt`
    );

    console.log("✅ Successfully added tags column to articles table");
  } catch (error) {
    console.error("❌ Error adding tags column:", error);
    throw error;
  }
}

// Run migration
addTagsColumn()
  .then(() => {
    console.log("✅ Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  });
