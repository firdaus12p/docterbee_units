// Landing Page Navbar - Authentication-based Display
// This script checks if user is logged in and adjusts navbar accordingly
// Modal utilities are defined in modal-utils.js (optional dependency)
/* global showError, showConfirm */

(function () {
  "use strict";

  // Check authentication status and update navbar
  async function checkAuthAndUpdateNavbar() {
    console.log("[landing-navbar] Checking auth status...");
    try {
      const response = await fetch("/api/auth/check", {
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
        // User logged in - show member navbar and fetch points
        console.log("[landing-navbar] User IS logged in, showing member navbar");
        showMemberNavbar();
        fetchAndDisplayPoints();
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

  // Fetch and display user points
  async function fetchAndDisplayPoints() {
    try {
      const response = await fetch("/api/user-data/progress", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const points = data.data.points || 0;
          
          // Update desktop points
          const navPoints = document.getElementById("navPoints");
          if (navPoints) navPoints.textContent = points;
          
          // Update mobile points
          const mobileNavPoints = document.getElementById("mobileNavPoints");
          if (mobileNavPoints) mobileNavPoints.textContent = points;
        }
      }
    } catch (error) {
      console.warn("[landing-navbar] Could not fetch points:", error.message);
    }
  }

  // Show navbar for guest users (not logged in)
  function showGuestNavbar() {
    // Show "Beranda" link (only visible for guests)
    const guestNavItem = document.getElementById("guestNavItem");
    const mobileGuestNavItem = document.getElementById("mobileGuestNavItem");
    if (guestNavItem) guestNavItem.style.display = "";
    if (mobileGuestNavItem) mobileGuestNavItem.style.display = "";

    // Show auth buttons (Masuk & Daftar)
    const authButtons = document.getElementById("authButtons");
    const mobileAuthButtons = document.getElementById("mobileAuthButtons");
    if (authButtons) authButtons.style.display = "";
    if (mobileAuthButtons) mobileAuthButtons.style.display = "";

    // Hide member info (Points, Profile, Logout)
    const memberInfo = document.getElementById("memberInfo");
    const mobileMemberInfo = document.getElementById("mobileMemberInfo");
    if (memberInfo) memberInfo.style.display = "none";
    if (mobileMemberInfo) mobileMemberInfo.style.display = "none";
  }

  // Show navbar for logged-in users
  function showMemberNavbar() {
    // Hide "Beranda" link (only visible for guests)
    const guestNavItem = document.getElementById("guestNavItem");
    const mobileGuestNavItem = document.getElementById("mobileGuestNavItem");
    if (guestNavItem) guestNavItem.style.display = "none";
    if (mobileGuestNavItem) mobileGuestNavItem.style.display = "none";

    // Hide auth buttons (Masuk & Daftar)
    const authButtons = document.getElementById("authButtons");
    const mobileAuthButtons = document.getElementById("mobileAuthButtons");
    if (authButtons) authButtons.style.display = "none";
    if (mobileAuthButtons) mobileAuthButtons.style.display = "none";

    // Show member info (Points, Profile, Logout)
    const memberInfo = document.getElementById("memberInfo");
    const mobileMemberInfo = document.getElementById("mobileMemberInfo");
    if (memberInfo) memberInfo.style.display = "flex";
    if (mobileMemberInfo) mobileMemberInfo.style.display = "flex";
  }

  // Handle logout
  async function performLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        // Directly reload without success modal (user already confirmed)
        window.location.reload();
      } else {
        if (typeof showError === "function") {
          showError("Gagal logout. Silakan coba lagi.");
        } else {
          alert("Gagal logout. Silakan coba lagi.");
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
      if (typeof showError === "function") {
        showError("Terjadi kesalahan saat logout.");
      } else {
        alert("Terjadi kesalahan saat logout.");
      }
    }
  }

  function handleLogout() {
    if (typeof showConfirm === "function") {
      showConfirm(
        "Apakah Anda yakin ingin logout?",
        () => {
          performLogout();
        },
        null,
        "Konfirmasi Logout"
      );
    } else {
      // Fallback if modal-utils.js not loaded
      if (confirm("Apakah Anda yakin ingin logout?")) {
        performLogout();
      }
    }
  }

  // Initialize mobile media dropdown toggle
  function initMobileMediaDropdown() {
    const mobileDropdown = document.getElementById("mobileMediaDropdown");
    const mobileToggle = mobileDropdown?.querySelector(".mobile-nav-dropdown-toggle");

    if (mobileToggle) {
      mobileToggle.addEventListener("click", function (e) {
        e.preventDefault();
        mobileDropdown.classList.toggle("open");
      });
    }
  }

  // Initialize on DOM ready
  function init() {
    // Check auth status and update navbar
    checkAuthAndUpdateNavbar();

    // Initialize mobile dropdown
    initMobileMediaDropdown();

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
