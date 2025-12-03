// Admin Dashboard JavaScript
const API_BASE = "http://localhost:3000/api";

// Simple authentication (can be improved with JWT later)
let isLoggedIn = false;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Set year
  document.getElementById("year").textContent = new Date().getFullYear();

  // Initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // Check if already logged in
  const session = sessionStorage.getItem("admin_session");
  if (session) {
    isLoggedIn = true;
    showDashboard();
  }

  // Login form
  document.getElementById("loginForm").addEventListener("submit", handleLogin);

  // Logout button
  document.getElementById("logoutBtn").addEventListener("submit", handleLogout);

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
    .addEventListener("click", openArticleModal);
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
    .addEventListener("click", openEventModal);
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
    .addEventListener("click", openCouponModal);
  document
    .getElementById("closeCouponModal")
    .addEventListener("click", closeCouponModal);
  document
    .getElementById("cancelCoupon")
    .addEventListener("click", closeCouponModal);
  document
    .getElementById("couponForm")
    .addEventListener("submit", handleCouponSubmit);
});

// Login handling
function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  // Simple hardcoded auth (replace with API call later)
  if (username === "admin" && password === "docterbee2025") {
    isLoggedIn = true;
    sessionStorage.setItem("admin_session", "logged_in");
    showDashboard();
  } else {
    document.getElementById("loginError").textContent =
      "Username atau password salah";
    document.getElementById("loginError").classList.remove("hidden");
  }
}

function handleLogout() {
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
  }
}

// ========== BOOKINGS ==========

