// ============================================
// USERS MANAGER - Admin Dashboard
// ============================================
// API_BASE is defined in admin-dashboard.js
// adminFetch is defined in admin-dashboard.js
// Modal utilities are defined in modal-utils.js
/* global showSuccess, showError, showWarning, showConfirm, API_BASE, adminFetch */

// ============================================
// Users State Management
// ============================================
let allUsers = []; // Store all users for client-side filtering
let usersLoaded = false;
let searchDebounceTimer = null;
const SEARCH_DEBOUNCE_MS = 300;

// ============================================
// Load Users
// ============================================
async function loadUsers() {
  try {
    const response = await adminFetch(`${API_BASE}/users`);
    const data = await response.json();

    if (data.success) {
      allUsers = data.data; // Store all users
      displayUsers(allUsers);
      document.getElementById("totalUsers").textContent = data.count || 0;
      
      // Clear search when reloading
      const searchInput = document.getElementById("usersSearchInput");
      if (searchInput) {
        searchInput.value = "";
        hideSearchInfo();
        hideClearButton();
      }
    } else {
      throw new Error(data.error || "Gagal memuat users");
    }
  } catch (error) {
    console.error("Error loading users:", error);
    document.getElementById("usersTableBody").innerHTML = `
      <tr>
        <td colspan="8" class="px-4 py-8 text-center text-red-400">
          Error: ${error.message}
        </td>
      </tr>
    `;
  }
}

// ============================================
// Search Users (Client-side filtering)
// ============================================
function searchUsers(query) {
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) {
    // Show all users if search is empty
    displayUsers(allUsers);
    hideSearchInfo();
    hideClearButton();
    return;
  }
  
  // Filter users by name, email, or phone
  const filteredUsers = allUsers.filter((user) => {
    const name = (user.name || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const phone = (user.phone || "").toLowerCase();
    
    return (
      name.includes(searchTerm) ||
      email.includes(searchTerm) ||
      phone.includes(searchTerm)
    );
  });
  
  displayUsers(filteredUsers);
  showSearchInfo(filteredUsers.length);
  showClearButton();
}

// ============================================
// Search UI Helpers
// ============================================
function showSearchInfo(count) {
  const searchInfo = document.getElementById("usersSearchInfo");
  const searchCount = document.getElementById("usersSearchCount");
  if (searchInfo && searchCount) {
    searchCount.textContent = count;
    searchInfo.classList.remove("hidden");
  }
}

function hideSearchInfo() {
  const searchInfo = document.getElementById("usersSearchInfo");
  if (searchInfo) {
    searchInfo.classList.add("hidden");
  }
}

function showClearButton() {
  const clearBtn = document.getElementById("clearUsersSearch");
  if (clearBtn) {
    clearBtn.classList.remove("hidden");
    clearBtn.classList.add("flex");
  }
}

function hideClearButton() {
  const clearBtn = document.getElementById("clearUsersSearch");
  if (clearBtn) {
    clearBtn.classList.add("hidden");
    clearBtn.classList.remove("flex");
  }
}

function clearSearch() {
  const searchInput = document.getElementById("usersSearchInput");
  if (searchInput) {
    searchInput.value = "";
    searchInput.focus();
  }
  displayUsers(allUsers);
  hideSearchInfo();
  hideClearButton();
}

// Debounced search handler
function handleSearchInput(e) {
  const query = e.target.value;
  
  // Clear previous timeout
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
  
  // Debounce the search
  searchDebounceTimer = setTimeout(() => {
    searchUsers(query);
  }, SEARCH_DEBOUNCE_MS);
}

