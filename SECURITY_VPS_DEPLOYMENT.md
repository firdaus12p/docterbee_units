# 🔐 Repository Security & VPS Deployment Guide

## ✅ **REPOSITORY AMAN - Sudah Dikonfigurasi**

Repository ini sudah dikonfigurasi dengan keamanan yang tepat untuk:

- ✅ Push ke GitHub (public/private)
- ✅ Clone di VPS production
- ✅ Proteksi credentials & API keys

---

## 📋 **File Yang Di-Ignore (Tidak Di-Push ke GitHub)**

### 1. **Environment Variables (CRITICAL)**

```
.env                    # API keys, database credentials
.env.*                  # Any .env variants
rules-for-ai.md         # Internal AI agent instructions
```

**Bahaya:** Mengandung Gemini API key, MySQL password, session secrets

### 2. **Documentation Folder (INTERNAL)**

```
docs/                   # Semua file dokumentasi internal
```

**Alasan:** Bisa mengandung API keys, credentials, atau info sensitif

### 3. **Troubleshooting Scripts (CREDENTIALS)**

```
troubleshoot-*.sh       # Shell scripts (kecuali *-safe.sh)
troubleshoot-*.bat      # Batch scripts (kecuali *-safe.bat)
debug-*.sh
debug-*.bat
```

**Bahaya:** Script lama mengandung hardcoded credentials

### 4. **Linting & Test Results (TEMPORARY)**

```
lint-output.txt
lint-result.txt
eslint-report.html
test-results/
```

**Alasan:** File temporary, setiap developer bisa generate sendiri

### 5. **Runtime Data (SERVER ONLY)**

```
uploads/                # User uploaded files
logs/                   # Application logs
*.log
```

**Alasan:** File spesifik server, ukuran besar

### 6. **Node Modules (DEPENDENCIES)**

```
node_modules/           # NPM packages
```

**Alasan:** Ukuran besar, bisa di-install via `npm install`

### 7. **IDE & Cache (LOCAL)**

```
.vscode/
.idea/
.npm
.eslintcache
```

**Alasan:** Konfigurasi editor lokal

---

## 🚀 **VPS Deployment - Step by Step**

### **1. Clone Repository di VPS**

```bash
# SSH ke VPS
ssh user@your-vps-ip

# Clone repository (akan otomatis ignore file-file di .gitignore)
git clone https://github.com/your-username/docterbee_units.git
cd docterbee_units

# Install dependencies
npm install
```

### **2. Setup Environment Variables**

```bash
# Copy template .env
cp .env.example .env

# Edit dengan credentials production
nano .env
```

**Isi .env di VPS:**

```env
# Gemini API (GENERATE BARU!)
GEMINI_API_KEY=your_new_production_api_key_here

# MySQL (VPS credentials)
DB_HOST=localhost
DB_USER=production_db_user
DB_PASSWORD=strong_password_here
DB_NAME=docterbee_units
DB_PORT=3306

# Session Secret (GENERATE RANDOM!)
SESSION_SECRET=production-secret-key-min-32-chars-random

# Admin Credentials (GANTI PASSWORD!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=strong_admin_password_here

# Server Config
PORT=3000
NODE_ENV=production
```

**🔑 PENTING: Generate session secret baru:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **3. Setup Database di VPS**

```bash
# Login ke MySQL
mysql -u root -p

# Create database
CREATE DATABASE docterbee_units;
CREATE USER 'production_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON docterbee_units.* TO 'production_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### **4. Start Application**

```bash
# Development mode (untuk testing)
npm start

# Production mode dengan PM2 (recommended)
npm install -g pm2
pm2 start backend/server.mjs --name docterbee
pm2 save
pm2 startup  # Enable auto-start on reboot
```

### **5. Verify Security**

```bash
# Check .env tidak ter-commit
git status .env
# Output: "nothing to commit" (file ignored)

# Check docs tidak ter-commit
git status docs/
# Output: "nothing to commit" (folder ignored)

