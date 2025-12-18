import mysql from "mysql2/promise";
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

async function fixAdminTables() {
  let connection;
  
  try {
    console.log("🔧 Fixing admin tables...");
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to database");
    
    // Drop existing tables (in correct order due to foreign keys)
    console.log("🗑️  Dropping old tables...");
    await connection.query("DROP TABLE IF EXISTS admin_login_history");
    console.log("   ✅ Dropped admin_login_history");
    
    await connection.query("DROP TABLE IF EXISTS admins");
    console.log("   ✅ Dropped admins");
    
    console.log("\n✅ Tables dropped successfully!");
    console.log("📝 Next steps:");
    console.log("   1. Restart your server (npm run dev or pm2 restart)");
    console.log("   2. Tables will be auto-created with correct schema");
    console.log("   3. Run: node backend/scripts/create-default-admin.mjs");
    console.log("   4. Login with admin/docterbee2025");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
fixAdminTables()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
