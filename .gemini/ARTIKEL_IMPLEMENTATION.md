# 📝 Fitur Artikel - Implementation Guide

## ✅ Progress Saat Ini

### **Step 1: Database ✅**
- Tabel `articles` sudah dibuat di `backend/db.mjs`
- Fields:
  - `id` - Primary key
  - `title` - Judul artikel
  - `slug` - URL-friendly slug (auto-generated)
  - `content` - Konten artikel (LONGTEXT)
  - `excerpt` - Ringkasan singkat
  - `header_image` - URL foto header
  - `category` - ENUM('Nutrisi', 'Ibadah', 'Kebiasaan', 'Sains')
  - `author` - Nama penulis (default: 'Admin')
  - `is_published` - Status publish (1/0)
  - `views` - Jumlah views
  - `created_at`, `updated_at` - Timestamps

### **Step 2: Backend API ✅**
- File: `backend/articles.mjs`
- Endpoints:
  ```
  GET    /api/articles              - List semua artikel (published only)
  GET    /api/articles?category=X   - Filter by category
  GET    /api/articles/:id          - Get artikel by ID
  GET    /api/articles/slug/:slug   - Get artikel by slug
  POST   /api/articles              - Create artikel baru
  PUT    /api/articles/:id          - Update artikel
  DELETE /api/articles/:id          - Delete artikel
  ```
- Features:
  - Auto-generate slug dari title
  - Auto-increment views saat artikel dibaca
  - Validation untuk required fields

### **Step 3: Admin Dashboard (TODO)**

Perlu ditambahkan di `admin-dashboard.html`:

#### **3.1. Tab Navigation**
Tambahkan tab "Articles" di navigation tabs (setelah Products/Services)

#### **3.2. Articles Manager Section**
```html
<section id="articlesManager" class="hidden">
  <!-- Header -->
  <div class="flex justify-between items-center mb-6">
    <h2>Articles Manager</h2>
    <button id="btnNewArticle">+ New Article</button>
  </div>

  <!-- Articles Table -->
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Title</th>
        <th>Category</th>
        <th>Author</th>
        <th>Views</th>
        <th>Status</th>
        <th>Created</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="articlesTableBody"></tbody>
  </table>
</section>
```

#### **3.3. Article Form Modal**
```html
<div id="articleFormModal" class="hidden">
  <form id="articleForm">
    <input type="text" id="articleTitle" placeholder="Judul Artikel" required>
    <select id="articleCategory" required>
      <option value="Nutrisi">Nutrisi</option>
      <option value="Ibadah">Ibadah</option>
      <option value="Kebiasaan">Kebiasaan</option>
      <option value="Sains">Sains</option>
    </select>
    <input type="text" id="articleExcerpt" placeholder="Ringkasan singkat">
    <input type="url" id="articleHeaderImage" placeholder="URL Foto Header">
    <textarea id="articleContent" placeholder="Konten artikel..." required></textarea>
    <input type="text" id="articleAuthor" placeholder="Nama Penulis" value="Admin">
    <label>
      <input type="checkbox" id="articlePublished" checked>
      Publish artikel
    </label>
    <button type="submit">Save Article</button>
  </form>
</div>
```

#### **3.4. JavaScript Functions**
File: `js/admin-dashboard.js`

```javascript
// Load articles
async function loadArticles() {
  const response = await fetch(`${API_BASE}/articles?published=undefined`);
  const result = await response.json();
  // Render to table
}

// Create/Update article
async function saveArticle(articleData) {
  const method = articleData.id ? 'PUT' : 'POST';
  const url = articleData.id 
    ? `${API_BASE}/articles/${articleData.id}` 
    : `${API_BASE}/articles`;
  
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(articleData)
  });
  
  return await response.json();
}

// Delete article
async function deleteArticle(id) {
  if (!confirm('Hapus artikel ini?')) return;
  
  await fetch(`${API_BASE}/articles/${id}`, {
    method: 'DELETE'
  });
  
  loadArticles();
}

// Edit article
async function editArticle(id) {
  const response = await fetch(`${API_BASE}/articles/${id}`);
  const result = await response.json();
  
  // Populate form with article data
  document.getElementById('articleTitle').value = result.data.title;
  document.getElementById('articleCategory').value = result.data.category;
  // ... dst
  
  // Show modal
  showArticleModal();
}
```

