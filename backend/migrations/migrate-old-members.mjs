/**
 * Migration Script: Migrate Old Members Data to Current Users Table
 * 
 * This script reads the old SQL dump file and migrates member data to the current users table.
 * 
 * Usage: node backend/migrations/migrate-old-members.mjs
 * 
 * Features:
 * - Parses INSERT statements from old SQL dump
 * - Transforms card type format (snake_case → Kebab-Case)
 * - Skips duplicate phone numbers
 * - Uses default password for all migrated users
 * - Preserves original created_at timestamps
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { pool, testConnection } from '../db.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DEFAULT_PASSWORD = 'minumansehat2026';
const SQL_FILE_PATH = path.join(__dirname, '..', '..', 'u508442634_data_pelanggan.sql');

// Card type mapping: old format → new format
const CARD_TYPE_MAPPING = {
  'active_worker': 'Active-Worker',
  'family_member': 'Family-Member',
  'healthy_smart_kids': 'Healthy-Smart-Kids',
  'mums_baby': 'Mums-Baby',
  'new_couple': 'New-Couple',
  'pregnant_preparation': 'Pregnant-Preparation',
  'senja_ceria': 'Senja-Ceria'
};

/**
 * Transform card type from old format to new format
 */
function transformCardType(oldCardType) {
  return CARD_TYPE_MAPPING[oldCardType] || 'Active-Worker';
}

/**
 * Parse member data from a single row string
 * Format: (id,'nama','whatsapp','email','alamat',umur,'kegiatan','jenis_kartu','kode_unik','tanggal_berlaku',jumlah_pembelian,'created_at','updated_at')
 */
function parseMemberRow(rowStr) {
  const values = [];
  let current = '';
  let inQuote = false;
  let i = 0;
  
  // Skip opening parenthesis
  if (rowStr.startsWith('(')) {
    i = 1;
  }
  
  while (i < rowStr.length) {
    const char = rowStr[i];
    
    if (char === "'" && !inQuote) {
      inQuote = true;
      i++;
      continue;
    }
    
    if (char === "'" && inQuote) {
      // Check for escaped quote ('')
      if (i + 1 < rowStr.length && rowStr[i + 1] === "'") {
        current += "'";
        i += 2;
        continue;
      }
      inQuote = false;
      values.push(current);
      current = '';
      i++;
      continue;
    }
    
    if (char === ',' && !inQuote) {
      if (current.trim() !== '') {
        values.push(current.trim());
      }
      current = '';
      i++;
      continue;
    }
    
    if (char === ')' && !inQuote) {
      if (current.trim() !== '') {
        values.push(current.trim());
      }
      break;
    }
    
    current += char;
    i++;
  }
  
  // Expected: id, nama, whatsapp, email, alamat, umur, kegiatan, jenis_kartu, kode_unik, tanggal_berlaku, jumlah_pembelian, created_at, updated_at
  // Indices:  0   1     2         3      4       5     6         7            8          9                 10                11          12
  if (values.length < 12) {
    return null;
  }
  
  return {
    id: parseInt(values[0]),
    nama: values[1],
    whatsapp: values[2],
    email: values[3],
    jenis_kartu: values[7],
    created_at: values[11]
  };
}

/**
 * Extract all member records from SQL file using improved parsing
 */
