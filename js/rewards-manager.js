// ============================================
// REWARDS MANAGER
// ============================================
// Modal utilities are defined in modal-utils.js
/* global showSuccess, showError, showWarning, showConfirm */

let currentRewardId = null;

// Load all rewards
async function loadRewards() {
  try {
    const response = await fetch(`${API_BASE}/rewards/admin/all`, {
      credentials: "include",
    });
    const data = await response.json();

    if (data.success) {
      displayRewards(data.rewards);
    } else {
      document.getElementById("rewardsGrid").innerHTML = `
        <div class="booking-container p-6 text-center text-red-400">
          ${data.error || "Gagal memuat rewards"}
        </div>
      `;
    }
  } catch (error) {
    console.error("Error loading rewards:", error);
    document.getElementById("rewardsGrid").innerHTML = `
      <div class="booking-container p-6 text-center text-red-400">
        Terjadi kesalahan saat memuat data
      </div>
    `;
  }
}

// Display rewards in grid
function displayRewards(rewards) {
  const grid = document.getElementById("rewardsGrid");

  if (!rewards || rewards.length === 0) {
    grid.innerHTML = `
      <div class="booking-container p-6 text-center text-slate-400">
        Belum ada reward. Klik "Tambah Reward" untuk membuat reward baru.
      </div>
    `;
    return;
  }

  grid.innerHTML = rewards
    .map(
      (reward) => `
    <div class="booking-container p-4 hover:border-${reward.color_theme}-400/50 transition">
      <div class="flex justify-between items-start mb-3">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <h3 class="font-semibold text-slate-900">${escapeHtml(reward.name)}</h3>
            ${
              reward.is_active
                ? '<span class="text-xs bg-emerald-500/20 text-emerald-700 font-semibold px-2 py-0.5 rounded">Aktif</span>'
                : '<span class="text-xs bg-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded">Nonaktif</span>'
            }
          </div>
          <div class="text-2xl font-bold text-${reward.color_theme}-600 mb-2">
            ${reward.points_cost} Poin
          </div>
          ${
            reward.description
              ? `<p class="text-sm text-slate-600 mb-3">${escapeHtml(reward.description)}</p>`
              : ""
          }
        </div>
      </div>

      <div class="flex gap-2">
        <button
          onclick="editReward(${reward.id})"
          class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
        >
          <i data-lucide="edit-2" class="w-4 h-4"></i>
          Edit
        </button>
        <button
          onclick="deleteReward(${reward.id}, '${escapeHtml(reward.name).replace(/'/g, "\\'")}')"
          class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
        >
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `
    )
    .join("");

  // Re-initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// Open reward modal for create or edit
function openRewardModal(id = null) {
  currentRewardId = id;
  const modal = document.getElementById("rewardModal");
  const form = document.getElementById("rewardForm");
  const title = document.getElementById("rewardModalTitle");

  if (id) {
    title.textContent = "Edit Reward";
    // Don't reset form when editing
  } else {
    title.textContent = "Tambah Reward Baru";
    // Reset form for new reward
    form.reset();
    document.getElementById("rewardId").value = "";
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

// Close reward modal
function closeRewardModal() {
  const modal = document.getElementById("rewardModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  currentRewardId = null;
}

// Edit reward - fetch and populate form
async function editReward(id) {
  try {
    const response = await fetch(`${API_BASE}/rewards/admin/${id}`, {
      credentials: "include",
    });
    const data = await response.json();

    if (data.success) {
      const reward = data.reward;

      // Populate form fields
      document.getElementById("rewardId").value = reward.id;
      document.getElementById("rewardName").value = reward.name;
      document.getElementById("rewardDescription").value = reward.description || "";
      document.getElementById("rewardPoints").value = reward.points_cost;
      document.getElementById("rewardColor").value = reward.color_theme || "amber";
      document.getElementById("rewardActive").checked = reward.is_active === 1;
      document.getElementById("rewardSortOrder").value = reward.sort_order || 0;

      openRewardModal(id);
    } else {
      showError(data.error || "Gagal memuat data reward");
    }
  } catch (error) {
    console.error("Error fetching reward:", error);
    showError("Terjadi kesalahan saat memuat data reward");
  }
}

// Save reward (create or update)
async function saveReward(event) {
  event.preventDefault();

  const id = document.getElementById("rewardId").value;
  const name = document.getElementById("rewardName").value.trim();
  const description = document.getElementById("rewardDescription").value.trim();
  const points = parseInt(document.getElementById("rewardPoints").value);
  const color = document.getElementById("rewardColor").value;
  const isActive = document.getElementById("rewardActive").checked ? 1 : 0;
  const sortOrder = parseInt(document.getElementById("rewardSortOrder").value) || 0;

  // Validation
  if (!name) {
    showWarning("Nama reward harus diisi");
    return;
  }

  if (isNaN(points) || points < 1) {
    showWarning("Poin harus lebih dari 0");
    return;
  }

  const payload = {
    name,
    description,
    points_cost: points,
    color_theme: color,
    is_active: isActive,
    sort_order: sortOrder,
  };

  try {
    const url = id ? `${API_BASE}/rewards/admin/${id}` : `${API_BASE}/rewards/admin`;
    const method = id ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.success) {
      showSuccess(data.message || "Reward berhasil disimpan");
      closeRewardModal();
      await loadRewards();
    } else {
      showError(data.error || "Gagal menyimpan reward");
    }
  } catch (error) {
    console.error("Error saving reward:", error);
    showError("Terjadi kesalahan saat menyimpan reward");
  }
}

// Delete reward
async function deleteReward(id, name) {
  showConfirm(
    `Hapus reward "${name}"?\n\nReward yang sudah dihapus tidak dapat dikembalikan. Riwayat penukaran reward ini akan tetap tersimpan.`,
    async () => {
      await performDeleteReward(id);
    }
  );
}

async function performDeleteReward(id) {

  try {
    const response = await fetch(`${API_BASE}/rewards/admin/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Gagal menghapus reward");
    }

    showSuccess("Reward berhasil dihapus!");
    loadRewards(); // Reload rewards list
  } catch (error) {
    console.error("Error deleting reward:", error);
    showError("Error: " + error.message);
  }
}

// Initialize rewards manager when tab is shown
function initRewardsManager() {
  loadRewards();

  // Attach event listeners
  const btnNewReward = document.getElementById("btnNewReward");
  if (btnNewReward && !btnNewReward.hasAttribute("data-listener")) {
    btnNewReward.addEventListener("click", () => openRewardModal());
    btnNewReward.setAttribute("data-listener", "true");
  }

  const rewardForm = document.getElementById("rewardForm");
  if (rewardForm && !rewardForm.hasAttribute("data-listener")) {
    rewardForm.addEventListener("submit", saveReward);
    rewardForm.setAttribute("data-listener", "true");
  }

  const closeRewardBtn = document.getElementById("closeRewardModal");
  if (closeRewardBtn && !closeRewardBtn.hasAttribute("data-listener")) {
    closeRewardBtn.addEventListener("click", closeRewardModal);
    closeRewardBtn.setAttribute("data-listener", "true");
  }
}
