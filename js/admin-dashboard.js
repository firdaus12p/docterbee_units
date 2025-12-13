// Admin Dashboard JavaScript
const API_BASE = "/api";

console.log("🚀 Admin Dashboard Loaded");
console.log("📍 API Base URL:", API_BASE);

// Simple authentication (can be improved with JWT later)
let isLoggedIn = false;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM Content Loaded - Initializing...");

  // Set year
  document.getElementById("year").textContent = new Date().getFullYear();

  // Initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // Check if already logged in - verify with backend
  const session = sessionStorage.getItem("admin_session");
  if (session) {
    // Verify session with backend
    checkAdminSession();
  }

  // Login form
  document.getElementById("loginForm").addEventListener("submit", handleLogin);

  // Logout button - FIX: Changed from "submit" to "click"
  document.getElementById("logoutBtn").addEventListener("click", handleLogout);

  // Tab navigation
  document.querySelectorAll(".dashboard-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const section = tab.getAttribute("data-section");
      switchSection(section);
    });
  });

  // Booking section
  document
    .getElementById("refreshBookings")
    .addEventListener("click", loadBookings);
  document
    .getElementById("filterBookingStatus")
    .addEventListener("change", loadBookings);

  // Insight section
  document
    .getElementById("btnNewArticle")
    .addEventListener("click", () => openArticleModal());
  document
    .getElementById("closeArticleModal")
    .addEventListener("click", closeArticleModal);
  document
    .getElementById("cancelArticle")
    .addEventListener("click", closeArticleModal);
  document
    .getElementById("articleForm")
    .addEventListener("submit", handleArticleSubmit);

  // Events section
  document
    .getElementById("btnNewEvent")
    .addEventListener("click", () => openEventModal());
  document
    .getElementById("closeEventModal")
    .addEventListener("click", closeEventModal);
  document
    .getElementById("cancelEvent")
    .addEventListener("click", closeEventModal);
  document
    .getElementById("eventForm")
    .addEventListener("submit", handleEventSubmit);

  // Coupons section
  document
    .getElementById("btnNewCoupon")
    .addEventListener("click", () => openCouponModal());
  document
    .getElementById("closeCouponModal")
    .addEventListener("click", closeCouponModal);
  document
    .getElementById("cancelCoupon")
    .addEventListener("click", closeCouponModal);
  document
    .getElementById("couponForm")
    .addEventListener("submit", handleCouponSubmit);

  // Services section
  document
    .getElementById("btnNewService")
    .addEventListener("click", () => openServiceModal());
  document
    .getElementById("cancelService")
    .addEventListener("click", closeServiceModal);
  document
    .getElementById("serviceForm")
    .addEventListener("submit", handleServiceSubmit);

  // Products section
  document
    .getElementById("btnNewProduct")
    .addEventListener("click", () => openProductModal());
  document
    .getElementById("cancelProduct")
    .addEventListener("click", closeProductModal);
  document
    .getElementById("productForm")
    .addEventListener("submit", handleProductSubmit);
  document
    .getElementById("productImage")
    .addEventListener("change", handleProductImageChange);
  document
    .getElementById("removeProductImageBtn")
    .addEventListener("click", removeProductImage);

  // Price input formatters for all price fields
  const priceInputs = [
    "servicePrice",
    "eventRegistrationFee",
    "couponMinBookingValue",
    "productPrice",
  ];

  priceInputs.forEach((inputId) => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener("input", formatPriceInput);
      input.addEventListener("paste", (e) => {
        // Allow paste, will be formatted by input event
        setTimeout(() => formatPriceInput(e), 0);
      });
      input.addEventListener("keypress", (e) => {
        // Only allow numbers
        if (!/[0-9]/.test(e.key)) {
          e.preventDefault();
        }
      });
    }
  });

  // Delete modal
  document.getElementById("confirmDelete").addEventListener("click", () => {
    if (deleteCallback) {
      deleteCallback();
      closeDeleteModal();
    }
  });
  document
    .getElementById("cancelDelete")
    .addEventListener("click", closeDeleteModal);

  // Close modal on overlay click
  document.getElementById("deleteModal").addEventListener("click", (e) => {
    if (e.target.id === "deleteModal") {
      closeDeleteModal();
    }
  });
});

// Check admin session with backend
async function checkAdminSession() {
  try {
    const response = await fetch(`${API_BASE}/admin/check`, {
      credentials: "include",
    });
    const data = await response.json();

    if (data.success && data.isAdmin) {
      isLoggedIn = true;
      showDashboard();
    } else {
      // Session invalid, clear local storage
      sessionStorage.removeItem("admin_session");
      isLoggedIn = false;
    }
  } catch (error) {
    console.error("[SESSION] Error checking session:", error);
    sessionStorage.removeItem("admin_session");
    isLoggedIn = false;
  }
}

// Login handling - NOW USES BACKEND API
async function handleLogin(e) {
  e.preventDefault();
  console.log("[LOGIN] 🔵 Login attempt");

  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;
  const loginError = document.getElementById("loginError");

  console.log(
    "[LOGIN] Username:",
    username,
    "| Password length:",
    password.length
  );

  try {
    const response = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("[LOGIN] ✅ Login berhasil!");
      isLoggedIn = true;
      sessionStorage.setItem("admin_session", "logged_in");
      loginError.classList.add("hidden");
      showDashboard();
    } else {
      console.log("[LOGIN] ❌ Login gagal:", data.error);
      loginError.textContent = data.error || "Username atau password salah";
      loginError.classList.remove("hidden");
    }
  } catch (error) {
    console.error("[LOGIN] ❌ Error:", error);
    loginError.textContent = "Terjadi kesalahan. Pastikan server berjalan.";
    loginError.classList.remove("hidden");
  }
}

