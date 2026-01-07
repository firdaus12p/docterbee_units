// ============================================
// ORDERS MANAGER - Admin Dashboard
// ============================================
// Note: API_BASE and adminFetch are defined in admin-dashboard.js
// Modal utilities are defined in modal-utils.js
/* global showSuccess, showError, showWarning, showConfirm, API_BASE, adminFetch */

// ============================================
// LOAD ORDERS
// ============================================

async function loadOrders() {
  const tableBody = document.getElementById("ordersTableBody");
  if (!tableBody) return;

  // Get current location from global state
  const locationId = window.adminLocationState?.currentLocationId || null;
  const locationName = window.adminLocationState?.currentLocationName || "Semua Lokasi";

  try {
    // Show loading
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
          <p class="mt-2 text-slate-400">Memuat orders...</p>
        </td>
      </tr>
    `;

    const response = await adminFetch(`${API_BASE}/orders`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Gagal memuat orders");
    }

    let orders = result.data;

    // Filter orders by selected location if applicable
    if (locationId) {
      orders = orders.filter((order) => {
        // Match by location_id if present, otherwise match by store_location name
        if (order.location_id) {
          return order.location_id === locationId;
        }
        // Fallback: match store_location string to location name (case-insensitive)
        return (
          order.store_location &&
          order.store_location.toLowerCase() === locationName.toLowerCase()
        );
      });
    }

    // Update location indicator in section header
    updateOrdersLocationIndicator(locationName, locationId, orders.length);

    if (orders.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center py-8 text-slate-400">
            ${locationId ? `Belum ada order di ${locationName}` : "Belum ada order"}
          </td>
        </tr>
      `;
      return;
    }

    // Render orders
    tableBody.innerHTML = orders
      .map((order) => {
        const statusBadge = getStatusBadge(order.status, order.payment_status);
        const expiryStatus = getExpiryStatus(order.expires_at, order.status);
        const pointsStatus = getPointsStatus(order);

        return `
          <tr class="border-b border-slate-800 hover:bg-slate-800/30">
            <td class="px-4 py-3">
              <span class="font-mono text-sm text-amber-400">${
                order.order_number
              }</span>
            </td>
            <td class="px-4 py-3">
              <div class="text-sm">${order.customer_name || "Guest"}</div>
              ${
                order.customer_phone
                  ? `<div class="text-xs text-slate-400">${order.customer_phone}</div>`
                  : ""
              }
            </td>
            <td class="px-4 py-3">
              <span class="text-xs px-2 py-1 rounded-full ${
                order.order_type === "dine_in"
                  ? "bg-amber-900/30 text-amber-400"
                  : "bg-emerald-900/30 text-emerald-400"
              }">
                ${order.order_type === "dine_in" ? "Dine In" : "Take Away"}
              </span>
            </td>
            <td class="px-4 py-3 text-sm capitalize">${
              order.store_location
            }</td>
            <td class="px-4 py-3">
              <span class="font-semibold text-amber-400">Rp ${parseFloat(
                order.total_amount
              ).toLocaleString("id-ID")}</span>
            </td>
            <td class="px-4 py-3">
              ${statusBadge}
              ${expiryStatus}
            </td>
            <td class="px-4 py-3">
              ${pointsStatus}
            </td>
            <td class="px-4 py-3 text-xs text-slate-400">
              ${formatOrderDateTime(order.created_at)}
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-col gap-2">
                <div class="flex gap-2">
                  <button
                    onclick="viewOrderDetails('${order.order_number}')"
                    class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition"
                    title="View Details"
                  >
                    <i data-lucide="eye" class="w-3 h-3"></i>
                  </button>
                  ${
                    order.status === "pending"
                      ? `<button
                          onclick="completeOrder(${order.id})"
                          class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-xs transition"
                          title="Complete Order"
                        >
                          <i data-lucide="check" class="w-3 h-3"></i>
                        </button>`
                      : ""
                  }
                  <button
                    onclick="deleteOrder(${order.id})"
                    class="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition"
                    title="Hapus Order"
                  >
                    <i data-lucide="trash-2" class="w-3 h-3"></i>
                  </button>
                </div>
                ${
                  order.status === "completed" &&
                  !order.user_id &&
                  order.customer_phone
                    ? `<button
                        onclick="openAssignPointsModal(${order.id}, '${order.order_number}', ${order.points_earned}, '${order.customer_phone}')"
                        class="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs transition w-full"
                        title="Assign Points by Phone"
                      >
                        <i data-lucide="award" class="w-3 h-3 inline mr-1"></i>
                        Assign Points
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
  } catch (error) {
    console.error("Error loading orders:", error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-8 text-red-400">
          Error: ${error.message}
        </td>
      </tr>
    `;
  }
}

// Update the orders section header with location indicator
function updateOrdersLocationIndicator(locationName, locationId, orderCount) {
  const sectionHeader = document.querySelector("#section-orders h2");
  if (!sectionHeader) return;

  // Reset header
  sectionHeader.innerHTML = "Orders Manager";

  // Add location badge if filtering
  if (locationId) {
    sectionHeader.innerHTML = `
      Orders Manager
      <span class="ml-2 px-2 py-1 text-xs rounded-full bg-amber-900/30 text-amber-400 font-normal">
        <i data-lucide="map-pin" class="w-3 h-3 inline"></i>
        ${escapeHtml(locationName)} (${orderCount})
      </span>
    `;
    // Refresh icons
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }
}

// Listen for location changes to reload orders
document.addEventListener("locationChanged", function (e) {
  console.log("[Orders] Location changed, reloading orders...", e.detail);
  // Only reload if orders section is currently visible
  const ordersSection = document.getElementById("section-orders");
  if (ordersSection && !ordersSection.classList.contains("hidden")) {
    loadOrders();
  }
});

// ============================================
// QR SCANNER
// ============================================

let html5QrCode = null;

function openQRScanner() {
  const modal = document.getElementById("qrScannerModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  // Initialize scanner
  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode("qr-reader");
  }

  html5QrCode
    .start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      onScanSuccess,
      onScanError
    )
    .catch((err) => {
      console.error("Error starting QR scanner:", err);
      showError("Gagal membuka camera. Pastikan browser memiliki akses ke camera.");
    });
}

function closeQRScanner() {
  const modal = document.getElementById("qrScannerModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");

  if (html5QrCode) {
    html5QrCode
      .stop()
      .then(() => {
        console.log("QR Scanner stopped");
      })
      .catch((err) => {
        console.error("Error stopping scanner:", err);
      });
  }
}

async function onScanSuccess(decodedText, _decodedResult) {
  console.log(`QR Code scanned: ${decodedText}`);

  // Stop scanner
  closeQRScanner();

  // Fetch order details
  await viewOrderDetails(decodedText);
}

function onScanError(_errorMessage) {
  // Ignore scan errors (happens frequently)
}

// ============================================
// VIEW ORDER DETAILS
// ============================================

async function viewOrderDetails(orderNumber) {
  try {
    const response = await adminFetch(`${API_BASE}/orders/${orderNumber}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Order tidak ditemukan");
    }

    const order = result.data;
    const items = JSON.parse(order.items);

    // Show order details modal
    const modal = document.getElementById("orderDetailsModal");
    const detailsContainer = document.getElementById("orderDetailsContent");

    const expiryDate = new Date(order.expires_at);
    const now = new Date();
    const isExpired = now > expiryDate && order.status === "pending";

    detailsContainer.innerHTML = `
      <div class="space-y-4">
        <!-- Order Number -->
        <div class="bg-slate-800 rounded-lg p-4">
          <div class="text-xs text-slate-400 mb-1">Order Number</div>
          <div class="text-2xl font-bold font-mono text-amber-400">${
            order.order_number
          }</div>
        </div>

        <!-- Customer Info -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <div class="text-xs text-slate-400 mb-1">Customer</div>
            <div class="font-semibold">${order.customer_name || "Guest"}</div>
          </div>
          <div>
            <div class="text-xs text-slate-400 mb-1">Phone</div>
            <div class="font-semibold">${order.customer_phone || "-"}</div>
          </div>
        </div>

        <!-- Order Type & Location -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <div class="text-xs text-slate-400 mb-1">Type</div>
            <span class="inline-block px-3 py-1 rounded-full text-sm ${
              order.order_type === "dine_in"
                ? "bg-amber-900/30 text-amber-400"
                : "bg-emerald-900/30 text-emerald-400"
            }">
              ${order.order_type === "dine_in" ? "Dine In" : "Take Away"}
            </span>
          </div>
          <div>
            <div class="text-xs text-slate-400 mb-1">Location</div>
            <div class="font-semibold capitalize">${order.store_location}</div>
          </div>
        </div>

        <!-- Items -->
        <div>
          <div class="text-xs text-slate-400 mb-2">Items</div>
          <div class="space-y-2">
            ${items
              .map(
                (item) => `
              <div class="flex justify-between items-center bg-slate-800 rounded p-3">
                <div>
                  <div class="font-semibold">${item.name}</div>
                  <div class="text-xs text-slate-400">${
                    item.quantity
                  }x @ Rp ${item.price.toLocaleString("id-ID")}</div>
                </div>
                <div class="font-bold text-amber-400">
                  Rp ${(item.price * item.quantity).toLocaleString("id-ID")}
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <!-- Total & Points -->
        <div class="bg-amber-900/20 border border-amber-400/30 rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-lg font-semibold">Total</span>
            <span class="text-2xl font-bold text-amber-400">Rp ${parseFloat(
              order.total_amount
            ).toLocaleString("id-ID")}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-slate-400">Points Earned</span>
            <span class="font-semibold text-emerald-400">+${
              order.points_earned
            } poin</span>
          </div>
        </div>

        <!-- Status & Expiry -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <div class="text-xs text-slate-400 mb-1">Status</div>
            ${getStatusBadge(order.status, order.payment_status)}
          </div>
          <div>
            <div class="text-xs text-slate-400 mb-1">Expires At</div>
            <div class="text-sm ${
              isExpired ? "text-red-400" : "text-slate-300"
            }">
              ${expiryDate.toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        ${
          order.status === "pending" && !isExpired
            ? `
          <button
            onclick="completeOrderFromModal(${order.id})"
            class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <i data-lucide="check-circle" class="w-5 h-5"></i>
            Complete Order
          </button>
        `
            : ""
        }
      </div>
    `;

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    // Re-initialize Lucide icons
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  } catch (error) {
    console.error("Error viewing order:", error);
    showError("Error: " + error.message);
  }
}

function closeOrderDetailsModal() {
  const modal = document.getElementById("orderDetailsModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

// ============================================
// COMPLETE ORDER
// ============================================

async function completeOrder(orderId) {
  showConfirm(
    "Complete order ini? Status akan berubah menjadi PAID dan COMPLETED.",
    async () => {
      try {
        const response = await adminFetch(`${API_BASE}/orders/${orderId}/complete`, {
          method: "PATCH",
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Gagal complete order");
        }

        showSuccess("Order berhasil di-complete!");
        loadOrders(); // Reload orders
      } catch (error) {
        console.error("Error completing order:", error);
        showError("Error: " + error.message);
      }
    }
  );
}

// ============================================
// DELETE ORDER
// ============================================

async function deleteOrder(orderId) {
  showConfirm(
    "Hapus order ini? Data akan dihapus permanen dan tidak dapat dikembalikan.",
    async () => {
      try {
        const response = await adminFetch(`${API_BASE}/orders/${orderId}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Gagal menghapus order");
        }

        showSuccess("Order berhasil dihapus!");
        loadOrders(); // Reload orders
      } catch (error) {
        console.error("Error deleting order:", error);
        showError("Error: " + error.message);
      }
    },
    null,
    "Konfirmasi Hapus Order"
  );
}

