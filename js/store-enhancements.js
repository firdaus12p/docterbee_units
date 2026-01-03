/**
 * Store UX Enhancements - JavaScript
 * Version: 1.0.0
 * Date: 2026-01-03
 * 
 * Features:
 * - Floating Cart Button with Badge
 * - Cart Drawer System
 * - Product Detail Modal
 * - Checkout Modal Flow
 * - Enhanced Product Cards
 * - Category Tooltips (Mobile)
 */

// ============================================
// STATE MANAGEMENT
// ============================================

let cartDrawerOpen = false;
let currentProduct = null;

// ============================================
// 1. FLOATING CART & DRAWER
// ============================================

/**
 * Toggle cart drawer open/close
 */
function toggleCartDrawer() {
  cartDrawerOpen = !cartDrawerOpen;
  
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  
  if (!drawer || !overlay) return;
  
  if (cartDrawerOpen) {
    overlay.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    // Populate drawer content
    populateCartDrawer();
    
    // Reinitialize lucide icons
    if (typeof lucide !== 'undefined') {
      setTimeout(() => lucide.createIcons(), 50);
    }
  } else {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/**
 * Populate cart drawer with current cart items
 */
function populateCartDrawer() {
  const drawerBody = document.getElementById('cart-drawer-body');
  if (!drawerBody) return;
  
  const cart = JSON.parse(localStorage.getItem('docterbee_cart') || '[]');
  
  if (cart.length === 0) {
    drawerBody.innerHTML = `
      <div class="empty-cart-state">
        <div class="empty-icon">
          <i data-lucide="shopping-cart"></i>
        </div>
        <h3 class="empty-title">Keranjang Kosong</h3>
        <p class="empty-description">Yuk pilih produk kesehatan terbaik untuk Anda!</p>
        <div class="empty-suggestions">
          <p class="suggestion-title">Mungkin Anda tertarik:</p>
          <div class="suggestion-chips">
            <button class="chip" onclick="filterAndCloseDrawer('Zona Honey')">🍯 Madu Premium</button>
            <button class="chip" onclick="filterAndCloseDrawer('Coffee')">☕ Coffee</button>
            <button class="chip" onclick="filterAndCloseDrawer('Zona Sunnah')">🌙 Zona Sunnah</button>
          </div>
        </div>
      </div>
    `;
    return;
  }
  
  // Get total and check member status
  const isLoggedIn = !!sessionStorage.getItem('userId');
  
  let itemsHtml = '<div class="drawer-cart-items">';
  let subtotal = 0;
  
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    itemsHtml += `
      <div class="drawer-cart-item fade-in" style="animation-delay: ${index * 50}ms">
        <div class="drawer-item-info">
          <h4 class="drawer-item-name">${escapeHtml(item.name)}</h4>
          <div class="drawer-item-price">Rp ${formatPrice(item.price)}</div>
        </div>
        <div class="drawer-item-controls">
          <div class="drawer-qty-controls">
            <button onclick="updateCartQtyFromDrawer(${item.product_id || item.id}, ${item.quantity - 1})">−</button>
            <span>${item.quantity}</span>
            <button onclick="updateCartQtyFromDrawer(${item.product_id || item.id}, ${item.quantity + 1})">+</button>
          </div>
          <button class="drawer-remove-btn" onclick="removeFromCartDrawer(${item.product_id || item.id})" title="Hapus">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
    `;
  });
  itemsHtml += '</div>';
  
  // Order options
  const orderOptionsHtml = `
    <div class="drawer-order-options">
      <div class="drawer-option-group">
        <label class="drawer-label">Tipe Pesanan</label>
        <div class="drawer-radio-group">
          <label class="drawer-radio">
            <input type="radio" name="drawerOrderType" value="dine_in" checked>
            <span class="drawer-radio-label"><i data-lucide="utensils"></i> Dine In</span>
          </label>
          <label class="drawer-radio">
            <input type="radio" name="drawerOrderType" value="take_away">
            <span class="drawer-radio-label"><i data-lucide="shopping-bag"></i> Take Away</span>
          </label>
        </div>
      </div>
      
      <div class="drawer-option-group">
        <label class="drawer-label">Lokasi Store</label>
        <select id="drawerStoreLocation" class="drawer-select">
          <option value="">-- Pilih Lokasi --</option>
          <option value="kolaka">🏪 Docterbee Kolaka ZE Center</option>
          <option value="makassar">🏪 Docterbee Makassar Pettarani</option>
          <option value="kendari">🏪 Docterbee Kendari ByPass</option>
        </select>
      </div>
      
      <div class="drawer-coupon-group">
        <label class="drawer-label">Kode Promo (Opsional)</label>
        <div class="drawer-coupon-input">
          <input type="text" id="drawerCouponCode" placeholder="Masukkan kode" class="drawer-input">
          <button onclick="validateDrawerCoupon()" class="drawer-coupon-btn">Gunakan</button>
        </div>
        <div id="drawerCouponStatus" class="drawer-coupon-status hidden"></div>
      </div>
    </div>
  `;
  
  // Total section
  const totalHtml = `
    <div class="drawer-total-section">
      <div class="drawer-subtotal">
        <span>Subtotal (${cart.length} item)</span>
        <span>Rp ${formatPrice(subtotal)}</span>
      </div>
      <div id="drawerDiscountRow" class="drawer-discount hidden">
        <span>Diskon Promo</span>
        <span id="drawerDiscountValue">- Rp 0</span>
      </div>
      <div class="drawer-total">
        <span>Total</span>
        <span id="drawerTotalAmount">Rp ${formatPrice(subtotal)}</span>
      </div>
      <button onclick="openCheckoutModal()" class="drawer-checkout-btn">
        <i data-lucide="check-circle"></i>
        Checkout Sekarang
      </button>
      <p class="drawer-checkout-hint">Anda akan mendapatkan QR code untuk di-scan di kasir</p>
    </div>
  `;
  
  drawerBody.innerHTML = itemsHtml + orderOptionsHtml + totalHtml;
  
  // Sync store location if already selected in main page
  const mainLocation = document.getElementById('storeLocation');
  if (mainLocation && mainLocation.value) {
    const drawerLocation = document.getElementById('drawerStoreLocation');
    if (drawerLocation) drawerLocation.value = mainLocation.value;
  }
}

