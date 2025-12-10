// ============================================
// ADD header_image column to articles table
// ============================================

import { pool } from './backend/db.mjs';

async function addHeaderImageColumn() {
  const connection = await pool.getConnection();

  try {
    console.log('🔧 Checking articles table...');

    // Check if 'header_image' column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'articles' 
        AND COLUMN_NAME = 'header_image'
    `);

    if (columns.length > 0) {
      console.log('✅ Column "header_image" already exists. No fix needed.');
      return;
    }

    console.log('⚠️  Column "header_image" is missing. Adding it now...');

    // Add 'header_image' column
    await connection.query(`
      ALTER TABLE articles 
      ADD COLUMN header_image VARCHAR(500) DEFAULT NULL AFTER excerpt
    `);

    console.log('✅ Column "header_image" added successfully!');
    console.log('📊 Table structure updated.');

  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('⚠️  Table "articles" does not exist.');
      console.log('💡 Solution: Restart server to create tables automatically.');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    connection.release();
    process.exit(0);
  }
}

addHeaderImageColumn();