async function handleLogout() {
  try {
    // Call backend to clear admin session
    await fetch(`${API_BASE}/admin/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("[LOGOUT] Error:", error);
  }

  isLoggedIn = false;
  sessionStorage.removeItem("admin_session");
  document.getElementById("loginOverlay").classList.remove("hidden");
  document.getElementById("dashboardContainer").classList.add("hidden");
}

function showDashboard() {
  document.getElementById("loginOverlay").classList.add("hidden");
  document.getElementById("dashboardContainer").classList.remove("hidden");

  // Load initial data
  loadBookings();

  // Refresh icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // Check table overflow after a short delay to ensure DOM is ready
  setTimeout(checkTableOverflow, 100);
}

// Tab switching
function switchSection(section) {
  // Update active tab
  document.querySelectorAll(".dashboard-tab").forEach((tab) => {
    tab.classList.remove("active");
  });
  document.querySelector(`[data-section="${section}"]`).classList.add("active");

  // Show section
  document.querySelectorAll(".dashboard-section").forEach((sec) => {
    sec.classList.add("hidden");
  });
  document.getElementById(`section-${section}`).classList.remove("hidden");

  // Load data for section
  if (section === "bookings") {
    loadBookings();
  } else if (section === "insight") {
    loadArticles();
  } else if (section === "events") {
    loadEvents();
  } else if (section === "coupons") {
    loadCoupons();
  } else if (section === "services") {
    loadServices();
  } else if (section === "products") {
    loadProducts();
  } else if (section === "orders") {
    // Load orders from orders-manager.js
    if (typeof window.loadOrders === "function") {
      window.loadOrders();
    }
  }
}

// ========== BOOKINGS ==========

async function loadBookings() {
  const status = document.getElementById("filterBookingStatus").value;
  const tbody = document.getElementById("bookingsTableBody");

  tbody.innerHTML =
    '<tr><td colspan="11" class="text-center p-6 text-white">Loading...</td></tr>';

  try {
    const url = `${API_BASE}/bookings${status ? `?status=${status}` : ""}`;
    const response = await fetch(url);
    const result = await response.json();

    if (result.success && result.data.length > 0) {
      tbody.innerHTML = result.data
        .map(
          (booking, index) => `
        <tr class="border-b border-slate-200 hover:bg-slate-50">
          <td class="p-3 text-slate-900 font-semibold">#${index + 1}</td>
          <td class="p-3 text-slate-900">${escapeHtml(
            booking.service_name
          )}</td>
          <td class="p-3 text-slate-900">${escapeHtml(booking.branch)}</td>
          <td class="p-3 text-slate-900">${escapeHtml(
            booking.practitioner
          )}</td>
          <td class="p-3 text-slate-900">${formatDate(
            booking.booking_date
          )}</td>
          <td class="p-3 text-slate-900">${escapeHtml(
            booking.booking_time
          )}</td>
          <td class="p-3">
            <span class="px-2 py-1 rounded text-xs font-semibold ${
              booking.mode === "online"
                ? "bg-emerald-500 text-white"
                : "bg-amber-500 text-white"
            }">
              ${booking.mode}
            </span>
          </td>
          <td class="p-3 text-slate-900">
            ${
              booking.price
                ? "Rp " + new Intl.NumberFormat("id-ID").format(booking.price)
                : "-"
            }
            ${
              booking.discount_amount > 0
                ? '<div class="text-xs text-red-600 font-semibold">- Rp ' +
                  new Intl.NumberFormat("id-ID").format(
                    booking.discount_amount
                  ) +
                  "</div>"
                : ""
            }
          </td>
          <td class="p-3 font-bold text-amber-600">
            ${
              booking.final_price
                ? "Rp " +
                  new Intl.NumberFormat("id-ID").format(booking.final_price)
                : booking.price
                ? "Rp " + new Intl.NumberFormat("id-ID").format(booking.price)
                : "-"
            }
          </td>
          <td class="p-3">
            <select 
              class="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-900 font-medium"
              onchange="updateBookingStatus(${booking.id}, this.value)"
            >
              <option value="pending" ${
                booking.status === "pending" ? "selected" : ""
              }>Pending</option>
              <option value="confirmed" ${
                booking.status === "confirmed" ? "selected" : ""
              }>Confirmed</option>
              <option value="completed" ${
                booking.status === "completed" ? "selected" : ""
              }>Completed</option>
              <option value="cancelled" ${
                booking.status === "cancelled" ? "selected" : ""
              }>Cancelled</option>
            </select>
          </td>
          <td class="p-3">
            <div class="flex gap-2 justify-center">
              <button 
                data-action="view-booking"
                data-id="${booking.id}"
                class="text-blue-600 hover:text-blue-700 transition-colors"
                title="Lihat detail booking"
              >
                <i data-lucide="eye" class="w-4 h-4"></i>
              </button>
              <button 
                data-action="delete-booking"
                data-id="${booking.id}"
                class="text-red-600 hover:text-red-700 transition-colors"
                title="Hapus booking"
              >
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </td>
        </tr>
      `
        )
        .join("");

      // Attach event listeners using event delegation
      tbody.querySelectorAll('[data-action="view-booking"]').forEach((btn) => {
        btn.addEventListener("click", function () {
          const id = this.getAttribute("data-id");
          viewBookingDetail(parseInt(id));
        });
      });

      tbody
        .querySelectorAll('[data-action="delete-booking"]')
        .forEach((btn) => {
          btn.addEventListener("click", function () {
            const id = this.getAttribute("data-id");
            deleteBooking(parseInt(id));
          });
        });

      // Refresh Lucide icons
      if (typeof lucide !== "undefined" && lucide.createIcons) {
        lucide.createIcons();
      }

      // Check if table actually overflows and adjust scrollbar visibility
      checkTableOverflow();
    } else {
      tbody.innerHTML =
        '<tr><td colspan="14" class="text-center p-6 text-white">Belum ada booking</td></tr>';
    }
  } catch (error) {
    console.error("Error loading bookings:", error);
    tbody.innerHTML =
      '<tr><td colspan="14" class="text-center p-6 text-red-300">Error loading data</td></tr>';
  }
}

// Helper function to check if table has overflow and manage scrollbar visibility
function checkTableOverflow() {
  const container = document.querySelector(
    ".booking-container.overflow-x-auto"
  );
  if (container) {
    const table = container.querySelector("table");
    if (table) {
      // Check if content width exceeds container width
      const hasOverflow = table.scrollWidth > container.clientWidth;

      // Add or remove a class to control scrollbar visibility
      if (hasOverflow) {
        container.style.overflowX = "auto";
      } else {
        container.style.overflowX = "hidden";
      }
    }
  }

  // Re-check on window resize
  if (!window.hasOverflowListener) {
    window.addEventListener("resize", checkTableOverflow);
    window.hasOverflowListener = true;
  }
}

async function deleteBooking(id) {
  showDeleteModal(
    "Apakah Anda yakin ingin menghapus booking ini secara permanen? Data booking dan riwayat pelanggan akan hilang selamanya.",
    async () => {
      try {
        const response = await fetch(`${API_BASE}/bookings/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();
        if (result.success) {
          showSuccessModal("Booking berhasil dihapus secara permanen");
          loadBookings();
        } else {
          alert(
            "Gagal menghapus booking: " + (result.error || "Unknown error")
          );
        }
      } catch (error) {
        console.error("Error deleting booking:", error);
        alert("Gagal menghapus booking");
      }
    }
  );
}

