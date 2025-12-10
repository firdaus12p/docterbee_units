// ============================================
// STORE CART - Shopping Cart Management
// ============================================

const API_BASE = "http://localhost:3000/api";

// Cart state
let cart = [];
let currentUser = null; // TODO: Get from login system

// ============================================
// CART FUNCTIONS
// ============================================

// Add product to cart
function addToStoreCartInternal(productId, productName, price, imageUrl) {
  // Debug log
  console.log('addToStoreCartInternal called with:', { productId, productName, price, imageUrl });
  
  // Ensure price is a number
  const numPrice = typeof price === 'number' ? price : parseFloat(price);
  
  if (isNaN(numPrice)) {
    console.error('Invalid price:', price);
    showToast('Error: Harga produk tidak valid', 'error');
    return;
  }
  
  // Check if product already in cart
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      name: productName,
      price: numPrice,
      image: imageUrl || null,
      quantity: 1,
    });
  }

  updateCartUI();
  updateCartCount();
  saveCartToLocalStorage();

  // Show feedback
  showToast(`${productName} ditambahkan ke keranjang`);
}

// Remove from cart
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartUI();
  updateCartCount();
  saveCartToLocalStorage();
}

// Update quantity
function updateQuantity(productId, change) {
  const item = cart.find((item) => item.id === productId);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    updateCartUI();
    saveCartToLocalStorage();
  }
}

// Calculate total
function calculateTotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

