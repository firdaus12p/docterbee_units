// ============================================
// INSIGHT PAGE - Articles Loader with Points System
// ============================================

// ============================================
// HELPER FUNCTIONS
// Note: escapeHtml, formatDate, and getCategoryColor are defined in utils.js (global)
// ============================================

/**
 * Render a single article card HTML with unlock status
 * @param {Object} article - Article data object
 * @returns {string} HTML string for article card
 */
function renderArticleCard(article) {
  const isFree = article.is_free || article.points_cost === 0;
  const isUnlocked = article.is_unlocked;
  const canRead = isFree || isUnlocked;
  
  // Access badge
  let accessBadge = '';
  if (isFree) {
    accessBadge = `
      <span class="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
        Gratis
      </span>
    `;
  } else if (isUnlocked) {
    accessBadge = `
      <span class="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
        Sudah Dibeli
      </span>
    `;
  } else {
    accessBadge = `
      <span class="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1C8.676 1 6 3.676 6 7v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V11a2 2 0 00-2-2h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10a2 2 0 110 4 2 2 0 010-4z"/></svg>
        ${article.points_cost} Poin
      </span>
    `;
  }

  // Overlay for locked articles
  const lockedOverlay = !canRead ? `
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl">
      <svg class="w-10 h-10 text-amber-400 mb-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 1C8.676 1 6 3.676 6 7v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V11a2 2 0 00-2-2h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10a2 2 0 110 4 2 2 0 010-4z"/>
      </svg>
      <p class="text-white font-semibold text-sm">Buka dengan ${article.points_cost} Poin</p>
      <p class="text-slate-300 text-xs mt-1">Klik untuk membeli</p>
    </div>
  ` : '';

  const clickHandler = canRead 
    ? `openArticle('${article.slug}')`
    : `showUnlockModal(${article.id}, '${escapeHtml(article.title).replace(/'/g, "\\'")}', ${article.points_cost})`;

  return `
    <article 
      class="article-card group relative bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${!canRead ? 'ring-2 ring-amber-300' : ''}"
      onclick="${clickHandler}"
    >
      ${article.header_image ? `
        <div class="article-image relative">
          <img 
            src="${article.header_image}" 
            alt="${escapeHtml(article.title)}"
            class="w-full h-36 object-cover ${!canRead ? 'grayscale-[30%]' : ''}"
            onerror="this.parentElement.style.display='none'"
          >
          ${!canRead ? '<div class="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>' : ''}
        </div>
      ` : ""}
      <div class="p-4">
        <div class="flex items-center gap-2 mb-2 flex-wrap">
          <span class="text-xs font-semibold px-2 py-1 rounded-full ${getCategoryColor(article.category)}">
            ${article.category || 'Umum'}
          </span>
          ${accessBadge}
        </div>
        <h3 class="text-base font-bold text-slate-900 mb-2 line-clamp-2">
          ${escapeHtml(article.title)}
        </h3>
        ${article.excerpt ? `
          <p class="text-sm text-slate-600 line-clamp-2 mb-2">
            ${escapeHtml(article.excerpt)}
          </p>
        ` : ""}
        <div class="article-meta flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-slate-500 mt-3 pt-2 border-t border-gray-100">
          <span>${article.author || 'DocterBee'}</span>
          <span>${formatDate(article.created_at)}</span>
        </div>
      </div>
      ${lockedOverlay}
    </article>
  `;
}

// ============================================
// UNLOCK MODAL - Buy Article with Points
// ============================================

/**
 * Show unlock modal for purchasing article
 */
