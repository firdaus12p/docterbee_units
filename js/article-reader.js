// ============================================
// ARTICLE READER
// ============================================

let currentArticle = null;

// ============================================
// LOAD ARTICLE
// ============================================
async function loadArticle() {
  // Get slug from URL
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug");

  if (!slug) {
    showError("Artikel tidak ditemukan. Slug tidak ada di URL.");
    return;
  }

  try {
    const response = await fetch(
      `/api/articles/slug/${slug}`
    );
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Artikel tidak ditemukan");
    }

    currentArticle = result.data;
    displayArticle(currentArticle);
    loadRelatedArticles(currentArticle.category, currentArticle.id);
  } catch (error) {
    console.error("Error loading article:", error);
    showError(error.message);
  }
}

// ============================================
// DISPLAY ARTICLE
// ============================================
function displayArticle(article) {
  // Update page title
  document.getElementById(
    "pageTitle"
  ).textContent = `${article.title} - Docterbee`;
  document.title = `${article.title} - Docterbee`;

  // Header Image
  if (article.header_image) {
    const imageContainer = document.getElementById(
      "articleHeaderImageContainer"
    );
    const image = document.getElementById("articleHeaderImage");
    image.src = article.header_image;
    image.alt = article.title;
    imageContainer.classList.remove("hidden");
  }

  // Category Badge
  const categoryBadge = document.getElementById("articleCategory");
  categoryBadge.textContent = article.category;
  categoryBadge.className = `text-xs font-semibold px-3 py-1 rounded-full ${getCategoryColor(
    article.category
  )}`;

  // Meta Info
  document.getElementById("articleAuthor").textContent = article.author;
  document.getElementById("articleDate").textContent = formatDate(
    article.created_at
  );
  document.getElementById("articleViews").textContent = article.views;

  // Title
  document.getElementById("articleTitle").textContent = article.title;

  // Excerpt
  if (article.excerpt) {
    const excerptContainer = document.getElementById("articleExcerptContainer");
    document.getElementById("articleExcerpt").textContent = article.excerpt;
    excerptContainer.classList.remove("hidden");
  }

  // Content
  document.getElementById("articleContent").innerHTML = article.content;

  // Initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// ============================================
// LOAD RELATED ARTICLES
// ============================================
async function loadRelatedArticles(category, currentId) {
  const container = document.getElementById("relatedArticles");

  try {
    const response = await fetch(
      `/api/articles?category=${category}`
    );
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Gagal memuat artikel terkait");
    }

    // Filter out current article and limit to 4
    const relatedArticles = result.data
      .filter((article) => article.id !== currentId)
      .slice(0, 4);

    if (relatedArticles.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-6 text-slate-600">
          Tidak ada artikel terkait.
        </div>
      `;
      return;
    }

    container.innerHTML = relatedArticles
      .map(
        (article) => `
        <a 
          href="/article?slug=${article.slug}"
          class="block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition"
        >
          ${
            article.header_image
              ? `
            <img 
              src="${article.header_image}" 
              alt="${escapeHtml(article.title)}"
              class="w-full h-32 object-cover rounded-lg mb-3"
              onerror="this.style.display='none'"
            >
          `
              : ""
          }
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-semibold px-2 py-1 rounded-full ${getCategoryColor(
              article.category
            )}">
              ${article.category}
            </span>
          </div>
          <h3 class="font-bold text-slate-900 line-clamp-2 mb-1">
            ${escapeHtml(article.title)}
          </h3>
          <p class="text-xs text-slate-500">
            ${article.views} views
          </p>
        </a>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error loading related articles:", error);
    container.innerHTML = `
      <div class="col-span-full text-center py-6 text-red-600">
        Error: ${error.message}
      </div>
    `;
  }
}

// ============================================
// SHARE FUNCTIONS
// ============================================
function shareToWhatsApp() {
  if (!currentArticle) return;
  const url = window.location.href;
  const text = `${currentArticle.title}\n\n${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}

function shareToFacebook() {
  const url = window.location.href;
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    "_blank"
  );
}

function copyLink() {
  const url = window.location.href;
  navigator.clipboard
    .writeText(url)
    .then(() => {
      alert("Link berhasil disalin!");
    })
    .catch((err) => {
      console.error("Error copying link:", err);
      alert("Gagal menyalin link");
    });
}

// ============================================
// ERROR HANDLING
// ============================================
function showError(message) {
  const main = document.querySelector("main");
  main.innerHTML = `
    <div class="text-center py-12">
      <div class="text-6xl mb-4">😞</div>
      <h2 class="text-2xl font-bold text-slate-900 mb-2">Artikel Tidak Ditemukan</h2>
      <p class="text-slate-600 mb-6">${message}</p>
      <a 
        href="/insight" 
        class="inline-block px-6 py-3 bg-amber-400 text-slate-900 font-semibold rounded-lg hover:bg-amber-500 transition"
      >
        Kembali ke Insight
      </a>
    </div>
  `;
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function getCategoryColor(category) {
  const colors = {
    Nutrisi: "bg-green-100 text-green-700",
    Ibadah: "bg-blue-100 text-blue-700",
    Kebiasaan: "bg-purple-100 text-purple-700",
    Sains: "bg-orange-100 text-orange-700",
  };
  return colors[category] || "bg-gray-100 text-gray-700";
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
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
  loadArticle();
});