function extractMembersFromSQL(sqlContent) {
  const members = [];
  
  // Find the INSERT INTO members VALUES section - everything between VALUES and the ending semicolon
  const startMarker = "INSERT INTO `members` VALUES";
  const endMarker = "/*!40000 ALTER TABLE `members` ENABLE KEYS";
  
  const startIdx = sqlContent.indexOf(startMarker);
  if (startIdx === -1) {
    console.error('❌ Could not find INSERT INTO members VALUES section');
    return members;
  }
  
  const endIdx = sqlContent.indexOf(endMarker, startIdx);
  if (endIdx === -1) {
    console.error('❌ Could not find end marker for members INSERT');
    return members;
  }
  
  // Extract just the VALUES portion
  let insertSection = sqlContent.substring(startIdx + startMarker.length, endIdx);
  
  // Clean up: remove leading newlines and the final semicolon
  insertSection = insertSection.trim();
  if (insertSection.endsWith(';')) {
    insertSection = insertSection.slice(0, -1);
  }
  
  // Split by rows - each row starts with \n( and ends with ),
  // Use regex to find all complete row entries
  const rowRegex = /\((\d+),'([^']*(?:''[^']*)*)','([^']*(?:''[^']*)*)','([^']*(?:''[^']*)*)','([^']*(?:''[^']*)*)','?(\d+)'?,'([^']*(?:''[^']*)*)','([^']*(?:''[^']*)*)','([^']*(?:''[^']*)*)','([^']*(?:''[^']*)*)','?(\d+)'?,'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})','(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})'\)/g;
  
  let match;
  while ((match = rowRegex.exec(insertSection)) !== null) {
    const member = {
      id: parseInt(match[1]),
      nama: match[2].replace(/''/g, "'"),
      whatsapp: match[3].replace(/''/g, "'"),
      email: match[4].replace(/''/g, "'"),
      jenis_kartu: match[8].replace(/''/g, "'"),
      created_at: match[12]
    };
    
    if (member.nama && member.whatsapp) {
      members.push(member);
    }
  }
  
  // If regex didn't work well, fall back to line-by-line parsing
  if (members.length === 0) {
    console.log('   Regex parsing failed, trying line-by-line approach...');
    const lines = insertSection.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('--') || !trimmed.startsWith('(')) {
        continue;
      }
      
      // Remove trailing comma if present
      const cleanLine = trimmed.endsWith(',') ? trimmed.slice(0, -1) : trimmed;
      const member = parseMemberRow(cleanLine);
      
      if (member && member.nama && member.whatsapp) {
        members.push(member);
      }
    }
  }
  
  return members;
}

/**
 * Check if phone already exists in users table
 */
async function phoneExists(phone) {
  const [rows] = await pool.execute(
    'SELECT id FROM users WHERE phone = ?',
    [phone]
  );
  return rows.length > 0;
}

/**
 * Insert member into users table
 */
async function insertUser(member, passwordHash) {
  const cardType = transformCardType(member.jenis_kartu);
  const email = member.email && member.email.trim() !== '' 
    ? member.email 
    : `${member.whatsapp}@migrated.local`;
  
  await pool.execute(
    `INSERT INTO users (name, email, phone, card_type, password, is_active, created_at) 
     VALUES (?, ?, ?, ?, ?, 1, ?)`,
    [member.nama, email, member.whatsapp, cardType, passwordHash, member.created_at]
  );
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Migration: Old Members → Current Users Table');
  console.log('═══════════════════════════════════════════════════════════');
  console.log();
  
  // Test database connection
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Cannot connect to database. Aborting migration.');
    process.exit(1);
  }
  
  // Read SQL file
  console.log(`📄 Reading SQL file: ${SQL_FILE_PATH}`);
  if (!fs.existsSync(SQL_FILE_PATH)) {
    console.error(`❌ SQL file not found: ${SQL_FILE_PATH}`);
    process.exit(1);
  }
  
  const sqlContent = fs.readFileSync(SQL_FILE_PATH, 'utf8');
  console.log(`   File size: ${(sqlContent.length / 1024).toFixed(2)} KB`);
  console.log();
  
  // Extract members
  console.log('🔍 Extracting member records from SQL...');
  const members = extractMembersFromSQL(sqlContent);
  console.log(`   Found ${members.length} member records`);
  console.log();
  
  if (members.length === 0) {
    console.log('⚠️  No members found to migrate. Check SQL file format.');
    process.exit(0);
  }
  
  // Hash default password
  console.log('🔐 Generating password hash...');
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  console.log('   Password hash generated');
  console.log();
  
  // Statistics
  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  const skippedPhones = [];
  const errorDetails = [];
  
  // Process each member
  console.log('📥 Migrating members to users table...');
  console.log();
  
  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    const progress = `[${(i + 1).toString().padStart(3)}/${members.length}]`;
    
    try {
      // Check for duplicate phone
      const exists = await phoneExists(member.whatsapp);
      
      if (exists) {
        skipped++;
        skippedPhones.push(member.whatsapp);
        console.log(`${progress} ⏭️  Skipped (duplicate): ${member.nama} (${member.whatsapp})`);
        continue;
      }
      
      // Insert user
      await insertUser(member, passwordHash);
      inserted++;
      
      if (inserted % 50 === 0 || i === members.length - 1) {
        console.log(`${progress} ✅ Inserted: ${member.nama} (${transformCardType(member.jenis_kartu)})`);
      }
    } catch (error) {
      errors++;
      errorDetails.push({ member: member.nama, phone: member.whatsapp, error: error.message });
      console.log(`${progress} ❌ Error: ${member.nama} - ${error.message}`);
    }
  }
  
  // Print summary
  console.log();
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Migration Summary');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Total records:     ${members.length}`);
  console.log(`  ✅ Inserted:       ${inserted}`);
  console.log(`  ⏭️  Skipped:        ${skipped} (duplicate phones)`);
  console.log(`  ❌ Errors:         ${errors}`);
  console.log('═══════════════════════════════════════════════════════════');
  
  if (skippedPhones.length > 0 && skippedPhones.length <= 20) {
    console.log();
    console.log('Skipped phone numbers:');
    skippedPhones.forEach(phone => console.log(`  - ${phone}`));
  }
  
  if (errorDetails.length > 0) {
    console.log();
    console.log('Error details:');
    errorDetails.forEach(e => console.log(`  - ${e.member} (${e.phone}): ${e.error}`));
  }
  
  console.log();
  console.log('✅ Migration completed!');
  console.log(`   Default password for migrated users: ${DEFAULT_PASSWORD}`);
  
  // Cleanup
  await pool.end();
  process.exit(0);
}

// Run migration
migrate().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