async function updateBookingStatus(id, status) {
  try {
    const response = await fetch(`${API_BASE}/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const result = await response.json();
    if (result.success) {
      alert("Status berhasil diupdate");
    }
  } catch (error) {
    console.error("Error updating status:", error);
    alert("Gagal update status");
  }
}

async function viewBookingDetail(id) {
  try {
    const response = await fetch(`${API_BASE}/bookings/${id}`);
    const result = await response.json();

    if (!result.success) {
      alert("Gagal memuat detail booking");
      return;
    }

    const booking = result.data;

    // Status badge color
    const statusColors = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    };

    const detailHTML = `
      <div class="space-y-6">
        <!-- Header Section -->
        <div class="flex items-start justify-between">
          <div>
            <h4 class="text-xl font-bold text-white mb-1">${escapeHtml(
              booking.service_name
            )}</h4>
            <p class="text-sm text-slate-400">Booking ID: #${booking.id}</p>
          </div>
          <span class="px-3 py-1 rounded-lg text-xs font-semibold border ${
            statusColors[booking.status] || statusColors.pending
          }">
            ${booking.status.toUpperCase()}
          </span>
        </div>

        <!-- Booking Info -->
        <div class="bg-slate-800/50 rounded-xl p-4 space-y-3">
          <div class="flex items-center gap-3">
            <i data-lucide="calendar" class="w-5 h-5 text-amber-400"></i>
            <div class="flex-1">
              <p class="text-xs text-slate-400">Tanggal & Waktu</p>
              <p class="text-white font-medium">${formatDate(
                booking.booking_date
              )} • ${escapeHtml(booking.booking_time)}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <i data-lucide="map-pin" class="w-5 h-5 text-amber-400"></i>
            <div class="flex-1">
              <p class="text-xs text-slate-400">Cabang</p>
              <p class="text-white font-medium">${escapeHtml(
                booking.branch
              )}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <i data-lucide="user-check" class="w-5 h-5 text-amber-400"></i>
            <div class="flex-1">
              <p class="text-xs text-slate-400">Praktisi</p>
              <p class="text-white font-medium">${escapeHtml(
                booking.practitioner
              )}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <i data-lucide="${
              booking.mode === "online" ? "monitor" : "building"
            }" class="w-5 h-5 text-amber-400"></i>
            <div class="flex-1">
              <p class="text-xs text-slate-400">Mode</p>
              <span class="inline-block px-2 py-1 rounded text-xs font-semibold ${
                booking.mode === "online"
                  ? "bg-emerald-500 text-white"
                  : "bg-amber-500 text-white"
              }">${booking.mode.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <!-- Customer Info -->
        ${
          booking.customer_name
            ? `
        <div class="bg-slate-800/50 rounded-xl p-4 space-y-3">
          <h5 class="font-semibold text-amber-400 flex items-center gap-2">
            <i data-lucide="user" class="w-4 h-4"></i>
            Data Customer
          </h5>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p class="text-xs text-slate-400">Nama Lengkap</p>
              <p class="text-white font-medium">${escapeHtml(
                booking.customer_name
              )}</p>
            </div>
            <div>
              <p class="text-xs text-slate-400">No. HP / WhatsApp</p>
              <p><a href="https://wa.me/${booking.customer_phone.replace(
                /[^0-9]/g,
                ""
              )}" target="_blank" class="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1">
                <i data-lucide="phone" class="w-3 h-3"></i>
                ${escapeHtml(booking.customer_phone)}
              </a></p>
            </div>
            <div>
              <p class="text-xs text-slate-400">Umur</p>
              <p class="text-white font-medium">${
                booking.customer_age
              } tahun</p>
            </div>
            <div>
              <p class="text-xs text-slate-400">Jenis Kelamin</p>
              <p class="text-white font-medium">${escapeHtml(
                booking.customer_gender
              )}</p>
            </div>
          </div>
          <div>
            <p class="text-xs text-slate-400 mb-1">Alamat Lengkap</p>
            <p class="text-white text-sm leading-relaxed">${escapeHtml(
              booking.customer_address
            )}</p>
          </div>
        </div>
        `
            : '<div class="bg-slate-800/50 rounded-xl p-4 text-center text-slate-400 text-sm">Data customer tidak tersedia</div>'
        }

        <!-- Price Info -->
        ${
          booking.price
            ? `
        <div class="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 space-y-3">
          <h5 class="font-semibold text-amber-400 flex items-center gap-2">
            <i data-lucide="receipt" class="w-4 h-4"></i>
            Rincian Pembayaran
          </h5>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-slate-300">Harga Layanan</span>
              <span class="text-white font-semibold">Rp ${new Intl.NumberFormat(
                "id-ID"
              ).format(booking.price)}</span>
            </div>
            ${
              booking.discount_amount > 0
                ? `
            <div class="flex justify-between items-center text-red-400">
              <span>Diskon ${
                booking.promo_code ? `(${booking.promo_code})` : ""
              }</span>
              <span class="font-semibold">- Rp ${new Intl.NumberFormat(
                "id-ID"
              ).format(booking.discount_amount)}</span>
            </div>
            `
                : ""
            }
            <hr class="border-slate-700">
            <div class="flex justify-between items-center text-lg">
              <span class="text-amber-300 font-semibold">Total Bayar</span>
              <span class="text-amber-300 font-bold">Rp ${new Intl.NumberFormat(
                "id-ID"
              ).format(booking.final_price || booking.price)}</span>
            </div>
          </div>
        </div>
        `
            : ""
        }

        <!-- Notes -->
        ${
          booking.notes
            ? `
        <div class="bg-slate-800/50 rounded-xl p-4">
          <h5 class="font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <i data-lucide="sticky-note" class="w-4 h-4"></i>
            Catatan
          </h5>
          <p class="text-slate-300 text-sm leading-relaxed">${escapeHtml(
            booking.notes
          )}</p>
        </div>
        `
            : ""
        }

        <!-- Timestamps -->
        <div class="text-xs text-slate-500 text-center space-y-1">
          <p>Dibuat: ${new Date(booking.created_at).toLocaleString("id-ID")}</p>
          ${
            booking.updated_at
              ? `<p>Terakhir diupdate: ${new Date(
                  booking.updated_at
                ).toLocaleString("id-ID")}</p>`
              : ""
          }
        </div>
      </div>
    `;

    // Show modal with detail
    const modal = document.getElementById("bookingDetailModal");
    const content = document.getElementById("bookingDetailContent");

    if (modal && content) {
      content.innerHTML = detailHTML;
      modal.classList.remove("hidden");
      modal.classList.add("flex");

      // Refresh Lucide icons
      if (typeof lucide !== "undefined" && lucide.createIcons) {
        lucide.createIcons();
      }
    } else {
      // Fallback to alert if modal not found
      alert(
        detailHTML
          .replace(/<[^>]*>/g, "\n")
          .replace(/\n+/g, "\n")
          .trim()
      );
    }
  } catch (error) {
    console.error("Error loading booking detail:", error);
    alert("Error memuat detail booking");
  }
}

// Function to close booking detail modal
function closeBookingDetailModal() {
  const modal = document.getElementById("bookingDetailModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

// ========== INSIGHT (ARTICLES) ==========

async function loadArticles() {
  const grid = document.getElementById("articlesGrid");
  grid.innerHTML =
    '<div class="booking-container p-6 text-center text-white">Loading...</div>';

  try {
    const response = await fetch(`${API_BASE}/insight`);
    const result = await response.json();

    if (result.success && result.data.length > 0) {
      grid.innerHTML = result.data
        .map(
          (article) => `
        <div class="booking-container p-5">
          <h3 class="font-semibold mb-2 text-slate-900">${escapeHtml(
            article.title
          )}</h3>
          <p class="text-sm text-slate-700 mb-3">${escapeHtml(
            article.excerpt || ""
          )}</p>
          <div class="text-xs text-slate-600 mb-3">
            <span>${formatDate(article.created_at)}</span>
            ${
              article.tags
                ? `<span class="ml-2">${escapeHtml(article.tags)}</span>`
                : ""
            }
          </div>
          <div class="flex gap-2">
            <button 
              data-action="edit-article"
              data-id="${article.id}"
              class="flex-1 bg-amber-500 hover:bg-amber-600 px-3 py-2 rounded text-sm text-white font-bold"
            >
              Edit
            </button>
            <button 
              data-action="delete-article"
              data-id="${article.id}"
              class="px-3 py-2 rounded text-sm bg-red-500 hover:bg-red-600 text-white font-bold"
            >
              Hapus
            </button>
          </div>
        </div>
      `
        )
        .join("");
    } else {
      grid.innerHTML =
        '<div class="booking-container p-6 text-center text-slate-700">Belum ada artikel</div>';
    }

    // Attach event listeners using event delegation
    grid.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", function () {
        const action = this.getAttribute("data-action");
        const id = this.getAttribute("data-id");

        if (action === "edit-article") {
          editArticle(parseInt(id));
        } else if (action === "delete-article") {
          deleteArticle(parseInt(id));
        }
      });
    });
  } catch (error) {
    console.error("Error loading articles:", error);
    grid.innerHTML =
      '<div class="booking-container p-6 text-center text-red-300">Error loading data</div>';
  }
}

function openArticleModal(id = null) {
  document.getElementById("articleModal").classList.remove("hidden");
  document.getElementById("articleModalTitle").textContent = id
    ? "Edit Artikel"
    : "Artikel Baru";
  document.getElementById("articleForm").reset();
  document.getElementById("articleId").value = id || "";

  // Reset header image preview (will be populated by editArticle if editing)
  document.getElementById("articleHeaderImage").value = "";
  document.getElementById("headerImagePreview").classList.add("hidden");

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function closeArticleModal() {
  document.getElementById("articleModal").classList.add("hidden");
}

let isSubmittingArticle = false;

async function handleArticleSubmit(e) {
  e.preventDefault();

  if (isSubmittingArticle) return;
  isSubmittingArticle = true;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "Menyimpan...";

  const id = document.getElementById("articleId").value;
  const data = {
    title: document.getElementById("articleTitle").value,
    slug: document.getElementById("articleSlug").value,
    excerpt: document.getElementById("articleExcerpt").value,
    content: document.getElementById("articleContent").value,
    tags: document.getElementById("articleTags").value,
    category: document.getElementById("articleCategory").value || null,
    header_image: document.getElementById("articleHeaderImage").value || null,
  };

  try {
    const url = id ? `${API_BASE}/insight/${id}` : `${API_BASE}/insight`;
    const method = id ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (result.success) {
      showSuccessModal(
        id ? "Artikel berhasil diupdate" : "Artikel berhasil dibuat"
      );
      closeArticleModal();
      loadArticles();
    } else {
      alert(result.error || "Gagal menyimpan artikel");
    }
  } catch (error) {
    console.error("Error saving article:", error);
    alert("Gagal menyimpan artikel");
  } finally {
    isSubmittingArticle = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
}

async function editArticle(id) {
  try {
    // Use /insight/id/:id endpoint to get article by ID (not slug)
    const response = await fetch(`${API_BASE}/insight/id/${id}`);
    const result = await response.json();

    if (result.success) {
      const article = result.data;
      console.log("[editArticle] Loaded article data:", article);

      // Open modal first
      openArticleModal(id);

      // Then populate with data AFTER opening
      document.getElementById("articleId").value = article.id;
      document.getElementById("articleTitle").value = article.title || "";
      document.getElementById("articleSlug").value = article.slug || "";
      document.getElementById("articleExcerpt").value = article.excerpt || "";
      document.getElementById("articleContent").value = article.content || "";
      document.getElementById("articleTags").value = article.tags || "";

      // Handle category
      if (article.category) {
        document.getElementById("articleCategory").value = article.category;
      }

      // Handle header image
      const headerImageInput = document.getElementById("articleHeaderImage");
      const headerImagePreview = document.getElementById("headerImagePreview");
      const headerImagePreviewImg = document.getElementById(
        "headerImagePreviewImg"
      );

      if (
        article.header_image &&
        headerImageInput &&
        headerImagePreview &&
        headerImagePreviewImg
      ) {
        console.log(
          "[editArticle] Setting header image:",
          article.header_image
        );
        headerImageInput.value = article.header_image;
        headerImagePreviewImg.src = article.header_image;
        headerImagePreview.classList.remove("hidden");
      } else {
        console.log("[editArticle] No header image or elements not found");
        if (headerImageInput) headerImageInput.value = "";
        if (headerImagePreview) headerImagePreview.classList.add("hidden");
      }
    } else {
      alert("Gagal memuat artikel: " + (result.error || "Unknown error"));
    }
  } catch (error) {
    console.error("Error loading article:", error);
    alert("Gagal memuat artikel");
  }
}

async function deleteArticle(id) {
  showDeleteModal(
    "Apakah Anda yakin ingin menghapus artikel ini secara permanen? Data artikel akan hilang selamanya.",
    async () => {
      try {
        const response = await fetch(`${API_BASE}/insight/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();
        if (result.success) {
          showSuccessModal("Artikel berhasil dihapus secara permanen");
          loadArticles();
        } else {
          alert(
            "Gagal menghapus artikel: " + (result.error || "Unknown error")
          );
        }
      } catch (error) {
        console.error("Error deleting article:", error);
        alert("Gagal menghapus artikel");
      }
    }
  );
}

