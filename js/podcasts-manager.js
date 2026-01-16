/**
 * Podcasts Manager for Admin Dashboard
 * Handles CRUD operations for podcast audio files
 */

/* global adminFetch, showError, showSuccess, showConfirm, escapeHtml */

// ========================================
// PODCASTS MANAGER
// ========================================

let isSubmittingPodcast = false;

/**
 * Initialize podcasts manager
 */
function initPodcastsManager() {
  // New podcast button
  const btnNewPodcast = document.getElementById("btnNewPodcast");
  if (btnNewPodcast) {
    btnNewPodcast.addEventListener("click", () => openPodcastModal());
  }

  // Modal close buttons
  const closePodcastModal = document.getElementById("closePodcastModal");
  if (closePodcastModal) {
    closePodcastModal.addEventListener("click", closePodcastModalFn);
  }

  const cancelPodcast = document.getElementById("cancelPodcast");
  if (cancelPodcast) {
    cancelPodcast.addEventListener("click", closePodcastModalFn);
  }

  // Form submit
  const podcastForm = document.getElementById("podcastForm");
  if (podcastForm) {
    podcastForm.addEventListener("submit", handlePodcastSubmit);
  }

  // Close modal on overlay click
  const podcastModal = document.getElementById("podcastModal");
  if (podcastModal) {
    podcastModal.addEventListener("click", (e) => {
      if (e.target.id === "podcastModal") {
        closePodcastModalFn();
      }
    });
  }
}

/**
 * Load podcasts from API
 */