/**
 * Update cart quantity from drawer
 */
function updateCartQtyFromDrawer(productId, newQty) {
  if (newQty <= 0) {
    removeFromCartDrawer(productId);
    return;
  }
  
  const cart = JSON.parse(localStorage.getItem('docterbee_cart') || '[]');
  const itemIndex = cart.findIndex(item => (item.product_id || item.id) === productId);
  
  if (itemIndex > -1) {
    cart[itemIndex].quantity = newQty;
    localStorage.setItem('docterbee_cart', JSON.stringify(cart));
    
    // Sync the cart variable in store-cart.js
    if (typeof window.syncCartFromLocalStorage === 'function') {
      window.syncCartFromLocalStorage();
    }
    
    populateCartDrawer();
    updateCartBadge();
  }
}

/**
 * Remove item from cart (drawer)
 */
function removeFromCartDrawer(productId) {
  let cart = JSON.parse(localStorage.getItem('docterbee_cart') || '[]');
  cart = cart.filter(item => (item.product_id || item.id) !== productId);
  localStorage.setItem('docterbee_cart', JSON.stringify(cart));
  
  // Sync the cart variable in store-cart.js
  if (typeof window.syncCartFromLocalStorage === 'function') {
    window.syncCartFromLocalStorage();
  }
  
  populateCartDrawer();
  updateCartBadge();
  
  // Reinit icons
  if (typeof lucide !== 'undefined') {
    setTimeout(() => lucide.createIcons(), 50);
  }
}

/**
 * Filter products and close drawer
 */
function filterAndCloseDrawer(category) {
  toggleCartDrawer();
  if (typeof filterStoreCategory === 'function') {
    filterStoreCategory(category);
  }
}

/**
 * Update cart badge with current item count
 */
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  
  const cart = JSON.parse(localStorage.getItem('docterbee_cart') || '[]');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Store previous count to detect changes
  const previousCount = parseInt(badge.textContent) || 0;
  
  badge.textContent = totalItems;
  
  if (totalItems > 0) {
    badge.classList.remove('hidden');
    
    // Trigger bounce animation when count changes (item added)
    if (totalItems !== previousCount) {
      badge.classList.remove('bounce');
      // Force reflow to restart animation
      void badge.offsetWidth;
      badge.classList.add('bounce');
      
      // Remove class after animation completes
      setTimeout(() => badge.classList.remove('bounce'), 500);
    }
    
    // Pulse animation on floating button
    const floatingBtn = document.getElementById('floating-cart-btn');
    if (floatingBtn && totalItems !== previousCount) {
      floatingBtn.classList.add('pulse');
      setTimeout(() => floatingBtn.classList.remove('pulse'), 400);
    }
  } else {
    badge.classList.add('hidden');
  }
}

