import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, "..", ".env") });

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password:
    process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "",
  database: process.env.DB_NAME || "docterbee_units",
  port: parseInt(process.env.DB_PORT) || 3307,
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
    // Create users table (FIRST - other tables reference this)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL UNIQUE,
        card_type ENUM('Active-Worker', 'Family-Member', 'Healthy-Smart-Kids', 'Mums-Baby', 'New-Couple', 'Pregnant-Preparation', 'Senja-Ceria') DEFAULT 'Active-Worker',
        password VARCHAR(255) NOT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_phone (phone),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: users");

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
        speaker VARCHAR(255) DEFAULT NULL COMMENT 'Nama pemateri/host',
        registration_fee DECIMAL(10, 2) DEFAULT 0 COMMENT 'Biaya pendaftaran (0 = gratis)',
        registration_deadline DATE DEFAULT NULL COMMENT 'Tanggal akhir pendaftaran',
        location VARCHAR(500) DEFAULT NULL COMMENT 'Lokasi offline atau link Zoom',
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_date (event_date),
        INDEX idx_mode (mode),
        INDEX idx_topic (topic)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: events");

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

    // Create services table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        category ENUM('manual', 'klinis', 'konsultasi', 'perawatan') NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT NOT NULL,
        branch VARCHAR(255) NOT NULL COMMENT 'Comma-separated branches: Kolaka, Makassar, Kendari',
        mode ENUM('online', 'offline', 'both') NOT NULL DEFAULT 'both',
        practitioner VARCHAR(255) DEFAULT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_active (is_active),
        INDEX idx_mode (mode)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: services");

    // Create products table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        category ENUM('Zona Sunnah', '1001 Rempah', 'Zona Honey', 'Cold Pressed') NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT NOT NULL,
        image_url VARCHAR(500) DEFAULT NULL,
        stock INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_active (is_active),
        INDEX idx_stock (stock)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: products");

    // Create articles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        content LONGTEXT NOT NULL,
        excerpt TEXT,
        header_image VARCHAR(500) DEFAULT NULL,
        tags VARCHAR(500) DEFAULT NULL,
        category VARCHAR(100) DEFAULT NULL,
        author VARCHAR(100) DEFAULT 'Admin',
        article_type ENUM('general', 'product') NOT NULL DEFAULT 'general',
        product_id INT DEFAULT NULL,
        is_published TINYINT(1) DEFAULT 1,
        views INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_category (category),
        INDEX idx_published (is_published),
        INDEX idx_created (created_at),
        INDEX idx_article_type (article_type),
        INDEX idx_product_id (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: articles");

    // Create orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        user_id INT,
        customer_name VARCHAR(100),
        customer_phone VARCHAR(20),
        customer_address TEXT DEFAULT NULL,
        customer_email VARCHAR(100),
        order_type ENUM('dine_in', 'take_away') NOT NULL,
        store_location ENUM('kolaka', 'makassar', 'kendari') NOT NULL,
        items JSON NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        points_earned INT DEFAULT 0,
        status ENUM('pending', 'completed', 'expired', 'cancelled') DEFAULT 'pending',
        payment_status ENUM('pending', 'paid') DEFAULT 'pending',
        qr_code_data TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        coupon_code VARCHAR(50) DEFAULT NULL,
        coupon_discount DECIMAL(10, 2) DEFAULT 0,
        original_total DECIMAL(10, 2) DEFAULT NULL,
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_order_number (order_number),
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_payment_status (payment_status),
        INDEX idx_expires_at (expires_at),
        INDEX idx_created (created_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: orders");

    // Create user_progress table for Journey data sync
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

    // Create user_cart table for Store cart data sync
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

    // Create rewards table for managing available rewards
    await connection.query(`
      CREATE TABLE IF NOT EXISTS rewards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        points_cost INT NOT NULL,
        color_theme VARCHAR(50) DEFAULT 'amber' COMMENT 'UI color: amber, emerald, purple, sky, blue, rose',
        is_active TINYINT(1) DEFAULT 1,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_active (is_active),
        INDEX idx_sort_order (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: rewards");

    // Create reward_redemptions table for tracking reward history
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reward_redemptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        reward_id INT DEFAULT NULL,
        reward_name VARCHAR(255) NOT NULL,
        points_cost INT NOT NULL,
        redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_reward_id (reward_id),
        INDEX idx_redeemed_at (redeemed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: reward_redemptions");

    console.log("📦 All tables initialized successfully");
    
    // Run migrations for existing tables
    await runMigrations(connection);
  } catch (error) {
    console.error("❌ Error initializing tables:", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// Run migrations for existing tables (idempotent - safe to run multiple times)
async function runMigrations(connection) {
  console.log("🔄 Running migrations...");
  
  try {
    // Migration: Add article_type column to articles table
    await safeAddColumn(connection, 'articles', 'article_type', 
      "ENUM('general', 'product') NOT NULL DEFAULT 'general' AFTER category");
    
    // Migration: Add product_id column to articles table
    await safeAddColumn(connection, 'articles', 'product_id', 
      'INT DEFAULT NULL AFTER article_type');
    
    // Migration: Add tags column to articles table (if missing)
    await safeAddColumn(connection, 'articles', 'tags', 
      'VARCHAR(500) DEFAULT NULL AFTER header_image');
    
    // Migration: Add index for article_type
    await safeAddIndex(connection, 'articles', 'idx_article_type', 'article_type');
    
    // Migration: Add index for product_id
    await safeAddIndex(connection, 'articles', 'idx_product_id', 'product_id');
    
    // Migration: Add member_price to products table
    await safeAddColumn(connection, 'products', 'member_price', 
      'DECIMAL(10, 2) DEFAULT NULL AFTER price');
    
    // Migration: Add promo_text to products table  
    await safeAddColumn(connection, 'products', 'promo_text', 
      'VARCHAR(255) DEFAULT NULL AFTER member_price');
    
    // Migration: Add coupon columns to orders table
    await safeAddColumn(connection, 'orders', 'coupon_code', 
      'VARCHAR(50) DEFAULT NULL AFTER expires_at');
    
    await safeAddColumn(connection, 'orders', 'coupon_discount', 
      'DECIMAL(10, 2) DEFAULT 0 AFTER coupon_code');
    
    await safeAddColumn(connection, 'orders', 'original_total', 
      'DECIMAL(10, 2) DEFAULT NULL AFTER coupon_discount');
    
    // Migration: Add customer_address to orders table
    await safeAddColumn(connection, 'orders', 'customer_address', 
      'TEXT DEFAULT NULL AFTER customer_phone');
    
    // Migration: Add card_type to users table
    await safeAddColumn(connection, 'users', 'card_type', 
      "ENUM('Active-Worker', 'Family-Member', 'Healthy-Smart-Kids', 'Mums-Baby', 'New-Couple', 'Pregnant-Preparation', 'Senja-Ceria') DEFAULT 'Active-Worker' AFTER phone");
    
    console.log("✅ Migrations completed");
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    // Don't throw - migrations failing shouldn't stop the server
  }
}

// Helper: Safely add column if it doesn't exist
async function safeAddColumn(connection, table, column, definition) {
  try {
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column]
    );
    
    if (columns.length === 0) {
      await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      console.log(`  ✅ Added column: ${table}.${column}`);
    }
  } catch (error) {
    // Ignore if column already exists
    if (!error.message.includes('Duplicate column')) {
      console.error(`  ⚠️ Could not add column ${table}.${column}:`, error.message);
    }
  }
}

// Helper: Safely add index if it doesn't exist
async function safeAddIndex(connection, table, indexName, column) {
  try {
    const [indexes] = await connection.query(
      `SHOW INDEX FROM ${table} WHERE Key_name = ?`,
      [indexName]
    );
    
    if (indexes.length === 0) {
      await connection.query(`ALTER TABLE ${table} ADD INDEX ${indexName} (${column})`);
      console.log(`  ✅ Added index: ${table}.${indexName}`);
    }
  } catch (error) {
    // Ignore if index already exists
    if (!error.message.includes('Duplicate key name')) {
      console.error(`  ⚠️ Could not add index ${table}.${indexName}:`, error.message);
    }
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