async function showUnlockModal(articleId, articleTitle, pointsCost) {
  // Check if user is logged in first
  try {
    const authResponse = await fetch('/api/auth/check', { credentials: 'include' });
    const authResult = await authResponse.json();
    
    if (!authResult.loggedIn) {
      // Show login prompt
      if (typeof showWarning === 'function') {
        showWarning('Silakan login terlebih dahulu untuk membeli artikel dengan poin.');
      } else {
        alert('Silakan login terlebih dahulu untuk membeli artikel dengan poin.');
      }
      // Redirect to login
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    
    // Get user's current points
    const progressResponse = await fetch('/api/user-data/progress', { credentials: 'include' });
    const progressResult = await progressResponse.json();
    const currentPoints = progressResult.success ? (progressResult.data?.points || 0) : 0;
    
    // Create and show modal
    const hasEnoughPoints = currentPoints >= pointsCost;
    
    const modalHTML = `
      <div id="unlockArticleModal" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onclick="closeUnlockModal(event)">
        <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onclick="event.stopPropagation()">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1C8.676 1 6 3.676 6 7v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V11a2 2 0 00-2-2h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10a2 2 0 110 4 2 2 0 010-4z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">Buka Artikel</h3>
            <p class="text-slate-600 text-sm">"${articleTitle}"</p>
          </div>
          
          <div class="bg-slate-50 rounded-xl p-4 mb-6">
            <div class="flex justify-between items-center mb-2">
              <span class="text-slate-600">Poin Anda saat ini</span>
              <span class="font-bold text-slate-900">${currentPoints} Poin</span>
            </div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-slate-600">Biaya artikel</span>
              <span class="font-bold text-amber-600">-${pointsCost} Poin</span>
            </div>
            <hr class="my-2 border-slate-200">
            <div class="flex justify-between items-center">
              <span class="text-slate-600">Sisa setelah pembelian</span>
              <span class="font-bold ${hasEnoughPoints ? 'text-emerald-600' : 'text-red-600'}">
                ${hasEnoughPoints ? currentPoints - pointsCost : 'Tidak cukup'} ${hasEnoughPoints ? 'Poin' : ''}
              </span>
            </div>
          </div>
          
          ${!hasEnoughPoints ? `
            <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p class="text-red-700 text-sm text-center">
                <strong>Poin tidak cukup!</strong> Anda membutuhkan ${pointsCost - currentPoints} poin lagi.
              </p>
            </div>
          ` : ''}
          
          <div class="flex gap-3">
            <button 
              onclick="closeUnlockModal()"
              class="flex-1 px-4 py-3 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button 
              onclick="confirmUnlockArticle(${articleId})"
              class="flex-1 px-4 py-3 rounded-xl font-semibold transition ${
                hasEnoughPoints 
                  ? 'bg-amber-500 text-white hover:bg-amber-600' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }"
              ${!hasEnoughPoints ? 'disabled' : ''}
            >
              ${hasEnoughPoints ? 'Beli Sekarang' : 'Poin Tidak Cukup'}
            </button>
          </div>
          
          <p class="text-xs text-slate-500 text-center mt-4">
            💡 Setelah dibeli, artikel ini akan selamanya dapat Anda baca.
          </p>
        </div>
      </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('unlockArticleModal');
    if (existingModal) existingModal.remove();
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
  } catch (error) {
    console.error('Error showing unlock modal:', error);
    alert('Terjadi kesalahan. Silakan coba lagi.');
  }
}

/**
 * Close unlock modal
 */
function closeUnlockModal(event) {
  if (event && event.target.id !== 'unlockArticleModal') return;
  const modal = document.getElementById('unlockArticleModal');
  if (modal) modal.remove();
}

/**
 * Confirm and execute article unlock (point deduction)
 */
async function confirmUnlockArticle(articleId) {
  const modal = document.getElementById('unlockArticleModal');
  const confirmBtn = modal?.querySelector('button:last-child');
  
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<span class="inline-block animate-spin mr-2">⏳</span> Memproses...';
  }
  
  try {
    const response = await fetch(`/api/insight/${articleId}/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Close modal
      closeUnlockModal();
      
      // Show success message
      if (typeof showSuccess === 'function') {
        showSuccess(result.message || 'Artikel berhasil dibeli!');
      } else {
        alert(result.message || 'Artikel berhasil dibeli!');
      }
      
      // Refresh points display if function exists
      if (typeof refreshNav === 'function') {
        refreshNav();
      }
      
      // Reload articles to reflect new unlock status
      loadInsightArticles();
      
      // If already_free or already_unlocked, redirect to article
      if (result.already_free || result.already_unlocked) {
        // Article already accessible, find and open it
        setTimeout(() => {
          // Find the article slug from DOM if available
          const articleCards = document.querySelectorAll('.article-card');
          articleCards.forEach(card => {
            const onclick = card.getAttribute('onclick');
            if (onclick && onclick.includes(articleId)) {
              // Extract slug if possible, or reload
              loadInsightArticles();
            }
          });
        }, 500);
      }
    } else {
      // Handle specific errors
      if (result.error === 'INSUFFICIENT_POINTS') {
        if (typeof showWarning === 'function') {
          showWarning(result.message || 'Poin tidak cukup!');
        } else {
          alert(result.message || 'Poin tidak cukup!');
        }
      } else {
        throw new Error(result.error || result.message || 'Gagal membeli artikel');
      }
      
      // Re-enable button
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Beli Sekarang';
      }
    }
  } catch (error) {
    console.error('Error unlocking article:', error);
    alert('Gagal membeli artikel: ' + error.message);
    
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = 'Beli Sekarang';
    }
  }
}

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
    // Use /api/insight which now includes unlock status per user
    const response = await fetch("/api/insight", { credentials: 'include' });
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Gagal memuat artikel");
    }

    const articles = result.data;

    console.log("📦 Articles loaded:", articles.length);
    if (articles.length > 0) {
      console.log("📄 First article sample:", {
        title: articles[0].title,
        is_free: articles[0].is_free,
        points_cost: articles[0].points_cost,
        is_unlocked: articles[0].is_unlocked
      });
    }

    if (articles.length === 0) {
      articlesContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-slate-600">Belum ada artikel tersedia.</p>
        </div>
      `;
      return;
    }

    // Render articles using shared helper
    articlesContainer.innerHTML = articles
      .map((article) => renderArticleCard(article))
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
    const response = await fetch("/api/insight", { credentials: 'include' });
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

    // Render filtered articles using shared helper
    articlesContainer.innerHTML = articles
      .map((article) => renderArticleCard(article))
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