// ============================================
// 2. PRODUCT DETAIL MODAL
// ============================================

/**
 * Show product detail modal
 */
async function showProductDetail(productId) {
  try {
    const response = await fetch(`/api/products/${productId}`);
    const result = await response.json();
    
    if (!result.success) {
      if (typeof showError === 'function') {
        showError('Gagal memuat detail produk');
      }
      return;
    }
    
    currentProduct = result.data;
    
    // Populate modal
    const pdImage = document.getElementById('pd-image');
    const pdCategory = document.getElementById('pd-category');
    const pdName = document.getElementById('pd-name');
    const pdDescription = document.getElementById('pd-description');
    const pdPricing = document.getElementById('pd-pricing');
    const pdStock = document.getElementById('pd-stock');
    const pdAddBtn = document.getElementById('pd-add-to-cart-btn');
    
    if (pdImage) {
      pdImage.src = currentProduct.image_url || 'assets/images/product-placeholder.png';
      pdImage.alt = currentProduct.name;
    }
    if (pdCategory) pdCategory.textContent = currentProduct.category;
    if (pdName) pdName.textContent = currentProduct.name;
    if (pdDescription) pdDescription.textContent = currentProduct.description;
    
    // Pricing
    const hasMemberPrice = currentProduct.member_price && currentProduct.member_price < currentProduct.price;
    if (pdPricing) {
      if (hasMemberPrice) {
        pdPricing.innerHTML = `
          <div class="pd-member-price-section">
            <span class="pd-member-label">Harga Member</span>
            <span class="pd-member-price">Rp ${formatPrice(currentProduct.member_price)}</span>
          </div>
          <div class="pd-normal-price strikethrough">Rp ${formatPrice(currentProduct.price)}</div>
        `;
      } else {
        pdPricing.innerHTML = `<div class="pd-normal-price">Rp ${formatPrice(currentProduct.price)}</div>`;
      }
    }
    
    // Stock
    if (pdStock) {
      if (currentProduct.stock <= 0) {
        pdStock.innerHTML = '<div class="pd-stock-badge out">Stok Habis</div>';
        if (pdAddBtn) pdAddBtn.disabled = true;
      } else if (currentProduct.stock < 5) {
        pdStock.innerHTML = `<div class="pd-stock-badge low">Stok Terbatas (${currentProduct.stock} tersisa)</div>`;
        if (pdAddBtn) pdAddBtn.disabled = false;
      } else {
        pdStock.innerHTML = `<div class="pd-stock-badge available">Stok Tersedia (${currentProduct.stock})</div>`;
        if (pdAddBtn) pdAddBtn.disabled = false;
      }
    }
    
    // Reset quantity
    const pdQty = document.getElementById('pd-quantity');
    if (pdQty) pdQty.value = 1;
    
    // Show modal
    const modal = document.getElementById('product-detail-modal');
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    
    // Reinit icons
    if (typeof lucide !== 'undefined') {
      setTimeout(() => lucide.createIcons(), 50);
    }
    
  } catch (error) {
    console.error('Error loading product detail:', error);
    if (typeof showError === 'function') {
      showError('Gagal memuat detail produk');
    }
  }
}

/**
 * Close product detail modal
 */