// ========== EVENTS ==========

async function loadEvents() {
  const grid = document.getElementById("eventsGrid");
  grid.innerHTML =
    '<div class="booking-container p-6 text-center text-white">Loading...</div>';

  try {
    // Admin: includeInactive=true to see all events (active & inactive)
    const response = await fetch(
      `${API_BASE}/events?limit=100&includeInactive=true`
    );
    const result = await response.json();

    if (result.success && result.data.length > 0) {
      grid.innerHTML = result.data
        .map(
          (event) => `
        <div class="booking-container p-5 ${
          event.is_active === 0 ? "opacity-50 border-red-900/30" : ""
        }">
          <h3 class="font-semibold mb-2 text-slate-900">
            ${escapeHtml(event.title)}
            ${
              event.is_active === 0
                ? '<span class="ml-2 text-xs text-red-600 font-semibold">(Tidak Aktif)</span>'
                : ""
            }
          </h3>
          <div class="text-sm text-slate-700 space-y-1 mb-3">
            <div>📅 ${formatDate(event.event_date)}</div>
            <div>
              <span class="px-2 py-1 rounded text-xs font-semibold ${
                event.mode === "online"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }">
                ${event.mode}
              </span>
              <span class="ml-2 text-xs">${escapeHtml(event.topic)}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <button 
              data-action="edit-event"
              data-id="${event.id}"
              class="flex-1 bg-amber-500 hover:bg-amber-600 px-3 py-2 rounded text-sm text-white font-bold"
            >
              Edit
            </button>
            <button 
              data-action="delete-event"
              data-id="${event.id}"
              class="px-3 py-2 rounded text-sm bg-red-500 hover:bg-red-600 text-white font-bold"
            >
              Hapus
            </button>
          </div>
        </div>
      `
        )
        .join("");
    } else {
      grid.innerHTML =
        '<div class="booking-container p-6 text-center text-slate-700">Belum ada event</div>';
    }

    // Attach event listeners using event delegation
    grid.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", function () {
        const action = this.getAttribute("data-action");
        const id = this.getAttribute("data-id");

        if (action === "edit-event") {
          editEvent(parseInt(id));
        } else if (action === "delete-event") {
          deleteEvent(parseInt(id));
        }
      });
    });
  } catch (error) {
    console.error("Error loading events:", error);
    grid.innerHTML =
      '<div class="booking-container p-6 text-center text-red-300">Error loading events</div>';
  }
}

