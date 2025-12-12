// ============================================
// ARTICLES MANAGER - Admin Dashboard
// ============================================

const API_BASE = "/api";

// ============================================
// LOAD ARTICLES
// ============================================
async function loadArticles() {
  const tbody = document.getElementById("articlesTableBody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-white font-medium">Loading...</td></tr>`;

  try {
    // Get all articles (including unpublished for admin)
    const response = await fetch(`${API_BASE}/articles?published=undefined`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Gagal memuat data");
    }

    const articles = result.data;

    if (articles.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-white">Belum ada artikel</td></tr>`;
      return;
    }

    tbody.innerHTML = articles
      .map(
        (article) => `
        <tr class="border-t border-slate-700 hover:bg-slate-800">
          <td class="px-3 py-3 text-white">${article.id}</td>
          <td class="px-3 py-3 font-semibold text-white max-w-xs truncate">${escapeHtml(article.title)}</td>
          <td class="px-3 py-3">
            <span class="text-xs rounded-full px-2 py-1 ${getCategoryBadgeClass(article.category)}">
              ${article.category}
            </span>
          </td>
          <td class="px-3 py-3 text-xs text-slate-300">${escapeHtml(article.author)}</td>
          <td class="px-3 py-3 text-white">${article.views}</td>
          <td class="px-3 py-3">
            <span class="text-xs rounded-full px-2 py-1 font-semibold ${
              article.is_published
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-600 text-slate-200"
            }">
              ${article.is_published ? "Published" : "Draft"}
            </span>
          </td>
          <td class="px-3 py-3 text-xs text-slate-300">${formatDate(article.created_at)}</td>
          <td class="px-3 py-3 text-center">
            <div class="flex gap-1 justify-center">
              <button
                onclick="editArticle(${article.id})"
                class="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded text-xs"
                title="Edit"
              >
                Edit
              </button>
              <button
                onclick="deleteArticle(${article.id}, '${escapeHtml(article.title).replace(/'/g, "\\'")}')"
                class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded text-xs"
                title="Hapus"
              >
                Hapus
              </button>
            </div>
          </td>
        </tr>`
      )
      .join("");
  } catch (error) {
    console.error("Error loading articles:", error);
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-red-400 font-semibold">Error: ${error.message}</td></tr>`;
  }
}

// ============================================
// CREATE/UPDATE ARTICLE
// ============================================
async function saveArticle(event) {
  event.preventDefault();

  const articleId = document.getElementById("articleId").value;
  const articleData = {
    title: document.getElementById("articleTitle").value,
    content: document.getElementById("articleContent").value,
    excerpt: document.getElementById("articleExcerpt").value || null,
    header_image: document.getElementById("articleHeaderImage").value || null,
    category: document.getElementById("articleCategory").value,
    author: document.getElementById("articleAuthor").value || "Admin",
    is_published: document.getElementById("articlePublished").checked ? 1 : 0,
  };

  try {
    const method = articleId ? "PUT" : "POST";
    const url = articleId
      ? `${API_BASE}/articles/${articleId}`
      : `${API_BASE}/articles`;

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(articleData),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Gagal menyimpan artikel");
    }

    alert(articleId ? "Artikel berhasil diupdate!" : "Artikel berhasil dibuat!");
    closeArticleModal();
    loadArticles();
  } catch (error) {
    console.error("Error saving article:", error);
    alert("Error: " + error.message);
  }
}