function closeProductDetail() {
  const modal = document.getElementById('product-detail-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
  currentProduct = null;
}

/**
 * Increment quantity in product detail
 */
function incrementPdQuantity() {
  const input = document.getElementById('pd-quantity');
  if (!input || !currentProduct) return;
  
  const max = currentProduct.stock || 99;
  if (parseInt(input.value) < max) {
    input.value = parseInt(input.value) + 1;
  }
}

/**
 * Decrement quantity in product detail
 */
function decrementPdQuantity() {
  const input = document.getElementById('pd-quantity');
  if (!input) return;
  
  if (parseInt(input.value) > 1) {
    input.value = parseInt(input.value) - 1;
  }
}

/**
 * Add to cart from product detail modal
 */
function addToCartFromDetail() {
  if (!currentProduct) return;
  
  const quantity = parseInt(document.getElementById('pd-quantity')?.value || 1);
  
  // Check if member and use member price
  const isLoggedIn = !!sessionStorage.getItem('userId');
  const price = (isLoggedIn && currentProduct.member_price) 
    ? currentProduct.member_price 
    : currentProduct.price;
  
  // Add to cart using existing function or manual
  let cart = JSON.parse(localStorage.getItem('docterbee_cart') || '[]');
  
  const existingIndex = cart.findIndex(item => item.product_id === currentProduct.id);
  
  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: Date.now(),
      product_id: currentProduct.id,
      name: currentProduct.name,
      price: price,
      quantity: quantity
    });
  }
  
  localStorage.setItem('docterbee_cart', JSON.stringify(cart));
  
  // Sync the cart variable in store-cart.js
  if (typeof window.syncCartFromLocalStorage === 'function') {
    window.syncCartFromLocalStorage();
  }
  
  // Close modal
  closeProductDetail();
  
  // Update badge (visual feedback replaces toast)
  updateCartBadge();
}

// ============================================
// 3. CHECKOUT MODAL
// ============================================

/**
 * Open checkout modal (or direct checkout for logged-in users)
 */
async function openCheckoutModal() {
  const cart = JSON.parse(localStorage.getItem('docterbee_cart') || '[]');
  
  // Validate cart not empty
  if (cart.length === 0) {
    if (typeof showError === 'function') {
      showError('Keranjang belanja kosong');
    }
    return;
  }
  
  // Validate store location
  const drawerLocation = document.getElementById('drawerStoreLocation');
  const mainLocation = document.getElementById('storeLocation');
  const storeLocation = drawerLocation?.value || mainLocation?.value;
  
  if (!storeLocation) {
    if (typeof showError === 'function') {
      showError('Pilih lokasi store terlebih dahulu');
    }
    // Highlight the select
    if (drawerLocation) {
      drawerLocation.focus();
      drawerLocation.style.borderColor = '#EF4444';
      setTimeout(() => drawerLocation.style.borderColor = '', 2000);
    }
    return;
  }
  
  // Check if user logged in via API (more reliable than sessionStorage)
  try {
    const response = await fetch('/api/auth/check', { credentials: 'include' });
    const result = await response.json();
    
    if (result.loggedIn && result.user) {
      // User is logged in - skip modal and proceed directly
      console.log('✅ User logged in, proceeding with direct checkout');
      
      // Close cart drawer if open
      if (cartDrawerOpen) {
        toggleCartDrawer();
      }
      
      // Sync store location to hidden form
      if (drawerLocation && mainLocation && drawerLocation.value) {
        mainLocation.value = drawerLocation.value;
      }
      
      // Sync order type
      const drawerOrderType = document.querySelector('input[name="drawerOrderType"]:checked');
      if (drawerOrderType) {
        const mainOrderType = document.querySelector(`input[name="orderType"][value="${drawerOrderType.value}"]`);
        if (mainOrderType) mainOrderType.checked = true;
      }
      
      // Directly call submitOrder for logged-in users
      if (typeof submitOrder === 'function') {
        await submitOrder();
      }
      return;
    }
  } catch (error) {
    console.warn('Could not check auth status, showing modal:', error.message);
  }
  
  // Guest user - show checkout modal with form
  const memberInfo = document.getElementById('checkout-member-info');
  const guestForm = document.getElementById('checkout-guest-form');
  
  if (memberInfo) memberInfo.classList.add('hidden');
  if (guestForm) guestForm.classList.remove('hidden');
  populateCheckoutSummary('guest');
  
  // Show modal
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  
  // Close cart drawer if open
  if (cartDrawerOpen) {
    toggleCartDrawer();
  }
  
  // Reinit icons
  if (typeof lucide !== 'undefined') {
    setTimeout(() => lucide.createIcons(), 50);
  }
}

/**
 * Close checkout modal
 */
function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/**
 * Populate checkout summary
 */
function populateCheckoutSummary(type) {
  const cart = JSON.parse(localStorage.getItem('docterbee_cart') || '[]');
  const container = document.getElementById(`checkout-items-${type}`);
  
  if (!container) return;
  
  let html = '';
  let total = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    html += `
      <div class="checkout-item">
        <span class="item-name">${escapeHtml(item.name)} ×${item.quantity}</span>
        <span class="item-price">Rp ${formatPrice(itemTotal)}</span>
      </div>
    `;
  });
  
  container.innerHTML = html;
  
  // Update total
  const totalEl = document.getElementById(`checkout-total-${type}`);
  if (totalEl) {
    totalEl.textContent = `Rp ${formatPrice(total)}`;
  }
}