function openEventModal(id = null) {
  document.getElementById("eventModal").classList.remove("hidden");
  document.getElementById("eventModalTitle").textContent = id
    ? "Edit Event"
    : "Event Baru";
  document.getElementById("eventForm").reset();
  document.getElementById("eventId").value = id || "";

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function closeEventModal() {
  document.getElementById("eventModal").classList.add("hidden");
}

let isSubmittingEvent = false;

async function handleEventSubmit(e) {
  e.preventDefault();

  if (isSubmittingEvent) return;
  isSubmittingEvent = true;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "Menyimpan...";

  const id = document.getElementById("eventId").value;
  const data = {
    title: document.getElementById("eventTitle").value,
    eventDate: document.getElementById("eventDate").value,
    mode: document.getElementById("eventMode").value,
    topic: document.getElementById("eventTopic").value,
    description: document.getElementById("eventDescription").value,
    speaker: document.getElementById("eventSpeaker").value,
    registrationFee: parsePriceInput(
      document.getElementById("eventRegistrationFee").value
    ),
    registrationDeadline: document.getElementById("eventRegistrationDeadline")
      .value,
    location: document.getElementById("eventLocation").value,
    link: document.getElementById("eventLink").value,
  };

  try {
    const url = id ? `${API_BASE}/events/${id}` : `${API_BASE}/events`;
    const method = id ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (result.success) {
      showSuccessModal(
        id ? "Event berhasil diupdate" : "Event berhasil dibuat"
      );
      closeEventModal();
      loadEvents();
    } else {
      alert(result.error || "Gagal menyimpan event");
    }
  } catch (error) {
    console.error("Error saving event:", error);
    alert("Gagal menyimpan event");
  } finally {
    isSubmittingEvent = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
}

async function editEvent(id) {
  try {
    // Admin: includeInactive=true to edit inactive events
    const response = await fetch(
      `${API_BASE}/events/${id}?includeInactive=true`
    );
    const result = await response.json();

    if (result.success) {
      const event = result.data;

      // Helper function to format date for input[type="date"]
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      // Open modal first (this will reset the form)
      openEventModal(id);

      // Then populate with data AFTER opening
      document.getElementById("eventId").value = event.id;
      document.getElementById("eventTitle").value = event.title || "";
      document.getElementById("eventDate").value = formatDateForInput(
        event.event_date
      );
      document.getElementById("eventMode").value = event.mode || "online";
      document.getElementById("eventTopic").value = event.topic || "quranic";
      document.getElementById("eventDescription").value =
        event.description || "";
      document.getElementById("eventSpeaker").value = event.speaker || "";
      // Format registration fee with thousand separator
      document.getElementById("eventRegistrationFee").value = parseInt(
        event.registration_fee || 0
      ).toLocaleString("id-ID");
      document.getElementById("eventRegistrationDeadline").value =
        formatDateForInput(event.registration_deadline);
      document.getElementById("eventLocation").value = event.location || "";
      document.getElementById("eventLink").value = event.link || "";
    }
  } catch (error) {
    console.error("Error loading event:", error);
    alert("Gagal memuat event");
  }
}

async function deleteEvent(id) {
  showDeleteModal(
    "Apakah Anda yakin ingin menghapus event ini secara permanen? Data event akan hilang selamanya dan tidak dapat dipulihkan.",
    async () => {
      try {
        const response = await fetch(`${API_BASE}/events/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();
        if (result.success) {
          showSuccessModal("Event berhasil dihapus secara permanen");
          loadEvents();
        } else {
          alert(result.error || "Gagal menghapus event");
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Gagal menghapus event");
      }
    }
  );
}

// ========== COUPONS ==========

async function loadCoupons() {
  const grid = document.getElementById("couponsGrid");
  grid.innerHTML =
    '<div class="booking-container p-6 text-center text-white">Loading...</div>';

  try {
    const response = await fetch(`${API_BASE}/coupons`);
    const result = await response.json();

    if (result.success && result.data.length > 0) {
      grid.innerHTML = result.data
        .map(
          (coupon) => `
        <div class="booking-container p-5">
          <div class="flex items-start justify-between mb-2">
            <h3 class="font-semibold text-amber-600">${escapeHtml(
              coupon.code
            )}</h3>
            <span class="text-xs px-2 py-1 rounded font-semibold ${
              coupon.is_active
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-200 text-slate-600"
            }">
              ${coupon.is_active ? "Aktif" : "Nonaktif"}
            </span>
          </div>
          <p class="text-sm text-slate-700 mb-2">${escapeHtml(
            coupon.description || ""
          )}</p>
          <div class="text-sm mb-3">
            <div>
              <span class="text-slate-900">Diskon:</span>
              <span class="text-amber-600 font-bold">
                ${
                  coupon.discount_type === "percentage"
                    ? `${coupon.discount_value}%`
                    : `Rp ${formatNumber(coupon.discount_value)}`
                }
              </span>
            </div>
            <div class="text-xs text-slate-600">
              Used: ${coupon.used_count} ${
            coupon.max_uses ? `/ ${coupon.max_uses}` : ""
          }
              ${
                coupon.expires_at
                  ? `<br>Expires: ${formatDate(coupon.expires_at)}`
                  : ""
              }
            </div>
          </div>
          <div class="flex gap-2">
            <button 
              data-action="edit-coupon"
              data-id="${coupon.id}"
              class="flex-1 bg-amber-500 hover:bg-amber-600 px-3 py-2 rounded text-sm text-white font-bold"
            >
              Edit
            </button>
            <button 
              data-action="delete-coupon"
              data-id="${coupon.id}"
              class="px-3 py-2 rounded text-sm bg-red-500 hover:bg-red-600 text-white font-bold"
            >
              Hapus
            </button>
          </div>
        </div>
      `
        )
        .join("");
    } else {
      grid.innerHTML =
        '<div class="booking-container p-6 text-center text-white">Belum ada kode promo</div>';
    }

    // Attach event listeners using event delegation
    grid.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", function () {
        const action = this.getAttribute("data-action");
        const id = this.getAttribute("data-id");

        if (action === "edit-coupon") {
          editCoupon(parseInt(id));
        } else if (action === "delete-coupon") {
          deleteCoupon(parseInt(id));
        }
      });
    });
  } catch (error) {
    console.error("Error loading coupons:", error);
    grid.innerHTML =
      '<div class="booking-container p-6 text-center text-red-300">Error loading data</div>';
  }
}

function openCouponModal(id = null) {
  document.getElementById("couponModal").classList.remove("hidden");
  document.getElementById("couponModalTitle").textContent = id
    ? "Edit Kode Promo"
    : "Kode Promo Baru";
  document.getElementById("couponForm").reset();
  document.getElementById("couponId").value = id || "";
  document.getElementById("couponMinBookingValue").value = "0";
  document.getElementById("couponIsActive").checked = true;

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function closeCouponModal() {
  document.getElementById("couponModal").classList.add("hidden");
}

let isSubmittingCoupon = false;

async function handleCouponSubmit(e) {
  e.preventDefault();

  if (isSubmittingCoupon) return;
  isSubmittingCoupon = true;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "Menyimpan...";

  const id = document.getElementById("couponId").value;
  const data = {
    code: document.getElementById("couponCode").value.toUpperCase(),
    description: document.getElementById("couponDescription").value,
    discountType: document.getElementById("couponDiscountType").value,
    discountValue: parseFloat(
      document.getElementById("couponDiscountValue").value
    ),
    minBookingValue: parsePriceInput(
      document.getElementById("couponMinBookingValue")?.value || "0"
    ),
    maxUses: document.getElementById("couponMaxUses").value || null,
    expiresAt: document.getElementById("couponExpiresAt").value || null,
    isActive: document.getElementById("couponIsActive").checked,
  };

  try {
    const url = id ? `${API_BASE}/coupons/${id}` : `${API_BASE}/coupons`;
    const method = id ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (result.success) {
      showSuccessModal(
        id ? "Kode promo berhasil diupdate" : "Kode promo berhasil dibuat"
      );
      closeCouponModal();
      loadCoupons();
    } else {
      alert(result.error || "Gagal menyimpan kode promo");
    }
  } catch (error) {
    console.error("Error saving coupon:", error);
    alert("Gagal menyimpan kode promo");
  } finally {
    isSubmittingCoupon = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
}

async function editCoupon(id) {
  try {
    const response = await fetch(`${API_BASE}/coupons/${id}`);
    const result = await response.json();

    if (result.success) {
      const coupon = result.data;

      // Open modal first
      openCouponModal(id);

      // Then populate with data AFTER opening
      document.getElementById("couponId").value = coupon.id;
      document.getElementById("couponCode").value = coupon.code || "";
      document.getElementById("couponDescription").value =
        coupon.description || "";
      document.getElementById("couponDiscountType").value =
        coupon.discount_type || "percentage";
      document.getElementById("couponDiscountValue").value =
        coupon.discount_value || "";
      // Format min booking value with thousand separator
      document.getElementById("couponMinBookingValue").value = parseInt(
        coupon.min_booking_value || 0
      ).toLocaleString("id-ID");
      document.getElementById("couponMaxUses").value = coupon.max_uses || "";
      if (coupon.expires_at) {
        document.getElementById("couponExpiresAt").value = coupon.expires_at
          .replace(" ", "T")
          .substring(0, 16);
      }
      document.getElementById("couponIsActive").checked =
        coupon.is_active === 1;
    } else {
      alert("Gagal memuat kode promo: " + (result.error || "Unknown error"));
    }
  } catch (error) {
    console.error("Error loading coupon:", error);
    alert("Gagal memuat kode promo");
  }
}

async function deleteCoupon(id) {
  showDeleteModal(
    "Apakah Anda yakin ingin menghapus kode promo ini secara permanen? Kode promo akan dihapus dari database dan tidak dapat dipulihkan.",
    async () => {
      try {
        const response = await fetch(`${API_BASE}/coupons/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();
        if (result.success) {
          showSuccessModal("Kode promo berhasil dihapus secara permanen");
          loadCoupons();
        } else {
          alert(result.error || "Gagal menghapus kode promo");
        }
      } catch (error) {
        console.error("Error deleting coupon:", error);
        alert("Gagal menghapus kode promo");
      }
    }
  );
}

// ========== DELETE MODAL ==========

let deleteCallback = null;

function showDeleteModal(message, onConfirm) {
  const modal = document.getElementById("deleteModal");
  const messageEl = document.getElementById("deleteModalMessage");

  if (modal && messageEl) {
    messageEl.textContent = message;
    modal.classList.remove("hidden");
    deleteCallback = onConfirm;

    // Refresh icons
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }
}

function closeDeleteModal() {
  const modal = document.getElementById("deleteModal");
  if (modal) {
    modal.classList.add("hidden");
    deleteCallback = null;
  }
}

// ========== SUCCESS MODAL ==========

let successTimeout = null;

function showSuccessModal(message) {
  const modal = document.getElementById("successModal");
  const content = document.getElementById("successModalContent");
  const messageEl = document.getElementById("successModalMessage");

  if (modal && messageEl && content) {
    messageEl.textContent = message;
    modal.classList.remove("hidden");

    // Animate in
    setTimeout(() => {
      content.classList.remove("scale-95", "opacity-0");
      content.classList.add("scale-100", "opacity-100");
    }, 10);

    // Auto close after 2 seconds
    if (successTimeout) clearTimeout(successTimeout);
    successTimeout = setTimeout(() => {
      closeSuccessModal();
    }, 2000);

    // Close on click outside
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeSuccessModal();
      }
    };

    // Refresh icons
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }
}