// Update cart UI
function updateCartUI() {
  const cartItemsContainer = document.getElementById("cartItems");
  const cartTotalElement = document.getElementById("cartTotal");

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <p class="text-slate-500 text-sm text-center py-8">
        Keranjang belanja kosong. Tambahkan produk untuk mulai berbelanja.
      </p>
    `;
    cartTotalElement.textContent = "0";
    return;
  }

  // Render cart items
  cartItemsContainer.innerHTML = cart
    .map(
      (item) => `
    <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-gray-200">
      ${
        item.image
          ? `<img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg">`
          : `<div class="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
               <i data-lucide="package" class="w-6 h-6 text-slate-400"></i>
             </div>`
      }
      <div class="flex-1">
        <h4 class="font-semibold text-sm text-slate-900">${item.name}</h4>
        <p class="text-xs text-amber-500 font-bold">Rp ${item.price.toLocaleString("id-ID")}</p>
      </div>
      <div class="flex items-center gap-2">
        <button 
          onclick="updateQuantity(${item.id}, -1)"
          class="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition"
        >
          <i data-lucide="minus" class="w-3 h-3"></i>
        </button>
        <span class="w-8 text-center font-semibold text-sm">${item.quantity}</span>
        <button 
          onclick="updateQuantity(${item.id}, 1)"
          class="w-7 h-7 rounded-full bg-amber-400 hover:bg-amber-500 flex items-center justify-center transition"
        >
          <i data-lucide="plus" class="w-3 h-3"></i>
        </button>
      </div>
      <button 
        onclick="removeFromCart(${item.id})"
        class="text-red-500 hover:text-red-600 transition"
        title="Hapus"
      >
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    </div>
  `
    )
    .join("");

  // Update total
  const total = calculateTotal();
  cartTotalElement.textContent = total.toLocaleString("id-ID");

  // Re-initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// Update cart count in navigation
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("navCartCount").textContent = totalItems;
  document.getElementById("mobileCartCount").textContent = totalItems;
}

// ============================================
// ORDER SUBMISSION
// ============================================

async function submitOrder() {
  if (cart.length === 0) {
    showToast("Keranjang belanja kosong", "error");
    return;
  }

  // Get order details
  const orderType = document.querySelector('input[name="orderType"]:checked')?.value;
  const storeLocation = document.getElementById("storeLocation")?.value;

  if (!orderType) {
    showToast("Pilih tipe order (Dine In / Take Away)", "error");
    return;
  }

  if (!storeLocation) {
    showToast("Pilih lokasi store", "error");
    return;
  }

  // TODO: Get user info from login system
  const customerName = "Guest User"; // Temporary
  const customerPhone = ""; // Temporary
  const customerEmail = ""; // Temporary

  const totalAmount = calculateTotal();

  const orderData = {
    user_id: currentUser?.id || null,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail,
    order_type: orderType,
    store_location: storeLocation,
    items: cart,
    total_amount: totalAmount,
  };

  try {
    // Show loading
    const submitButton = document.getElementById("submitOrderBtn");
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = `
      <i data-lucide="loader" class="w-4 h-4 inline animate-spin"></i>
      Memproses...
    `;

    const response = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Gagal membuat order");
    }

    // Success - show QR code
    showQRCodeModal(result.data);

    // Save last order to localStorage
    saveLastOrder(result.data);

    // Clear cart
    cart = [];
    updateCartUI();
    updateCartCount();
    saveCartToLocalStorage();

    submitButton.disabled = false;
    submitButton.innerHTML = originalText;
  } catch (error) {
    console.error("Error submitting order:", error);
    showToast("Error: " + error.message, "error");

    // Reset button
    const submitButton = document.getElementById("submitOrderBtn");
    submitButton.disabled = false;
    submitButton.innerHTML = `
      <i data-lucide="send" class="w-4 h-4 inline mr-2"></i>
      Kirim Pesanan
    `;
  }
}

// ============================================
// QR CODE MODAL
// ============================================

function showQRCodeModal(orderData) {
  const modal = document.getElementById("qrModal");
  const orderNumberEl = document.getElementById("qrOrderNumber");
  const expiresAtEl = document.getElementById("qrExpiresAt");
  const pointsEl = document.getElementById("qrPoints");
  const qrcodeContainer = document.getElementById("qrcode");

  // Set order info
  orderNumberEl.textContent = orderData.order_number;
  pointsEl.textContent = orderData.points_earned;

  // Format expiry time
  const expiryDate = new Date(orderData.expires_at);
  expiresAtEl.textContent = expiryDate.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Clear previous QR code
  qrcodeContainer.innerHTML = "";

  // Generate QR code
  new QRCode(qrcodeContainer, {
    text: orderData.qr_code_data,
    width: 256,
    height: 256,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });

  // Show modal
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeQRModal() {
  const modal = document.getElementById("qrModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

// ============================================
// LOCAL STORAGE
// ============================================

function saveCartToLocalStorage() {
  localStorage.setItem("docterbee_cart", JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
  const savedCart = localStorage.getItem("docterbee_cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartUI();
    updateCartCount();
  }
}

// Save last order
function saveLastOrder(orderData) {
  localStorage.setItem("docterbee_last_order", JSON.stringify(orderData));
  updateLastOrderButton();
}

// Load last order
function getLastOrder() {
  const savedOrder = localStorage.getItem("docterbee_last_order");
  return savedOrder ? JSON.parse(savedOrder) : null;
}

// Reopen last order QR
function reopenLastOrderQR() {
  const lastOrder = getLastOrder();
  if (lastOrder) {
    // Check if order is still valid (not expired)
    const expiryDate = new Date(lastOrder.expires_at);
    const now = new Date();
    
    if (now > expiryDate) {
      showToast("QR code sudah kadaluarsa", "error");
      return;
    }
    
    showQRCodeModal(lastOrder);
  } else {
    showToast("Belum ada transaksi", "error");
  }
}

// Update last order button visibility
function updateLastOrderButton() {
  const lastOrder = getLastOrder();
  const button = document.getElementById("lastOrderBtn");
  
  if (button) {
    if (lastOrder) {
      const expiryDate = new Date(lastOrder.expires_at);
      const now = new Date();
      
      if (now <= expiryDate) {
        button.classList.remove("hidden");
      } else {
        button.classList.add("hidden");
      }
    } else {
      button.classList.add("hidden");
    }
  }
}

// ============================================
// TOAST NOTIFICATION
// ============================================

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all ${
    type === "error"
      ? "bg-red-500 text-white"
      : "bg-emerald-500 text-white"
  }`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// INIT
// ============================================

// Load cart on page load
document.addEventListener("DOMContentLoaded", () => {
  loadCartFromLocalStorage();
  updateLastOrderButton();
});

// Expose functions to window
window.addToStoreCart = addToStoreCartInternal; // Expose internal function
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.submitOrder = submitOrder;
window.closeQRModal = closeQRModal;
window.reopenLastOrderQR = reopenLastOrderQR;
