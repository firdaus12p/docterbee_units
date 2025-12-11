// User Data Sync Helper - Database-backed localStorage replacement
// This file handles syncing Journey progress, Points, and Cart with backend

const API_BASE = "http://localhost:3000/api";

// ==================== SYNC STATE ====================
let syncEnabled = false; // Set to true after user login
let currentUserId = null;

// ==================== INITIALIZATION ====================

/**
 * Initialize user data sync after successful login
 * Call this from login.html after successful authentication
 */
async function initUserDataSync(userId) {
  currentUserId = userId;
  syncEnabled = true;

  try {
    // Load user data from database
    await loadUserProgress();
    await loadUserCart();

    console.log("✅ User data loaded from database");
    return true;
  } catch (error) {
    console.error("❌ Failed to load user data:", error);
    return false;
  }
}

/**
 * Clear user data sync on logout
 * Call this from logout handler
 */
function clearUserDataSync() {
  syncEnabled = false;
  currentUserId = null;

  // Clear localStorage
  localStorage.removeItem("db_units");
  localStorage.removeItem("db_points");
  localStorage.removeItem("docterbee_cart");

  console.log("✅ User data cleared from localStorage");
}

// ==================== PROGRESS SYNC (Journey + Points) ====================

/**
 * Load user progress and points from database to localStorage
 */
async function loadUserProgress() {
  if (!syncEnabled) return;

  try {
    const response = await fetch(`${API_BASE}/user-data/progress`, {
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to load progress");

    const result = await response.json();
    if (result.success) {
      const { unitData, points } = result.data;

      // Save to localStorage for immediate access
      localStorage.setItem("db_units", JSON.stringify(unitData));
      localStorage.setItem("db_points", JSON.stringify({ value: points }));

      // Refresh UI if on journey page
      if (typeof refreshNav === "function") refreshNav();
      if (typeof calcAll === "function") calcAll();
    }
  } catch (error) {
    console.error("Error loading progress:", error);
  }
}

/**
 * Save user progress and points to database
 * Call this after user answers questions or earns points
 */
async function saveUserProgress() {
  if (!syncEnabled) return;

  try {
    // Read from localStorage
    const unitData = JSON.parse(localStorage.getItem("db_units") || "{}");
    const pointsData = JSON.parse(
      localStorage.getItem("db_points") || '{"value":0}'
    );
    const points = pointsData.value || 0;

    const response = await fetch(`${API_BASE}/user-data/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ unitData, points }),
    });

    if (!response.ok) throw new Error("Failed to save progress");

    const result = await response.json();
    if (!result.success) {
      console.error("Server error saving progress:", result.error);
    }
  } catch (error) {
    console.error("Error saving progress:", error);
  }
}

// ==================== CART SYNC ====================

/**
 * Load user cart from database to localStorage
 */
async function loadUserCart() {
  if (!syncEnabled) return;

  try {
    const response = await fetch(`${API_BASE}/user-data/cart`, {
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to load cart");

    const result = await response.json();
    if (result.success) {
      const { cartData, lastQrCode } = result.data;

      // Save to localStorage
      localStorage.setItem("docterbee_cart", JSON.stringify(cartData));
      if (lastQrCode) {
        localStorage.setItem("last_qr_code", lastQrCode);
      }

      // Refresh cart UI if on store page
      if (typeof updateCartDisplay === "function") updateCartDisplay();
    }
  } catch (error) {
    console.error("Error loading cart:", error);
  }
}

/**
 * Save user cart to database
 * Call this after user adds/removes items or completes order
 */
async function saveUserCart(lastQrCode = null) {
  if (!syncEnabled) return;

  try {
    // Read from localStorage
    const cartData = JSON.parse(localStorage.getItem("docterbee_cart") || "[]");

    const response = await fetch(`${API_BASE}/user-data/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ cartData, lastQrCode }),
    });

    if (!response.ok) throw new Error("Failed to save cart");

    const result = await response.json();
    if (!result.success) {
      console.error("Server error saving cart:", result.error);
    }
  } catch (error) {
    console.error("Error saving cart:", error);
  }
}

/**
 * Clear user cart from database (after order completion)
 */
async function clearUserCart() {
  if (!syncEnabled) return;

  try {
    const response = await fetch(`${API_BASE}/user-data/cart`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to clear cart");

    // Also clear localStorage
    localStorage.removeItem("docterbee_cart");

    // Refresh cart UI
    if (typeof updateCartDisplay === "function") updateCartDisplay();
  } catch (error) {
    console.error("Error clearing cart:", error);
  }
}

// ==================== AUTO-SAVE DEBOUNCING ====================

let progressSaveTimeout = null;
let cartSaveTimeout = null;

/**
 * Debounced progress save (wait 1 second after last change)
 */
function debouncedSaveProgress() {
  if (progressSaveTimeout) clearTimeout(progressSaveTimeout);
  progressSaveTimeout = setTimeout(() => {
    saveUserProgress();
  }, 1000);
}

/**
 * Debounced cart save (wait 500ms after last change)
 */
function debouncedSaveCart() {
  if (cartSaveTimeout) clearTimeout(cartSaveTimeout);
  cartSaveTimeout = setTimeout(() => {
    saveUserCart();
  }, 500);
}

// ==================== EXPORT ====================

// Make functions globally available
window.UserDataSync = {
  init: initUserDataSync,
  clear: clearUserDataSync,

  // Progress functions
  loadProgress: loadUserProgress,
  saveProgress: saveUserProgress,
  debouncedSaveProgress: debouncedSaveProgress,

  // Cart functions
  loadCart: loadUserCart,
  saveCart: saveUserCart,
  clearCart: clearUserCart,
  debouncedSaveCart: debouncedSaveCart,

  // State check
  isEnabled: () => syncEnabled,
  getUserId: () => currentUserId,
};
