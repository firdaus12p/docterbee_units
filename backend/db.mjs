import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "docterbee_units",
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully");
    console.log(`📦 Database: ${dbConfig.database}`);
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
}

// Initialize database tables if not exists
async function initializeTables() {
  const connection = await pool.getConnection();

  try {
    // Create bookings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        service_name VARCHAR(255) NOT NULL,
        branch VARCHAR(100) NOT NULL,
        practitioner VARCHAR(255) NOT NULL,
        booking_date DATE NOT NULL,
        booking_time VARCHAR(20) NOT NULL,
        mode ENUM('online', 'offline') NOT NULL,
        price DECIMAL(10, 2) DEFAULT 0 COMMENT 'Harga asli service',
        customer_name VARCHAR(255) DEFAULT NULL,
        customer_phone VARCHAR(20) DEFAULT NULL,
        customer_age INT DEFAULT NULL,
        customer_gender ENUM('Laki-laki', 'Perempuan') DEFAULT NULL,
        customer_address TEXT DEFAULT NULL,
        promo_code VARCHAR(50) DEFAULT NULL,
        discount_amount DECIMAL(10, 2) DEFAULT 0 COMMENT 'Nilai diskon (Rp)',
        final_price DECIMAL(10, 2) DEFAULT 0 COMMENT 'Harga setelah diskon',
        status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_date (booking_date),
        INDEX idx_status (status),
        INDEX idx_branch (branch),
        INDEX idx_customer_phone (customer_phone)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: bookings");

    // Check and add customer columns if not exist
    try {
      const [columns] = await connection.query(
        "SHOW COLUMNS FROM bookings LIKE 'customer_name'"
      );

      if (columns.length === 0) {
        console.log("⚙️  Adding customer columns to bookings table...");

        await connection.query(`
          ALTER TABLE bookings
          ADD COLUMN customer_name VARCHAR(255) DEFAULT NULL AFTER mode,
          ADD COLUMN customer_phone VARCHAR(20) DEFAULT NULL AFTER customer_name,
          ADD COLUMN customer_age INT DEFAULT NULL AFTER customer_phone,
          ADD COLUMN customer_gender ENUM('Laki-laki', 'Perempuan') DEFAULT NULL AFTER customer_age,
          ADD COLUMN customer_address TEXT DEFAULT NULL AFTER customer_gender,
          ADD INDEX idx_customer_phone (customer_phone)
        `);

        console.log("✅ Customer columns added successfully");
      }
    } catch (alterError) {
      // If ALTER fails, it might be because columns already exist or other issues
      console.log("ℹ️  Customer columns check:", alterError.message);
    }

    // Check and add price columns if not exist
    try {
      const [priceCol] = await connection.query(
        "SHOW COLUMNS FROM bookings LIKE 'price'"
      );

      if (priceCol.length === 0) {
        console.log("⚙️  Adding price columns to bookings table...");

        await connection.query(`
          ALTER TABLE bookings
          ADD COLUMN price DECIMAL(10, 2) DEFAULT 0 COMMENT 'Harga asli service' AFTER mode,
          ADD COLUMN final_price DECIMAL(10, 2) DEFAULT 0 COMMENT 'Harga setelah diskon' AFTER discount_amount
        `);

        console.log("✅ Price columns added successfully");
      }
    } catch (priceError) {
      console.log("ℹ️  Price columns check:", priceError.message);
    }

    // Create events table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        event_date DATE NOT NULL,
        mode ENUM('online', 'offline') NOT NULL,
        topic VARCHAR(100) NOT NULL,
        description TEXT,
        link VARCHAR(500),
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_date (event_date),
        INDEX idx_mode (mode),
        INDEX idx_topic (topic)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: events");

    // Create articles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        tags VARCHAR(500),
        is_published TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_published (is_published)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: articles");

    // Create coupons table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INT PRIMARY KEY AUTO_INCREMENT,
        code VARCHAR(50) UNIQUE NOT NULL,
        description VARCHAR(255),
        discount_type ENUM('percentage', 'fixed') NOT NULL,
        discount_value DECIMAL(10, 2) NOT NULL,
        min_booking_value DECIMAL(10, 2) DEFAULT 0,
        max_uses INT DEFAULT NULL,
        used_count INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        expires_at DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_code (code),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: coupons");

    console.log("📦 All tables initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing tables:", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// Execute query helper
async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error("❌ Query error:", error.message);
    throw error;
  }
}

// Get single row
async function queryOne(sql, params) {
  const results = await query(sql, params);
  return results[0] || null;
}

export { pool, query, queryOne, testConnection, initializeTables };
