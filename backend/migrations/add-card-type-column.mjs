import { query } from '../db.mjs';

/**
 * Migration: Add card_type column to users table
 * This allows users to have different membership card types
 */

async function addCardTypeColumn() {
  try {
    console.log('Starting migration: add card_type column to users table...');

    // Check if column already exists
    const checkColumn = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'card_type'
    `);

    if (checkColumn.length > 0) {
      console.log('✓ Column card_type already exists. Skipping migration.');
      return;
    }

    // Add card_type column
    await query(`
      ALTER TABLE users 
      ADD COLUMN card_type ENUM(
        'Active-Worker',
        'Family-Member', 
        'Healthy-Smart-Kids',
        'Mums-Baby',
        'New-Couple',
        'Pregnant-Preparation',
        'Senja-Ceria'
      ) DEFAULT 'Active-Worker' AFTER phone
    `);

    console.log('✓ Successfully added card_type column to users table');
    console.log('✓ Migration completed successfully');

  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    throw error;
  }
}

// Run migration
addCardTypeColumn()
  .then(() => {
    console.log('Migration script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