/**
 * Confirm checkout and submit order
 */
async function confirmCheckout() {
  const isLoggedIn = !!sessionStorage.getItem('userId');
  
  // Validate guest form if not logged in
  if (!isLoggedIn) {
    const name = document.getElementById('checkout-guest-name')?.value.trim();
    const phone = document.getElementById('checkout-guest-phone')?.value.trim();
    
    if (!name || !phone) {
      if (typeof showError === 'function') {
        showError('Mohon lengkapi nama dan nomor HP');
      }
      return;
    }
    
    // Validate phone format
    if (!/^0\d{9,12}$/.test(phone)) {
      if (typeof showError === 'function') {
        showError('Format nomor HP tidak valid (harus 08xx...)');
      }
      return;
    }
    
    // Set guest data to main form fields for submitOrder compatibility
    const mainGuestName = document.getElementById('guestName');
    const mainGuestPhone = document.getElementById('guestPhone');
    const mainGuestAddress = document.getElementById('guestAddress');
    
    if (mainGuestName) mainGuestName.value = name;
    if (mainGuestPhone) mainGuestPhone.value = phone;
    if (mainGuestAddress) mainGuestAddress.value = document.getElementById('checkout-guest-address')?.value || '';
  }
  
  // Sync store location
  const drawerLocation = document.getElementById('drawerStoreLocation');
  const mainLocation = document.getElementById('storeLocation');
  if (drawerLocation && mainLocation && drawerLocation.value) {
    mainLocation.value = drawerLocation.value;
  }
  
  // Sync order type
  const drawerOrderType = document.querySelector('input[name="drawerOrderType"]:checked');
  if (drawerOrderType) {
    const mainOrderType = document.querySelector(`input[name="orderType"][value="${drawerOrderType.value}"]`);
    if (mainOrderType) mainOrderType.checked = true;
  }
  
  // Close modal
  closeCheckoutModal();
  
  // Call existing submitOrder function
  if (typeof submitOrder === 'function') {
    await submitOrder();
  }
}

/**
 * Validate coupon from drawer
 */
async function validateDrawerCoupon() {
  const couponInput = document.getElementById('drawerCouponCode');
  const statusEl = document.getElementById('drawerCouponStatus');
  
  if (!couponInput || !couponInput.value.trim()) {
    if (statusEl) {
      statusEl.textContent = 'Masukkan kode promo';
      statusEl.className = 'drawer-coupon-status error';
      statusEl.classList.remove('hidden');
    }
    return;
  }
  
  // Use existing validateStoreCoupon if available
  // Sync to main coupon input
  const mainCouponInput = document.getElementById('storeCouponCode');
  if (mainCouponInput) {
    mainCouponInput.value = couponInput.value.toUpperCase();
  }
  
  if (typeof validateStoreCoupon === 'function') {
    await validateStoreCoupon();
    
    // Copy status back
    const mainStatus = document.getElementById('storeCouponStatus');
    if (mainStatus && statusEl) {
      statusEl.innerHTML = mainStatus.innerHTML;
      statusEl.className = mainStatus.className;
    }
  }
}

// ============================================
// 4. ENHANCED PRODUCT CARD RENDERING
// ============================================

/**
 * Render enhanced product card with image
 */