### **Step 4: Insight Page (TODO)**

File: `insight.html` & `js/script.js`

#### **4.1. Load Articles List**
```javascript
async function loadInsightArticles() {
  const response = await fetch(`${API_BASE}/articles`);
  const result = await response.json();
  
  const articlesContainer = document.getElementById('articles');
  articlesContainer.innerHTML = result.data.map(article => `
    <article class="article-card" onclick="openArticle('${article.slug}')">
      ${article.header_image ? `<img src="${article.header_image}" alt="${article.title}">` : ''}
      <h3>${article.title}</h3>
      <p class="excerpt">${article.excerpt || ''}</p>
      <div class="meta">
        <span class="category">${article.category}</span>
        <span class="views">${article.views} views</span>
      </div>
    </article>
  `).join('');
}
```

#### **4.2. Open Article Reader**
```javascript
async function openArticle(slug) {
  const response = await fetch(`${API_BASE}/articles/slug/${slug}`);
  const result = await response.json();
  const article = result.data;
  
  // Option 1: Modal
  showArticleModal(article);
  
  // Option 2: Redirect to article page
  window.location.href = `article.html?slug=${slug}`;
}
```

### **Step 5: Article Reader Page (TODO)**

File baru: `article.html`

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <title id="articleTitle">Article - Docterbee</title>
  <!-- ... -->
</head>
<body>
  <header><!-- Navigation --></header>
  
  <main class="article-reader">
    <article>
      <img id="articleHeaderImage" src="" alt="">
      <div class="article-meta">
        <span id="articleCategory"></span>
        <span id="articleAuthor"></span>
        <span id="articleDate"></span>
        <span id="articleViews"></span>
      </div>
      <h1 id="articleTitleMain"></h1>
      <div id="articleContent" class="article-content"></div>
    </article>
    
    <aside class="article-sidebar">
      <h3>Artikel Terkait</h3>
      <div id="relatedArticles"></div>
    </aside>
  </main>
  
  <script src="js/article-reader.js"></script>
</body>
</html>
```

JavaScript:
```javascript
// Get slug from URL
const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');

// Load article
async function loadArticle() {
  const response = await fetch(`${API_BASE}/articles/slug/${slug}`);
  const result = await response.json();
  const article = result.data;
  
  // Populate page
  document.getElementById('articleTitle').textContent = article.title;
  document.getElementById('articleTitleMain').textContent = article.title;
  document.getElementById('articleContent').innerHTML = article.content;
  document.getElementById('articleCategory').textContent = article.category;
  // ... dst
}

loadArticle();
```

## 📋 Checklist Implementation

### Backend ✅
- [x] Database table created
- [x] API endpoints created
- [x] Router registered

### Admin Dashboard ⏳
- [ ] Add "Articles" tab
- [ ] Create Articles Manager section
- [ ] Create Article Form modal
- [ ] Add JavaScript functions (CRUD)
- [ ] Test create article
- [ ] Test edit article
- [ ] Test delete article

### Insight Page ⏳
- [ ] Load articles list
- [ ] Add click handler
- [ ] Filter by category
- [ ] Add search functionality

### Article Reader ⏳
- [ ] Create article.html
- [ ] Load article by slug
- [ ] Display header image
- [ ] Format content
- [ ] Show related articles
- [ ] Add share buttons

## 🎨 Design Considerations

### Article Card (Insight Page)
```css
.article-card {
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.article-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
```

### Article Content Formatting
```css
.article-content {
  line-height: 1.8;
  font-size: 1.125rem;
}

.article-content h2 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.article-content p {
  margin-bottom: 1rem;
}

.article-content img {
  max-width: 100%;
  border-radius: 0.5rem;
  margin: 2rem 0;
}
```

## 🚀 Next Steps

1. **Restart backend server** untuk load tabel baru:
   ```bash
   npm run dev
   ```

2. **Test API** dengan Postman/Thunder Client:
   ```
   POST http://localhost:3000/api/articles
   Body: {
     "title": "Test Article",
     "content": "Content here...",
     "category": "Nutrisi"
   }
   ```

3. **Implement Admin Dashboard UI** (Step 3)

4. **Implement Insight Page** (Step 4)

5. **Create Article Reader** (Step 5)

---

**Status**: Backend Ready ✅ | Frontend Pending ⏳
**Last Updated**: 2025-12-10
