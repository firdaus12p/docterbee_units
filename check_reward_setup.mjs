import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'docterbee_units',
    port: parseInt(process.env.DB_PORT) || 3307
  });
  
  try {
    // Check rewards - only key fields
    const [rewards] = await c.query('SELECT id, name, reward_type, target_product_id FROM rewards');
    console.log('REWARDS (id, name, reward_type, target_product_id):');
    for (const r of rewards) {
      console.log(`  ${r.id}: "${r.name}" | type=${r.reward_type} | target=${r.target_product_id}`);
    }
    
    // Check Aurora Gold product ID
    const [prods] = await c.query("SELECT id, name FROM products WHERE name LIKE '%Aurora%' LIMIT 5");
    console.log('AURORA PRODUCTS:');
    for (const p of prods) {
      console.log(`  ${p.id}: "${p.name}"`);
    }
    
    // Check coupons with RWD prefix
    const [coups] = await c.query("SELECT code, discount_type, target_product_id FROM coupons WHERE code LIKE 'RWD%' LIMIT 5");
    console.log('REWARD COUPONS:');
    for (const cp of coups) {
      console.log(`  ${cp.code}: type=${cp.discount_type} | target=${cp.target_product_id}`);
    }
    
  } catch (e) { console.error(e.message); }
  finally { await c.end(); }
}
check();
