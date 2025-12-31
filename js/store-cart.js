// ============================================
// STORE CART - Shopping Cart Management
// ============================================
// Modal utilities are defined in modal-utils.js
/* global showConfirm */

// Cart state
let cart = [];

// Pending order state
let pendingOrderData = null;

// Coupon state for store
let storeCouponData = null;

// ============================================
// CART FUNCTIONS
// ============================================

// Add product to cart
function addToStoreCartInternal(productId, productName, price, imageUrl) {
  // Debug log
  console.log("addToStoreCartInternal called with:", {
    productId,
    productName,
    price,
    imageUrl,
  });

  // Ensure price is a number
  const numPrice = typeof price === "number" ? price : parseFloat(price);

  if (isNaN(numPrice)) {
    console.error("Invalid price:", price);
    showToast("Error: Harga produk tidak valid", "error");
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

  // Update total with discount applied (if coupon exists)
  updateCartUIWithDiscount();

  // Re-initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// Update cart count in navigation
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const navCartCount = document.getElementById("navCartCount");
  const mobileCartCount = document.getElementById("mobileCartCount");
  
  if (navCartCount) {
    navCartCount.textContent = totalItems;
  }
  if (mobileCartCount) {
    mobileCartCount.textContent = totalItems;
  }
}

// ============================================
// COUPON VALIDATION FOR STORE
// ============================================

// eslint-disable-next-line no-unused-vars
async function validateStoreCoupon() {
  const couponInput = document.getElementById("storeCouponCode");
  const validateBtn = document.getElementById("validateStoreCouponBtn");
  const statusDiv = document.getElementById("storeCouponStatus");
  const discountInfo = document.getElementById("storeDiscountInfo");

  const code = couponInput?.value?.trim().toUpperCase();

  if (!code) {
    showToast("Masukkan kode promo", "error");
    couponInput?.focus();
    return;
  }

  // Show loading
  const originalBtnText = validateBtn.textContent;
  validateBtn.disabled = true;
  validateBtn.textContent = "...";

  try {
    const subtotal = calculateTotal();

    const response = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        code: code,
        booking_value: subtotal,
        type: "store", // Specify this is for store
        validate_only: false, // Actually apply the coupon
      }),
    });

    const result = await response.json();

    if (!result.success || !result.valid) {
      throw new Error(result.error || "Kode promo tidak valid");
    }

    // Coupon is valid - store all data for recalculation
    storeCouponData = result.data;

    // Build discount info text
    let discountInfoText = "";
    if (storeCouponData.discountType === "percentage") {
      discountInfoText = `Diskon ${storeCouponData.discountValue}%`;
    } else {
      discountInfoText = `Diskon Rp ${storeCouponData.discountValue.toLocaleString("id-ID")}`;
    }

    // Show success message with discount info
    statusDiv.innerHTML = `
      <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-emerald-700">
        ✅ <strong>${code}</strong> - ${storeCouponData.description || discountInfoText}
        ${
          storeCouponData.minBookingValue > 0
            ? `<br><small>Min. belanja: Rp ${storeCouponData.minBookingValue.toLocaleString(
                "id-ID"
              )}</small>`
            : ""
        }
      </div>
    `;
    statusDiv.classList.remove("hidden");

    // Disable input and change button
    couponInput.disabled = true;
    validateBtn.textContent = "✓ Diterapkan";
    validateBtn.disabled = true;
    validateBtn.classList.remove("bg-emerald-500", "hover:bg-emerald-600");
    validateBtn.classList.add("bg-slate-400", "cursor-not-allowed");

    // Update cart display with discount (will recalculate based on current total)
    updateCartUIWithDiscount();

    // Show calculated discount amount in info
    const calculatedDiscount = storeCouponData.discountAmount || 0;
    discountInfo.textContent = `💰 Hemat: Rp ${calculatedDiscount.toLocaleString("id-ID")}`;
    discountInfo.classList.remove("hidden");

    showToast("✅ Kode promo berhasil diterapkan", "success");
  } catch (error) {
    console.error("Error validating coupon:", error);
    statusDiv.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-2 text-red-700">
        ❌ ${error.message}
      </div>
    `;
    statusDiv.classList.remove("hidden");
    storeCouponData = null;
    updateCartUI(); // Reset to original
    showToast(error.message, "error");
  } finally {
    validateBtn.disabled = false;
    validateBtn.textContent = originalBtnText;
  }
}

// Update cart UI with discount applied
function updateCartUIWithDiscount() {
  const originalTotal = calculateTotal();
  let finalTotal = originalTotal;
  let discountAmount = 0;

  // Calculate discount if coupon applied
  if (storeCouponData) {
    // Check if cart meets minimum booking value
    const minBookingValue = storeCouponData.minBookingValue || 0;

    if (originalTotal < minBookingValue) {
      // Cart total below minimum - remove coupon and show warning
      const code = storeCouponData.code;
      clearStoreCoupon();
      showToast(
        `⚠️ Kode promo ${code} memerlukan minimal pembelian Rp ${minBookingValue.toLocaleString(
          "id-ID"
        )}`,
        "error"
      );

      // Update display without discount
      document.getElementById("storeOriginalTotal").classList.add("hidden");
      document.getElementById("storeDiscountAmount").classList.add("hidden");
      document.getElementById("cartTotal").textContent = originalTotal.toLocaleString("id-ID");
      return;
    }

    // Recalculate discount based on current total
    if (storeCouponData.discountType === "percentage") {
      discountAmount = Math.round((originalTotal * storeCouponData.discountValue) / 100);
    } else {
      // Fixed amount discount
      discountAmount = storeCouponData.discountValue;
    }

    // Ensure discount doesn't exceed total
    discountAmount = Math.min(discountAmount, originalTotal);
    finalTotal = Math.max(0, originalTotal - discountAmount);

    // Update discount amount in storeCouponData for checkout
    storeCouponData.discountAmount = discountAmount;

    // Show original total and discount
    document.getElementById("storeOriginalAmount").textContent =
      originalTotal.toLocaleString("id-ID");
    document.getElementById("storeDiscountValue").textContent =
      discountAmount.toLocaleString("id-ID");
    document.getElementById("storeOriginalTotal").classList.remove("hidden");
    document.getElementById("storeDiscountAmount").classList.remove("hidden");

    // Update discount info display
    const discountInfo = document.getElementById("storeDiscountInfo");
    if (discountInfo) {
      discountInfo.textContent = `💰 Hemat: Rp ${discountAmount.toLocaleString("id-ID")}`;
      discountInfo.classList.remove("hidden");
    }
  } else {
    // Hide discount rows if no coupon
    document.getElementById("storeOriginalTotal").classList.add("hidden");
    document.getElementById("storeDiscountAmount").classList.add("hidden");

    const discountInfo = document.getElementById("storeDiscountInfo");
    if (discountInfo) {
      discountInfo.classList.add("hidden");
    }
  }

  // Update final total
  document.getElementById("cartTotal").textContent = finalTotal.toLocaleString("id-ID");
}

// Clear coupon data
function clearStoreCoupon() {
  storeCouponData = null;
  const couponInput = document.getElementById("storeCouponCode");
  const validateBtn = document.getElementById("validateStoreCouponBtn");
  const statusDiv = document.getElementById("storeCouponStatus");
  const discountInfo = document.getElementById("storeDiscountInfo");

  if (couponInput) couponInput.disabled = false;
  if (couponInput) couponInput.value = "";
  if (validateBtn) {
    validateBtn.disabled = false;
    validateBtn.textContent = "Gunakan";
    validateBtn.classList.remove("bg-slate-400", "cursor-not-allowed");
    validateBtn.classList.add("bg-emerald-500", "hover:bg-emerald-600");
  }
  if (statusDiv) statusDiv.classList.add("hidden");
  if (discountInfo) discountInfo.classList.add("hidden");

  updateCartUI(); // Reset to original display
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

  // Get guest customer data (if form is visible)
  const guestInfoDiv = document.getElementById("guestCustomerInfo");
  let guestData = null;

  if (guestInfoDiv && !guestInfoDiv.classList.contains("hidden")) {
    // Guest mode - validate required fields
    const guestName = document.getElementById("guestName")?.value.trim();
    const guestPhone = document.getElementById("guestPhone")?.value.trim();
    const guestAddress = document.getElementById("guestAddress")?.value.trim();

    if (!guestName) {
      showToast("Nama harus diisi", "error");
      document.getElementById("guestName")?.focus();
      return;
    }

    if (!guestPhone) {
      showToast("Nomor HP harus diisi", "error");
      document.getElementById("guestPhone")?.focus();
      return;
    }

    // Validate phone number format (basic)
    if (!/^[0-9]{10,15}$/.test(guestPhone)) {
      showToast("Format nomor HP tidak valid (10-15 digit)", "error");
      document.getElementById("guestPhone")?.focus();
      return;
    }

    guestData = {
      name: guestName,
      phone: guestPhone,
      address: guestAddress,
    };
  }

  // ✅ CHECK FOR PENDING ORDER FIRST
  try {
    const checkResponse = await fetch("/api/orders/check-pending", {
      credentials: "include",
    });

    const checkResult = await checkResponse.json();

    if (checkResult.success && checkResult.has_pending) {
      // User has pending order - show modal
      showPendingOrderModal(checkResult.data);
      return; // Stop checkout process
    }
  } catch (error) {
    console.error("Error checking pending order:", error);
    // Continue with checkout if check fails (for guest users)
  }

  // ✅ VALIDATE STOCK AVAILABILITY BEFORE CHECKOUT
  try {
    // Fetch current product stock from API
    const stockResponse = await fetch("/api/products");
    const stockData = await stockResponse.json();

    if (stockData.success && stockData.data) {
      const products = stockData.data;

      // Check each cart item against current stock
      for (const cartItem of cart) {
        const product = products.find((p) => p.id === cartItem.id);

        if (!product) {
          showToast(`Produk "${cartItem.name}" tidak ditemukan`, "error");
          return;
        }

        if (product.stock < cartItem.quantity) {
          showToast(
            `Stok tidak cukup untuk "${cartItem.name}". Tersedia: ${product.stock}, diminta: ${cartItem.quantity}`,
            "error"
          );
          return;
        }
      }
    }
  } catch (error) {
    console.error("Error validating stock:", error);
    // Continue with order - backend will validate again
  }

  const originalTotal = calculateTotal();
  let finalTotal = originalTotal;
  let discountAmount = 0;
  let couponCode = null;

  // Apply coupon discount if available
  if (storeCouponData) {
    discountAmount = storeCouponData.discountAmount || 0;
    finalTotal = Math.max(0, originalTotal - discountAmount);
    couponCode = storeCouponData.code;
  }

  const orderData = {
    order_type: orderType,
    store_location: storeLocation,
    items: cart,
    total_amount: finalTotal,
    coupon_code: couponCode,
    coupon_discount: discountAmount,
  };

  // Add guest data if available
  if (guestData) {
    orderData.guest_data = guestData;
  }

  try {
    // Show loading
    const submitButton = document.getElementById("submitOrderBtn");
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = `
      <i data-lucide="loader" class="w-4 h-4 inline animate-spin"></i>
      Memproses...
    `;

    // Debug: log order data being sent
    console.log("💾 Sending order data:", orderData);

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send session cookie
      body: JSON.stringify(orderData),
    });

    const result = await response.json();

    // Debug: log response
    console.log("📡 Response status:", response.status);
    console.log("📡 Response data:", result);

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

    // Clear coupon
    clearStoreCoupon();

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

let countdownInterval = null;

function showQRCodeModal(orderData) {
  const modal = document.getElementById("qrModal");
  const orderNumberEl = document.getElementById("qrOrderNumber");
  const expiresAtEl = document.getElementById("qrExpiresAt");
  const pointsEl = document.getElementById("qrPoints");
  const qrcodeContainer = document.getElementById("qrcode");
  const qrCodeContainerDiv = document.getElementById("qrCodeContainer");
  const modalTitle = document.getElementById("qrModalTitle");
  const modalSubtitle = document.getElementById("qrModalSubtitle");
  const warningText = document.getElementById("qrWarningText");
  const expiryLabel = document.getElementById("qrExpiryLabel");
  const countdownEl = document.getElementById("qrCountdown");

  // Set order info
  orderNumberEl.textContent = orderData.order_number;
  pointsEl.textContent = orderData.points_earned;

  // Check if order is completed
  const isCompleted = orderData.status === "completed" || orderData.status === "paid";

  if (isCompleted) {
    // Show "Pesanan Di Proses" view (no QR code)
    modalTitle.textContent = "Pesanan Di Proses!";
    modalSubtitle.textContent =
      "Pesanan anda sudah di accept oleh admin, silahkan tunggu pesanan anda. Terimakasih!";
    qrCodeContainerDiv.style.display = "none";
    warningText.style.display = "none";
    expiryLabel.textContent = "Status:";
    expiresAtEl.textContent = "COMPLETED";
    expiresAtEl.className = "font-semibold text-emerald-500 text-xs";

    // Clear any existing countdown
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }

    // Add points if not already claimed
    claimOrderPoints(orderData);
  } else {
    // Show "Pesanan Berhasil" view (with QR code and countdown)
    modalTitle.textContent = "Pesanan Berhasil!";
    modalSubtitle.textContent = "Tunjukkan QR code ini ke kasir untuk memproses pesanan Anda";
    qrCodeContainerDiv.style.display = "block";
    warningText.style.display = "block";
    expiryLabel.textContent = "Berlaku Hingga:";
    expiresAtEl.className = "font-semibold text-red-500 text-xs";

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

    // Start countdown timer
    startCountdown(expiryDate, countdownEl);
  }

  // Show modal
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function startCountdown(expiryDate, countdownEl) {
  // Clear any existing countdown
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  function updateCountdown() {
    const now = new Date().getTime();
    const expiry = new Date(expiryDate).getTime();
    const distance = expiry - now;

    if (distance < 0) {
      countdownEl.textContent = "KADALUARSA";
      countdownEl.className = "text-2xl font-bold text-red-600";
      clearInterval(countdownInterval);
      countdownInterval = null;
      return;
    }

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdownEl.textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;

    // Change color based on time remaining
    if (distance < 5 * 60 * 1000) {
      // Less than 5 minutes
      countdownEl.className = "text-2xl font-bold text-red-600 animate-pulse";
    } else if (distance < 15 * 60 * 1000) {
      // Less than 15 minutes
      countdownEl.className = "text-2xl font-bold text-orange-500";
    } else {
      countdownEl.className = "text-2xl font-bold text-red-500";
    }
  }

  // Update immediately
  updateCountdown();

  // Update every second
  countdownInterval = setInterval(updateCountdown, 1000);
}

function closeQRModal() {
  const modal = document.getElementById("qrModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");

  // Clear countdown when closing modal
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

/**
 * Check order status - refresh QR modal with latest order data
 */
async function checkOrderStatus() {
  const checkBtn = document.getElementById("checkOrderStatusBtn");
  const orderNumberEl = document.getElementById("qrOrderNumber");
  const orderNumber = orderNumberEl?.textContent;

  if (!orderNumber || orderNumber === "-") {
    showToast("❌ Order number tidak ditemukan", "error");
    return;
  }

  // Show loading state
  if (checkBtn) {
    checkBtn.disabled = true;
    checkBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Mengecek...';
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }

  try {
    // Fetch order status from backend
    const response = await fetch(`/api/orders/status/${encodeURIComponent(orderNumber)}`, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    // Handle order not found (deleted/rejected by admin)
    if (response.status === 404 || data.error === "Order not found") {
      // Close the QR modal
      closeQRModal();
      
      // Clear the last order from localStorage since it no longer exists
      clearLastOrder();
      
      // Show user-friendly message
      showToast("🚫 Pesanan telah dihapus oleh admin. Silakan order kembali.", "error");
      return;
    }

    if (data.success && data.order) {
      // Close current modal
      closeQRModal();

      // Reopen with updated data
      setTimeout(() => {
        showQRCodeModal(data.order);

        // Show feedback based on status
        if (data.order.status === "completed" || data.order.status === "paid") {
          showToast("✅ Pesanan sudah di-accept! Poin Anda telah ditambahkan.", "success");
        } else if (data.order.status === "pending") {
          showToast("⏳ Pesanan masih pending, belum di-accept admin", "info");
        } else if (data.order.status === "cancelled") {
          showToast("❌ Pesanan telah dibatalkan", "error");
        } else if (data.order.status === "expired") {
          showToast("⌛ Pesanan telah kadaluarsa", "error");
        } else {
          showToast(`ℹ️ Status: ${data.order.status}`, "info");
        }
      }, 100);
    } else {
      throw new Error(data.error || "Gagal mengecek status order");
    }
  } catch (error) {
    console.error("Error checking order status:", error);
    
    // Check if the error is specifically "Order not found"
    if (error.message && error.message.includes("not found")) {
      closeQRModal();
      clearLastOrder();
      showToast("🚫 Pesanan tidak ditemukan. Mungkin telah dihapus oleh admin. Silakan order kembali.", "error");
    } else {
      showToast("❌ Gagal mengecek status pesanan. Coba lagi.", "error");
    }
  } finally {
    // Restore button state
    if (checkBtn) {
      checkBtn.disabled = false;
      checkBtn.innerHTML = '<i data-lucide="refresh-cw" class="w-4 h-4"></i> Cek Status Pesanan';
      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }
    }
  }
}

// ============================================
// POINTS CLAIMING
// ============================================

async function claimOrderPoints(orderData) {
  // Check if points already claimed for this order
  const claimedOrders = getClaimedOrders();

  if (claimedOrders.includes(orderData.id)) {
    console.log(`Points already claimed for order ${orderData.id}`);
    return;
  }

  // If user is logged in, reload progress from database (points already added by backend)
  if (typeof window.UserDataSync !== "undefined" && window.UserDataSync.isEnabled()) {
    console.log("🔄 Reloading user progress from database...");

    try {
      // Reload progress from backend (this will update localStorage with correct points)
      await window.UserDataSync.loadProgress();

      // Refresh UI to show new points
      if (typeof window.refreshNav === "function") {
        window.refreshNav();
      }

      // Mark order as claimed
      claimedOrders.push(orderData.id);
      localStorage.setItem("docterbee_claimed_orders", JSON.stringify(claimedOrders));

      // Show toast notification
      showToast(`+${orderData.points_earned} poin telah ditambahkan ke akun Anda! 🎉`, "success");

      console.log(
        `✅ Successfully loaded ${orderData.points_earned} points from database for order ${orderData.id}`
      );
    } catch (error) {
      console.error("❌ Failed to reload progress:", error);
    }
  } else {
    // Guest mode - add points to localStorage only
    console.log("👤 Guest mode - adding points to localStorage");

    // Dispatch event for decoupled point handling (script.js listens for this)
    document.dispatchEvent(
      new CustomEvent("docterbee:pointsEarned", {
        detail: { points: orderData.points_earned },
      })
    );

    // Mark order as claimed
    claimedOrders.push(orderData.id);
    localStorage.setItem("docterbee_claimed_orders", JSON.stringify(claimedOrders));

    // Show toast notification
    showToast(`+${orderData.points_earned} poin telah ditambahkan! 🎉`, "success");

    console.log(
      `✅ Dispatched pointsEarned event with ${orderData.points_earned} points for order ${orderData.id}`
    );
  }
}

function getClaimedOrders() {
  const claimed = localStorage.getItem("docterbee_claimed_orders");
  return claimed ? JSON.parse(claimed) : [];
}

// ============================================
// LOCAL STORAGE
// ============================================

function saveCartToLocalStorage() {
  localStorage.setItem("docterbee_cart", JSON.stringify(cart));

  // Auto-save to database if sync is enabled
  if (window.UserDataSync && window.UserDataSync.isEnabled()) {
    window.UserDataSync.debouncedSaveCart();
  }
}

function loadCartFromLocalStorage() {
  const savedCart = localStorage.getItem("docterbee_cart");
  if (savedCart) {
    try {
      const parsed = JSON.parse(savedCart);
      // Ensure cart is always an array
      cart = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error parsing cart from localStorage:", error);
      cart = [];
      localStorage.removeItem("docterbee_cart"); // Clear corrupted data
    }
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

// Clear last order (when order is deleted/rejected by admin)
function clearLastOrder() {
  localStorage.removeItem("docterbee_last_order");
  updateLastOrderButton();
}

// Reopen last order QR with latest status from server
async function reopenLastOrderQR() {
  const lastOrder = getLastOrder();
  if (!lastOrder) {
    showToast("Belum ada transaksi", "error");
    return;
  }

  try {
    // Fetch latest order status from server (requires auth)
    const response = await fetch(`/api/orders/id/${lastOrder.id}`, {
      credentials: "include",
    });
    const result = await response.json();

    if (!result.success) {
      // If auth failed (401/403), try order number endpoint instead
      if (response.status === 401 || response.status === 403) {
        console.log("Auth required for /api/orders/id, trying order number...");
        const altResponse = await fetch(`/api/orders/status/${encodeURIComponent(lastOrder.order_number)}`, {
          credentials: "include",
        });
        const altResult = await altResponse.json();
        
        if (altResult.success && altResult.order) {
          showQRCodeModal(altResult.order);
          return;
        }
      }
      throw new Error("Gagal mengambil status order");
    }

    const updatedOrder = result.data;

    // Update localStorage with latest data
    saveLastOrder(updatedOrder);

    // Show modal with updated status
    showQRCodeModal(updatedOrder);
  } catch (error) {
    console.error("Error fetching order status:", error);
    // Fallback to cached data if server fails
    showQRCodeModal(lastOrder);
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
    type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
  }`;
  toast.textContent = message;

  document.body.appendChild(toast);

  // Display for 5 seconds (increased from 3s for better readability)
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// ============================================
// PENDING ORDER MODAL FUNCTIONS
// ============================================

function showPendingOrderModal(orderData) {
  pendingOrderData = orderData;
  const modal = document.getElementById("pendingOrderModal");

  // Populate order info
  document.getElementById("pendingOrderNumber").textContent = orderData.order_number;
  document.getElementById("pendingOrderTotal").textContent = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(orderData.total_amount);

  // Format order type
  const orderTypeText = orderData.order_type === "dine_in" ? "Dine In" : "Take Away";
  document.getElementById("pendingOrderType").textContent = orderTypeText;

  // Format expiry date
  const expiryDate = new Date(orderData.expires_at);
  document.getElementById("pendingExpiresAt").textContent = expiryDate.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Display items
  const itemsContainer = document.getElementById("pendingOrderItems");
  const items = JSON.parse(orderData.items);
  itemsContainer.innerHTML = items
    .map(
      (item) => `
    <div class="flex justify-between text-xs text-slate-700">
      <span>${item.name} x${item.quantity}</span>
      <span class="font-semibold">${new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(item.price * item.quantity)}</span>
    </div>
  `
    )
    .join("");

  // Generate QR Code
  const qrContainer = document.getElementById("pendingQrcode");
  qrContainer.innerHTML = ""; // Clear previous QR

  new QRCode(qrContainer, {
    text: orderData.qr_code_data,
    width: 200,
    height: 200,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });

  // Show modal
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  // Reinitialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function closePendingOrderModal() {
  const modal = document.getElementById("pendingOrderModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  pendingOrderData = null;
}

async function cancelPendingOrderAndRetry() {
  if (!pendingOrderData) {
    showToast("Data order tidak ditemukan", "error");
    return;
  }

  showConfirm(
    `Apakah Anda yakin ingin membatalkan order ${pendingOrderData.order_number}?\n\n⚠️ Poin yang dijanjikan tidak akan diberikan jika order dibatalkan.`,
    async () => {
      await performCancelOrder();
    },
    null,
    "Konfirmasi Batal Order"
  );
}

async function performCancelOrder() {

  try {
    // Call cancel endpoint
    const response = await fetch(`/api/orders/${pendingOrderData.id}/cancel`, {
      method: "PATCH",
      credentials: "include",
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Gagal membatalkan order");
    }

    showToast("✅ Order berhasil dibatalkan", "success");
    closePendingOrderModal();

    // Wait a bit then retry checkout
    setTimeout(() => {
      submitOrder();
    }, 500);
  } catch (error) {
    console.error("Error canceling order:", error);
    showToast("❌ Error: " + error.message, "error");
  }
}

// Make functions globally accessible
window.closePendingOrderModal = closePendingOrderModal;
window.cancelPendingOrderAndRetry = cancelPendingOrderAndRetry;

// ============================================
// CUSTOMER INFO MANAGEMENT
// ============================================

async function initCustomerInfo() {
  try {
    // Check if user is logged in
    const response = await fetch("/api/auth/check", {
      credentials: "include",
    });

    const data = await response.json();
    const guestInfoDiv = document.getElementById("guestCustomerInfo");

    if (data.loggedIn && data.user) {
      // User is logged in - hide guest form
      if (guestInfoDiv) {
        guestInfoDiv.classList.add("hidden");
      }
    } else {
      // Guest user - show form
      if (guestInfoDiv) {
        guestInfoDiv.classList.remove("hidden");
      }
    }
  } catch (error) {
    console.error("Error checking auth status:", error);
    // Show guest form on error
    const guestInfoDiv = document.getElementById("guestCustomerInfo");
    if (guestInfoDiv) {
      guestInfoDiv.classList.remove("hidden");
    }
  }
}

// ============================================
// INIT
// ============================================

// Load cart on page load
document.addEventListener("DOMContentLoaded", () => {
  loadCartFromLocalStorage();
  updateLastOrderButton();
  initCustomerInfo();
});

// Expose functions to window
window.addToStoreCart = addToStoreCartInternal; // Expose internal function
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.submitOrder = submitOrder;
window.closeQRModal = closeQRModal;
window.reopenLastOrderQR = reopenLastOrderQR;