function closeSuccessModal() {
  const modal = document.getElementById("successModal");
  const content = document.getElementById("successModalContent");

  if (modal && content) {
    // Animate out
    content.classList.remove("scale-100", "opacity-100");
    content.classList.add("scale-95", "opacity-0");

    setTimeout(() => {
      modal.classList.add("hidden");
    }, 300);

    if (successTimeout) {
      clearTimeout(successTimeout);
      successTimeout = null;
    }
  }
}

// ========== SERVICES FUNCTIONS ==========

async function loadServices() {
  const tbody = document.getElementById("servicesTableBody");
  tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-white font-medium">Loading...</td></tr>`;

  try {
    const response = await fetch(`${API_BASE}/services?is_active=1`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Gagal memuat data");
    }

    const services = result.data;

    if (services.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-white">Belum ada layanan</td></tr>`;
      return;
    }

    tbody.innerHTML = services
      .map(
        (service) => `
        <tr class="border-t border-slate-700 hover:bg-slate-800">
          <td class="px-3 py-3 text-white">${service.id}</td>
          <td class="px-3 py-3 font-semibold text-white">${escapeHtml(
            service.name
          )}</td>
          <td class="px-3 py-3">
            <span class="text-xs rounded-full px-2 py-1 ${getCategoryBadgeClass(
              service.category
            )}">
              ${getCategoryLabel(service.category)}
            </span>
          </td>
          <td class="px-3 py-3 text-white font-medium">Rp ${formatNumber(
            service.price
          )}</td>
          <td class="px-3 py-3 text-xs text-white">${escapeHtml(
            service.branch
          )}</td>
          <td class="px-3 py-3">
            <span class="text-xs rounded-full px-2 py-1 ${getModeBadgeClass(
              service.mode
            )}">
              ${getModeLabel(service.mode)}
            </span>
          </td>
          <td class="px-3 py-3">
            <span class="text-xs rounded-full px-2 py-1 font-semibold ${
              service.is_active
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-200 text-slate-600"
            }">
              ${service.is_active ? "Aktif" : "Nonaktif"}
            </span>
          </td>
          <td class="px-3 py-3 text-center">
            <div class="flex gap-1 justify-center">
              <button
                onclick="editService(${service.id})"
                class="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded text-xs"
                title="Edit"
              >
                Edit
              </button>
              <button
                onclick="deleteService(${service.id}, '${escapeHtml(
          service.name
        ).replace(/'/g, "\\'")}')"
                class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded text-xs"
                title="Hapus"
              >
                Hapus
              </button>
            </div>
          </td>
        </tr>
      `
      )
      .join("");

    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  } catch (error) {
    console.error("Error loading services:", error);
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-red-400 font-semibold">Error: ${error.message}</td></tr>`;
  }
}

function getCategoryLabel(category) {
  const labels = {
    manual: "Manual Therapy",
    klinis: "Layanan Klinis",
    konsultasi: "Konsultasi",
    perawatan: "Perawatan",
  };
  return labels[category] || category;
}

function getCategoryBadgeClass(category) {
  const classes = {
    manual: "bg-amber-100 text-amber-700 font-semibold",
    klinis: "bg-sky-100 text-sky-700 font-semibold",
    konsultasi: "bg-purple-100 text-purple-700 font-semibold",
    perawatan: "bg-emerald-100 text-emerald-700 font-semibold",
  };
  return classes[category] || "bg-slate-200 text-slate-700";
}

function getModeLabel(mode) {
  const labels = {
    online: "Online",
    offline: "Offline",
    both: "Online & Offline",
  };
  return labels[mode] || mode;
}

function getModeBadgeClass(mode) {
  const classes = {
    online: "bg-blue-100 text-blue-700 font-semibold",
    offline: "bg-green-100 text-green-700 font-semibold",
    both: "bg-purple-100 text-purple-700 font-semibold",
  };
  return classes[mode] || "bg-slate-200 text-slate-700";
}

function openServiceModal(id = null) {
  const modal = document.getElementById("serviceModal");
  const title = document.getElementById("serviceModalTitle");
  const form = document.getElementById("serviceForm");

  form.reset();
  document.getElementById("serviceId").value = "";
  document.getElementById("serviceIsActive").checked = true;

  // Uncheck all branch checkboxes
  document
    .querySelectorAll('input[name="serviceBranch"]')
    .forEach((checkbox) => {
      checkbox.checked = false;
    });

  if (id) {
    title.textContent = "Edit Service";
    // Load service data will be done in editService function
  } else {
    title.textContent = "Tambah Service Baru";
  }

  modal.classList.remove("hidden");

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function closeServiceModal() {
  const modal = document.getElementById("serviceModal");
  modal.classList.add("hidden");
}

let isSubmittingService = false;

async function handleServiceSubmit(e) {
  e.preventDefault();

  if (isSubmittingService) return;
  isSubmittingService = true;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "Menyimpan...";

  const id = document.getElementById("serviceId").value;
  const name = document.getElementById("serviceName").value.trim();
  const category = document.getElementById("serviceCategory").value;
  const priceFormatted = document.getElementById("servicePrice").value;
  const description = document
    .getElementById("serviceDescription")
    .value.trim();

  // Get selected branches from checkboxes
  const branchCheckboxes = document.querySelectorAll(
    'input[name="serviceBranch"]:checked'
  );
  const selectedBranches = Array.from(branchCheckboxes).map((cb) => cb.value);
  const branch = selectedBranches.join(", ");

  // Validation: at least one branch must be selected
  if (selectedBranches.length === 0) {
    alert("Pilih minimal satu cabang/kota");
    return;
  }

  const mode = document.getElementById("serviceMode").value;
  const practitioner = document
    .getElementById("servicePractitioner")
    .value.trim();
  const is_active = document.getElementById("serviceIsActive").checked;

  const data = {
    name,
    category,
    price: parsePriceInput(priceFormatted),
    description,
    branch,
    mode,
    practitioner: practitioner || null,
    is_active: is_active ? 1 : 0,
  };

  try {
    const url = id ? `${API_BASE}/services/${id}` : `${API_BASE}/services`;
    const method = id ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Gagal menyimpan data");
    }

    showSuccessModal(
      id ? "Layanan berhasil diupdate" : "Layanan berhasil dibuat"
    );
    closeServiceModal();
    loadServices();
  } catch (error) {
    console.error("Error saving service:", error);
    alert("Error: " + error.message);
  } finally {
    isSubmittingService = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
}

async function editService(id) {
  try {
    const response = await fetch(`${API_BASE}/services/${id}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Gagal memuat data");
    }

    const service = result.data;

    // Open modal first
    openServiceModal(id);

    // Then populate fields
    document.getElementById("serviceId").value = service.id;
    document.getElementById("serviceName").value = service.name;
    document.getElementById("serviceCategory").value = service.category;
    // Format price with thousand separator
    document.getElementById("servicePrice").value = parseInt(
      service.price
    ).toLocaleString("id-ID");
    document.getElementById("serviceDescription").value = service.description;

    // Parse branch string and check appropriate checkboxes
    const branches = service.branch.split(",").map((b) => b.trim());
    document
      .querySelectorAll('input[name="serviceBranch"]')
      .forEach((checkbox) => {
        checkbox.checked = branches.includes(checkbox.value);
      });
    document.getElementById("serviceMode").value = service.mode;
    document.getElementById("servicePractitioner").value =
      service.practitioner || "";
    document.getElementById("serviceIsActive").checked =
      service.is_active === 1;
  } catch (error) {
    console.error("Error loading service:", error);
    alert("Error: " + error.message);
  }
}

function deleteService(id, name) {
  showDeleteModal(
    `Apakah Anda yakin ingin menghapus layanan "${name}"? Layanan akan dihapus dari sistem (soft delete).`,
    async () => {
      try {
        const response = await fetch(`${API_BASE}/services/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (result.success) {
          showSuccessModal("Layanan berhasil dihapus");
          loadServices();
        } else {
          alert(result.error || "Gagal menghapus layanan");
        }
      } catch (error) {
        console.error("Error deleting service:", error);
        alert("Gagal menghapus layanan");
      }
    }
  );
}