function renderEnhancedProductCard(product) {
  const imageUrl = product.image_url || 'assets/images/product-placeholder.png';
  const hasMemberPrice = product.member_price && product.member_price < product.price;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock < 5;
  
  // Truncate description
  const shortDesc = product.description && product.description.length > 80 
    ? product.description.substring(0, 80) + '...' 
    : product.description || '';
  
  return `
    <div class="product-card-enhanced hover-lift" data-product-id="${product.id}">
      <div class="product-image-wrapper">
        <img 
          src="${imageUrl}" 
          alt="${escapeHtml(product.name)}" 
          class="product-image"
          loading="lazy"
          onerror="this.src='assets/images/product-placeholder.png'"
        >
        <div class="product-badges">
          ${product.promo_text ? `<span class="promo-badge">${escapeHtml(product.promo_text)}</span>` : '<span></span>'}
          ${isOutOfStock ? '<span class="stock-badge out-of-stock">Habis</span>' : ''}
          ${isLowStock ? '<span class="stock-badge low-stock">Stok Terbatas</span>' : ''}
        </div>
      </div>
      
      <div class="product-info">
        <span class="product-category">${escapeHtml(product.category)}</span>
        <h3 class="product-name">${escapeHtml(product.name)}</h3>
        <p class="product-description">${escapeHtml(shortDesc)}</p>
        
        <div class="product-pricing">
          ${hasMemberPrice ? `
            <div class="member-price-wrapper">
              <span class="member-label">Member</span>
              <span class="member-price">Rp ${formatPrice(product.member_price)}</span>
            </div>
            <span class="normal-price strikethrough">Rp ${formatPrice(product.price)}</span>
          ` : `
            <span class="normal-price">Rp ${formatPrice(product.price)}</span>
          `}
        </div>
        
        <div class="product-actions">
          <button 
            class="btn-add-to-cart" 
            onclick="addToCartEnhanced(${product.id}, '${escapeHtml(product.name).replace(/'/g, "\\'")}', ${product.price}, ${product.member_price || 'null'})"
            ${isOutOfStock ? 'disabled' : ''}
          >
            <i data-lucide="shopping-cart"></i>
            ${isOutOfStock ? 'Habis' : 'Tambah'}
          </button>
          <button 
            class="btn-view-detail" 
            onclick="showProductDetail(${product.id})"
          >
            Detail
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Add to cart with enhanced feedback
 */
function addToCartEnhanced(productId, productName, price, memberPrice) {
  const isLoggedIn = !!sessionStorage.getItem('userId');
  const finalPrice = (isLoggedIn && memberPrice) ? memberPrice : price;
  
  let cart = JSON.parse(localStorage.getItem('docterbee_cart') || '[]');
  
  const existingIndex = cart.findIndex(item => item.product_id === productId);
  
  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({
      id: Date.now(),
      product_id: productId,
      name: productName,
      price: finalPrice,
      quantity: 1
    });
  }
  
  localStorage.setItem('docterbee_cart', JSON.stringify(cart));
  
  // Sync the cart variable in store-cart.js
  if (typeof window.syncCartFromLocalStorage === 'function') {
    window.syncCartFromLocalStorage();
  }
  
  // Update badge (visual feedback replaces toast)
  updateCartBadge();
}

// ============================================
// 5. CATEGORY TOOLTIPS (MOBILE)
// ============================================

/**
 * Initialize mobile tooltip functionality
 */
function initMobileTooltips() {
  const categoryButtons = document.querySelectorAll('.category-filter[data-tooltip]');
  
  categoryButtons.forEach(btn => {
    btn.addEventListener('touchstart', function(e) {
      // Toggle tooltip class
      this.classList.toggle('show-tooltip');
      
      // Remove tooltip from others
      categoryButtons.forEach(other => {
        if (other !== this) {
          other.classList.remove('show-tooltip');
        }
      });
      
      // Remove after 3 seconds
      setTimeout(() => {
        this.classList.remove('show-tooltip');
      }, 3000);
    }, { passive: true });
  });
}

// ============================================
// 6. UTILITY FUNCTIONS
// ============================================

// Note: escapeHtml() is available globally from utils.js (window.escapeHtml)

/**
 * Format price with thousand separator
 */
function formatPrice(price) {
  if (!price && price !== 0) return '0';
  return Number(price).toLocaleString('id-ID');
}

// ============================================
// 7. INITIALIZATION
// ============================================

/**
 * Initialize store enhancements
 */
function initStoreEnhancements() {
  // Update cart badge on load
  updateCartBadge();
  
  // Initialize mobile tooltips
  initMobileTooltips();
  
  // Listen for storage changes (cart updates)
  window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
      updateCartBadge();
      if (cartDrawerOpen) {
        populateCartDrawer();
      }
    }
  });
  
  // Close drawer on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (cartDrawerOpen) toggleCartDrawer();
      closeProductDetail();
      closeCheckoutModal();
    }
  });
  
  console.log('✅ Store UX Enhancements initialized');
}

// Initialize when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStoreEnhancements);
} else {
  initStoreEnhancements();
}

// ============================================
// 8. ADDITIONAL CSS (Inline for drawer items)
// ============================================

// Inject additional styles for drawer cart items
const drawerStyles = document.createElement('style');
drawerStyles.textContent = `
  .drawer-cart-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }
  
  .drawer-cart-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #F8FAFC;
    border-radius: 12px;
    padding: 14px 16px;
    gap: 12px;
  }
  
  .drawer-item-info {
    flex: 1;
    min-width: 0;
  }
  
  .drawer-item-name {
    font-size: 14px;
    font-weight: 600;
    color: #1E293B;
    margin: 0 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .drawer-item-price {
    font-size: 13px;
    color: #64748B;
  }
  
  .drawer-item-controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .drawer-qty-controls {
    display: flex;
    align-items: center;
    background: white;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .drawer-qty-controls button {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    font-size: 16px;
    font-weight: 600;
    color: #64748B;
    cursor: pointer;
  }
  
  .drawer-qty-controls button:hover {
    background: #F1F5F9;
    color: #EC3237;
  }
  
  .drawer-qty-controls span {
    width: 32px;
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    color: #1E293B;
  }
  
  .drawer-remove-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: #FEE2E2;
    border-radius: 8px;
    color: #DC2626;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .drawer-remove-btn:hover {
    background: #FECACA;
  }
  
  .drawer-remove-btn svg {
    width: 16px;
    height: 16px;
  }
  
  .drawer-order-options {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px 0;
    border-top: 1px solid #E2E8F0;
    border-bottom: 1px solid #E2E8F0;
  }
  
  .drawer-option-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .drawer-label {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
  }
  
  .drawer-radio-group {
    display: flex;
    gap: 10px;
  }
  
  .drawer-radio {
    flex: 1;
    cursor: pointer;
  }
  
  .drawer-radio input {
    display: none;
  }
  
  .drawer-radio-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px;
    border: 2px solid #E2E8F0;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #64748B;
    transition: all 0.2s;
  }
  
  .drawer-radio input:checked + .drawer-radio-label {
    border-color: #EC3237;
    background: #FEF2F2;
    color: #EC3237;
  }
  
  .drawer-radio-label svg {
    width: 16px;
    height: 16px;
  }
  
  .drawer-select {
    padding: 12px 14px;
    border: 2px solid #E2E8F0;
    border-radius: 10px;
    font-size: 14px;
    color: #1E293B;
    background: white;
    cursor: pointer;
  }
  
  .drawer-select:focus {
    outline: none;
    border-color: #EC3237;
  }
  
  .drawer-coupon-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .drawer-coupon-input {
    display: flex;
    gap: 8px;
  }
  
  .drawer-input {
    flex: 1;
    padding: 10px 14px;
    border: 2px solid #E2E8F0;
    border-radius: 8px;
    font-size: 14px;
    text-transform: uppercase;
  }
  
  .drawer-input:focus {
    outline: none;
    border-color: #EC3237;
  }
  
  .drawer-coupon-btn {
    padding: 10px 16px;
    background: #22C55E;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }
  
  .drawer-coupon-btn:hover {
    background: #16A34A;
  }
  
  .drawer-coupon-status {
    font-size: 12px;
    padding: 8px 12px;
    border-radius: 6px;
  }
  
  .drawer-coupon-status.success {
    background: #DCFCE7;
    color: #16A34A;
  }
  
  .drawer-coupon-status.error {
    background: #FEE2E2;
    color: #DC2626;
  }
  
  .drawer-total-section {
    padding-top: 20px;
  }
  
  .drawer-subtotal, .drawer-discount {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: #64748B;
    margin-bottom: 8px;
  }
  
  .drawer-discount {
    color: #16A34A;
  }
  
  .drawer-total {
    display: flex;
    justify-content: space-between;
    font-size: 18px;
    font-weight: 700;
    color: #1E293B;
    padding: 12px 0;
    border-top: 1px solid #E2E8F0;
    margin-bottom: 16px;
  }
  
  .drawer-checkout-btn {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
    transition: all 0.2s;
  }
  
  .drawer-checkout-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(34, 197, 94, 0.4);
  }
  
  .drawer-checkout-btn svg {
    width: 20px;
    height: 20px;
  }
  
  .drawer-checkout-hint {
    text-align: center;
    font-size: 12px;
    color: #94A3B8;
    margin-top: 12px;
  }
`;
document.head.appendChild(drawerStyles);