# Test application
curl http://localhost:3000/health
```

---

## 🛡️ **Security Checklist**

### **Sebelum Push ke GitHub:**

- [ ] ✅ `.env` ada di `.gitignore`
- [ ] ✅ `docs/` ada di `.gitignore`
- [ ] ✅ Troubleshooting scripts dengan credentials di-ignore
- [ ] ✅ Lint results di-ignore
- [ ] ✅ `uploads/` di-ignore
- [ ] ✅ Tidak ada API key hardcoded di code
- [ ] ✅ Tidak ada password hardcoded di scripts

### **Di VPS Production:**

- [ ] ✅ `.env` file exists dengan credentials production
- [ ] ✅ Gemini API key baru (bukan yang sama dengan local)
- [ ] ✅ MySQL user production (bukan root)
- [ ] ✅ Session secret random 32+ characters
- [ ] ✅ Admin password strong & unique
- [ ] ✅ Firewall configured (port 3000 atau via reverse proxy)
- [ ] ✅ PM2 setup untuk auto-restart
- [ ] ✅ Nginx/Apache reverse proxy (optional tapi recommended)

---

## 🔧 **Troubleshooting di VPS (AMAN)**

Gunakan script SAFE yang tidak mengandung hardcoded credentials:

```bash
# Set credentials via environment (temporary)
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=your_actual_password

# Run safe script
bash troubleshoot-rewards-safe.sh

# Atau pass sebagai argument
bash troubleshoot-rewards-safe.sh admin your_password
```

**Windows (local development):**

```cmd
set ADMIN_USERNAME=admin
set ADMIN_PASSWORD=your_password
troubleshoot-rewards-safe.bat
```

---

## 📊 **File Structure (Git vs VPS)**

| File/Folder              | Git Tracked? | Di VPS?     | Notes                 |
| ------------------------ | ------------ | ----------- | --------------------- |
| `.env`                   | ❌ NO        | ✅ YES      | Manual setup di VPS   |
| `.env.example`           | ✅ YES       | ✅ YES      | Template only         |
| `docs/`                  | ❌ NO        | ⚠️ OPTIONAL | Keep local only       |
| `troubleshoot-*.sh`      | ❌ NO        | ✅ YES      | Create locally di VPS |
| `troubleshoot-*-safe.sh` | ✅ YES       | ✅ YES      | Safe to use           |
| `lint-output.txt`        | ❌ NO        | ❌ NO       | Temporary file        |
| `node_modules/`          | ❌ NO        | ✅ YES      | Via `npm install`     |
| `uploads/`               | ❌ NO        | ✅ YES      | Runtime data          |
| Backend code             | ✅ YES       | ✅ YES      | Application code      |
| Frontend code            | ✅ YES       | ✅ YES      | HTML/CSS/JS           |

---

## 🚨 **Emergency: If Credentials Leaked**

### **1. API Key Leaked:**

```bash
# Generate new API key
# → https://aistudio.google.com/app/apikey

# Update .env di local
code .env  # Paste new key

# Update .env di VPS
ssh user@vps
nano /path/to/docterbee_units/.env  # Paste new key

# Restart server
pm2 restart docterbee
```

### **2. Database Password Leaked:**

```bash
# Change MySQL password
mysql -u root -p
ALTER USER 'production_user'@'localhost' IDENTIFIED BY 'new_strong_password';
FLUSH PRIVILEGES;

# Update .env
nano .env  # Update DB_PASSWORD

# Restart app
pm2 restart docterbee
```

### **3. Session Secret Leaked:**

```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env
nano .env  # Update SESSION_SECRET

# Restart app (will logout all users)
pm2 restart docterbee
```

---

## 📚 **Resources**

- **PM2 Process Manager:** https://pm2.keymetrics.io/
- **Nginx Setup:** https://nginx.org/en/docs/
- **MySQL Security:** https://dev.mysql.com/doc/refman/8.0/en/security.html
- **Node.js Security Best Practices:** https://nodejs.org/en/docs/guides/security/

---

## ✅ **Verification Commands**

```bash
# Check what will be pushed to GitHub
git ls-files

# Check what's ignored
git status --ignored

# Verify .env is ignored
git check-ignore -v .env
# Output: .gitignore:4:.env    .env

# Verify docs is ignored
git check-ignore -v docs/
# Output: .gitignore:12:docs/    docs/

# Test credentials not in repository
git grep "docterbee2025"  # Should return: nothing
git grep "AIzaSy"          # Should return: nothing (or only in docs if not pushed)
```

---

**🎯 KESIMPULAN: Repository Anda AMAN untuk di-push ke GitHub dan di-clone di VPS!**

Semua credentials, API keys, dan file sensitif sudah ter-protect dengan `.gitignore`.
