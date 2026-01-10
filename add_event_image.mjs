/**
 * Migration: Add event_image column to events table
 * This column stores the hero/banner image for the event (separate from speaker photo)
 * 
 * Run this script manually with: node add_event_image.mjs
 */

import { query } from "./backend/db.mjs";

async function migrate() {
  console.log("🔄 Starting migration: add_event_image_column");

  try {
    // Check if column already exists
    const columns = await query("SHOW COLUMNS FROM events LIKE 'event_image'");
    
    if (columns.length > 0) {
      console.log("✅ Column 'event_image' already exists. Skipping.");
      return;
    }

    // Add the event_image column after description
    await query(`
      ALTER TABLE events 
      ADD COLUMN event_image TEXT NULL 
      AFTER description
    `);

    console.log("✅ Successfully added 'event_image' column to events table");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Run migration
migrate()
  .then(() => {
    console.log("✅ Migration completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });
