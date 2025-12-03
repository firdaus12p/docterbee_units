# 🔧 Troubleshooting Guide - Gemini API Integration

## ❌ Masalah: "Semua Model Tidak Tersedia" (Error 404)

### Gejala:

- Console: `❌ Not Available` untuk semua model
- Browser: Error 153 saat load video
- Test endpoint: `workingCount: 0`

### Penyebab Utama:

#### 1. **API Key Expired atau Invalid** ⚠️

API key dari Google AI Studio memiliki masa berlaku dan bisa expired.

**Solusi:**

```bash
# Step 1: Buka Google AI Studio
https://aistudio.google.com/app/apikey

# Step 2: Generate API key BARU
Klik "Create API key" → Pilih project → Copy key

# Step 3: Update file .env
GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
PORT=3000

# Step 4: Restart server
npm start
```

#### 2. **API Key Tidak Memiliki Akses ke Model** 🔐

Beberapa model butuh akses khusus atau billing enabled.

**Cek Akses API Key:**

```powershell
# Test 1: Verify API key
Invoke-WebRequest http://localhost:3000/api/verify-key | ConvertFrom-Json

# Output yang diharapkan:
# {
#   "valid": true,
#   "totalModels": 10,
#   "availableModels": ["models/gemini-pro", "models/gemini-1.5-flash", ...]
# }
```

**Jika `valid: false`:**

- API key salah atau expired
- Generate key baru di AI Studio

#### 3. **Whitespace di .env File** 🚫

Spasi di sekitar `=` bisa menyebabkan masalah.

**.env yang SALAH:**

```env
❌ GEMINI_API_KEY = AIzaSy...    (ada spasi)
❌ GEMINI_API_KEY= AIzaSy...     (ada spasi setelah key)
❌ GEMINI_API_KEY =AIzaSy...     (ada spasi sebelum value)
```

**.env yang BENAR:**

```env
✅ GEMINI_API_KEY=AIzaSyDWyrKdPiRMS-P4_Yq1M_otRue_P_kSuIk
✅ PORT=3000
```

#### 4. **Package Version Mismatch** 📦

SDK versi lama mungkin tidak support model baru.

**Update Dependencies:**

```powershell
# Remove old packages
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Install fresh
npm install

# Atau update specific package
npm install @google/generative-ai@latest
```

#### 5. **Region Lock atau Firewall** 🌍

Google AI API mungkin di-block di region tertentu.

**Test Koneksi:**

```powershell
# Test direct API access
$apiKey = "YOUR_API_KEY"
$url = "https://generativelanguage.googleapis.com/v1beta/models?key=$apiKey"
Invoke-WebRequest $url
```

**Jika timeout/error:**

- Gunakan VPN
- Cek firewall perusahaan
- Test dari jaringan lain

---

## 🧪 Diagnostic Commands

### 1. **Verify API Key**

```powershell
Invoke-WebRequest http://localhost:3000/api/verify-key | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

**Expected Output (Success):**

```json
{
  "valid": true,
  "apiKeyLength": 39,
  "apiKeyPrefix": "AIzaSyDWyrKdPi...",
  "totalModels": 10,
  "availableModels": [
    "models/gemini-pro",
    "models/gemini-1.5-flash",
    "models/gemini-1.5-pro"
  ],
  "message": "✅ API key valid dan memiliki akses ke 10 model"
}
```

**Expected Output (Failed):**

```json
{
  "valid": false,
  "error": "API_KEY_INVALID",
  "suggestion": "Generate API key baru di https://aistudio.google.com/app/apikey"
}
```

### 2. **Test All Models**

```powershell
Invoke-WebRequest http://localhost:3000/api/test-models | ConvertFrom-Json
```

**Success:** `workingCount: 1` atau lebih  
**Failed:** `workingCount: 0`

### 3. **Check Server Logs**

Server akan menampilkan info saat startup:

```
🚀 Docterbee Media AI Server
📡 Server berjalan di http://localhost:3000
🔑 API Key (first 10 chars): AIzaSyDWyr...
🔑 API Key length: 39
⏳ Menunggu request...
```

Jika API key length ≠ 39, ada masalah di .env file.

---

## 📋 Step-by-Step Fix

### **SOLUSI LENGKAP:**

```powershell
# 1. Stop server (Ctrl+C di terminal)

