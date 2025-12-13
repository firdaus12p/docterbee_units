// ============================================
// USERS MANAGER - Admin Dashboard
// ============================================
// API_BASE is defined in admin-dashboard.js

// ============================================
// Load Users
// ============================================
async function loadUsers() {
  try {
    const response = await fetch(`${API_BASE}/users`);
    const data = await response.json();

    if (data.success) {
      displayUsers(data.data);
      document.getElementById("totalUsers").textContent = data.count || 0;
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
    alert("Password minimal 6 karakter");
    return;
  }

  if (!confirm("Reset password untuk user ini?")) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/users/${userId}/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (data.success) {
      alert("Password berhasil direset!");
      closeUserModal();
      usersLoaded = false;
      loadUsers();
    } else {
      alert(data.error || "Gagal reset password");
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    alert("Terjadi kesalahan saat reset password");
  }
});

// ============================================
// Toggle User Status
// ============================================
async function toggleUserStatus(userId) {
  if (!confirm("Ubah status user ini?")) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/users/${userId}/toggle`, {
      method: "PATCH",
    });

    const data = await response.json();

    if (data.success) {
      alert(data.message);
      usersLoaded = false;
      loadUsers();
    } else {
      alert(data.error || "Gagal mengubah status user");
    }
  } catch (error) {
    console.error("Error toggling user status:", error);
    alert("Terjadi kesalahan saat mengubah status user");
  }
}

// ============================================
// Confirm Delete User
// ============================================
function confirmDeleteUser(userId, userName) {
  if (
    !confirm(
      `Hapus user "${userName}"?\n\nPeringatan: Data user akan dihapus permanen dari database!`
    )
  ) {
    return;
  }

  deleteUser(userId);
}

// ============================================
// Delete User
// ============================================
async function deleteUser(userId) {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (data.success) {
      alert("User berhasil dihapus!");
      usersLoaded = false;
      loadUsers();
    } else {
      alert(data.error || "Gagal menghapus user");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    alert("Terjadi kesalahan saat menghapus user");
  }
}

// ============================================
// Escape HTML for XSS prevention
// ============================================
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text ? String(text).replace(/[&<>"']/g, (m) => map[m]) : "";
}

// ============================================
// Initialize Users Section
// ============================================
let usersLoaded = false;

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
    const response = await fetch(`${API_BASE}/users/${userId}/rewards`);
    const data = await response.json();

    if (data.success) {
      openRewardsModal(userId, userName, data.data.rewards);
    } else {
      alert(data.error || "Gagal memuat riwayat reward");
    }
  } catch (error) {
    console.error("Error fetching user rewards:", error);
    alert("Terjadi kesalahan saat memuat riwayat reward");
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
        <td colspan="3" class="px-4 py-8 text-center text-slate-400">
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

        return `
          <tr class="border-t border-slate-800 hover:bg-slate-800/30">
            <td class="px-4 py-3 text-slate-300 text-center">${index + 1}</td>
            <td class="px-4 py-3 text-slate-200">${escapeHtml(
              reward.reward_name
            )}</td>
            <td class="px-4 py-3 text-amber-400 font-semibold text-center">${
              reward.points_cost
            } poin</td>
            <td class="px-4 py-3 text-slate-400 text-xs">${formattedDate}</td>
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
}
