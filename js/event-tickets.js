/**
 * Event Tickets Manager
 * Handles event ticket display, QR codes, and payment confirmation flow
 * Secured: Tickets are fetched based on logged-in user session, not stored phone number.
 * 
 * Dependencies:
 * - modal-utils.js (showSuccess, showError, showWarning)
 * - qrcode.min.js (QRCode library from store)
 * - utils.js (escapeHtml)
 */

// ============================================
// STATE
// ============================================

const EventTickets = {
  registrations: [],
  isLoading: false,
};

// Bank account info for payment
const BANK_ACCOUNTS = [
  { bank: "BCA", number: "1234567890", name: "CV Docterbee Indonesia" },
  { bank: "Mandiri", number: "0987654321", name: "CV Docterbee Indonesia" },
];

// WhatsApp admin for payment confirmation
const ADMIN_WA_NUMBER = "6285191554056";
const DOCTERBEE_INSTAGRAM = "https://instagram.com/docterbee.official";

// ============================================
// API CALLS
// ============================================

/**
 * Fetch tickets for the currently logged-in user
 * @returns {Promise<Array>} Array of registrations
 */
async function fetchMyTickets() {
  try {
    const response = await fetch("/api/event-registrations/my-tickets", {
      method: "GET",
      credentials: "include"
    });
    
    // If 401, user is not logged in
    if (response.status === 401) {
      return [];
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return [];
  }
}

// ============================================
// UI RENDERING
// ============================================

/**
 * Format date to Indonesian format
 */
function formatDateIndo(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format currency to Rupiah
 */
function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID").format(amount || 0);
}

/**
 * Generate status badge HTML
 */
function getStatusBadge(reg) {
  if (reg.is_expired) {
    return '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-600">Kadaluarsa</span>';
  }
  if (reg.is_attended) {
    return '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">Hadir ✓</span>';
  }
  if (reg.is_confirmed) {
    return '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Dikonfirmasi</span>';
  }
  if (reg.is_pending) {
    return '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">Menunggu Bayar</span>';
  }
  return '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">-</span>';
}

/**
 * Generate ticket card HTML for a single registration
 */
function renderTicketCard(reg) {
  const statusBadge = getStatusBadge(reg);
  const isPending = reg.is_pending;
  const canShowQR = reg.can_use_ticket && reg.ticket_code;
  
  // Payment info section for pending registrations
  let paymentSection = "";
  if (isPending && reg.final_fee > 0) {
    paymentSection = `
      <div class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div class="text-sm font-semibold text-amber-700 mb-2">💳 Silakan Transfer:</div>
        <div class="text-lg font-bold text-amber-600 mb-2">Rp ${formatRupiah(reg.final_fee)}</div>
        ${BANK_ACCOUNTS.map(acc => `
          <div class="flex items-center justify-between text-sm mb-1">
            <span class="text-slate-600">${acc.bank}:</span>
            <span class="font-mono font-semibold">${acc.number}</span>
            <button onclick="copyToClipboard('${acc.number}')" class="ml-2 text-xs text-blue-600 hover:underline">Salin</button>
          </div>
          <div class="text-xs text-slate-500 mb-2">a.n. ${acc.name}</div>
        `).join("")}
        <button 
          onclick="openPaymentConfirmation('${reg.id}', '${typeof escapeHtml === 'function' ? escapeHtml(reg.event_title) : reg.event_title}', ${reg.final_fee})"
          class="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Konfirmasi Pembayaran
        </button>
      </div>
    `;
  } else if (isPending && reg.final_fee === 0) {
    // Free event, pending admin confirmation
    paymentSection = `
      <div class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="text-sm text-blue-700">
          ✓ Event Gratis. Menunggu konfirmasi admin.
        </div>
      </div>
    `;
  }
  
  // QR Code section for confirmed registrations
  let qrSection = "";
  if (canShowQR) {
    qrSection = `
      <div class="mt-3 p-4 bg-green-50 border-2 border-green-300 rounded-xl text-center">
        <div class="text-sm font-semibold text-green-700 mb-2">🎟️ Tiket Anda</div>
        <div id="qr-${reg.id}" class="flex justify-center mb-2"></div>
        <div class="text-xs text-slate-500 font-mono">${reg.ticket_code || "-"}</div>
        <div class="text-xs text-green-600 mt-1">Tunjukkan QR ini saat masuk venue</div>
      </div>
    `;
  }
  
  return `
    <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition mb-3" data-reg-id="${reg.id}">
      <div class="flex items-start justify-between mb-2">
        <div>
          <div class="font-semibold text-slate-900">${typeof escapeHtml === 'function' ? escapeHtml(reg.event_title) : reg.event_title}</div>
          <div class="text-sm text-slate-600">${formatDateIndo(reg.event_date)}</div>
        </div>
        ${statusBadge}
      </div>
      <div class="text-xs text-slate-500 mb-2">
        Mode: ${reg.event_mode === "online" ? "Online (Zoom)" : "Offline"}
        ${reg.location ? ` • ${typeof escapeHtml === 'function' ? escapeHtml(reg.location) : reg.location}` : ""}
      </div>
      ${reg.final_fee > 0 ? `
        <div class="text-sm">
          <span class="text-slate-600">Biaya:</span>
          <span class="font-semibold text-red-600">Rp ${formatRupiah(reg.final_fee)}</span>
        </div>
      ` : `
        <div class="text-sm text-emerald-600 font-semibold">GRATIS</div>
      `}
      ${paymentSection}
      ${qrSection}
    </div>
  `;
}

/**
 * Render all tickets in the modal
 */
function renderTicketsList(registrations) {
  const container = document.getElementById("eventTicketsListContainer");
  if (!container) return;
  
  if (!registrations || registrations.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-slate-500">
        <div class="text-4xl mb-2">🎫</div>
        <div>Belum ada tiket event.</div>
        <div class="text-sm mt-1">Daftar ke event untuk mendapatkan tiket.</div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = registrations.map(renderTicketCard).join("");
  
  // Generate QR codes for confirmed registrations
  registrations.forEach((reg) => {
    if (reg.can_use_ticket && reg.ticket_code) {
      const qrContainer = document.getElementById(`qr-${reg.id}`);
      if (qrContainer && typeof QRCode !== "undefined") {
        qrContainer.innerHTML = "";
        new QRCode(qrContainer, {
          text: reg.ticket_code,
          width: 150,
          height: 150,
          colorDark: "#1e293b",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.M,
        });
      }
    }
  });
}

// ============================================
// MODAL MANAGEMENT
// ============================================

/**
 * Inject ticket modal HTML if not exists
 */
function ensureTicketModal() {
  if (document.getElementById("eventTicketsModal")) return;
  
  const modalHTML = `
    <div id="eventTicketsModal" class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-black/60 backdrop-blur-sm" style="display: none;">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-red-600 to-red-500">
          <div class="flex items-center gap-2 text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
            </svg>
            <span class="font-semibold text-lg">Tiket Event Saya</span>
          </div>
          <button onclick="closeEventTicketsModal()" class="text-white/80 hover:text-white transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <!-- Tickets List Container -->
        <div id="eventTicketsListContainer" class="flex-1 overflow-y-auto p-4 max-h-[60vh]">
          <div class="text-center py-8 text-slate-500">
            <div class="text-4xl mb-2">⏳</div>
            <div>Memuat tiket Anda...</div>
          </div>
        </div>
        
        <!-- Modal Footer -->
        <div class="px-5 py-3 border-t border-gray-200 bg-gray-50">
          <button 
            onclick="closeEventTicketsModal()" 
            class="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

/**
 * Open the tickets modal
 */
function openEventTicketsModal() {
  ensureTicketModal();
  
  const modal = document.getElementById("eventTicketsModal");
  modal.style.display = "flex";
  modal.classList.remove("hidden");
  
  // Auto fetch tickets when opening modal
  loadMyTickets();
}

/**
 * Close the tickets modal
 */
function closeEventTicketsModal() {
  const modal = document.getElementById("eventTicketsModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.style.display = "none";
  }
}

/**
 * Load user tickets
 */
async function loadMyTickets() {
  const container = document.getElementById("eventTicketsListContainer");
  
  // Show loading
  if (container) {
    container.innerHTML = `
      <div class="text-center py-8 text-slate-500">
        <div class="animate-spin text-4xl mb-2">⏳</div>
        <div>Memuat tiket Anda...</div>
      </div>
    `;
  }
  
  // Fetch tickets
  const registrations = await fetchMyTickets();
  EventTickets.registrations = registrations;
  
  // Render results
  renderTicketsList(registrations);
  
  // Update badge
  updateTicketBadge(registrations.length);
}

/**
 * Update the floating button badge
 */
function updateTicketBadge(count) {
  const badge = document.getElementById("event-ticket-badge");
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
    }
  }
}

// ============================================
// PAYMENT CONFIRMATION
// ============================================

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    if (typeof showSuccess === "function") {
      showSuccess("Berhasil disalin ke clipboard!", "Disalin");
    }
  }).catch(() => {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    if (typeof showSuccess === "function") {
      showSuccess("Berhasil disalin ke clipboard!", "Disalin");
    }
  });
}

/**
 * Open WhatsApp for payment confirmation
 */
function openPaymentConfirmation(regId, eventTitle, amount) {
  const message = encodeURIComponent(
    `Halo Admin Docterbee,\n\n` +
    `Saya ingin mengkonfirmasi pembayaran untuk:\n` +
    `- Event: ${eventTitle}\n` +
    `- ID Pendaftaran: ${regId}\n` +
    `- Total: Rp ${formatRupiah(amount)}\n\n` +
    `Mohon diproses, terima kasih! 🙏`
  );
  
  const waUrl = `https://wa.me/${ADMIN_WA_NUMBER}?text=${message}`;
  window.open(waUrl, "_blank");
}

// ============================================
// REGISTRATION CLOSED MODAL
// ============================================

/**
 * Show registration closed modal with IG redirect
 */
function showRegistrationClosedModal() {
  if (typeof showModal === "function") {
    showModal({
      title: "Pendaftaran Ditutup",
      message: "Maaf, pendaftaran untuk event ini sudah ditutup.\n\nSilakan cek event lainnya di Instagram kami.",
      type: "warning",
      confirmText: "Lihat Instagram",
      showCancel: true,
      cancelText: "Tutup",
      onConfirm: () => {
        window.open(DOCTERBEE_INSTAGRAM, "_blank");
      },
    });
  } else {
    alert("Pendaftaran untuk event ini sudah ditutup.");
  }
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize floating ticket button for events page
 */
function initEventTicketButton() {
  // Check if we're on events page
  const eventsContainer = document.getElementById("events");
  if (!eventsContainer) return;
  
  // Check if button already exists
  if (document.getElementById("floating-ticket-btn")) return;
  
  // Inject floating button
  const buttonHTML = `
    <button 
      id="floating-ticket-btn" 
      onclick="openEventTicketsModal()" 
      class="fixed right-4 bottom-20 z-40 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition transform hover:scale-110"
      title="Lihat Tiket Saya"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
      </svg>
      <span id="event-ticket-badge" class="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 text-slate-900 text-xs font-bold rounded-full flex items-center justify-center hidden">0</span>
    </button>
  `;
  
  document.body.insertAdjacentHTML("beforeend", buttonHTML);
  
  // Auto-load tickets to update badge silently
  fetchMyTickets().then((registrations) => {
    EventTickets.registrations = registrations;
    if (registrations && registrations.length > 0) {
      updateTicketBadge(registrations.filter(r => !r.is_expired).length);
    }
  });
}

// ============================================
// EXPORTS TO WINDOW
// ============================================

window.EventTickets = EventTickets;
window.openEventTicketsModal = openEventTicketsModal;
window.closeEventTicketsModal = closeEventTicketsModal;
window.loadMyTickets = loadMyTickets;
window.copyToClipboard = copyToClipboard;
window.openPaymentConfirmation = openPaymentConfirmation;
window.showRegistrationClosedModal = showRegistrationClosedModal;
window.initEventTicketButton = initEventTicketButton;

// Auto-init on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  initEventTicketButton();
  
  // Check if we should auto-open the tickets modal (redirect from registration)
  const shouldOpenModal = localStorage.getItem("docterbee_open_tickets_modal");
  if (shouldOpenModal === "true") {
    localStorage.removeItem("docterbee_open_tickets_modal");
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      openEventTicketsModal();
    }, 300);
  }
});