# 2. Generate API key BARU
# Buka: https://aistudio.google.com/app/apikey
# Klik: "Create API key in new project"
# Copy key yang baru

# 3. Update .env (HAPUS spasi!)
# Edit file .env:
GEMINI_API_KEY=PASTE_KEY_BARU_DISINI
PORT=3000

# 4. Clear dan reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install

# 5. Start server
npm start

# 6. Verify API key
Invoke-WebRequest http://localhost:3000/api/verify-key | ConvertFrom-Json

# 7. Test models
Invoke-WebRequest http://localhost:3000/api/test-models | ConvertFrom-Json

# 8. Jika workingCount > 0, test di browser
# Buka media.html dan coba analisis
```

---

## ⚡ Quick Fixes

### **Fix 1: Reset API Key**

```powershell
# Generate baru di AI Studio dan update .env
code .env
# Paste key baru (NO SPACES!)
# Restart: npm start
```

### **Fix 2: Check .env Format**

```powershell
# Lihat isi .env
Get-Content .env

# Pastikan TIDAK ada spasi:
# ✅ GEMINI_API_KEY=AIzaSy...
# ❌ GEMINI_API_KEY = AIzaSy...
```

### **Fix 3: Test Manual**

```powershell
# Test langsung ke Google API
$key = "YOUR_KEY_HERE"
Invoke-WebRequest "https://generativelanguage.googleapis.com/v1beta/models?key=$key"
```

---

## 🎯 Expected Behavior

### **Startup (Correct):**

```
🚀 Docterbee Media AI Server
📡 Server berjalan di http://localhost:3000
🔑 API Key (first 10 chars): AIzaSyDWyr...
🔑 API Key length: 39
✅ API key configured
⏳ Menunggu request...
```

### **Startup (Wrong):**

```
❌ GEMINI_API_KEY tidak ditemukan di .env file!
```

### **Model Test (Success):**

```json
{
  "workingCount": 3,
  "recommendedModel": "gemini-1.5-flash-8b",
  "message": "✅ 3 model tersedia"
}
```

### **Model Test (Failed):**

```json
{
  "workingCount": 0,
  "recommendedModel": "❌ None available",
  "message": "❌ Tidak ada model tersedia. Periksa API key di https://aistudio.google.com/"
}
```

---

## 🔗 Useful Links

- **Google AI Studio**: https://aistudio.google.com/
- **API Key Management**: https://aistudio.google.com/app/apikey
- **Usage Dashboard**: https://aistudio.google.com/app/usage
- **Model Documentation**: https://ai.google.dev/gemini-api/docs/models

---

## 💡 Prevention Tips

1. ✅ **Selalu test API key** setelah generate baru
2. ✅ **Backup API key** di tempat aman (password manager)
3. ✅ **Monitor usage** di AI Studio dashboard
4. ✅ **Check .env format** (no spaces!)
5. ✅ **Update SDK** secara berkala: `npm update`

---

## 🆘 Still Not Working?

Jika sudah coba semua solusi di atas:

1. **Check Google AI Studio Dashboard**

   - Apakah project masih aktif?
   - Apakah ada quota remaining?
   - Apakah API key belum di-delete?

2. **Generate Key di Project BARU**

   - Buat project baru di Google Cloud
   - Generate API key di project tersebut
   - Update .env dengan key baru

3. **Test dari Device Lain**

   - Kemungkinan ada network/firewall issue
   - Test dari laptop/PC lain
   - Atau gunakan hotspot mobile

4. **Check Package Versions**
   ```powershell
   npm list @google/generative-ai
   # Harus: ^0.21.0 atau lebih baru
   ```

---

**Last Updated**: December 2, 2025  
**Version**: 1.1.0
