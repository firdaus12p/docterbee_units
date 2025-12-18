# Database-Based Admin System

## Overview
Admin authentication sekarang menggunakan **database** dengan **bcrypt password hashing** dan **audit logging**.

## Features
✅ **Database-based authentication** - Admin disimpan di tabel `admins`
✅ **Bcrypt password hashing** - Password di-hash dengan bcrypt (10 rounds)
✅ **Role-based access** - Support super-admin, admin, moderator
✅ **Login audit log** - Semua login attempt dicatat di `admin_login_history`
✅ **Session-based** - Menggunakan express-session (server-side)
✅ **IP & User-Agent tracking** - Untuk security monitoring

## Database Tables

### `admins`
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- username (VARCHAR(50), UNIQUE)
- password (VARCHAR(255)) -- bcrypt hashed
- email (VARCHAR(100))
- role (ENUM: 'super-admin', 'admin', 'moderator')
- is_active (TINYINT(1))
- last_login (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### `admin_login_history`
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- admin_id (INT, FOREIGN KEY -> admins.id)
- username (VARCHAR(50))
- ip_address (VARCHAR(45))
- user_agent (TEXT)
- login_status (ENUM: 'success', 'failed')
- login_at (TIMESTAMP)
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install bcrypt
```

### 2. Restart Server (Auto-create tables)
```bash
pm2 restart docterbee
# atau
npm run dev
```

Tables `admins` dan `admin_login_history` akan otomatis dibuat.

### 3. Create Default Admin
```bash
node backend/scripts/create-default-admin.mjs
```

Output:
```
✅ Default admin created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Username: admin
   Password: docterbee2025
   Email:    admin@docterbee.com
   Role:     super-admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  IMPORTANT: Change the password after first login!
```

### 4. Login ke Admin Dashboard
- URL: `http://your-domain.com/admin-dashboard.html`
- Username: `admin` (dari .env ADMIN_USERNAME)
- Password: `docterbee2025` (dari .env ADMIN_PASSWORD)

## Environment Variables (.env)

```env
# Admin credentials (used by create-default-admin.mjs)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=docterbee2025
ADMIN_EMAIL=admin@docterbee.com
```

**Note**: Setelah admin dibuat, credentials di .env **tidak digunakan lagi** untuk login. Login menggunakan data dari database.

## API Endpoints

### POST /api/admin/login
**Request:**
```json
{
  "username": "admin",
  "password": "docterbee2025"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Admin login berhasil",
  "admin": {
    "id": 1,
    "username": "admin",
    "email": "admin@docterbee.com",
    "role": "super-admin"
  }
}
```

**Response (Failed):**
```json
{
  "success": false,
  "error": "Username atau password salah"
}
```

## Security Features

1. **Password Hashing**
   - Bcrypt dengan 10 salt rounds
   - Password tidak pernah disimpan plain text

2. **Login Audit**
   - Semua attempt (success/failed) dicatat
   - IP address dan user-agent disimpan
   - Bisa untuk monitoring suspicious activity

3. **Session-based Auth**
   - Server-side session dengan express-session
   - Session data: `isAdmin`, `adminId`, `adminUsername`, `adminRole`

4. **Active Status**
   - Admin bisa di-disable dengan `is_active = 0`
   - Disabled admin tidak bisa login

## Future Enhancements (Optional)

### 1. Change Password API
```javascript
// POST /api/admin/change-password
{
  "oldPassword": "...",
  "newPassword": "..."
}
```

### 2. Manage Admins UI
- Add new admin
- Edit admin (email, role)
- Disable/enable admin
- View login history

### 3. Password Reset
- Forgot password flow
- Email verification
- Reset token

### 4. Two-Factor Authentication (2FA)
- TOTP (Google Authenticator)
- SMS verification

### 5. Role-Based Permissions
```javascript
const permissions = {
  'super-admin': ['*'], // all permissions
  'admin': ['users', 'orders', 'bookings'],
  'moderator': ['users.view', 'orders.view']
};
```

## Migration from Old System

**Old System (Environment Variables):**
- ❌ Hardcoded di .env
- ❌ Plain text password
- ❌ No audit log
- ❌ Single admin only

**New System (Database):**
- ✅ Stored in database
- ✅ Bcrypt hashed password
- ✅ Full audit log
- ✅ Multi-admin support
- ✅ Role-based access

## Troubleshooting

### Admin table not created
```bash
# Check if tables exist
mysql -u root -p docterbee_units -e "SHOW TABLES LIKE 'admins';"

# If not, restart server to trigger auto-migration
pm2 restart docterbee
```

### Can't login with old credentials
```bash
# Create new admin from database
node backend/scripts/create-default-admin.mjs
```

### Forgot admin password
```sql
-- Reset password manually (hash for "newpassword123")
UPDATE admins 
SET password = '$2b$10$YourBcryptHashHere' 
WHERE username = 'admin';
```

Or delete and recreate:
```sql
DELETE FROM admins WHERE username = 'admin';
```
Then run: `node backend/scripts/create-default-admin.mjs`

## Monitoring Login Activity

```sql
-- View recent login attempts
SELECT * FROM admin_login_history 
ORDER BY login_at DESC 
LIMIT 20;

-- View failed login attempts
SELECT * FROM admin_login_history 
WHERE login_status = 'failed' 
ORDER BY login_at DESC;

-- View successful logins by admin
SELECT a.username, h.ip_address, h.login_at
FROM admin_login_history h
JOIN admins a ON h.admin_id = a.id
WHERE h.login_status = 'success'
ORDER BY h.login_at DESC;
```

## Conclusion

Sistem admin sekarang lebih **secure**, **scalable**, dan **auditable**. 

✅ **Production-ready**
✅ **Best practices**
✅ **Easy to extend**
