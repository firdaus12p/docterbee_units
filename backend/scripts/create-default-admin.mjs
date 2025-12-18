import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "..", ".env") });

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "",
  database: process.env.DB_NAME || "docterbee_units",
  port: parseInt(process.env.DB_PORT) || 3307,
};

async function createDefaultAdmin() {
  let connection;
  
  try {
    console.log("🔐 Creating default admin account...");
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to database");
    
    // Get admin credentials from .env or use defaults
    const username = process.env.ADMIN_USERNAME || "admin";
    const plainPassword = process.env.ADMIN_PASSWORD || "docterbee2025";
    const email = process.env.ADMIN_EMAIL || "admin@docterbee.com";
    
    // Check if admin already exists
    const [existing] = await connection.query(
      "SELECT id FROM admins WHERE username = ?",
      [username]
    );
    
    if (existing.length > 0) {
      console.log(`⚠️  Admin '${username}' already exists. Skipping creation.`);
      console.log("   To reset password, delete the admin from database first.");
      return;
    }
    
    // Hash password with bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    // Insert admin
    await connection.query(
      `INSERT INTO admins (username, password, email, role, is_active) 
       VALUES (?, ?, ?, 'super-admin', 1)`,
      [username, hashedPassword, email]
    );
    
    console.log("✅ Default admin created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${plainPassword}`);
    console.log(`   Email:    ${email}`);
    console.log(`   Role:     super-admin`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️  IMPORTANT: Change the password after first login!");
    
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
createDefaultAdmin()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