async function completeOrderFromModal(orderId) {
  await completeOrder(orderId);
  closeOrderDetailsModal();
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getStatusBadge(status, paymentStatus) {
  const statusColors = {
    pending: "bg-yellow-900/30 text-yellow-400",
    completed: "bg-emerald-900/30 text-emerald-400",
    expired: "bg-red-900/30 text-red-400",
    cancelled: "bg-slate-700 text-slate-400",
  };

  const paymentColors = {
    pending: "bg-orange-900/30 text-orange-400",
    paid: "bg-emerald-900/30 text-emerald-400",
  };

  return `
    <div class="flex flex-col gap-1">
      <span class="text-xs px-2 py-1 rounded-full ${
        statusColors[status] || "bg-slate-700 text-slate-400"
      }">
        ${status.toUpperCase()}
      </span>
      <span class="text-xs px-2 py-1 rounded-full ${
        paymentColors[paymentStatus] || "bg-slate-700 text-slate-400"
      }">
        ${paymentStatus === "paid" ? "PAID" : "UNPAID"}
      </span>
    </div>
  `;
}

function getExpiryStatus(expiresAt, status) {
  if (status !== "pending") return "";

  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry - now;

  if (diff < 0) {
    return '<div class="text-xs text-red-400 mt-1">⚠️ EXPIRED</div>';
  }

  const minutes = Math.floor(diff / 60000);
  if (minutes < 10) {
    return `<div class="text-xs text-orange-400 mt-1">⏰ ${minutes} min left</div>`;
  }

  return "";
}

// Note: Using local function instead of global formatDate because orders need time display
function formatOrderDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPointsStatus(order) {
  if (order.status !== "completed") {
    return '<span class="text-xs text-slate-500">-</span>';
  }

  // If user_id exists, points already assigned
  if (order.user_id) {
    return `
      <div class="flex flex-col gap-1">
        <span class="text-xs px-2 py-1 rounded-full bg-emerald-900/30 text-emerald-400">
          ✓ ${order.points_earned} pts
        </span>
        <span class="text-xs text-slate-500">Assigned</span>
      </div>
    `;
  }

  // Guest order - check if phone exists
  if (order.customer_phone) {
    return `
      <div class="flex flex-col gap-1">
        <span class="text-xs px-2 py-1 rounded-full bg-amber-900/30 text-amber-400">
          ⏳ ${order.points_earned} pts
        </span>
        <span class="text-xs text-slate-500">Claimable</span>
      </div>
    `;
  }

  // No phone - points lost
  return `
    <div class="flex flex-col gap-1">
      <span class="text-xs px-2 py-1 rounded-full bg-red-900/30 text-red-400">
        ✗ ${order.points_earned} pts
      </span>
      <span class="text-xs text-slate-500">Lost</span>
    </div>
  `;
}

// ============================================
// ASSIGN POINTS BY PHONE
// ============================================

function openAssignPointsModal(
  orderId,
  orderNumber,
  pointsEarned,
  customerPhone
) {
  const modal = document.getElementById("assignPointsModal");
  if (!modal) {
    // Create modal if not exists
    createAssignPointsModal();
    return openAssignPointsModal(
      orderId,
      orderNumber,
      pointsEarned,
      customerPhone
    );
  }

  // Set modal data
  document.getElementById("assignOrderId").value = orderId;
  document.getElementById("assignOrderNumber").textContent = orderNumber;
  document.getElementById("assignPointsAmount").textContent = pointsEarned;
  document.getElementById("assignPhoneInput").value = customerPhone;
  document.getElementById("assignPhoneDisplay").textContent = customerPhone;

  // Show modal
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeAssignPointsModal() {
  const modal = document.getElementById("assignPointsModal");
  if (modal) {
    modal.classList.remove("flex");
    modal.classList.add("hidden");
  }
}

async function submitAssignPoints() {
  const orderId = document.getElementById("assignOrderId").value;
  const phone = document.getElementById("assignPhoneInput").value.trim();

  if (!phone) {
    showWarning("Nomor HP harus diisi");
    return;
  }

  try {
    const submitBtn = document.querySelector(
      "#assignPointsModal button[type='submit']"
    );
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i data-lucide="loader" class="w-4 h-4 inline animate-spin"></i> Processing...';

    const response = await adminFetch(
      `${API_BASE}/orders/${orderId}/assign-points-by-phone`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Gagal assign points");
    }

    // Success
    showSuccess(
      `${result.message}\n\n${result.data.points_added} points berhasil diberikan ke ${result.data.user.name}`
    );

    closeAssignPointsModal();
    loadOrders(); // Reload orders table

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  } catch (error) {
    console.error("Error assigning points:", error);
    showError("❌ Error: " + error.message);

    const submitBtn = document.querySelector(
      "#assignPointsModal button[type='submit']"
    );
    submitBtn.disabled = false;
    submitBtn.innerHTML =
      '<i data-lucide="award" class="w-4 h-4 inline mr-1"></i> Assign Points';
  }
}

function createAssignPointsModal() {
  const modalHTML = `
    <div id="assignPointsModal" class="fixed inset-0 bg-black/80 z-50 hidden items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-white">Assign Points by Phone</h3>
          <button onclick="closeAssignPointsModal()" class="text-slate-400 hover:text-slate-200">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <div class="space-y-4">
          <input type="hidden" id="assignOrderId" />
          
          <div class="bg-slate-800 rounded-lg p-4">
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="text-slate-400">Order Number:</div>
              <div class="font-mono text-amber-400" id="assignOrderNumber">-</div>
              
              <div class="text-slate-400">Points to Assign:</div>
              <div class="font-bold text-emerald-400">
                <i data-lucide="award" class="w-4 h-4 inline"></i>
                <span id="assignPointsAmount">0</span> pts
              </div>
              
              <div class="text-slate-400">Customer Phone:</div>
              <div class="font-semibold text-white" id="assignPhoneDisplay">-</div>
            </div>
          </div>

          <div class="bg-amber-900/20 border border-amber-800/50 rounded-lg p-3 text-sm text-amber-200">
            <i data-lucide="info" class="w-4 h-4 inline mr-1"></i>
            System akan mencari user dengan nomor HP ini. Jika tidak terdaftar, points akan hilang.
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-300 mb-2">
              Konfirmasi Nomor HP
            </label>
            <input 
              type="tel" 
              id="assignPhoneInput"
              placeholder="08123456789"
              class="w-full bg-slate-800 border-2 border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none transition"
            />
          </div>

          <div class="flex gap-3">
            <button 
              onclick="closeAssignPointsModal()"
              class="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
            >
              Batal
            </button>
            <button 
              onclick="submitAssignPoints()"
              type="submit"
              class="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
            >
              <i data-lucide="award" class="w-4 h-4 inline mr-1"></i>
              Assign Points
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Initialize lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// ============================================
// EXPOSE FUNCTIONS
// ============================================

window.loadOrders = loadOrders;
window.openQRScanner = openQRScanner;
window.closeQRScanner = closeQRScanner;
window.viewOrderDetails = viewOrderDetails;
window.closeOrderDetailsModal = closeOrderDetailsModal;
window.completeOrder = completeOrder;
window.completeOrderFromModal = completeOrderFromModal;
window.openAssignPointsModal = openAssignPointsModal;
window.closeAssignPointsModal = closeAssignPointsModal;
window.submitAssignPoints = submitAssignPoints;
