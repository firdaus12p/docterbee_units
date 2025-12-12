// Landing Page Navbar - Authentication-based Display
// This script checks if user is logged in and adjusts navbar accordingly

(function () {
  "use strict";

  // Check authentication status and update navbar
  async function checkAuthAndUpdateNavbar() {
    console.log("[landing-navbar] Checking auth status...");
    try {
      const response = await fetch("http://localhost:3000/api/auth/check", {
        credentials: "include",
      });

      if (!response.ok) {
        // User not logged in - show guest navbar
        console.log("[landing-navbar] User NOT logged in (response not ok)");
        showGuestNavbar();
        return;
      }

      const result = await response.json();
      console.log("[landing-navbar] Auth check result:", result);

      if (result.loggedIn && result.user) {
        // User logged in - show member navbar
        console.log("[landing-navbar] User IS logged in, showing member navbar");
        showMemberNavbar();
      } else {
        // User not logged in - show guest navbar
        console.log("[landing-navbar] User NOT logged in (no user in result)");
        showGuestNavbar();
      }
    } catch (error) {
      // Network error or server down - show guest navbar as fallback
      console.warn("[landing-navbar] Could not check auth status:", error.message);
      showGuestNavbar();
    }
  }

  // Show navbar for guest users (not logged in)
  function showGuestNavbar() {
    // Show "Beranda" link
    const guestNavItem = document.getElementById("guestNavItem");
    const mobileGuestNavItem = document.getElementById("mobileGuestNavItem");
    if (guestNavItem) guestNavItem.style.display = "";
    if (mobileGuestNavItem) mobileGuestNavItem.style.display = "";

    // Show auth buttons (Masuk & Daftar)
    const authButtons = document.getElementById("authButtons");
    const mobileAuthButtons = document.getElementById("mobileAuthButtons");
    if (authButtons) authButtons.style.display = "";
    if (mobileAuthButtons) mobileAuthButtons.style.display = "";

    // Hide logout button
    const logoutBtn = document.getElementById("logoutBtn");
    const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");
    if (logoutBtn) logoutBtn.style.display = "none";
    if (mobileLogoutBtn) mobileLogoutBtn.style.display = "none";
  }

  // Show navbar for logged-in users
  function showMemberNavbar() {
    // Hide "Beranda" link
    const guestNavItem = document.getElementById("guestNavItem");
    const mobileGuestNavItem = document.getElementById("mobileGuestNavItem");
    if (guestNavItem) guestNavItem.style.display = "none";
    if (mobileGuestNavItem) mobileGuestNavItem.style.display = "none";

    // Hide auth buttons (Masuk & Daftar)
    const authButtons = document.getElementById("authButtons");
    const mobileAuthButtons = document.getElementById("mobileAuthButtons");
    if (authButtons) authButtons.style.display = "none";
    if (mobileAuthButtons) mobileAuthButtons.style.display = "none";

    // Show logout button
    const logoutBtn = document.getElementById("logoutBtn");
    const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
    if (mobileLogoutBtn) mobileLogoutBtn.style.display = "inline-flex";
  }

  // Handle logout
  async function handleLogout() {
    try {
      const response = await fetch("http://localhost:3000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        alert("Anda telah logout. Sampai jumpa!");
        // Reload page to show guest navbar
        window.location.reload();
      } else {
        alert("Gagal logout. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Terjadi kesalahan saat logout.");
    }
  }

  // Initialize on DOM ready
  function init() {
    // Check auth status and update navbar
    checkAuthAndUpdateNavbar();

    // Attach logout handlers
    const logoutBtn = document.getElementById("logoutBtn");
    const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");

    if (logoutBtn) {
      logoutBtn.addEventListener("click", handleLogout);
    }

    if (mobileLogoutBtn) {
      mobileLogoutBtn.addEventListener("click", handleLogout);
    }
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
