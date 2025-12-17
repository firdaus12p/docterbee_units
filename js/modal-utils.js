/**
 * Modal Utilities - Replacement for alert() and confirm()
 * Provides themed modals for user and admin pages
 */

// ============================================
// MODAL HTML STRUCTURE (Auto-inject on first use)
// ============================================

function ensureModalContainer() {
  if (document.getElementById("customModalContainer")) return;

  const modalHTML = `
    <!-- Custom Modal Container -->
    <div id="customModalContainer" class="fixed inset-0 z-[9999] hidden items-center justify-center p-4 bg-black/60 backdrop-blur-sm" style="display: none;">
      <div id="customModalBox" class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full transform transition-all scale-95 opacity-0">
        <!-- Modal Header -->
        <div id="customModalHeader" class="px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div id="customModalIcon" class="w-12 h-12 rounded-full flex items-center justify-center">
              <!-- Icon will be injected here -->
            </div>
            <h3 id="customModalTitle" class="text-xl font-bold text-slate-900 dark:text-white"></h3>
          </div>
        </div>

        <!-- Modal Body -->
        <div id="customModalBody" class="px-6 py-4">
          <p id="customModalMessage" class="text-slate-700 dark:text-slate-300 whitespace-pre-line"></p>
        </div>

        <!-- Modal Footer -->
        <div id="customModalFooter" class="px-6 pb-6 pt-4 flex gap-3 justify-end">
          <!-- Buttons will be injected here -->
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

// ============================================
// SHOW MODAL (Base Function)
// ============================================

function showModal(options) {
  ensureModalContainer();

  const {
    title = "Notification",
    message = "",
    type = "info", // info, success, warning, error, confirm
    confirmText = "OK",
    cancelText = "Batal",
    onConfirm = null,
    onCancel = null,
    showCancel = false,
  } = options;

  const container = document.getElementById("customModalContainer");
  const box = document.getElementById("customModalBox");
  const iconEl = document.getElementById("customModalIcon");
  const titleEl = document.getElementById("customModalTitle");
  const messageEl = document.getElementById("customModalMessage");
  const footer = document.getElementById("customModalFooter");

  // Set icon and colors based on type
  const typeConfig = {
    info: {
      icon: `<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`,
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    success: {
      icon: `<svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`,
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    warning: {
      icon: `<svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>`,
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    error: {
      icon: `<svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`,
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
    confirm: {
      icon: `<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`,
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  // Set icon
  iconEl.className = `w-12 h-12 rounded-full flex items-center justify-center ${config.bgColor}`;
  iconEl.innerHTML = config.icon;

  // Set title and message
  titleEl.textContent = title;
  messageEl.textContent = message;

  // Build footer buttons
  footer.innerHTML = "";

  if (showCancel || type === "confirm") {
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = cancelText;
    cancelBtn.className =
      "px-6 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold rounded-lg transition-colors";
    cancelBtn.onclick = () => {
      closeModal();
      if (onCancel) onCancel();
    };
    footer.appendChild(cancelBtn);
  }

  const confirmBtn = document.createElement("button");
  confirmBtn.textContent = confirmText;
  const confirmColors = {
    info: "bg-blue-600 hover:bg-blue-700",
    success: "bg-emerald-600 hover:bg-emerald-700",
    warning: "bg-amber-600 hover:bg-amber-700",
    error: "bg-red-600 hover:bg-red-700",
    confirm: "bg-purple-600 hover:bg-purple-700",
  };
  confirmBtn.className = `px-6 py-2.5 ${confirmColors[type]} text-white font-semibold rounded-lg transition-colors`;
  confirmBtn.onclick = () => {
    closeModal();
    if (onConfirm) onConfirm();
  };
  footer.appendChild(confirmBtn);

  // Show modal with animation
  container.style.display = "flex";
  setTimeout(() => {
    container.classList.remove("hidden");
    box.classList.remove("scale-95", "opacity-0");
    box.classList.add("scale-100", "opacity-100");
  }, 10);

  // Close on backdrop click
  container.onclick = (e) => {
    if (e.target === container) {
      closeModal();
      if (onCancel) onCancel();
    }
  };

  // Close on ESC key
  const escHandler = (e) => {
    if (e.key === "Escape") {
      closeModal();
      if (onCancel) onCancel();
      document.removeEventListener("keydown", escHandler);
    }
  };
  document.addEventListener("keydown", escHandler);

  // Auto-close after 3 seconds for alert types (not confirm)
  if (type !== "confirm") {
    setTimeout(() => {
      closeModal();
    }, 3000);
  }
}

function closeModal() {
  const container = document.getElementById("customModalContainer");
  const box = document.getElementById("customModalBox");

  if (!container || !box) return;

  box.classList.remove("scale-100", "opacity-100");
  box.classList.add("scale-95", "opacity-0");

  setTimeout(() => {
    container.classList.add("hidden");
    container.style.display = "none";
  }, 200);
}

// ============================================
// PUBLIC API (Replacement for alert/confirm)
// ============================================

/**
 * Show alert modal (replacement for alert())
 * @param {string} message - Message to display
 * @param {string} type - Type: 'info', 'success', 'warning', 'error'
 * @param {string} title - Optional title
 */
function showAlert(message, type = "info", title = null) {
  const titles = {
    info: "Informasi",
    success: "Berhasil",
    warning: "Peringatan",
    error: "Error",
  };

  showModal({
    title: title || titles[type] || "Notification",
    message,
    type,
    confirmText: "OK",
    showCancel: false,
  });
}

/**
 * Show confirm modal (replacement for confirm())
 * @param {string} message - Message to display
 * @param {function} onConfirm - Callback when confirmed
 * @param {function} onCancel - Callback when cancelled
 * @param {string} title - Optional title
 */
function showConfirm(message, onConfirm, onCancel = null, title = "Konfirmasi") {
  showModal({
    title,
    message,
    type: "confirm",
    confirmText: "Ya",
    cancelText: "Tidak",
    showCancel: true,
    onConfirm,
    onCancel,
  });
}

/**
 * Show success modal
 * @param {string} message - Success message
 * @param {string} title - Optional title
 */
function showSuccess(message, title = "Berhasil") {
  showAlert(message, "success", title);
}

/**
 * Show error modal
 * @param {string} message - Error message
 * @param {string} title - Optional title
 */
function showError(message, title = "Error") {
  showAlert(message, "error", title);
}

/**
 * Show warning modal
 * @param {string} message - Warning message
 * @param {string} title - Optional title
 */
function showWarning(message, title = "Peringatan") {
  showAlert(message, "warning", title);
}

/**
 * Show info modal
 * @param {string} message - Info message
 * @param {string} title - Optional title
 */
function showInfo(message, title = "Informasi") {
  showAlert(message, "info", title);
}

// ============================================
// EXPORT TO WINDOW
// ============================================

window.showModal = showModal;
window.closeModal = closeModal;
window.showAlert = showAlert;
window.showConfirm = showConfirm;
window.showSuccess = showSuccess;
window.showError = showError;
window.showWarning = showWarning;
window.showInfo = showInfo;