async function loadPodcasts() {
  const tbody = document.getElementById("podcastsTableBody");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="6" class="px-4 py-8 text-center text-slate-400">
        Memuat data podcasts...
      </td>
    </tr>
  `;

  try {
    const response = await adminFetch("/api/podcasts/admin");
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Gagal memuat podcast");
    }

    const podcasts = data.data || [];

    if (podcasts.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="px-4 py-8 text-center text-slate-400">
            Belum ada podcast. Klik "Podcast Baru" untuk menambahkan.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = podcasts
      .map(
        (podcast) => `
      <tr class="border-b border-slate-800 hover:bg-slate-800/50 transition">
        <td class="px-4 py-3 text-slate-400">${podcast.id}</td>
        <td class="px-4 py-3">
          <span class="font-medium text-white">${escapeHtml(
            podcast.title
          )}</span>
        </td>
        <td class="px-4 py-3">
          <audio controls class="h-8 w-48">
            <source src="${escapeHtml(podcast.audio_url)}" type="audio/mpeg">
          </audio>
        </td>
        <td class="px-4 py-3 text-center text-slate-400">${
          podcast.sort_order
        }</td>
        <td class="px-4 py-3 text-center">
          <button 
            onclick="togglePodcastStatus(${podcast.id})"
            class="px-2 py-1 rounded text-xs font-medium transition ${
              podcast.is_active
                ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
            }"
          >
            ${podcast.is_active ? "Aktif" : "Nonaktif"}
          </button>
        </td>
        <td class="px-4 py-3 text-center">
          <div class="flex items-center justify-center gap-2">
            <button
              onclick="editPodcast(${podcast.id})"
              class="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition"
              title="Edit"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button
              onclick="deletePodcast(${podcast.id}, '${escapeJsString(
          podcast.title
        )}')"
              class="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition"
              title="Hapus"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loading podcasts:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-4 py-8 text-center text-red-400">
          Gagal memuat data: ${error.message}
        </td>
      </tr>
    `;
  }
}

/**
 * Open podcast modal for add/edit
 * @param {number|null} id - Podcast ID for edit mode, null for add mode
 */
async function openPodcastModal(id = null) {
  const modal = document.getElementById("podcastModal");
  const title = document.getElementById("podcastModalTitle");
  const form = document.getElementById("podcastForm");
  const audioRequired = document.getElementById("podcastAudioRequired");
  const currentAudioPreview = document.getElementById("currentAudioPreview");
  const currentAudioPlayer = document.getElementById("currentAudioPlayer");

  if (!modal || !form) return;

  // Reset form
  form.reset();
  document.getElementById("podcastId").value = "";
  document.getElementById("podcastSortOrder").value = "0";
  document.getElementById("podcastIsActive").checked = true;

  // Hide audio preview
  currentAudioPreview.classList.add("hidden");
  currentAudioPlayer.src = "";

  if (id) {
    // Edit mode
    title.textContent = "Edit Podcast";
    audioRequired.textContent = ""; // Audio not required for edit

    try {
      const response = await adminFetch("/api/podcasts/admin");
      const data = await response.json();

      if (data.success) {
        const podcast = data.data.find((p) => p.id === id);
        if (podcast) {
          document.getElementById("podcastId").value = podcast.id;
          document.getElementById("podcastTitle").value = podcast.title;
          document.getElementById("podcastSortOrder").value =
            podcast.sort_order || 0;
          document.getElementById("podcastIsActive").checked =
            !!podcast.is_active;

          // Show current audio
          if (podcast.audio_url) {
            currentAudioPreview.classList.remove("hidden");
            currentAudioPlayer.src = podcast.audio_url;
          }
        }
      }
    } catch (error) {
      console.error("Error loading podcast for edit:", error);
      showError("Gagal memuat data podcast");
      return;
    }
  } else {
    // Add mode
    title.textContent = "Podcast Baru";
    audioRequired.textContent = "*"; // Audio required for new
  }

  // Show modal
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  // Reinitialize Lucide icons in modal
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Close podcast modal
 */
function closePodcastModalFn() {
  const modal = document.getElementById("podcastModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

/**
 * Handle podcast form submit
 * @param {Event} e - Form submit event
 */
async function handlePodcastSubmit(e) {
  e.preventDefault();

  if (isSubmittingPodcast) return;
  isSubmittingPodcast = true;

  const podcastId = document.getElementById("podcastId").value;
  const title = document.getElementById("podcastTitle").value.trim();
  const audioFile = document.getElementById("podcastAudio").files[0];
  const sortOrder = document.getElementById("podcastSortOrder").value;
  const isActive = document.getElementById("podcastIsActive").checked;

  // Validation
  if (!title) {
    showError("Judul podcast harus diisi");
    isSubmittingPodcast = false;
    return;
  }

  // For new podcast, audio is required
  if (!podcastId && !audioFile) {
    showError("File audio harus diupload untuk podcast baru");
    isSubmittingPodcast = false;
    return;
  }

  // Prepare form data
  const formData = new FormData();
  formData.append("title", title);
  formData.append("sort_order", sortOrder || "0");
  formData.append("is_active", isActive ? "1" : "0");

  if (audioFile) {
    formData.append("audio", audioFile);
  }

  try {
    const url = podcastId ? `/api/podcasts/${podcastId}` : "/api/podcasts";
    const method = podcastId ? "PUT" : "POST";

    const response = await adminFetch(url, {
      method: method,
      body: formData,
      // Don't set Content-Type header - let browser set it with boundary for multipart
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Gagal menyimpan podcast");
    }

    showSuccess(
      podcastId ? "Podcast berhasil diperbarui" : "Podcast berhasil ditambahkan"
    );
    closePodcastModalFn();
    loadPodcasts();
  } catch (error) {
    console.error("Error saving podcast:", error);
    showError(error.message || "Gagal menyimpan podcast");
  } finally {
    isSubmittingPodcast = false;
  }
}

/**
 * Edit podcast
 * @param {number} id - Podcast ID
 */
function editPodcast(id) {
  openPodcastModal(id);
}

/**
 * Delete podcast
 * @param {number} id - Podcast ID
 * @param {string} title - Podcast title for confirmation
 */
function deletePodcast(id, title) {
  showConfirm(
    `Hapus podcast "${title}"? File audio juga akan dihapus.`,
    async () => {
      try {
        const response = await adminFetch(`/api/podcasts/${id}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Gagal menghapus podcast");
        }

        showSuccess("Podcast berhasil dihapus");
        loadPodcasts();
      } catch (error) {
        console.error("Error deleting podcast:", error);
        showError(error.message || "Gagal menghapus podcast");
      }
    },
    null,
    "Konfirmasi Hapus"
  );
}

/**
 * Toggle podcast active status
 * @param {number} id - Podcast ID
 */
async function togglePodcastStatus(id) {
  try {
    const response = await adminFetch(`/api/podcasts/${id}/toggle`, {
      method: "PATCH",
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Gagal mengubah status");
    }

    showSuccess(data.message || "Status berhasil diubah");
    loadPodcasts();
  } catch (error) {
    console.error("Error toggling podcast status:", error);
    showError(error.message || "Gagal mengubah status");
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initPodcastsManager();
});

// Expose functions globally for onclick handlers
window.loadPodcasts = loadPodcasts;
window.openPodcastModal = openPodcastModal;
window.editPodcast = editPodcast;
window.deletePodcast = deletePodcast;
window.togglePodcastStatus = togglePodcastStatus;
