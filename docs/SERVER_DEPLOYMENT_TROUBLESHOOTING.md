# Server Deployment Troubleshooting - Rewards Manager

## Masalah: Unauthorized di Production Server

Jika Rewards Manager bekerja di local tapi tidak di server (muncul "Unauthorized - Admin login required"), ikuti langkah-langkah berikut:

## ✅ Solusi yang Sudah Diterapkan

### 1. Session Cookie Configuration

File: `backend/server.mjs`

**Perubahan:**

```javascript
// SEBELUM (strict settings):
cookie: {
  secure: isProduction,           // HTTPS only in production
  sameSite: isProduction ? "strict" : "lax",
}

// SESUDAH (compatible settings):
cookie: {
  secure: false,                  // Compatible dengan HTTP & HTTPS
  sameSite: "lax",                // Lebih permissive
}
```

**Alasan:**

- `secure: true` memerlukan HTTPS. Jika server tidak menggunakan HTTPS, cookie tidak akan dikirim
- `sameSite: "strict"` terlalu ketat untuk cross-origin requests

### 2. Debug Logging

File: `backend/routes/rewards.mjs`

**Ditambahkan:**

```javascript
console.log("🔐 Session check:", {
  sessionExists: !!req.session,
  isAdmin: req.session?.isAdmin,
  sessionID: req.sessionID,
});
```

**Fungsi:**

- Memudahkan troubleshooting di server
- Log akan terlihat di server console/logs

## 🔍 Debugging Steps

### Step 1: Restart Server

Setelah update, restart Node.js server:

```bash
# Development
npm run dev

# Production
pm2 restart docterbee
# atau
node backend/server.mjs
```

### Step 2: Clear Browser Data

Di browser, clear:

- Cookies
- Session Storage
- Local Storage

Atau gunakan Incognito/Private mode untuk testing fresh.

### Step 3: Login Ulang ke Admin

1. Buka `https://your-domain.com/admin-dashboard.html`
2. Login dengan:
   - Username: `admin`
   - Password: `docterbee2025` (atau sesuai env)
3. Check browser console untuk error

### Step 4: Test Rewards Manager

1. Klik tab "Rewards Manager"
2. Coba buat reward baru
3. Check server logs untuk output:
   - ✅ `Admin access granted` → Berhasil
   - ❌ `Unauthorized access attempt` → Masih ada masalah

## 🔧 Troubleshooting Lanjutan

### A. Check Environment Variables

Pastikan di server `.env` file sudah benar:

```env
# Session secret (harus sama antara restart)
SESSION_SECRET=your-secret-key-here

# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=docterbee2025

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=docterbee_units
DB_PORT=3307
```

**Penting:**

- `SESSION_SECRET` harus konsisten (tidak berubah setiap restart)
- Jika menggunakan load balancer, semua instance harus punya secret yang sama

### B. Check Server Logs

Saat login admin, harus terlihat:

```
POST /api/admin/login 200
Session created: { isAdmin: true, adminUsername: 'admin' }
```

Saat akses Rewards Manager, harus terlihat:

```
🔐 Session check: { sessionExists: true, isAdmin: true, sessionID: '...' }
✅ Admin access granted
GET /api/rewards/admin/all 200
```

### C. Jika Masih Unauthorized

**Check 1: Session Store**
Server mungkin kehilangan session. Solusi:

- Install session store persistent (Redis/MongoDB)
- Untuk sementara, gunakan memory store (default)

**Check 2: CORS Headers**
Pastikan domain frontend diizinkan di `server.mjs`:

```javascript
const allowedOrigins = [
  "https://your-domain.com",
  "https://www.your-domain.com",
  "http://localhost:3000",
];
```

**Check 3: Reverse Proxy**
Jika menggunakan Nginx/Apache, pastikan proxy_pass meneruskan cookies:

**Nginx:**

```nginx
location /api {
    proxy_pass http://localhost:3000;
    proxy_set_header Cookie $http_cookie;
    proxy_pass_header Set-Cookie;
}
```

**Apache:**

```apache
ProxyPass /api http://localhost:3000/api
ProxyPassReverse /api http://localhost:3000/api
ProxyPreserveHost On
```

### D. Alternative: Gunakan Environment Check

Jika masih tidak berhasil, bisa gunakan simple token check sebagai workaround:

```javascript
// Di rewards.mjs, tambahkan alternative auth:
function requireAdmin(req, res, next) {
  // Check session
  if (req.session?.isAdmin) {
    return next();
  }

  // Alternative: Check admin token dari header (untuk server)
  const adminToken = req.headers["x-admin-token"];
  if (adminToken === process.env.ADMIN_TOKEN) {
    return next();
  }

  return res.status(401).json({
    success: false,
    error: "Unauthorized - Admin login required",
  });
}
```

Lalu set di admin-dashboard.js:

```javascript
// Tambahkan token di header request
const response = await fetch(`${API_BASE}/rewards/admin/all`, {
  credentials: "include",
  headers: {
    "X-Admin-Token": localStorage.getItem("adminToken") || "",
  },
});
```

## 📋 Checklist Deployment

Sebelum deploy ke production:

- [ ] `SESSION_SECRET` sudah diset di `.env`
- [ ] Session cookie config sudah disesuaikan
- [ ] Server sudah direstart setelah update
- [ ] Browser cache/cookies sudah diclear
- [ ] CORS origins sudah include domain production
- [ ] Reverse proxy (jika ada) sudah pass cookies
- [ ] Database connection berjalan normal
- [ ] Admin login endpoint berfungsi (`POST /api/admin/login`)
- [ ] Public rewards endpoint berfungsi (`GET /api/rewards`)
- [ ] Debug logs terlihat di server console

## 🎯 Testing Command

Gunakan curl untuk test langsung dari server:

```bash
# 1. Test Login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"docterbee2025"}' \
  -c cookies.txt \
  -v

# 2. Test Rewards Admin Endpoint (dengan cookie dari login)
curl http://localhost:3000/api/rewards/admin/all \
  -b cookies.txt \
  -v

# Harus return JSON rewards, bukan Unauthorized
```

## 📞 Support

Jika masih bermasalah, kirim informasi berikut:

1. Server logs saat login admin
2. Server logs saat akses rewards endpoint
3. Browser console errors (F12)
4. Network tab (F12) - check cookies & headers
5. Environment: OS, Node version, database, web server

---

**Last Updated:** December 13, 2025  
**Status:** Session configuration sudah diperbaiki untuk production compatibility
