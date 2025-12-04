// Admin Dashboard JavaScript
const API_BASE = "http://localhost:3000/api";

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

  // Check if already logged in
  const session = sessionStorage.getItem("admin_session");
  if (session) {
    isLoggedIn = true;
    showDashboard();
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

// Login handling
function handleLogin(e) {
  e.preventDefault();
  console.log("[LOGIN] 🔵 Login attempt");

  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  console.log(
    "[LOGIN] Username:",
    username,
    "| Password length:",
    password.length
  );

  // Simple hardcoded auth (replace with API call later)
  if (username === "admin" && password === "docterbee2025") {
    console.log("[LOGIN] ✅ Credentials valid!");
    isLoggedIn = true;
    sessionStorage.setItem("admin_session", "logged_in");
    showDashboard();
  } else {
    console.log("[LOGIN] ❌ Invalid credentials");
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
  }
}

// ========== BOOKINGS ==========

async function loadBookings() {
  const status = document.getElementById("filterBookingStatus").value;
  const tbody = document.getElementById("bookingsTableBody");

  tbody.innerHTML =
    '<tr><td colspan="13" class="text-center p-6 text-slate-400">Loading...</td></tr>';

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
          <td class="p-3">${escapeHtml(booking.customer_name || "-")}</td>
          <td class="p-3">
            ${
              booking.customer_phone
                ? `<a href="https://wa.me/${booking.customer_phone.replace(
                    /[^0-9]/g,
                    ""
                  )}" target="_blank" class="text-emerald-400 hover:text-emerald-300">${escapeHtml(
                    booking.customer_phone
                  )}</a>`
                : "-"
            }
          </td>
          <td class="p-3 text-slate-300">
            ${
              booking.price
                ? "Rp " + new Intl.NumberFormat("id-ID").format(booking.price)
                : "-"
            }
            ${
              booking.discount_amount > 0
                ? '<div class="text-xs text-red-400">- Rp ' +
                  new Intl.NumberFormat("id-ID").format(
                    booking.discount_amount
                  ) +
                  "</div>"
                : ""
            }
          </td>
          <td class="p-3 font-semibold text-amber-300">
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
            <div class="flex gap-2">
              <button 
                data-action="view-booking"
                data-id="${booking.id}"
                class="text-amber-400 hover:text-amber-300 text-xs"
              >
                Detail
              </button>
              <button 
                data-action="delete-booking"
                data-id="${booking.id}"
                class="text-red-400 hover:text-red-300 text-xs"
              >
                Hapus
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

      // Check if table actually overflows and adjust scrollbar visibility
      checkTableOverflow();
    } else {
      tbody.innerHTML =
        '<tr><td colspan="14" class="text-center p-6 text-slate-400">Belum ada booking</td></tr>';
    }
  } catch (error) {
    console.error("Error loading bookings:", error);
    tbody.innerHTML =
      '<tr><td colspan="14" class="text-center p-6 text-red-400">Error loading data</td></tr>';
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
    const detailHTML = `
      <div class="text-left space-y-3">
        <div>
          <span class="text-slate-400 text-sm">ID Booking:</span>
          <p class="font-semibold">#${booking.id}</p>
        </div>
        <div>
          <span class="text-slate-400 text-sm">Layanan:</span>
          <p class="font-semibold">${escapeHtml(booking.service_name)}</p>
        </div>
        <div>
          <span class="text-slate-400 text-sm">Cabang:</span>
          <p>${escapeHtml(booking.branch)}</p>
        </div>
        <div>
          <span class="text-slate-400 text-sm">Praktisi:</span>
          <p>${escapeHtml(booking.practitioner)}</p>
        </div>
        <div>
          <span class="text-slate-400 text-sm">Tanggal & Waktu:</span>
          <p>${formatDate(booking.booking_date)} - ${escapeHtml(
      booking.booking_time
    )}</p>
        </div>
        <div>
          <span class="text-slate-400 text-sm">Mode:</span>
          <p class="capitalize">${escapeHtml(booking.mode)}</p>
        </div>
        ${
          booking.price
            ? `
        <hr class="border-slate-700">
        <h4 class="font-semibold text-amber-400">Rincian Harga</h4>
        <div>
          <span class="text-slate-400 text-sm">Harga Layanan:</span>
          <p class="font-semibold">Rp ${new Intl.NumberFormat("id-ID").format(
            booking.price
          )}</p>
        </div>
        ${
          booking.discount_amount > 0
            ? `
        <div>
          <span class="text-slate-400 text-sm">Diskon:</span>
          <p class="text-red-400">- Rp ${new Intl.NumberFormat("id-ID").format(
            booking.discount_amount
          )}</p>
        </div>
        `
            : ""
        }
        <div>
          <span class="text-slate-400 text-sm">Total Bayar:</span>
          <p class="font-bold text-lg text-amber-300">Rp ${new Intl.NumberFormat(
            "id-ID"
          ).format(booking.final_price || booking.price)}</p>
        </div>
        `
            : ""
        }
        ${
          booking.customer_name
            ? `
        <hr class="border-slate-700">
        <h4 class="font-semibold text-amber-400">Data Pribadi</h4>
        <div>
          <span class="text-slate-400 text-sm">Nama:</span>
          <p>${escapeHtml(booking.customer_name)}</p>
        </div>
        <div>
          <span class="text-slate-400 text-sm">No. HP:</span>
          <p><a href="https://wa.me/${booking.customer_phone.replace(
            /[^0-9]/g,
            ""
          )}" target="_blank" class="text-emerald-400 hover:text-emerald-300">${escapeHtml(
                booking.customer_phone
              )}</a></p>
        </div>
        <div>
          <span class="text-slate-400 text-sm">Umur:</span>
          <p>${booking.customer_age} tahun</p>
        </div>
        <div>
          <span class="text-slate-400 text-sm">Jenis Kelamin:</span>
          <p>${escapeHtml(booking.customer_gender)}</p>
        </div>
        <div>
          <span class="text-slate-400 text-sm">Alamat:</span>
          <p>${escapeHtml(booking.customer_address)}</p>
        </div>
        `
            : ""
        }
        ${
          booking.promo_code
            ? `
        <div>
          <span class="text-slate-400 text-sm">Kode Promo:</span>
          <p class="font-semibold text-emerald-400">${escapeHtml(
            booking.promo_code
          )}</p>
        </div>
        `
            : ""
        }
        ${
          booking.notes
            ? `
        <div>
          <span class="text-slate-400 text-sm">Catatan:</span>
          <p>${escapeHtml(booking.notes)}</p>
        </div>
        `
            : ""
        }
        <div>
          <span class="text-slate-400 text-sm">Status:</span>
          <p class="capitalize font-semibold ${
            booking.status === "completed"
              ? "text-emerald-400"
              : booking.status === "confirmed"
              ? "text-blue-400"
              : booking.status === "cancelled"
              ? "text-red-400"
              : "text-amber-400"
          }">${escapeHtml(booking.status)}</p>
        </div>
        <div>
          <span class="text-slate-400 text-sm">Dibuat:</span>
          <p class="text-sm">${formatDate(booking.created_at)}</p>
        </div>
      </div>
    `;

    alert(
      detailHTML
        .replace(/<[^>]*>/g, "\n")
        .replace(/\n+/g, "\n")
        .trim()
    );
  } catch (error) {
    console.error("Error loading booking detail:", error);
    alert("Error memuat detail booking");
  }
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
              data-action="edit-article"
              data-id="${article.id}"
              class="flex-1 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-sm"
            >
              Edit
            </button>
            <button 
              data-action="delete-article"
              data-id="${article.id}"
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
    '<div class="booking-container p-6 text-center text-slate-400">Loading...</div>';

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
          <h3 class="font-semibold mb-2">
            ${escapeHtml(event.title)}
            ${
              event.is_active === 0
                ? '<span class="ml-2 text-xs text-red-400">(Tidak Aktif)</span>'
                : ""
            }
          </h3>
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
              data-action="edit-event"
              data-id="${event.id}"
              class="flex-1 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-sm"
            >
              Edit
            </button>
            <button 
              data-action="delete-event"
              data-id="${event.id}"
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
      '<div class="booking-container p-6 text-center text-red-400">Error loading events</div>';
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
              data-action="edit-coupon"
              data-id="${coupon.id}"
              class="flex-1 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-sm"
            >
              Edit
            </button>
            <button 
              data-action="delete-coupon"
              data-id="${coupon.id}"
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
  document.getElementById("couponMinBookingValue").value = "0";
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
    minBookingValue: parseFloat(
      document.getElementById("couponMinBookingValue")?.value || 0
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
      document.getElementById("couponMinBookingValue").value =
        coupon.min_booking_value || 0;
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
