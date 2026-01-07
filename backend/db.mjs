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

    // AUTO-MIGRATION: Add Email Verification Columns if not exist
    try {
      // 1. Add Columns (using individual try-catches to be safe if some columns already exist)
      const usersColumns = [
        { name: "is_email_verified", type: "TINYINT(1) DEFAULT 0" },
        { name: "email_verification_token", type: "VARCHAR(255) DEFAULT NULL" },
        { name: "email_verification_expires", type: "DATETIME DEFAULT NULL" },
        { name: "pending_email", type: "VARCHAR(100) DEFAULT NULL" }
      ];

      for (const col of usersColumns) {
        try {
          await connection.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
          console.log(`  ➕ Migration: Added column ${col.name}`);
        } catch (e) {
          // Ignore "Duplicate column name" error (ER_DUP_COLUMN_NAME / 1060)
          if (e.errno !== 1060 && e.code !== 'ER_DUP_COLUMN_NAME') throw e;
        }
      }

      // 2. Add Reset Password Columns
      const resetCols = [
        { name: "reset_password_token", type: "VARCHAR(255) DEFAULT NULL" },
        { name: "reset_password_expires", type: "DATETIME DEFAULT NULL" }
      ];

      for (const col of resetCols) {
        try {
          await connection.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
          console.log(`  ➕ Migration: Added column ${col.name}`);
        } catch (e) {
          if (e.errno !== 1060 && e.code !== 'ER_DUP_COLUMN_NAME') throw e;
        }
      }

      // 3. Flag Migrated Emails
      await connection.query(`
        UPDATE users SET is_email_verified = 0 
        WHERE email LIKE '%@migrated.local' AND is_email_verified = 1
      `);
    } catch (err) {
      console.warn("  ⚠️ Auto-migration warning:", err.message);
    }

    // Create admins table for admin authentication
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL COMMENT 'bcrypt hashed password',
        email VARCHAR(100) DEFAULT NULL,
        role ENUM('super-admin', 'admin', 'moderator') DEFAULT 'admin',
        is_active TINYINT(1) DEFAULT 1,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_role (role),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: admins");

    // Create admin_login_history table for audit log
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_login_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        admin_id INT DEFAULT NULL COMMENT 'NULL for failed attempts when admin not found',
        username VARCHAR(50) NOT NULL,
        ip_address VARCHAR(45) DEFAULT NULL,
        user_agent TEXT DEFAULT NULL,
        login_status ENUM('success', 'failed') NOT NULL,
        login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL,
        INDEX idx_admin_id (admin_id),
        INDEX idx_login_at (login_at),
        INDEX idx_status (login_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: admin_login_history");

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
        coupon_type ENUM('store', 'services', 'both') DEFAULT 'both' COMMENT 'Where coupon can be used',
        is_active TINYINT(1) DEFAULT 1,
        expires_at DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_code (code),
        INDEX idx_active (is_active),
        INDEX idx_type (coupon_type)
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
        category ENUM('Zona Sunnah', '1001 Rempah', 'Zona Honey', 'Cold Pressed', 'Coffee', 'Tea', 'Jus') NOT NULL,
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
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT 'Approval status by admin',
        redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_reward_id (reward_id),
        INDEX idx_status (status),
        INDEX idx_redeemed_at (redeemed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: reward_redemptions");

    // Create podcasts table for media page podcast management
    await connection.query(`
      CREATE TABLE IF NOT EXISTS podcasts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        audio_url VARCHAR(500) NOT NULL,
        is_active TINYINT(1) DEFAULT 1,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_active (is_active),
        INDEX idx_sort_order (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: podcasts");

    // Create journeys table for dynamic journey management
    await connection.query(`
      CREATE TABLE IF NOT EXISTS journeys (
        id INT PRIMARY KEY AUTO_INCREMENT,
        slug VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        is_active TINYINT(1) DEFAULT 1,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_active (is_active),
        INDEX idx_sort_order (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: journeys");

    // Create journey_units table for units within a journey
    await connection.query(`
      CREATE TABLE IF NOT EXISTS journey_units (
        id INT PRIMARY KEY AUTO_INCREMENT,
        journey_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        color_class VARCHAR(100) DEFAULT 'text-amber-500',
        sort_order INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE,
        INDEX idx_journey (journey_id),
        INDEX idx_active (is_active),
        INDEX idx_sort_order (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: journey_units");

    // Create unit_items table for questions within a unit
    await connection.query(`
      CREATE TABLE IF NOT EXISTS unit_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        unit_id INT NOT NULL,
        item_key VARCHAR(100) NOT NULL,
        question TEXT NOT NULL,
        dalil TEXT NOT NULL,
        sains TEXT NOT NULL,
        nbsn TEXT NOT NULL,
        sort_order INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (unit_id) REFERENCES journey_units(id) ON DELETE CASCADE,
        INDEX idx_unit (unit_id),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: unit_items");

    // Create locations table for multi-location inventory management
    await connection.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        address TEXT DEFAULT NULL,
        type ENUM('store', 'warehouse') DEFAULT 'store',
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_active (is_active),
        INDEX idx_type (type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: locations");

    // Create product_stocks table for per-location inventory tracking
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_stocks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        location_id INT NOT NULL,
        quantity INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
        UNIQUE KEY unique_product_location (product_id, location_id),
        INDEX idx_product (product_id),
        INDEX idx_location (location_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: product_stocks");

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
    
    // Migration: Add coupon_type to coupons table (for existing tables that don't have it)
    await safeAddColumn(connection, 'coupons', 'coupon_type',
      "ENUM('store', 'services', 'both') DEFAULT 'both' COMMENT 'Where coupon can be used' AFTER used_count");
    
    // Migration: Add index for coupon_type
    await safeAddIndex(connection, 'coupons', 'idx_type', 'coupon_type');
    
    // Note: coupons table is already created in initializeTables()
    // The safeAddColumn above handles adding coupon_type to existing tables
    
    // Migration: Add order_type to coupon_usage table
    await safeAddColumn(connection, 'coupon_usage', 'order_type',
      "ENUM('store', 'services') DEFAULT 'store' COMMENT 'Type of order this coupon was used for' AFTER coupon_id");
    
    // Migration: Add order_id to coupon_usage table
    await safeAddColumn(connection, 'coupon_usage', 'order_id',
      "INT DEFAULT NULL COMMENT 'ID of the order/booking this coupon was used for' AFTER order_type");
    
    // Migration: Create coupon_usage table if not exists (for fresh installs)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS coupon_usage (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        coupon_id INT NOT NULL,
        order_type ENUM('store', 'services') DEFAULT 'store' COMMENT 'Type of order this coupon was used for',
        order_id INT DEFAULT NULL COMMENT 'ID of the order/booking this coupon was used for',
        used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_coupon_type (user_id, coupon_id, order_type),
        INDEX idx_user (user_id),
        INDEX idx_coupon (coupon_id),
        INDEX idx_order_type (order_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Migration: coupon_usage table");
    
    // Migration: Add Tea and Jus categories to products table (extends existing ENUM)
    await safeModifyEnum(connection, 'products', 'category',
      "ENUM('Zona Sunnah', '1001 Rempah', 'Zona Honey', 'Cold Pressed', 'Coffee', 'Tea', 'Jus') NOT NULL");
    
    // Migration: Add status column to reward_redemptions table (for existing tables)
    await safeAddColumn(connection, 'reward_redemptions', 'status',
      "ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT 'Approval status by admin' AFTER points_cost");
    
    // Migration: Add index for status column in reward_redemptions
    await safeAddIndex(connection, 'reward_redemptions', 'idx_status', 'status');
    
    // Migration: Seed default "Journey Hidup Sehat" data
    await seedDefaultJourney(connection);
    
    // Migration: Add deleted_at column to orders table for soft delete functionality
    // User's order history is preserved even when admin "deletes" an order
    await safeAddColumn(connection, 'orders', 'deleted_at',
      "DATETIME NULL DEFAULT NULL COMMENT 'Soft delete timestamp - NULL means not deleted'");
    
    // Migration: Add index for deleted_at column in orders (for faster filtering)
    await safeAddIndex(connection, 'orders', 'idx_orders_deleted_at', 'deleted_at');
    
    // Migration: Add index for email_verification_token (optimize /verify-email lookups)
    await safeAddIndex(connection, 'users', 'idx_email_verification_token', 'email_verification_token');
    
    // Migration: Add index for reset_password_token (optimize /reset-password lookups)
    await safeAddIndex(connection, 'users', 'idx_reset_password_token', 'reset_password_token');
    
    // ============================================
    // MULTI-LOCATION INVENTORY MIGRATIONS
    // ============================================
    
    // Migration: Add location_id to orders table (nullable for backward compatibility)
    await safeAddColumn(connection, 'orders', 'location_id',
      "INT DEFAULT NULL COMMENT 'FK to locations table - NULL for legacy orders' AFTER store_location");
    
    // Migration: Add index for location_id in orders
    await safeAddIndex(connection, 'orders', 'idx_orders_location_id', 'location_id');
    
    // Migration: Add location_id to reward_redemptions table
    await safeAddColumn(connection, 'reward_redemptions', 'location_id',
      "INT DEFAULT NULL COMMENT 'Location where redemption occurred' AFTER reward_id");
    
    // Migration: Add index for location_id in reward_redemptions
    await safeAddIndex(connection, 'reward_redemptions', 'idx_redemptions_location_id', 'location_id');
    
    // Migration: Seed initial locations based on existing store_location ENUM values
    await seedInitialLocations(connection);
    
    // Migration: Migrate existing products.stock to product_stocks table
    await migrateExistingStockToProductStocks(connection);
    
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

// Helper: Safely modify ENUM column to add new values
async function safeModifyEnum(connection, table, column, newDefinition) {
  try {
    await connection.query(`ALTER TABLE ${table} MODIFY COLUMN ${column} ${newDefinition}`);
    console.log(`  ✅ Modified enum: ${table}.${column}`);
  } catch (error) {
    // Ignore if the enum already has the values
    if (!error.message.includes('Duplicate')) {
      console.error(`  ⚠️ Could not modify enum ${table}.${column}:`, error.message);
    }
  }
}

// Helper: Seed default "Journey Hidup Sehat" data (idempotent)
async function seedDefaultJourney(connection) {
  try {
    // Check if default journey already exists
    const [existing] = await connection.query(
      "SELECT id FROM journeys WHERE slug = ?",
      ["hidup-sehat"]
    );
    
    if (existing.length > 0) {
      console.log("  ✅ Default journey already exists, skipping seed");
      return;
    }
    
    console.log("  🌱 Seeding default journey 'Hidup Sehat'...");
    
    // Insert journey
    const [journeyResult] = await connection.query(
      `INSERT INTO journeys (slug, name, description, is_active, sort_order)
       VALUES (?, ?, ?, 1, 0)`,
      ["hidup-sehat", "Journey Hidup Sehat – 6 Unit", "Qur'an–Sunnah × Sains × NBSN · Jawab pertanyaan harian, dapatkan feedback & skor."]
    );
    const journeyId = journeyResult.insertId;
    
    // Define units data
    const unitsData = [
      { title: "Unit 1 · 24 Jam Sehari", color: "text-amber-500", items: [
        { key: "subuh", q: "Sudah shalat Subuh tepat waktu & terkena cahaya fajar 5–10 menit?", dalil: "QS 7:205; adab Subuh", sains: "Cahaya fajar → sirkadian → dopamin/serotonin → semangat & fokus", nbsn: "Neuron: niat & syukur. Sensorik: cahaya pagi. Biomolekul: madu + air hangat. Nature: napas 2\"" },
        { key: "quranPagi", q: "Apakah membaca Al-Qur'an pagi ini?", dalil: "Keutamaan membaca Qur'an", sains: "Fokus & regulasi emosi meningkat", nbsn: "Neuron: fokus 5 menit" },
        { key: "zuhur", q: "Zuhur tepat waktu & istirahat 2–3 menit dari layar?", dalil: "QS 62:10 – seimbang kerja & ibadah", sains: "Microbreak mencegah decision fatigue", nbsn: "Sensorik: peregangan" },
        { key: "ashar", q: "Menjaga mata/gadget di waktu Ashar (tidak berlebihan)?", dalil: "Amanah menjaga tubuh", sains: "Paparan layar berlebih → kelelahan", nbsn: "Sensorik: 20–20–20" },
        { key: "maghrib", q: "Maghrib tepat waktu & menenangkan rumah?", dalil: "HR Bukhari – adab Maghrib", sains: "Ritme sosial & emosi stabil", nbsn: "Neuron: syukur sore" },
        { key: "isya", q: "Isya tepat waktu & tidur lebih awal?", dalil: "HR Muslim – tidur awal", sains: "Hormon pemulihan di malam", nbsn: "Nature: gelapkan kamar" }
      ]},
      { title: "Unit 2 · Bersosialisasi", color: "text-emerald-500", items: [
        { key: "senyum", q: "Hari ini memberi salam/senyum pada keluarga/teman?", dalil: "HR Tirmidzi – senyum sedekah", sains: "Oksitosin ↓ stres", nbsn: "Neuron: niat ihsan" },
        { key: "lidah", q: "Menghindari kata menyakitkan/ghibah?", dalil: "HR Bukhari – berkata baik/diam", sains: "Menghindari konflik → emosi stabil", nbsn: "Neuron: tafakur 1 menit" },
        { key: "doa", q: "Mendoakan orang lain diam-diam?", dalil: "Doa untuk saudara", sains: "Empati tingkatkan well-being", nbsn: "Nature: rasa syukur" }
      ]},
      { title: "Unit 3 · Mencari Rezeki", color: "text-sky-500", items: [
        { key: "niatKerja", q: "Berniat kerja untuk ridha Allah & amanah?", dalil: "QS 62:10 – bertebaran cari karunia", sains: "Niat → motivasi intrinsik", nbsn: "Neuron: tujuan kerja harian" },
        { key: "jujur", q: "Menjaga kejujuran & catatan transaksi?", dalil: "Amanah dagang", sains: "Kepercayaan sosial → produktivitas", nbsn: "Nature: disiplin waktu" },
        { key: "recharge", q: "Istirahat singkat + dzikir saat lelah?", dalil: "Dzikir menenangkan hati", sains: "Microrest pulihkan prefrontal", nbsn: "Sensorik: napas 2–3\"" }
      ]},
      { title: "Unit 4 · Makan & Minum", color: "text-fuchsia-500", items: [
        { key: "porsi", q: "Makan sebelum lapar, berhenti sebelum kenyang?", dalil: "HR Tirmidzi – sepertiga", sains: "Cegah lonjakan insulin", nbsn: "Biomolekul: porsi seimbang" },
        { key: "halal", q: "Memilih makanan halal-thayyib?", dalil: "QS 2:168", sains: "Higienitas & kualitas nutrisi", nbsn: "Nature: bahan segar lokal" },
        { key: "minumDuduk", q: "Minum sambil duduk & tidak terburu-buru?", dalil: "Adab minum", sains: "Hindari aspirasi/ketidaknyamanan", nbsn: "Sensorik: mindful sip" }
      ]},
      { title: "Unit 5 · Saat Sakit", color: "text-rose-500", items: [
        { key: "sabar", q: "Sabar & berobat dengan cara halal?", dalil: "QS 26:80 – Allah menyembuhkan", sains: "Stres rendah → imun meningkat", nbsn: "Nature: tidur & hidrasi" },
        { key: "doaSembuh", q: "Berdoa memohon kesembuhan?", dalil: "Doa Nabi – syifa", sains: "Relaksasi → pemulihan", nbsn: "Neuron: harapan positif" },
        { key: "madu", q: "Mengambil ikhtiar madu/kurma sesuai anjuran?", dalil: "QS 16:69 – syifa", sains: "Enzim & flavonoid", nbsn: "Biomolekul: dosis wajar" }
      ]},
      { title: "Unit 6 · Menjaga Pancaindra", color: "text-amber-500", items: [
        { key: "pandangan", q: "Menjaga pandangan dari yang haram?", dalil: "QS 24:30", sains: "Hindari dopamin instan", nbsn: "Neuron: kontrol diri" },
        { key: "pendengaran", q: "Memilih konten bermanfaat untuk didengar?", dalil: "Adab mendengar", sains: "Konten positif → fokus", nbsn: "Sensorik: kurasi audio" },
        { key: "ucapan", q: "Menjaga ucapan (baik/diam)?", dalil: "HR Bukhari", sains: "Hindari konflik", nbsn: "Neuron: jeda 3 detik" }
      ]}
    ];
    
    // Insert units and items
    for (let i = 0; i < unitsData.length; i++) {
      const unit = unitsData[i];
      const [unitResult] = await connection.query(
        `INSERT INTO journey_units (journey_id, title, color_class, sort_order, is_active)
         VALUES (?, ?, ?, ?, 1)`,
        [journeyId, unit.title, unit.color, i]
      );
      const unitId = unitResult.insertId;
      
      // Insert items for this unit
      for (let j = 0; j < unit.items.length; j++) {
        const item = unit.items[j];
        await connection.query(
          `INSERT INTO unit_items (unit_id, item_key, question, dalil, sains, nbsn, sort_order, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [unitId, item.key, item.q, item.dalil, item.sains, item.nbsn, j]
        );
      }
    }
    
    console.log("  ✅ Default journey 'Hidup Sehat' seeded with 6 units");
  } catch (error) {
    console.error("  ⚠️ Could not seed default journey:", error.message);
  }
}

// Helper: Seed initial locations (idempotent - based on existing store_location ENUM values)
async function seedInitialLocations(connection) {
  try {
    // Check if any locations already exist
    const [existing] = await connection.query("SELECT COUNT(*) as count FROM locations");
    
    if (existing[0].count > 0) {
      console.log("  ✅ Locations already exist, skipping seed");
      return;
    }
    
    console.log("  🌱 Seeding initial locations...");
    
    // Initial locations matching the existing store_location ENUM values
    const initialLocations = [
      { name: 'Kolaka', address: 'Kolaka, Sulawesi Tenggara', type: 'store' },
      { name: 'Makassar', address: 'Makassar, Sulawesi Selatan', type: 'store' },
      { name: 'Kendari', address: 'Kendari, Sulawesi Tenggara', type: 'store' }
    ];
    
    for (const loc of initialLocations) {
      await connection.query(
        `INSERT INTO locations (name, address, type, is_active) VALUES (?, ?, ?, 1)`,
        [loc.name, loc.address, loc.type]
      );
    }
    
    console.log(`  ✅ Seeded ${initialLocations.length} initial locations`);
  } catch (error) {
    console.error("  ⚠️ Could not seed initial locations:", error.message);
  }
}

// Helper: Migrate existing products.stock to product_stocks table
// This ensures backward compatibility - existing stock gets distributed to all locations
async function migrateExistingStockToProductStocks(connection) {
  try {
    // Check if product_stocks already has data (migration already done)
    const [existingStocks] = await connection.query("SELECT COUNT(*) as count FROM product_stocks");
    
    if (existingStocks[0].count > 0) {
      console.log("  ✅ product_stocks already has data, skipping migration");
      return;
    }
    
    // Get all products with stock > 0
    const [products] = await connection.query("SELECT id, name, stock FROM products WHERE is_active = 1");
    
    if (products.length === 0) {
      console.log("  ✅ No products to migrate");
      return;
    }
    
    // Get all active locations
    const [locations] = await connection.query("SELECT id, name FROM locations WHERE is_active = 1");
    
    if (locations.length === 0) {
      console.log("  ⚠️ No locations found, cannot migrate stock");
      return;
    }
    
    console.log(`  🌱 Migrating stock for ${products.length} products to ${locations.length} locations...`);
    
    let migratedCount = 0;
    
    for (const product of products) {
      for (const location of locations) {
        // Insert stock for each product at each location
        // Use the existing products.stock value as initial stock for ALL locations
        await connection.query(
          `INSERT INTO product_stocks (product_id, location_id, quantity) 
           VALUES (?, ?, ?) 
           ON DUPLICATE KEY UPDATE quantity = quantity`,
          [product.id, location.id, product.stock]
        );
        migratedCount++;
      }
    }
    
    console.log(`  ✅ Migrated stock: Created ${migratedCount} product_stocks records`);
    console.log(`     Note: Each product now has the same stock (${products[0]?.stock || 0}) at all ${locations.length} locations`);
    console.log(`     Adjust individual location stock via Admin Dashboard > Products Manager`);
  } catch (error) {
    console.error("  ⚠️ Could not migrate product stocks:", error.message);
  }
}

// Execute query helper
async function query(sql, params) {
  try {
    // Use pool.query() for all queries (more flexible with dynamic SQL)
    // Note: pool.execute() uses prepared statements which are strict about
    // parameter types and can fail with "Incorrect arguments to mysqld_stmt_execute"
    // when using dynamic SQL with variable number of parameters
    const [results] = await pool.query(sql, params);
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
