# 📝 Admin Dashboard - Articles Manager Integration

## Cara Menambahkan ke admin-dashboard.html

### 1. Tambahkan Script di `<head>` atau sebelum `</body>`

```html
<!-- Articles Manager Script -->
<script src="js/articles-manager.js"></script>
```

### 2. Tambahkan Tab Navigation (cari bagian tabs, tambahkan setelah tab terakhir)

```html
<button
  class="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition"
  onclick="showSection('articles')"
>
  📝 Articles
</button>
```

### 3. Tambahkan Articles Manager Section (setelah section terakhir, sebelum `</main>`)

```html
<!-- ============================================ -->
<!-- ARTICLES MANAGER -->
<!-- ============================================ -->
<section id="articlesManager" class="hidden">
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
    <div>
      <h2 class="text-2xl font-bold text-white">Articles Manager</h2>
      <p class="text-slate-400 text-sm">Kelola artikel untuk halaman Insight</p>
    </div>
    <button
      id="btnNewArticle"
      class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition flex items-center gap-2"
    >
      <span>+</span>
      <span>New Article</span>
    </button>
  </div>

  <!-- Articles Table -->
  <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-slate-800">
          <tr>
            <th class="px-3 py-3 text-left text-white">ID</th>
            <th class="px-3 py-3 text-left text-white">Title</th>
            <th class="px-3 py-3 text-left text-white">Category</th>
            <th class="px-3 py-3 text-left text-white">Author</th>
            <th class="px-3 py-3 text-left text-white">Views</th>
            <th class="px-3 py-3 text-left text-white">Status</th>
            <th class="px-3 py-3 text-left text-white">Created</th>
            <th class="px-3 py-3 text-center text-white">Actions</th>
          </tr>
        </thead>
        <tbody id="articlesTableBody">
          <!-- Articles will be loaded here by JavaScript -->
        </tbody>
      </table>
    </div>
  </div>
</section>
```

### 4. Tambahkan Article Form Modal (setelah semua sections, sebelum `</body>`)

```html
<!-- ============================================ -->
<!-- ARTICLE FORM MODAL -->
<!-- ============================================ -->
<div
  id="articleFormModal"
  class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 items-center justify-center p-4"
>
  <div
    class="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
  >
    <!-- Modal Header -->
    <div class="flex justify-between items-center mb-6">
      <h3 id="articleModalTitle" class="text-2xl font-bold text-white">
        Tambah Artikel Baru
      </h3>
      <button
        id="closeArticleModal"
        class="text-slate-400 hover:text-white transition"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Article Form -->
    <form id="articleForm" class="space-y-4">
      <input type="hidden" id="articleId" value="">

      <!-- Title -->
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Judul Artikel <span class="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="articleTitle"
          class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-amber-400 focus:outline-none"
          placeholder="Contoh: Manfaat Madu untuk Kesehatan"
          required
        >
      </div>

      <!-- Category -->
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Kategori <span class="text-red-400">*</span>
        </label>
        <select
          id="articleCategory"
          class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-amber-400 focus:outline-none"
          required
        >
          <option value="Nutrisi">Nutrisi</option>
          <option value="Ibadah">Ibadah</option>
          <option value="Kebiasaan">Kebiasaan</option>
          <option value="Sains">Sains</option>
        </select>
      </div>

      <!-- Excerpt -->
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Ringkasan Singkat
        </label>
        <input
          type="text"
          id="articleExcerpt"
          class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-amber-400 focus:outline-none"
          placeholder="Ringkasan 1-2 kalimat untuk preview"
        >
      </div>

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

      <!-- Author -->
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Nama Penulis
        </label>
        <input
          type="text"
          id="articleAuthor"
          class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-amber-400 focus:outline-none"
          placeholder="Admin"
          value="Admin"
        >
      </div>

      <!-- Published Status -->
      <div class="flex items-center gap-2">
        <input
          type="checkbox"
          id="articlePublished"
          class="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
          checked
        >
        <label for="articlePublished" class="text-sm text-white">
          Publish artikel (tampilkan di halaman Insight)
        </label>
      </div>

      <!-- Form Actions -->
      <div class="flex gap-3 pt-4">
        <button
          type="submit"
          class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg transition"
        >
          Save Article
        </button>
        <button
          type="button"
          onclick="closeArticleModal()"
          class="px-6 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</div>
```

### 5. Update JavaScript untuk Show Section

Cari fungsi `showSection()` di admin-dashboard.js dan tambahkan case untuk 'articles':

```javascript
function showSection(sectionName) {
  // Hide all sections
  const sections = document.querySelectorAll('section[id$="Manager"]');
  sections.forEach(section => section.classList.add('hidden'));

  // Show selected section
  const targetSection = document.getElementById(sectionName + 'Manager');
  if (targetSection) {
    targetSection.classList.remove('hidden');
  }

  // Load data for the section
  if (sectionName === 'articles') {
    loadArticles();
  }
  // ... other sections
}
```

## 🎨 Styling Notes

Semua styling sudah menggunakan Tailwind CSS yang konsisten dengan admin dashboard:
- Dark theme (slate-900, slate-800)
- Amber accent color untuk buttons
- Emerald color untuk success/publish
- Red color untuk delete actions

## 🧪 Testing

1. Login ke admin dashboard
2. Klik tab "Articles"
3. Klik "New Article"
4. Isi form dan save
5. Artikel akan muncul di tabel
6. Test edit dan delete

## 📝 Next: Insight Page Integration

Setelah admin bisa create artikel, lanjut ke:
- Load articles di insight.html
- Create article reader page
- Add filter by category

---

**File Created**: `js/articles-manager.js` ✅
**Integration Guide**: This file ✅