// ========== PRODUCTS CRUD ==========

async function loadProducts() {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML =
    '<div class="booking-container p-6 text-center text-white">Loading...</div>';

  try {
    const response = await fetch(`${API_BASE}/products`);
    const result = await response.json();

    if (result.success && result.data.length > 0) {
      grid.innerHTML = result.data
        .map(
          (product) => `
        <div class="booking-container p-5 ${
          product.is_active === 0 ? "opacity-50 border-red-900/30" : ""
        }">
          ${
            product.image_url
              ? `<img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(
                  product.name
                )}" class="w-full h-32 object-cover rounded-lg mb-3" />`
              : `<div class="w-full h-32 bg-slate-800 rounded-lg mb-3 flex items-center justify-center text-slate-500 text-sm">
                  <i data-lucide="image-off" class="w-8 h-8"></i>
                 </div>`
          }
          <h3 class="font-semibold mb-2 text-slate-900">
            ${escapeHtml(product.name)}
            ${
              product.is_active === 0
                ? '<span class="ml-2 text-xs text-red-600 font-semibold">(Tidak Aktif)</span>'
                : ""
            }
          </h3>
          <div class="text-sm text-slate-700 space-y-1 mb-3">
            <div>
              <span class="text-xs px-2 py-1 rounded ${getProductCategoryBadgeClass(
                product.category
              )}">
                ${getProductCategoryIcon(product.category)} ${escapeHtml(
            product.category
          )}
              </span>
            </div>
            <div class="font-bold text-amber-600">Rp ${formatNumber(
              product.price
            )}</div>
            <div class="text-xs text-slate-700">
              Stok: <span class="font-semibold ${
                product.stock > 0 ? "text-emerald-600" : "text-red-600"
              }">${product.stock}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <button 
              data-action="edit-product"
              data-id="${product.id}"
              class="flex-1 bg-amber-500 hover:bg-amber-600 px-3 py-2 rounded text-sm text-white font-bold"
            >
              Edit
            </button>
            <button 
              data-action="delete-product"
              data-id="${product.id}"
              data-name="${escapeHtml(product.name)}"
              class="px-3 py-2 rounded text-sm bg-red-500 hover:bg-red-600 text-white font-bold"
            >
              Hapus
            </button>
          </div>
        </div>
      `
        )
        .join("");
    } else {
      grid.innerHTML =
        '<div class="booking-container p-6 text-center text-slate-700">Belum ada produk</div>';
    }

    // Attach event listeners using event delegation
    grid.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", function () {
        const action = this.getAttribute("data-action");
        const id = this.getAttribute("data-id");

        if (action === "edit-product") {
          editProduct(parseInt(id));
        } else if (action === "delete-product") {
          const name = this.getAttribute("data-name");
          deleteProduct(parseInt(id), name);
        }
      });
    });

    // Re-create icons
    if (typeof lucide !== "undefined" && lucide.createIcons) {
      lucide.createIcons();
    }
  } catch (error) {
    console.error("Error loading products:", error);
    grid.innerHTML =
      '<div class="booking-container p-6 text-center text-red-400">Error loading data</div>';
  }
}

function openProductModal(id = null) {
  const modal = document.getElementById("productModal");
  const title = document.getElementById("productModalTitle");
  const form = document.getElementById("productForm");

  if (id) {
    title.textContent = "Edit Produk";
  } else {
    title.textContent = "Tambah Produk";
    form.reset();
    document.getElementById("productId").value = "";
    document.getElementById("productImageUrl").value = "";
    hideProductImagePreview();
  }

  modal.classList.remove("hidden");
}

function handleProductImageChange(e) {
  const file = e.target.files[0];

  if (!file) {
    hideProductImagePreview();
    return;
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    alert("Format file tidak didukung. Gunakan JPG, PNG, atau WebP.");
    e.target.value = "";
    hideProductImagePreview();
    return;
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    alert("Ukuran file terlalu besar. Maksimal 5MB.");
    e.target.value = "";
    hideProductImagePreview();
    return;
  }

  // Show preview
  const reader = new FileReader();
  reader.onload = function (e) {
    const preview = document.getElementById("productImagePreview");
    const img = document.getElementById("productImagePreviewImg");
    img.src = e.target.result;
    preview.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
}

function hideProductImagePreview() {
  const preview = document.getElementById("productImagePreview");
  const img = document.getElementById("productImagePreviewImg");
  preview.classList.add("hidden");
  img.src = "";
}

function removeProductImage() {
  document.getElementById("productImage").value = "";
  document.getElementById("productImageUrl").value = "";
  hideProductImagePreview();
}

function closeProductModal() {
  const modal = document.getElementById("productModal");
  modal.classList.add("hidden");
  document.getElementById("productForm").reset();
}

let isSubmittingProduct = false;

async function handleProductSubmit(e) {
  e.preventDefault();

  // Prevent double submission
  if (isSubmittingProduct) {
    console.log("⚠️ Product submission already in progress");
    return;
  }

  const id = document.getElementById("productId").value;
  const name = document.getElementById("productName").value.trim();
  const category = document.getElementById("productCategory").value;
  const priceInput = document.getElementById("productPrice").value.trim();
  const price = parsePriceInput(priceInput);
  const description = document
    .getElementById("productDescription")
    .value.trim();
  const stock = parseInt(document.getElementById("productStock").value) || 0;
  const imageFile = document.getElementById("productImage").files[0];
  const existingImageUrl = document.getElementById("productImageUrl").value;

  if (!name || !category || !description) {
    alert("Mohon isi semua field yang wajib diisi");
    return;
  }

  if (!priceInput || price <= 0) {
    alert("Mohon masukkan harga yang valid (contoh: 20.000)");
    return;
  }

  // Set flag and disable button
  isSubmittingProduct = true;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "Menyimpan...";

  try {
    let image_url = existingImageUrl || null;

    // Upload new image if selected
    if (imageFile) {
      const formData = new FormData();
      formData.append("image", imageFile);

      const uploadResponse = await fetch(`${API_BASE}/upload/product-image`, {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success) {
        alert(uploadResult.error || "Gagal mengupload gambar");
        return;
      }

      image_url = uploadResult.data.url;
    }

    const data = {
      name,
      category,
      price,
      description,
      image_url,
      stock,
    };

    const url = id ? `${API_BASE}/products/${id}` : `${API_BASE}/products`;
    const method = id ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      showSuccessModal(
        id ? "Produk berhasil diupdate" : "Produk baru berhasil ditambahkan"
      );
      closeProductModal();
      loadProducts();
    } else {
      alert(result.error || "Gagal menyimpan produk");
    }
  } catch (error) {
    console.error("Error saving product:", error);
    alert("Gagal menyimpan produk: " + error.message);
  } finally {
    // Reset flag and button
    isSubmittingProduct = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
}

async function editProduct(id) {
  try {
    const response = await fetch(`${API_BASE}/products/${id}`);
    const result = await response.json();

    if (!result.success || !result.data) {
      alert("Produk tidak ditemukan");
      return;
    }

    const product = result.data;

    // Open modal first
    openProductModal(id);

    // Then populate fields
    document.getElementById("productId").value = product.id;
    document.getElementById("productName").value = product.name;
    document.getElementById("productCategory").value = product.category;
    // Format price with thousand separator
    document.getElementById("productPrice").value = parseInt(
      product.price
    ).toLocaleString("id-ID");
    document.getElementById("productDescription").value = product.description;
    document.getElementById("productStock").value = product.stock || 0;

    // Handle existing image
    if (product.image_url) {
      document.getElementById("productImageUrl").value = product.image_url;
      const preview = document.getElementById("productImagePreview");
      const img = document.getElementById("productImagePreviewImg");
      img.src = product.image_url;
      preview.classList.remove("hidden");
    } else {
      hideProductImagePreview();
    }
  } catch (error) {
    console.error("Error loading product:", error);
    alert("Error: " + error.message);
  }
}

function deleteProduct(id, name) {
  showDeleteModal(
    `Apakah Anda yakin ingin menghapus produk "${name}"? Produk akan dihapus dari sistem (soft delete).`,
    async () => {
      try {
        const response = await fetch(`${API_BASE}/products/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (result.success) {
          showSuccessModal("Produk berhasil dihapus");
          loadProducts();
        } else {
          alert(result.error || "Gagal menghapus produk");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Gagal menghapus produk");
      }
    }
  );
}

