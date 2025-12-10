# 🔧 TROUBLESHOOTING - Articles Table Fix

## ❌ Error: "Unknown column 'views' in 'field list'"

### **Penyebab:**
Tabel `articles` dibuat **SEBELUM** field `views` ditambahkan ke schema, atau server tidak di-restart setelah update `db.mjs`.

### **Gejala:**
- ✅ Artikel bisa dibuat di admin dashboard
- ❌ Error saat membaca artikel di insight.html
- ❌ Error: `Unknown column 'views' in 'field list'`

---

## ✅ **SOLUSI (Sudah Dijalankan)**

Script `fix-articles-table.mjs` sudah dijalankan dan berhasil menambahkan column `views`.

**Output:**
```
🔧 Checking articles table...
⚠️  Column "views" is missing. Adding it now...
✅ Column "views" added successfully!
📊 Table structure updated.
```

---

## 🧪 **VERIFIKASI**

### **1. Check di Database**
Buka phpMyAdmin atau MySQL client:
```sql
DESCRIBE articles;
```

Pastikan ada column `views` dengan type `INT` dan default `0`.

### **2. Test di Browser**
1. **Hard refresh** (Ctrl+Shift+R) halaman insight.html
2. Artikel seharusnya muncul
3. Klik artikel untuk baca
4. Seharusnya tidak ada error lagi

---

## 🔄 **Jika Masih Error**

### **Option 1: Restart Server**
```bash
# Stop server (Ctrl+C)
npm run dev
```

Server akan auto-create/update tabel saat startup.

### **Option 2: Manual ALTER TABLE**
Buka phpMyAdmin dan jalankan:
```sql
ALTER TABLE articles 
ADD COLUMN views INT DEFAULT 0 AFTER is_published;
```

### **Option 3: DROP & RECREATE (HATI-HATI: Data akan hilang!)**
```sql
DROP TABLE IF EXISTS articles;
```

Lalu restart server untuk recreate tabel dengan schema yang benar.

---

## 📝 **Files Created**

1. **`fix-articles-table.mjs`** - Auto-fix script (sudah dijalankan)
2. **`.gemini/fix_articles_table.sql`** - Manual SQL script
3. **`.gemini/TROUBLESHOOTING_ARTICLES.md`** - This file

---

## ✅ **Status**

- [x] Column `views` ditambahkan
- [x] Script fix dijalankan
- [ ] Test di browser (silakan test sekarang!)

---

**Sekarang silakan test lagi di browser!** Artikel seharusnya sudah bisa dibaca tanpa error. 🚀
