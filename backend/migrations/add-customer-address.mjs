// ============================================
// Migration: Add customer_address to orders table
// ============================================

import { query } from "../db.mjs";

async function addCustomerAddress() {
  try {
    console.log("🔄 Adding customer_address column to orders table...");

    // Check if column already exists
    const checkColumn = await query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'orders' 
       AND COLUMN_NAME = 'customer_address'`
    );

    if (checkColumn.length > 0) {
      console.log("✅ Column customer_address already exists");
      return;
    }

    // Add customer_address column after customer_phone
    await query(
      `ALTER TABLE orders 
       ADD COLUMN customer_address TEXT NULL 
       AFTER customer_phone`
    );

    console.log(
      "✅ Successfully added customer_address column to orders table"
    );
  } catch (error) {
    console.error("❌ Error adding customer_address column:", error);
    throw error;
  }
}

// Run migration
addCustomerAddress()
  .then(() => {
    console.log("✅ Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  });
