# 🔐 API Key Security - Langkah Perbaikan

## 🚨 Masalah yang Ditemukan

API key Gemini Anda terdeteksi sebagai **"leaked"** oleh Google karena:

1. ❌ **API key lama** (`AIzaSy...[REDACTED]`) **hardcoded** di file dokumentasi
2. ❌ File dokumentasi (`docs/README-GEMINI-API.md` dan `docs/TROUBLESHOOTING.md`) **di-commit ke Git**
3. ❌ Meskipun di local/private repo, Google scanner **tetap mendeteksi** API key di Git history

## ✅ Yang Sudah Diperbaiki

1. ✅ API key di dokumentasi sudah diganti dengan placeholder `your_actual_gemini_api_key_here`
2. ✅ Backend **AMAN** - API key hanya di `.env` (sudah di-gitignore)
3. ✅ Frontend **AMAN** - Tidak ada API key di HTML/JavaScript files
4. ✅ Current API key (`AIzaSyCwVp...`) **TIDAK** ada di tracked files

## 🔧 Langkah Selanjutnya yang HARUS Dilakukan

### 1. Generate API Key Baru

**API key lama yang leaked HARUS diganti:**

```bash
# Buka Google AI Studio
https://aistudio.google.com/app/apikey

# Klik "Create API key in new project"
# Copy API key yang baru
```

⚠️ **PENTING:** Jangan gunakan API key yang sama lagi. Google sudah menandainya sebagai "leaked" dan akan terus block.

### 2. Update File .env dengan API Key Baru

```bash
# Edit .env (JANGAN commit file ini!)
GEMINI_API_KEY=API_KEY_BARU_ANDA_DISINI
```

**Format yang BENAR:**

```env
✅ GEMINI_API_KEY=AIzaSy...xyz     (NO SPACES!)
```

**Format yang SALAH:**

```env
❌ GEMINI_API_KEY = AIzaSy...xyz   (ada spasi)
❌ GEMINI_API_KEY= AIzaSy...xyz    (ada spasi)
```

### 3. Clean Up Git History (CRITICAL!)

Meskipun API key sudah dihapus dari file saat ini, **Git history masih menyimpannya**. Untuk benar-benar menghapus dari history:

#### Option A: Jika Belum Push ke Remote (GitHub/GitLab)

```powershell
# Cukup commit perubahan baru
git add docs/
git commit -m "docs: remove exposed API keys from documentation"
```

#### Option B: Jika Sudah Push ke Remote (CRITICAL!)

```powershell
# Install git-filter-repo (lebih aman dari git filter-branch)
# Via pip: pip install git-filter-repo

# Backup dulu
git clone c:\Projek\docterbee_units c:\Projek\docterbee_units_backup

# Hapus API key dari seluruh history
cd c:\Projek\docterbee_units
git filter-repo --invert-paths --path docs/README-GEMINI-API.md --path docs/TROUBLESHOOTING.md

# Atau gunakan BFG Repo-Cleaner (lebih mudah):
# Download: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files "README-GEMINI-API.md" --delete-files "TROUBLESHOOTING.md"
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push ke remote (WARNING: ini akan rewrite history!)
git push origin --force --all
```

⚠️ **WARNING:** Rewriting Git history adalah operasi berbahaya! Pastikan semua kolaborator tahu dan re-clone repository.

### 4. Restart Server

```powershell
# Stop server (Ctrl+C)
# Start ulang
npm start
```

### 5. Verifikasi API Key Baru

```powershell
# Test koneksi ke Gemini API
Invoke-WebRequest http://localhost:3000/api/verify-key | ConvertFrom-Json
```

**Expected output:**

```json
{
  "valid": true,
  "apiKeyLength": 39,
  "message": "✅ API key valid"
}
```

## 🛡️ Best Practices Security (IKUTI INI!)

### 1. ✅ NEVER Hardcode API Keys

**SALAH:**

```javascript
❌ const apiKey = "AIzaSy...xyz";  // Jangan di code!
❌ GEMINI_API_KEY=AIzaSy...xyz     // Jangan di docs!
```

**BENAR:**

```javascript
✅ const apiKey = process.env.GEMINI_API_KEY;  // Ambil dari .env
```

### 2. ✅ ALWAYS Use .env Files

```env
# .env (HARUS di .gitignore!)
GEMINI_API_KEY=your_actual_key_here
```

```gitignore
# .gitignore
.env
.env.*
!.env.example
```

### 3. ✅ Use Placeholders in Documentation

**SALAH:**

```markdown
❌ GEMINI_API_KEY=AIzaSyDWyrKdPiRMS-P4_Yq1M_otRue_P_kSuIk
```

**BENAR:**

```markdown
✅ GEMINI_API_KEY=your_actual_gemini_api_key_here
✅ GEMINI_API_KEY=paste_your_key_here
```

### 4. ✅ Backend Only

API key **HANYA** boleh di backend:

- ✅ `backend/server.mjs` (via `process.env`)
- ❌ HTML files
- ❌ Frontend JavaScript
- ❌ Documentation files

### 5. ✅ Monitor API Usage

```bash
# Check usage di Google AI Studio
https://aistudio.google.com/app/usage

# Set up quota limits
https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas
```

### 6. ✅ Rotate Keys Regularly

- Generate API key baru setiap 3-6 bulan
- Jika ada leak suspicion, ganti IMMEDIATELY

## 📋 Checklist Security

Sebelum deploy atau push code, pastikan:

- [ ] ✅ `.env` ada di `.gitignore`
- [ ] ✅ Tidak ada API key di HTML/JS frontend
- [ ] ✅ Tidak ada API key di documentation
- [ ] ✅ Tidak ada API key di commit messages
- [ ] ✅ File `.env.example` hanya berisi placeholder
- [ ] ✅ Backend menggunakan `process.env.GEMINI_API_KEY`
- [ ] ✅ API key valid (test via `/api/verify-key`)

## 🔍 Cara Cek API Key Leaked

```powershell
# Cek apakah API key ada di tracked files
git grep "AIzaSy"

# Cek di Git history
git log --all --source -S "AIzaSy"

# Jika ada hasil, berarti LEAKED!
```

## 🆘 Jika API Key Leaked Lagi

1. **STOP using** API key yang leaked
2. **Generate** API key baru di Google AI Studio
3. **Update** `.env` dengan key baru
4. **Clean** Git history (gunakan git-filter-repo atau BFG)
5. **Force push** ke remote (jika sudah push sebelumnya)
6. **Notify** team members untuk re-clone

## 📚 Resources

- Google AI Studio: https://aistudio.google.com/
- API Key Management: https://aistudio.google.com/app/apikey
- Git Filter-Repo: https://github.com/newren/git-filter-repo
- BFG Repo-Cleaner: https://rtyley.github.io/bfg-repo-cleaner/

---

## 🎯 Quick Action Summary

```powershell
# 1. Generate API key baru
# → https://aistudio.google.com/app/apikey

# 2. Update .env
code .env
# Paste key baru (NO SPACES!)

# 3. Commit perubahan docs
git add docs/
git commit -m "docs: remove exposed API keys"

# 4. Restart server
npm start

# 5. Test API key
Invoke-WebRequest http://localhost:3000/api/verify-key | ConvertFrom-Json

# 6. Deploy ke VPS dengan .env baru
scp .env user@vps:/path/to/app/
# Restart server di VPS
ssh user@vps "cd /path/to/app && npm restart"
```

**Selamat! Sekarang API key Anda AMAN! 🔒**