async function loadBookings() {
  const status = document.getElementById("filterBookingStatus").value;
  const tbody = document.getElementById("bookingsTableBody");

  tbody.innerHTML =
    '<tr><td colspan="9" class="text-center p-6 text-slate-400">Loading...</td></tr>';

  try {
    const url = `${API_BASE}/bookings${status ? `?status=${status}` : ""}`;
    const response = await fetch(url);
    const result = await response.json();

    if (result.success && result.data.length > 0) {
      tbody.innerHTML = result.data
        .map(
          (booking) => `
        <tr class="border-b border-slate-800 hover:bg-slate-900/50">
          <td class="p-3">#${booking.id}</td>
          <td class="p-3">${escapeHtml(booking.service_name)}</td>
          <td class="p-3">${escapeHtml(booking.branch)}</td>
          <td class="p-3">${escapeHtml(booking.practitioner)}</td>
          <td class="p-3">${formatDate(booking.booking_date)}</td>
          <td class="p-3">${escapeHtml(booking.booking_time)}</td>
          <td class="p-3">
            <span class="px-2 py-1 rounded text-xs ${
              booking.mode === "online"
                ? "bg-emerald-900/50 text-emerald-300"
                : "bg-amber-900/50 text-amber-300"
            }">
              ${booking.mode}
            </span>
          </td>
          <td class="p-3">
            <select 
              class="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs"
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
            <button 
              onclick="viewBookingDetail(${booking.id})"
              class="text-amber-400 hover:text-amber-300 text-xs"
            >
              Detail
            </button>
          </td>
        </tr>
      `
        )
        .join("");
    } else {
      tbody.innerHTML =
        '<tr><td colspan="9" class="text-center p-6 text-slate-400">Belum ada booking</td></tr>';
    }
  } catch (error) {
    console.error("Error loading bookings:", error);
    tbody.innerHTML =
      '<tr><td colspan="9" class="text-center p-6 text-red-400">Error loading data</td></tr>';
  }
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

function viewBookingDetail(id) {
  // TODO: Show modal with full booking details
  alert(`Detail booking #${id}\n(Feature coming soon)`);
}

// ========== INSIGHT (ARTICLES) ==========

async function loadArticles() {
  const grid = document.getElementById("articlesGrid");
  grid.innerHTML =
    '<div class="booking-container p-6 text-center text-slate-400">Loading...</div>';

  try {
    const response = await fetch(`${API_BASE}/insight`);
    const result = await response.json();

    if (result.success && result.data.length > 0) {
      grid.innerHTML = result.data
        .map(
          (article) => `
        <div class="booking-container p-5">
          <h3 class="font-semibold mb-2">${escapeHtml(article.title)}</h3>
          <p class="text-sm text-slate-400 mb-3">${escapeHtml(
            article.excerpt || ""
          )}</p>
          <div class="text-xs text-slate-500 mb-3">
            <span>${formatDate(article.created_at)}</span>
            ${
              article.tags
                ? `<span class="ml-2">${escapeHtml(article.tags)}</span>`
                : ""
            }
          </div>
          <div class="flex gap-2">
            <button 
              onclick="editArticle(${article.id})"
              class="flex-1 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-sm"
            >
              Edit
            </button>
            <button 
              onclick="deleteArticle(${article.id})"
              class="px-3 py-2 rounded text-sm bg-red-900/30 hover:bg-red-900/50 text-red-400"
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
        '<div class="booking-container p-6 text-center text-slate-400">Belum ada artikel</div>';
    }
  } catch (error) {
    console.error("Error loading articles:", error);
    grid.innerHTML =
      '<div class="booking-container p-6 text-center text-red-400">Error loading data</div>';
  }
}

function openArticleModal(id = null) {
  document.getElementById("articleModal").classList.remove("hidden");
  document.getElementById("articleModalTitle").textContent = id
    ? "Edit Artikel"
    : "Artikel Baru";
  document.getElementById("articleForm").reset();
  document.getElementById("articleId").value = id || "";

  if (id) {
    // Load article data for editing
    // TODO: Fetch article by id and populate form
  }

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function closeArticleModal() {
  document.getElementById("articleModal").classList.add("hidden");
}

async function handleArticleSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("articleId").value;
  const data = {
    title: document.getElementById("articleTitle").value,
    slug: document.getElementById("articleSlug").value,
    excerpt: document.getElementById("articleExcerpt").value,
    content: document.getElementById("articleContent").value,
    tags: document.getElementById("articleTags").value,
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
      alert(id ? "Artikel berhasil diupdate" : "Artikel berhasil dibuat");
      closeArticleModal();
      loadArticles();
    } else {
      alert(result.error || "Gagal menyimpan artikel");
    }
  } catch (error) {
    console.error("Error saving article:", error);
    alert("Gagal menyimpan artikel");
  }
}

async function editArticle(id) {
  try {
    const response = await fetch(`${API_BASE}/insight/${id}`);
    const result = await response.json();

    if (result.success) {
      const article = result.data;
      document.getElementById("articleId").value = article.id;
      document.getElementById("articleTitle").value = article.title;
      document.getElementById("articleSlug").value = article.slug;
      document.getElementById("articleExcerpt").value = article.excerpt || "";
      document.getElementById("articleContent").value = article.content;
      document.getElementById("articleTags").value = article.tags || "";

      openArticleModal(id);
    }
  } catch (error) {
    console.error("Error loading article:", error);
    alert("Gagal memuat artikel");
  }
}

async function deleteArticle(id) {
  if (!confirm("Yakin ingin menghapus artikel ini?")) return;

  try {
    const response = await fetch(`${API_BASE}/insight/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();
    if (result.success) {
      alert("Artikel berhasil dihapus");
      loadArticles();
    }
  } catch (error) {
    console.error("Error deleting article:", error);
    alert("Gagal menghapus artikel");
  }
}

// ========== EVENTS ==========

async function loadEvents() {
  const grid = document.getElementById("eventsGrid");
  grid.innerHTML =
    '<div class="booking-container p-6 text-center text-slate-400">Loading...</div>';

  try {
    const response = await fetch(`${API_BASE}/events?limit=100`);
    const result = await response.json();

    if (result.success && result.data.length > 0) {
      grid.innerHTML = result.data
        .map(
          (event) => `
        <div class="booking-container p-5">
          <h3 class="font-semibold mb-2">${escapeHtml(event.title)}</h3>
          <div class="text-sm text-slate-400 space-y-1 mb-3">
            <div>📅 ${formatDate(event.event_date)}</div>
            <div>
              <span class="px-2 py-1 rounded text-xs ${
                event.mode === "online"
                  ? "bg-emerald-900/50 text-emerald-300"
                  : "bg-amber-900/50 text-amber-300"
              }">
                ${event.mode}
              </span>
              <span class="ml-2 text-xs">${escapeHtml(event.topic)}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <button 
              onclick="editEvent(${event.id})"
              class="flex-1 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-sm"
            >
              Edit
            </button>
            <button 
              onclick="deleteEvent(${event.id})"
              class="px-3 py-2 rounded text-sm bg-red-900/30 hover:bg-red-900/50 text-red-400"
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
        '<div class="booking-container p-6 text-center text-slate-400">Belum ada event</div>';
    }
  } catch (error) {
    console.error("Error loading events:", error);
    grid.innerHTML =
      '<div class="booking-container p-6 text-center text-red-400">Error loading data</div>';
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

async function handleEventSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("eventId").value;
  const data = {
    title: document.getElementById("eventTitle").value,
    eventDate: document.getElementById("eventDate").value,
    mode: document.getElementById("eventMode").value,
    topic: document.getElementById("eventTopic").value,
    description: document.getElementById("eventDescription").value,
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
      alert(id ? "Event berhasil diupdate" : "Event berhasil dibuat");
      closeEventModal();
      loadEvents();
    } else {
      alert(result.error || "Gagal menyimpan event");
    }
  } catch (error) {
    console.error("Error saving event:", error);
    alert("Gagal menyimpan event");
  }
}

async function editEvent(id) {
  try {
    const response = await fetch(`${API_BASE}/events/${id}`);
    const result = await response.json();

    if (result.success) {
      const event = result.data;
      document.getElementById("eventId").value = event.id;
      document.getElementById("eventTitle").value = event.title;
      document.getElementById("eventDate").value = event.event_date;
      document.getElementById("eventMode").value = event.mode;
      document.getElementById("eventTopic").value = event.topic;
      document.getElementById("eventDescription").value =
        event.description || "";
      document.getElementById("eventLink").value = event.link || "";

      openEventModal(id);
    }
  } catch (error) {
    console.error("Error loading event:", error);
    alert("Gagal memuat event");
  }
}

async function deleteEvent(id) {
  if (!confirm("Yakin ingin menghapus event ini?")) return;

  try {
    const response = await fetch(`${API_BASE}/events/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();
    if (result.success) {
      alert("Event berhasil dihapus");
      loadEvents();
    }
  } catch (error) {
    console.error("Error deleting event:", error);
    alert("Gagal menghapus event");
  }
}

// ========== COUPONS ==========

async function loadCoupons() {
  const grid = document.getElementById("couponsGrid");
  grid.innerHTML =
    '<div class="booking-container p-6 text-center text-slate-400">Loading...</div>';

  try {
    const response = await fetch(`${API_BASE}/coupons`);
    const result = await response.json();

    if (result.success && result.data.length > 0) {
      grid.innerHTML = result.data
        .map(
          (coupon) => `
        <div class="booking-container p-5">
          <div class="flex items-start justify-between mb-2">
            <h3 class="font-semibold text-amber-300">${escapeHtml(
              coupon.code
            )}</h3>
            <span class="text-xs px-2 py-1 rounded ${
              coupon.is_active
                ? "bg-emerald-900/50 text-emerald-300"
                : "bg-slate-800 text-slate-500"
            }">
              ${coupon.is_active ? "Aktif" : "Nonaktif"}
            </span>
          </div>
          <p class="text-sm text-slate-400 mb-2">${escapeHtml(
            coupon.description || ""
          )}</p>
          <div class="text-sm mb-3">
            <div>
              <span class="text-slate-500">Diskon:</span>
              <span class="text-amber-300 font-semibold">
                ${
                  coupon.discount_type === "percentage"
                    ? `${coupon.discount_value}%`
                    : `Rp ${formatNumber(coupon.discount_value)}`
                }
              </span>
            </div>
            <div class="text-xs text-slate-500">
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
              onclick="editCoupon(${coupon.id})"
              class="flex-1 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-sm"
            >
              Edit
            </button>
            <button 
              onclick="deleteCoupon(${coupon.id})"
              class="px-3 py-2 rounded text-sm bg-red-900/30 hover:bg-red-900/50 text-red-400"
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
        '<div class="booking-container p-6 text-center text-slate-400">Belum ada kode promo</div>';
    }
  } catch (error) {
    console.error("Error loading coupons:", error);
    grid.innerHTML =
      '<div class="booking-container p-6 text-center text-red-400">Error loading data</div>';
  }
}

function openCouponModal(id = null) {
  document.getElementById("couponModal").classList.remove("hidden");
  document.getElementById("couponModalTitle").textContent = id
    ? "Edit Kode Promo"
    : "Kode Promo Baru";
  document.getElementById("couponForm").reset();
  document.getElementById("couponId").value = id || "";
  document.getElementById("couponIsActive").checked = true;

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function closeCouponModal() {
  document.getElementById("couponModal").classList.add("hidden");
}

async function handleCouponSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("couponId").value;
  const data = {
    code: document.getElementById("couponCode").value.toUpperCase(),
    description: document.getElementById("couponDescription").value,
    discountType: document.getElementById("couponDiscountType").value,
    discountValue: parseFloat(
      document.getElementById("couponDiscountValue").value
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
      alert(id ? "Kode promo berhasil diupdate" : "Kode promo berhasil dibuat");
      closeCouponModal();
      loadCoupons();
    } else {
      alert(result.error || "Gagal menyimpan kode promo");
    }
  } catch (error) {
    console.error("Error saving coupon:", error);
    alert("Gagal menyimpan kode promo");
  }
}

async function editCoupon(id) {
  try {
    const response = await fetch(`${API_BASE}/coupons/${id}`);
    const result = await response.json();

    if (result.success) {
      const coupon = result.data;
      document.getElementById("couponId").value = coupon.id;
      document.getElementById("couponCode").value = coupon.code;
      document.getElementById("couponDescription").value =
        coupon.description || "";
      document.getElementById("couponDiscountType").value =
        coupon.discount_type;
      document.getElementById("couponDiscountValue").value =
        coupon.discount_value;
      document.getElementById("couponMaxUses").value = coupon.max_uses || "";
      if (coupon.expires_at) {
        document.getElementById("couponExpiresAt").value = coupon.expires_at
          .replace(" ", "T")
          .substring(0, 16);
      }
      document.getElementById("couponIsActive").checked =
        coupon.is_active === 1;

      openCouponModal(id);
    }
  } catch (error) {
    console.error("Error loading coupon:", error);
    alert("Gagal memuat kode promo");
  }
}

async function deleteCoupon(id) {
  if (!confirm("Yakin ingin menghapus kode promo ini?")) return;

  try {
    const response = await fetch(`${API_BASE}/coupons/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();
    if (result.success) {
      alert("Kode promo berhasil dihapus");
      loadCoupons();
    }
  } catch (error) {
    console.error("Error deleting coupon:", error);
    alert("Gagal menghapus kode promo");
  }
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