// ============================================
// EDIT ARTICLE
// ============================================
async function editArticle(id) {
  try {
    const response = await fetch(`${API_BASE}/articles/${id}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Gagal memuat artikel");
    }

    const article = result.data;

    // Populate form
    document.getElementById("articleId").value = article.id;
    document.getElementById("articleTitle").value = article.title;
    document.getElementById("articleContent").value = article.content;
    document.getElementById("articleExcerpt").value = article.excerpt || "";
    document.getElementById("articleHeaderImage").value = article.header_image || "";
    document.getElementById("articleCategory").value = article.category;
    document.getElementById("articleAuthor").value = article.author;
    document.getElementById("articlePublished").checked = article.is_published === 1;

    // Update modal title
    document.getElementById("articleModalTitle").textContent = "Edit Artikel";

    // Show modal
    showArticleModal();
  } catch (error) {
    console.error("Error loading article:", error);
    alert("Error: " + error.message);
  }
}

// ============================================
// DELETE ARTICLE
// ============================================
async function deleteArticle(id, title) {
  if (!confirm(`Hapus artikel "${title}"?\n\nArtikel yang dihapus tidak dapat dikembalikan.`)) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/articles/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Gagal menghapus artikel");
    }

    alert("Artikel berhasil dihapus!");
    loadArticles();
  } catch (error) {
    console.error("Error deleting article:", error);
    alert("Error: " + error.message);
  }
}

// ============================================
// MODAL FUNCTIONS
// ============================================
function showArticleModal() {
  const modal = document.getElementById("articleFormModal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

function closeArticleModal() {
  const modal = document.getElementById("articleFormModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }

  // Reset form
  document.getElementById("articleForm").reset();
  document.getElementById("articleId").value = "";
  document.getElementById("articleModalTitle").textContent = "Tambah Artikel Baru";
}

function openNewArticleForm() {
  // Reset form
  document.getElementById("articleForm").reset();
  document.getElementById("articleId").value = "";
  document.getElementById("articleModalTitle").textContent = "Tambah Artikel Baru";
  document.getElementById("articlePublished").checked = true;

  showArticleModal();
}

// ============================================
// IMAGE UPLOAD FUNCTIONS
// ============================================

// Upload header image
async function uploadHeaderImage(input) {
  const file = input.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('File harus berupa gambar (JPG, PNG, GIF, dll)');
    input.value = '';
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Ukuran file maksimal 5MB');
    input.value = '';
    return;
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Gagal upload gambar');
    }

    // Set hidden input value
    document.getElementById('articleHeaderImage').value = result.filePath;

    // Show preview
    const preview = document.getElementById('headerImagePreview');
    const img = document.getElementById('headerImagePreviewImg');
    img.src = result.filePath;
    preview.classList.remove('hidden');

    console.log('✅ Header image uploaded:', result.filePath);
  } catch (error) {
    console.error('Error uploading header image:', error);
    alert('Error upload gambar: ' + error.message);
    input.value = '';
  }
}

// Upload content image
async function uploadContentImage() {
  // Create temporary file input
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar (JPG, PNG, GIF, dll)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Gagal upload gambar');
      }

      // Insert image tag at cursor position in textarea
      const textarea = document.getElementById('articleContent');
      const imageTag = `\n<img src="${result.filePath}" alt="Gambar artikel" class="w-full rounded-lg my-4">\n`;

      const cursorPos = textarea.selectionStart;
      const textBefore = textarea.value.substring(0, cursorPos);
      const textAfter = textarea.value.substring(cursorPos);

      textarea.value = textBefore + imageTag + textAfter;

      // Set cursor after inserted image
      textarea.selectionStart = textarea.selectionEnd = cursorPos + imageTag.length;
      textarea.focus();

      console.log('✅ Content image uploaded and inserted:', result.filePath);
    } catch (error) {
      console.error('Error uploading content image:', error);
      alert('Error upload gambar: ' + error.message);
    }
  };

  input.click();
}

// Remove header image
function removeHeaderImage() {
  document.getElementById('articleHeaderImage').value = '';
  document.getElementById('articleHeaderImageFile').value = '';
  document.getElementById('headerImagePreview').classList.add('hidden');
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function getCategoryBadgeClass(category) {
  const classes = {
    Nutrisi: "bg-green-100 text-green-700",
    Ibadah: "bg-blue-100 text-blue-700",
    Kebiasaan: "bg-purple-100 text-purple-700",
    Sains: "bg-orange-100 text-orange-700",
  };
  return classes[category] || "bg-gray-100 text-gray-700";
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// INIT
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  // Attach form submit handler
  const articleForm = document.getElementById("articleForm");
  if (articleForm) {
    articleForm.addEventListener("submit", saveArticle);
  }

  // Attach close modal handlers
  const closeModalBtn = document.getElementById("closeArticleModal");
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeArticleModal);
  }

  const articleModalOverlay = document.getElementById("articleFormModal");
  if (articleModalOverlay) {
    articleModalOverlay.addEventListener("click", (e) => {
      if (e.target === articleModalOverlay) {
        closeArticleModal();
      }
    });
  }

  // Attach new article button
  const btnNewArticle = document.getElementById("btnNewArticle");
  if (btnNewArticle) {
    btnNewArticle.addEventListener("click", openNewArticleForm);
  }

  // Load articles if on articles manager page
  if (document.getElementById("articlesTableBody")) {
    loadArticles();
  }
});

// ============================================
// EXPOSE FUNCTIONS TO WINDOW (for onclick handlers)
// ============================================
window.loadArticles = loadArticles;
window.editArticle = editArticle;
window.deleteArticle = deleteArticle;
window.uploadHeaderImage = uploadHeaderImage;
window.uploadContentImage = uploadContentImage;
window.removeHeaderImage = removeHeaderImage;
window.closeArticleModal = closeArticleModal;
