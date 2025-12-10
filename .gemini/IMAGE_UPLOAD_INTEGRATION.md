# 📷 Image Upload Integration Guide - Admin Dashboard

## Cara Menambahkan File Upload ke Article Form Modal

Cari **Article Form Modal** di `admin-dashboard.html` dan **GANTI** field "URL Foto Header" dengan code berikut:

### 1. Ganti Field URL dengan File Upload

**CARI** code ini (sekitar line yang ada `articleHeaderImage`):

```html
<!-- Header Image -->
<div>
  <label class="block text-sm font-medium text-white mb-2">
    URL Foto Header
  </label>
  <input
    type="url"
    id="articleHeaderImage"
    class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-amber-400 focus:outline-none"
    placeholder="https://example.com/image.jpg"
  >
  <p class="text-xs text-slate-400 mt-1">
    Opsional. Foto akan ditampilkan di atas artikel.
  </p>
</div>
```

**GANTI** dengan code ini:

```html
<!-- Header Image Upload -->
<div>
  <label class="block text-sm font-medium text-white mb-2">
    Gambar Hero (Header)
  </label>
  
  <!-- File Input -->
  <input
    type="file"
    id="articleHeaderImageFile"
    accept="image/*"
    onchange="uploadHeaderImage(this)"
    class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-amber-400 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-amber-400 file:text-slate-900 hover:file:bg-amber-500"
  >
  
  <!-- Hidden input untuk menyimpan path -->
  <input type="hidden" id="articleHeaderImage">
  
  <!-- Preview Image -->
  <div id="headerImagePreview" class="hidden mt-3">
    <div class="relative inline-block">
      <img 
        id="headerImagePreviewImg" 
        src="" 
        alt="Preview" 
        class="w-full max-w-md h-48 object-cover rounded-lg border-2 border-slate-700"
      >
      <button
        type="button"
        onclick="removeHeaderImage()"
        class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition"
        title="Hapus gambar"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </div>
  
  <p class="text-xs text-slate-400 mt-1">
    Upload gambar (JPG, PNG, GIF). Maksimal 5MB. Gambar akan muncul di card artikel dan di atas artikel.
  </p>
</div>
```

### 2. Tambahkan Upload Button untuk Gambar Konten

**CARI** field "Konten Artikel" (sekitar line yang ada `articleContent`):

```html
<!-- Content -->
<div>
  <label class="block text-sm font-medium text-white mb-2">
    Konten Artikel <span class="text-red-400">*</span>
  </label>
  <textarea
    id="articleContent"
    rows="12"
    class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-amber-400 focus:outline-none font-mono text-sm"
    placeholder="Tulis konten artikel di sini... (support HTML)"
    required
  ></textarea>
  <p class="text-xs text-slate-400 mt-1">
    Anda bisa menggunakan HTML untuk formatting (h2, p, strong, em, ul, ol, img, dll)
  </p>
</div>
```

**GANTI** dengan code ini (tambahkan button upload):

```html
<!-- Content -->
<div>
  <label class="block text-sm font-medium text-white mb-2">
    Konten Artikel <span class="text-red-400">*</span>
  </label>
  
  <!-- Upload Image Button -->
  <div class="mb-2">
    <button
      type="button"
      onclick="uploadContentImage()"
      class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition flex items-center gap-2"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      <span>Upload Gambar ke Konten</span>
    </button>
    <p class="text-xs text-slate-400 mt-1">
      Klik untuk upload gambar. Gambar akan di-insert di posisi cursor.
    </p>
  </div>
  
  <textarea
    id="articleContent"
    rows="12"
    class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-amber-400 focus:outline-none font-mono text-sm"
    placeholder="Tulis konten artikel di sini... (support HTML)"
    required
  ></textarea>
  <p class="text-xs text-slate-400 mt-1">
    Anda bisa menggunakan HTML untuk formatting (h2, p, strong, em, ul, ol, img, dll)
  </p>
</div>
```

---

## ✅ Checklist Integration

- [ ] Buka `admin-dashboard.html`
- [ ] Cari Article Form Modal
- [ ] Ganti field "URL Foto Header" dengan code di atas (Section 1)
- [ ] Tambahkan upload button di field "Konten Artikel" (Section 2)
- [ ] Save file
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Test upload gambar

---

## 🧪 Testing

### Test 1: Upload Gambar Hero

1. Login admin dashboard
2. Klik tab "Articles"
3. Klik "New Article"
4. Klik "Choose File" pada "Gambar Hero"
5. Pilih gambar dari komputer
6. **Verifikasi**: Preview gambar muncul
7. Klik "Save Article"
8. **Verifikasi**: Artikel tersimpan

### Test 2: Upload Gambar Konten

1. Edit artikel
2. Klik di dalam textarea "Konten Artikel"
3. Klik button "Upload Gambar ke Konten"
4. Pilih gambar
5. **Verifikasi**: Tag `<img>` muncul di textarea
6. Save artikel
7. Buka artikel di `article.html`
8. **Verifikasi**: Gambar muncul di konten

### Test 3: Hapus Gambar Hero

1. Edit artikel yang ada gambar
2. Klik button "X" di preview
3. **Verifikasi**: Preview hilang
4. Save artikel
5. **Verifikasi**: Artikel tersimpan tanpa gambar

---

## 📝 Notes

- **JavaScript functions** sudah ditambahkan di `js/articles-manager.js`
- **Endpoint upload** sudah ada di `/api/upload`
- **Validasi**: Max 5MB, hanya file gambar
- **Preview**: Gambar hero bisa di-preview sebelum save
- **Insert**: Gambar konten di-insert di posisi cursor

---

**Status**: JavaScript ✅ | HTML Integration ⏳

Silakan copy-paste code di atas ke `admin-dashboard.html` dan test! 🚀
