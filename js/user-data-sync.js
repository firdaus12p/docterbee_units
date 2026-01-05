// User Data Sync Helper - Database-backed localStorage replacement
// This file handles syncing Journey progress, Points, and Cart with backend

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
 * Auto-check if user is logged in and initialize sync
 * Call this on page load for protected pages
 */
async function autoInitUserDataSync() {
  try {
    const response = await fetch("/api/auth/check", {
      credentials: "include",
    });

    if (!response.ok) return false;

    const result = await response.json();

    if (result.loggedIn && result.user && result.user.id) {
      console.log("🔐 User logged in, initializing sync...", result.user.id);
      await initUserDataSync(result.user.id);
      return true;
    } else {
      console.log("👤 Guest mode - no sync");
      return false;
    }
  } catch (error) {
    console.warn("⚠️ Could not check login status:", error.message);
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
  localStorage.removeItem("db_journey_progress");
  localStorage.removeItem("db_units"); // Clear legacy key
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
    const response = await fetch(
      "/api/user-data/progress",
      {
        credentials: "include",
      }
    );

    if (!response.ok) throw new Error("Failed to load progress");

    const result = await response.json();
    if (result.success) {
      const { points } = result.data;
      let { unitData } = result.data;

      // Backend returns unitData as STRING, parse it to object
      if (typeof unitData === "string") {
        try {
          unitData = JSON.parse(unitData);
        } catch (e) {
          console.error("❌ Failed to parse unitData:", e);
          unitData = {};
        }
      }

      // Save to localStorage for immediate access
      localStorage.setItem("db_journey_progress", JSON.stringify(unitData));
      localStorage.setItem("db_points", JSON.stringify({ value: points }));
      
      // Cleanup legacy key if it exists
      localStorage.removeItem("db_units");

      // Refresh UI if on journey page
      if (typeof window.refreshNav === "function") window.refreshNav();

      // Re-render current unit to show selected answers
      if (typeof window.showUnit === "function" && window.currentUnitId) {
        console.log("🔄 Re-rendering unit to show loaded data...");
        window.showUnit(window.currentUnitId);
      }
    }
  } catch (error) {
    console.error("❌ Error loading progress:", error);
  }
}

/**
 * Save user progress and points to database
 * Call this after user answers questions or earns points
 */
async function saveUserProgress() {
  if (!syncEnabled) {
    // User not logged in - data stays in localStorage only (guest mode)
    return;
  }

  try {
    // Read from localStorage (use standardized key)
    const unitData = JSON.parse(localStorage.getItem("db_journey_progress") || "{}");
    const pointsData = JSON.parse(
      localStorage.getItem("db_points") || '{"value":0}'
    );
    const points = pointsData.value || 0;

    console.log("💾 Attempting to save progress:", {
      unitData,
      points,
      syncEnabled,
    });

    const response = await fetch(
      "/api/user-data/progress",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ unitData, points }),
      }
    );

    console.log("📡 Response status:", response.status, response.statusText);

    if (!response.ok) {
      // Check if it's authentication error (401)
      if (response.status === 401) {
        console.warn("⚠️ User session expired. Data saved locally only.");
        syncEnabled = false; // Disable sync to prevent repeated errors
        return;
      }

      // Get error details from response
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Save failed:", response.status, errorData);
      throw new Error(
        `Failed to save progress: ${response.status} ${
          errorData.error || response.statusText
        }`
      );
    }

    const result = await response.json();
    if (!result.success) {
      console.error("Server error saving progress:", result.error);
    } else {
      console.log("✅ Progress saved successfully");
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
    const response = await fetch("/api/user-data/cart", {
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
      if (typeof window.updateCartDisplay === "function") window.updateCartDisplay();
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
  if (!syncEnabled) {
    // User not logged in - cart stays in localStorage only (guest mode)
    return;
  }

  try {
    // Read from localStorage
    const cartData = JSON.parse(localStorage.getItem("docterbee_cart") || "[]");

    const response = await fetch("/api/user-data/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ cartData, lastQrCode }),
    });

    if (!response.ok) {
      // Check if it's authentication error (401)
      if (response.status === 401) {
        console.warn("⚠️ User session expired. Cart saved locally only.");
        syncEnabled = false; // Disable sync to prevent repeated errors
        return;
      }
      throw new Error("Failed to save cart");
    }

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
  if (!syncEnabled) {
    // User not logged in - just clear localStorage
    localStorage.removeItem("docterbee_cart");
    if (typeof window.updateCartDisplay === "function") window.updateCartDisplay();
    return;
  }

  try {
    const response = await fetch("/api/user-data/cart", {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      // Check if it's authentication error (401)
      if (response.status === 401) {
        console.warn("⚠️ User session expired. Cart cleared locally only.");
        syncEnabled = false;
        localStorage.removeItem("docterbee_cart");
        if (typeof window.updateCartDisplay === "function") window.updateCartDisplay();
        return;
      }
      throw new Error("Failed to clear cart");
    }

    // Also clear localStorage
    localStorage.removeItem("docterbee_cart");

    // Refresh cart UI
    if (typeof window.updateCartDisplay === "function") window.updateCartDisplay();
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
  autoInit: autoInitUserDataSync,
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

// Auto-initialize on page load (check if user is logged in)
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInitUserDataSync);
  } else {
    // DOM already loaded
    autoInitUserDataSync();
  }
}
