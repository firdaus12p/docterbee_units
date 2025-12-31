// ============================================
// INSIGHT PAGE - Articles Loader
// ============================================

// ============================================
// HELPER FUNCTIONS
// Note: escapeHtml, formatDate, and getCategoryColor are defined in utils.js (global)
// ============================================

// ============================================
// LOAD ARTICLES
// ============================================
async function loadInsightArticles() {
  const articlesContainer = document.getElementById("articles");
  if (!articlesContainer) return;

  // Show loading
  articlesContainer.innerHTML = `
    <div class="col-span-full text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      <p class="mt-4 text-slate-600">Memuat artikel...</p>
    </div>
  `;

  try {
    // Get published articles only
    const response = await fetch("/api/articles");
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Gagal memuat artikel");
    }

    const articles = result.data;

    console.log("📦 Articles loaded:", articles.length);
    console.log("📄 First article:", articles[0]);

    if (articles.length === 0) {
      articlesContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-slate-600">Belum ada artikel tersedia.</p>
        </div>
      `;
      return;
    }

    // Render articles
    articlesContainer.innerHTML = articles
      .map((article) => {
        console.log("🎨 Rendering article:", article.title);
        return `
        <article 
          class="article-card bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          onclick="openArticle('${article.slug}')"
        >
          ${
            article.header_image
              ? `
            <div class="article-image">
              <img 
                src="${article.header_image}" 
                alt="${escapeHtml(article.title)}"
                class="w-full h-36 object-cover"
                onerror="this.parentElement.style.display='none'"
              >
            </div>
          `
              : ""
          }
          <div class="p-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs font-semibold px-2 py-1 rounded-full ${getCategoryColor(
                article.category
              )}">
                ${article.category}
              </span>
              <span class="text-xs text-slate-500">
                ${article.views} views
              </span>
            </div>
            <h3 class="text-base font-bold text-slate-900 mb-2 line-clamp-2">
              ${escapeHtml(article.title)}
            </h3>
            ${
              article.excerpt
                ? `
              <p class="text-sm text-slate-600 line-clamp-2 mb-2">
                ${escapeHtml(article.excerpt)}
              </p>
            `
                : ""
            }
            <div class="article-meta flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-slate-500 mt-3 pt-2 border-t border-gray-100">
              <span>${article.author}</span>
              <span>${formatDate(article.created_at)}</span>
            </div>
          </div>
        </article>
      `;
      })
      .join("");
  } catch (error) {
    console.error("Error loading articles:", error);
    articlesContainer.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-red-600">Error: ${error.message}</p>
        <button 
          onclick="loadInsightArticles()" 
          class="mt-4 px-4 py-2 bg-amber-400 text-slate-900 rounded-lg hover:bg-amber-500"
        >
          Coba Lagi
        </button>
      </div>
    `;
  }
}

// ============================================
// FILTER ARTICLES BY CATEGORY
// ============================================
async function filterArticlesByCategory() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const selectedCategories = Array.from(checkboxes)
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);

  const articlesContainer = document.getElementById("articles");
  if (!articlesContainer) return;

  try {
    const response = await fetch("/api/articles");
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Gagal memuat artikel");
    }

    let articles = result.data;

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      articles = articles.filter((article) =>
        selectedCategories.includes(article.category)
      );
    }

    if (articles.length === 0) {
      articlesContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-slate-600">Tidak ada artikel untuk kategori yang dipilih.</p>
        </div>
      `;
      return;
    }

    // Render filtered articles (same as loadInsightArticles)
    articlesContainer.innerHTML = articles
      .map(
        (article) => `
        <article 
          class="article-card bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          onclick="openArticle('${article.slug}')"
        >
          ${
            article.header_image
              ? `
            <div class="article-image">
              <img 
                src="${article.header_image}" 
                alt="${escapeHtml(article.title)}"
                class="w-full h-36 object-cover"
                onerror="this.parentElement.style.display='none'"
              >
            </div>
          `
              : ""
          }
          <div class="p-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs font-semibold px-2 py-1 rounded-full ${getCategoryColor(
                article.category
              )}">
                ${article.category}
              </span>
              <span class="text-xs text-slate-500">
                ${article.views} views
              </span>
            </div>
            <h3 class="text-base font-bold text-slate-900 mb-2 line-clamp-2">
              ${escapeHtml(article.title)}
            </h3>
            ${
              article.excerpt
                ? `
              <p class="text-sm text-slate-600 line-clamp-2 mb-2">
                ${escapeHtml(article.excerpt)}
              </p>
            `
                : ""
            }
            <div class="article-meta flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-slate-500 mt-3 pt-2 border-t border-gray-100">
              <span>${article.author}</span>
              <span>${formatDate(article.created_at)}</span>
            </div>
          </div>
        </article>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error filtering articles:", error);
  }
}

// ============================================
// OPEN ARTICLE READER
// ============================================
function openArticle(slug) {
  // Redirect to article reader page
  window.location.href = `/article?slug=${slug}`;
}

// ============================================
// INIT
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  // Load articles on page load
  loadInsightArticles();

  // Attach filter checkboxes
  const filterCheckboxes = document.querySelectorAll(
    '.insight-sidebar input[type="checkbox"]'
  );
  filterCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", filterArticlesByCategory);
  });
});
