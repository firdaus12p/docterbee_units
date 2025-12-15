// App Navbar - Authentication-based Logout Button Display
// This script controls logout button visibility based on login status
// Used for: index.html, services.html, store.html, events.html, insight.html, media.html, ai-advisor.html

(function () {
  "use strict";

  // Check authentication status and update logout button
  async function checkAuthAndUpdateLogoutBtn() {
    console.log("[app-navbar] Checking auth status...");
    try {
      const response = await fetch("/api/auth/check", {
        credentials: "include",
      });

      if (!response.ok) {
        // User not logged in - hide logout button
        console.log("[app-navbar] User NOT logged in (response not ok)");
        hideLogoutButton();
        return;
      }

      const result = await response.json();
      console.log("[app-navbar] Auth check result:", result);

      if (result.loggedIn && result.user) {
        // User logged in - show logout button
        console.log("[app-navbar] User IS logged in, showing logout button");
        showLogoutButton();
      } else {
        // User not logged in - hide logout button
        console.log("[app-navbar] User NOT logged in (no user in result)");
        hideLogoutButton();
      }
    } catch (error) {
      // Network error or server down - hide logout button as fallback
      console.warn("[app-navbar] Could not check auth status:", error.message);
      hideLogoutButton();
    }
  }

  // Show logout button for logged-in users
  function showLogoutButton() {
    const logoutBtn = document.getElementById("logoutBtn");
    const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");

    if (logoutBtn) {
      logoutBtn.classList.remove("hidden");
      logoutBtn.style.display = "block";
    }

    if (mobileLogoutBtn) {
      mobileLogoutBtn.classList.remove("hidden");
      mobileLogoutBtn.style.display = "block";
    }

    // Show Profile button if exists
    const profileBtn = document.getElementById("profileBtn");
    const mobileProfileBtn = document.getElementById("mobileProfileBtn");
    
    if (profileBtn) {
      profileBtn.classList.remove("hidden");
      profileBtn.style.display = "block";
    }
    
    if (mobileProfileBtn) {
      mobileProfileBtn.classList.remove("hidden");
      mobileProfileBtn.style.display = "block";
    }

    // Show Points display if exists
    const pointsDisplay = document.getElementById("pointsDisplay");
    const mobilePointsDisplay = document.getElementById("mobilePointsDisplay");
    
    if (pointsDisplay) {
      pointsDisplay.classList.remove("hidden");
      pointsDisplay.style.display = "block";
    }
    
    if (mobilePointsDisplay) {
      mobilePointsDisplay.classList.remove("hidden");
      mobilePointsDisplay.style.display = "block";
    }

    // Hide Beranda link for logged-in users
    const guestNavItem = document.getElementById("guestNavItem");
    const mobileGuestNavItem = document.getElementById("mobileGuestNavItem");

    if (guestNavItem) {
      guestNavItem.style.display = "none";
    }

    if (mobileGuestNavItem) {
      mobileGuestNavItem.style.display = "none";
    }
  }

  // Hide logout button for guest users
  function hideLogoutButton() {
    const logoutBtn = document.getElementById("logoutBtn");
    const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");

    if (logoutBtn) {
      logoutBtn.classList.add("hidden");
      logoutBtn.style.display = "none";
    }

    if (mobileLogoutBtn) {
      mobileLogoutBtn.classList.add("hidden");
      mobileLogoutBtn.style.display = "none";
    }

    // Hide Profile button
    const profileBtn = document.getElementById("profileBtn");
    const mobileProfileBtn = document.getElementById("mobileProfileBtn");
    
    if (profileBtn) {
      profileBtn.classList.add("hidden");
      profileBtn.style.display = "none";
    }
    
    if (mobileProfileBtn) {
      mobileProfileBtn.classList.add("hidden");
      mobileProfileBtn.style.display = "none";
    }

    // Hide Points display
    const pointsDisplay = document.getElementById("pointsDisplay");
    const mobilePointsDisplay = document.getElementById("mobilePointsDisplay");
    
    if (pointsDisplay) {
      pointsDisplay.classList.add("hidden");
      pointsDisplay.style.display = "none";
    }
    
    if (mobilePointsDisplay) {
      mobilePointsDisplay.classList.add("hidden");
      mobilePointsDisplay.style.display = "none";
    }

    // Show Beranda link for guest users
    const guestNavItem = document.getElementById("guestNavItem");
    const mobileGuestNavItem = document.getElementById("mobileGuestNavItem");

    if (guestNavItem) {
      guestNavItem.style.display = "";
    }

    if (mobileGuestNavItem) {
      mobileGuestNavItem.style.display = "";
    }
  }

  // Initialize on DOM ready
  function init() {
    // Check auth status and update logout button
    checkAuthAndUpdateLogoutBtn();
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