function getProductCategoryBadgeClass(category) {
  const badgeClasses = {
    "Zona Sunnah": "bg-purple-100 text-purple-700 font-semibold",
    "1001 Rempah": "bg-orange-100 text-orange-700 font-semibold",
    "Zona Honey": "bg-amber-100 text-amber-700 font-semibold",
    "Cold Pressed": "bg-green-100 text-green-700 font-semibold",
  };
  return badgeClasses[category] || "bg-slate-200 text-slate-700";
}

function getProductCategoryIcon(category) {
  const icons = {
    "Zona Sunnah": "🌙",
    "1001 Rempah": "🧂",
    "Zona Honey": "🍯",
    "Cold Pressed": "🥤",
  };
  return icons[category] || "📦";
}

// ========== UTILITIES ==========

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatNumber(num) {
  return new Intl.NumberFormat("id-ID").format(num);
}

/**
 * Format price input with thousand separator (dots)
 * Example: 150000 -> 150.000
 */
function formatPriceInput(e) {
  let value = e.target.value;

  // Remove all non-numeric characters
  value = value.replace(/\D/g, "");

  // Format with thousand separator (dots)
  if (value) {
    value = parseInt(value).toLocaleString("id-ID");
  }

  e.target.value = value;
}

/**
 * Parse formatted price to number
 * Example: 150.000 -> 150000
 */
function parsePriceInput(formattedPrice) {
  if (!formattedPrice) return 0;
  return parseInt(formattedPrice.replace(/\./g, "")) || 0;
}

// ============================================
// INSIGHT MANAGER - IMAGE UPLOAD FUNCTIONS
// ============================================

// Upload header image for Insight
async function uploadInsightHeaderImage(input) {
  const file = input.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith("image/")) {
    alert("File harus berupa gambar (JPG, PNG, GIF, dll)");
    input.value = "";
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert("Ukuran file maksimal 5MB");
    input.value = "";
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Gagal upload gambar");
    }

    // Set hidden input value
    document.getElementById("insightHeaderImage").value = result.filePath;

    // Show preview
    const preview = document.getElementById("insightHeaderImagePreview");
    const img = document.getElementById("insightHeaderImagePreviewImg");
    img.src = result.filePath;
    preview.classList.remove("hidden");

    console.log("✅ Insight header image uploaded:", result.filePath);
  } catch (error) {
    console.error("Error uploading insight header image:", error);
    alert("Error upload gambar: " + error.message);
    input.value = "";
  }
}

// Upload content image for Insight
async function uploadInsightContentImage() {
  // Create temporary file input
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar (JPG, PNG, GIF, dll)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Gagal upload gambar");
      }

      // Insert image tag at cursor position in textarea
      const textarea = document.getElementById("articleContent");
      const imageTag = `\n<img src="${result.filePath}" alt="Gambar artikel" class="w-full rounded-lg my-4">\n`;

      const cursorPos = textarea.selectionStart;
      const textBefore = textarea.value.substring(0, cursorPos);
      const textAfter = textarea.value.substring(cursorPos);

      textarea.value = textBefore + imageTag + textAfter;

      // Set cursor after inserted image
      textarea.selectionStart = textarea.selectionEnd =
        cursorPos + imageTag.length;
      textarea.focus();

      console.log(
        "✅ Insight content image uploaded and inserted:",
        result.filePath
      );
    } catch (error) {
      console.error("Error uploading insight content image:", error);
      alert("Error upload gambar: " + error.message);
    }
  };

  input.click();
}

// Remove header image for Insight
function removeInsightHeaderImage() {
  document.getElementById("insightHeaderImage").value = "";
  document.getElementById("insightHeaderImageFile").value = "";
  document.getElementById("insightHeaderImagePreview").classList.add("hidden");
}

// ============================================
// ARTICLES MANAGER - IMAGE UPLOAD FUNCTIONS
// ============================================

// Upload header image for Articles
async function uploadHeaderImage(input) {
  const file = input.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("File harus berupa gambar (JPG, PNG, GIF, dll)");
    input.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("Ukuran file maksimal 5MB");
    input.value = "";
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Gagal upload gambar");
    }

    document.getElementById("articleHeaderImage").value = result.filePath;

    const preview = document.getElementById("headerImagePreview");
    const img = document.getElementById("headerImagePreviewImg");
    img.src = result.filePath;
    preview.classList.remove("hidden");

    console.log("✅ Article header image uploaded:", result.filePath);
  } catch (error) {
    console.error("Error uploading article header image:", error);
    alert("Error upload gambar: " + error.message);
    input.value = "";
  }
}

// Upload content image for Articles
async function uploadContentImage() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar (JPG, PNG, GIF, dll)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Gagal upload gambar");
      }

      const textarea = document.getElementById("articleContent");
      const imageTag = `\n<img src="${result.filePath}" alt="Gambar artikel" class="w-full rounded-lg my-4">\n`;

      const cursorPos = textarea.selectionStart;
      const textBefore = textarea.value.substring(0, cursorPos);
      const textAfter = textarea.value.substring(cursorPos);

      textarea.value = textBefore + imageTag + textAfter;
      textarea.selectionStart = textarea.selectionEnd =
        cursorPos + imageTag.length;
      textarea.focus();

      console.log("✅ Article content image uploaded:", result.filePath);
    } catch (error) {
      console.error("Error uploading article content image:", error);
      alert("Error upload gambar: " + error.message);
    }
  };

  input.click();
}

// Remove header image for Articles
function removeHeaderImage() {
  document.getElementById("articleHeaderImage").value = "";
  document.getElementById("articleHeaderImageFile").value = "";
  document.getElementById("headerImagePreview").classList.add("hidden");
}

// Expose functions to window
window.uploadInsightHeaderImage = uploadInsightHeaderImage;
window.uploadInsightContentImage = uploadInsightContentImage;
window.removeInsightHeaderImage = removeInsightHeaderImage;
window.uploadHeaderImage = uploadHeaderImage;
window.uploadContentImage = uploadContentImage;
window.removeHeaderImage = removeHeaderImage;
