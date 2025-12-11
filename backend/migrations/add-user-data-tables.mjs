import { pool } from "../db.mjs";

async function addUserDataTables() {
  const connection = await pool.getConnection();

  try {
    console.log("🔧 Adding user data tables...");

    // Create user_progress table for Journey data
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        unit_data JSON NOT NULL,
        points INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: user_progress");

    // Create user_cart table for Store cart data
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        cart_data JSON NOT NULL,
        last_qr_code TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_cart (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: user_cart");

    console.log("✅ User data tables created successfully");
  } catch (error) {
    console.error("❌ Error creating user data tables:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run migration if called directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  addUserDataTables()
    .then(() => {
      console.log("✅ Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Migration failed:", error);
      process.exit(1);
    });
}

export default addUserDataTables;