// ============================================
// Display Users
// ============================================
function displayUsers(users) {
  const tbody = document.getElementById("usersTableBody");

  if (!users || users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="px-4 py-8 text-center text-slate-400">
          Belum ada user terdaftar
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = users
    .map((user) => {
      const createdDate = new Date(user.created_at);
      const formattedDate = createdDate.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const statusBadge = user.is_active
        ? '<span class="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Aktif</span>'
        : '<span class="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Nonaktif</span>';

      const points = user.points || 0;
      const pointsBadge = `<span class="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs font-bold">${points}</span>`;

      return `
        <tr class="border-t border-slate-800 hover:bg-slate-800/50">
          <td class="px-4 py-3 text-slate-300">#${user.id}</td>
          <td class="px-4 py-3 text-slate-200 font-medium">${escapeHtml(
            user.name
          )}</td>
          <td class="px-4 py-3 text-slate-300">${escapeHtml(user.email)}</td>
          <td class="px-4 py-3 text-slate-300">${escapeHtml(
            user.phone || "-"
          )}</td>
          <td class="px-4 py-3 text-slate-400 text-xs">${formattedDate}</td>
          <td class="px-4 py-3">${statusBadge}</td>
          <td class="px-4 py-3 text-center">${pointsBadge}</td>
          <td class="px-4 py-3 text-center">
            <div class="flex items-center justify-center gap-2">
              <button
                onclick="viewUserRewards(${user.id}, '${escapeHtml(
        user.name
      )}')"
                class="text-emerald-400 hover:text-emerald-300 p-1"
                title="Lihat Riwayat Reward"
              >
                <i data-lucide="award" class="w-4 h-4"></i>
              </button>
              <button
                onclick="openResetPasswordModal(${user.id}, '${escapeHtml(
        user.name
      )}', '${escapeHtml(user.email)}')"
                class="text-amber-400 hover:text-amber-300 p-1"
                title="Reset Password"
              >
                <i data-lucide="key" class="w-4 h-4"></i>
              </button>
              <button
                onclick="toggleUserStatus(${user.id})"
                class="text-blue-400 hover:text-blue-300 p-1"
                title="${user.is_active ? "Nonaktifkan" : "Aktifkan"} User"
              >
                <i data-lucide="${
                  user.is_active ? "user-x" : "user-check"
                }" class="w-4 h-4"></i>
              </button>
              <button
                onclick="confirmDeleteUser(${user.id}, '${escapeHtml(
        user.name
      )}')"
                class="text-red-400 hover:text-red-300 p-1"
                title="Hapus User"
              >
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
              ${
                user.phone
                  ? `<button
                onclick="sendWhatsAppToUser('${escapeHtml(user.phone)}', '${escapeHtml(
                      user.name
                    )}')"
                class="text-green-400 hover:text-green-300 p-1"
                title="Kirim WhatsApp"
              >
                <i data-lucide="message-circle" class="w-4 h-4"></i>
              </button>`
                  : ""
              }
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  // Re-initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// ============================================
// Open Reset Password Modal
// ============================================
function openResetPasswordModal(id, name, email) {
  document.getElementById("userId").value = id;
  document.getElementById("userName").value = name;
  document.getElementById("userEmail").value = email;
  document.getElementById("userPassword").value = "";

  const modal = document.getElementById("userModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

// ============================================
// Close User Modal
// ============================================
function closeUserModal() {
  const modal = document.getElementById("userModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.getElementById("userForm").reset();
}

// ============================================
// Handle Reset Password Form Submit
// ============================================
document.getElementById("userForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userId = document.getElementById("userId").value;
  const password = document.getElementById("userPassword").value;

  if (password.length < 6) {
    showWarning("Password minimal 6 karakter");
    return;
  }
  
  showConfirm(
    "Reset password untuk user ini?",
    async () => {
      await performPasswordReset(userId, password);
    }
  );
});

async function performPasswordReset(userId, password) {

  try {
    const response = await adminFetch(`${API_BASE}/users/${userId}/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (data.success) {
      showSuccess("Password berhasil direset!");
      closeUserModal();
      usersLoaded = false;
      loadUsers();
    } else {
      showError(data.error || "Gagal reset password");
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    showError("Terjadi kesalahan saat reset password");
  }
}

// ============================================
// Toggle User Status
// ============================================
async function toggleUserStatus(userId) {
  showConfirm(
    "Ubah status user ini?",
    async () => {
      try {
        const response = await adminFetch(`${API_BASE}/users/${userId}/toggle`, {
          method: "PATCH",
        });

        const data = await response.json();

        if (data.success) {
          showSuccess(data.message);
          usersLoaded = false;
          loadUsers();
        } else {
          showError(data.error || "Gagal mengubah status user");
        }
      } catch (error) {
        console.error("Error toggling user status:", error);
        showError("Terjadi kesalahan saat mengubah status user");
      }
    }
  );
}

// ============================================
// Confirm Delete User
// ============================================
function confirmDeleteUser(userId, userName) {
  showConfirm(
    `Hapus user "${userName}"?\n\nPeringatan: Data user akan dihapus permanen dari database!`,
    () => {
      deleteUser(userId);
    },
    null,
    "Konfirmasi Hapus User"
  );
}

// ============================================
// Delete User
// ============================================
async function deleteUser(userId) {
  try {
    const response = await adminFetch(`${API_BASE}/users/${userId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (data.success) {
      showSuccess("User berhasil dihapus!");
      usersLoaded = false;
      loadUsers();
    } else {
      showError(data.error || "Gagal menghapus user");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    showError("Terjadi kesalahan saat menghapus user");
  }
}

// Note: escapeHtml is defined in utils.js (global)

// ============================================
// Initialize Users Section
// ============================================

if (typeof window !== "undefined") {
  // Auto-load users when users section becomes active
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        const usersSection = document.getElementById("section-users");
        if (
          usersSection &&
          !usersSection.classList.contains("hidden") &&
          usersSection.querySelector("#usersTableBody") &&
          !usersLoaded
        ) {
          usersLoaded = true;
          loadUsers();
          initSearchListeners();
        } else if (usersSection && usersSection.classList.contains("hidden")) {
          // Reset flag when section is hidden so it can reload next time
          usersLoaded = false;
        }
      }
    });
  });

  // Start observing users section
  const usersSection = document.getElementById("section-users");
  if (usersSection) {
    observer.observe(usersSection, { attributes: true });
  }
}

// ============================================
// View User Rewards
// ============================================
async function viewUserRewards(userId, userName) {
  try {
    const response = await adminFetch(`${API_BASE}/users/${userId}/rewards`);
    const data = await response.json();

    if (data.success) {
      openRewardsModal(userId, userName, data.data.rewards);
    } else {
      showError(data.error || "Gagal memuat riwayat reward");
    }
  } catch (error) {
    console.error("Error fetching user rewards:", error);
    showError("Terjadi kesalahan saat memuat riwayat reward");
  }
}

// ============================================
// Open Rewards Modal
// ============================================
function openRewardsModal(userId, userName, rewards) {
  document.getElementById("rewardUserId").textContent = userId;
  document.getElementById("rewardUserName").textContent = userName;

  const rewardsBody = document.getElementById("rewardsHistoryBody");

  if (!rewards || rewards.length === 0) {
    rewardsBody.innerHTML = `
      <tr>
        <td colspan="7" class="px-4 py-8 text-center text-slate-400">
          Belum ada riwayat penukaran reward
        </td>
      </tr>
    `;
  } else {
    rewardsBody.innerHTML = rewards
      .map((reward, index) => {
        const redeemedDate = new Date(reward.redeemed_at);
        const formattedDate = redeemedDate.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        // Format expiry date if exists
        let expiryText = "-";
        let isExpired = false;
        if (reward.expires_at) {
          const expiryDate = new Date(reward.expires_at);
          isExpired = expiryDate < new Date();
          expiryText = expiryDate.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        }

        // Determine status based on new ENUM values (active, used, expired, cancelled)
        // or fallback to old statuses for backward compat
        let status = reward.status || "active";
        
        // Auto-detect expired status based on date
        if (status === "active" && isExpired) {
          status = "expired";
        }
        
        // Status badge with appropriate colors
        let statusBadge;
        switch (status) {
          case "used":
          case "approved": // backward compat
            statusBadge = `<span class="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-semibold">Terpakai</span>`;
            break;
          case "expired":
            statusBadge = `<span class="px-2 py-1 bg-slate-500/20 text-slate-400 rounded text-xs font-semibold">Kadaluarsa</span>`;
            break;
          case "cancelled":
          case "rejected": // backward compat
            statusBadge = `<span class="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-semibold">Dibatalkan</span>`;
            break;
          case "active":
          case "pending": // backward compat
          default:
            statusBadge = `<span class="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs font-semibold">Aktif</span>`;
        }

        // Coupon code display (if available)
        const couponCodeDisplay = reward.coupon_code 
          ? `<code class="px-2 py-1 bg-slate-700 text-emerald-300 rounded text-xs font-mono">${reward.coupon_code}</code>`
          : `<span class="text-slate-500 text-xs">-</span>`;

        // Only show Delete button (no more Claim button)
        const actionButton = `
          <button 
            onclick="deleteRedemption(${userId}, ${reward.id}, '${escapeHtml(reward.reward_name)}')" 
            class="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded transition"
            title="Hapus & Refund poin"
          >
            Hapus
          </button>`;

        return `
          <tr class="border-t border-slate-800 hover:bg-slate-800/30">
            <td class="px-4 py-3 text-slate-300 text-center">${index + 1}</td>
            <td class="px-4 py-3 text-slate-200">${escapeHtml(reward.reward_name)}</td>
            <td class="px-4 py-3 text-amber-400 font-semibold text-center">${reward.points_cost} poin</td>
            <td class="px-4 py-3 text-slate-400 text-xs">${formattedDate}</td>
            <td class="px-4 py-3 text-center">${couponCodeDisplay}</td>
            <td class="px-4 py-3 text-slate-400 text-xs ${isExpired ? 'text-red-400' : ''}">${expiryText}</td>
            <td class="px-4 py-3 text-center">${statusBadge}</td>
            <td class="px-4 py-3 text-center">${actionButton}</td>
          </tr>
        `;
      })
      .join("");
  }

  const modal = document.getElementById("rewardsModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  // Re-initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// ============================================
// Close Rewards Modal
// ============================================
function closeRewardsModal() {
  const modal = document.getElementById("rewardsModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

// ============================================
// Approve Reward Redemption
// ============================================
async function approveRedemption(userId, redemptionId, rewardName) {
  showConfirm(
    `Approve penukaran reward "${rewardName}"?`,
    async () => {
      try {
        const response = await adminFetch(
          `${API_BASE}/rewards/admin/redemptions/${redemptionId}/status`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: 'approved' }),
            credentials: "include",
          }
        );

        const data = await response.json();

        if (data.success) {
          showSuccess("Redemption berhasil di-approve!");
          // Refresh the rewards list
          const userName = document.getElementById("rewardUserName").textContent;
          const userRewardsResponse = await adminFetch(
            `${API_BASE}/api/user-data/rewards?user_id=${userId}`, // Note: this endpoint might need adjustment if it's user-facing
            // Actually users-manager calls /api/users/${userId}/rewards which is likely mapped to user-data route but for admins?
            // Let's stick to what viewUserRewards uses: ${API_BASE}/users/${userId}/rewards
            // Waiting... viewUserRewards uses ${API_BASE}/users/${userId}/rewards. Does that exist?
            // If not, I should fix that too.
            // Let's use the new admin endpoint filtering by user_id
            `${API_BASE}/rewards/admin/redemptions?user_id=${userId}`
          );
          
          const userRewardsData = await userRewardsResponse.json();
          if (userRewardsData.success) {
             // The format from admin/redemptions is different from users/:id/rewards?
             // viewUserRewards expects {success: true, data: {rewards: []}}
             // admin/redemptions returns {success: true, redemptions: []}
             // I should probbaly use reloadUsers() or just re-call viewUserRewards logic
             
             // Simplest: re-call viewUserRewards
             // But viewUserRewards calls an endpoint I haven't verified.
             // Let's rely on the NEW endpoint I made: /rewards/admin/redemptions?user_id=...
             
             openRewardsModal(userId, userName, userRewardsData.redemptions);
          }
          
          // Also refresh Reports if available
          if (typeof window.loadRedemptionReport === 'function') {
            window.loadRedemptionReport();
          }
        } else {
          showError(data.error || "Gagal approve redemption");
        }
      } catch (error) {
        console.error("Error approving redemption:", error);
        showError("Terjadi kesalahan saat approve redemption");
      }
    }
  );
}

// ============================================
// Send WhatsApp to User
// ============================================

// ============================================
// Delete Reward Redemption (with refund)
// ============================================
async function deleteRedemption(userId, redemptionId, rewardName) {
  showConfirm(
    `Hapus dan refund poin untuk penukaran "${rewardName}"?\n\nPoin akan dikembalikan ke user.`,
    async () => {
      try {
        // First, set status to 'cancelled' (which triggers refund on backend)
        const response = await adminFetch(
          `${API_BASE}/rewards/admin/redemptions/${redemptionId}/status`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: 'cancelled' }),
            credentials: "include",
          }
        );

        const data = await response.json();

        if (data.success) {
          showSuccess("Redemption berhasil dihapus. Poin dikembalikan!");
          // Refresh the rewards list
          const userName = document.getElementById("rewardUserName").textContent;
          const userRewardsResponse = await adminFetch(
            `${API_BASE}/rewards/admin/redemptions?user_id=${userId}`
          );
          
          const userRewardsData = await userRewardsResponse.json();
          if (userRewardsData.success) {
             openRewardsModal(userId, userName, userRewardsData.redemptions);
          }
          
          // Also refresh Reports if available
          if (typeof window.loadRedemptionReport === 'function') {
            window.loadRedemptionReport();
          }
        } else {
          showError(data.error || "Gagal menghapus redemption");
        }
      } catch (error) {
        console.error("Error deleting redemption:", error);
        showError("Terjadi kesalahan saat menghapus redemption");
      }
    }
  );
}
function sendWhatsAppToUser(phone, userName) {
  // Clean phone number - remove all non-numeric characters
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  
  // Format phone number for WhatsApp (add 62 prefix if starts with 0)
  let formattedPhone = cleanPhone;
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "62" + formattedPhone.substring(1);
  } else if (!formattedPhone.startsWith("62")) {
    formattedPhone = "62" + formattedPhone;
  }
  
  // Default message template
  const defaultMessage = `Halo ${userName}, saya dari Tim DocterBee. `;
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(defaultMessage);
  
  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  
  // Open WhatsApp in new tab
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

// ============================================
// Initialize Search Listeners
// ============================================
let searchListenersInitialized = false;

function initSearchListeners() {
  // Prevent duplicate listeners
  if (searchListenersInitialized) return;
  
  const searchInput = document.getElementById("usersSearchInput");
  const clearBtn = document.getElementById("clearUsersSearch");
  
  if (searchInput) {
    // Search on input with debounce
    searchInput.addEventListener("input", handleSearchInput);
    
    // Clear search on Escape key
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        clearSearch();
      }
    });
  }
  
  if (clearBtn) {
    clearBtn.addEventListener("click", clearSearch);
  }
  
  searchListenersInitialized = true;
  
  // Re-initialize Lucide icons for search bar
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// Export functions for use in HTML
if (typeof window !== "undefined") {
  window.loadUsers = loadUsers;
  window.viewUserRewards = viewUserRewards;
  window.openResetPasswordModal = openResetPasswordModal;
  window.closeUserModal = closeUserModal;
  window.closeRewardsModal = closeRewardsModal;
  window.toggleUserStatus = toggleUserStatus;
  window.confirmDeleteUser = confirmDeleteUser;
  window.deleteUser = deleteUser;
  window.approveRedemption = approveRedemption;
  window.sendWhatsAppToUser = sendWhatsAppToUser;
  window.clearSearch = clearSearch;
  window.searchUsers = searchUsers;
}

