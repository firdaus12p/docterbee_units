// App Navbar - Authentication-based Display
// This script controls navbar visibility based on login status
// Used for pages with style.css navbar (journey, services, store, events, insight, etc.)

(function () {
  "use strict";

  // Check authentication status and update navbar
  async function checkAuthAndUpdateNavbar() {
    console.log("[app-navbar] Checking auth status...");
    try {
      const response = await fetch("/api/auth/check", {
        credentials: "include",
      });

      if (!response.ok) {
        // User not logged in - show guest UI
        console.log("[app-navbar] User NOT logged in (response not ok)");
        showGuestUI();
        return;
      }

      const result = await response.json();
      console.log("[app-navbar] Auth check result:", result);

      if (result.loggedIn && result.user) {
        // User logged in - show member UI
        console.log("[app-navbar] User IS logged in, showing member UI");
        showMemberUI();
      } else {
        // User not logged in - show guest UI
        console.log("[app-navbar] User NOT logged in (no user in result)");
        showGuestUI();
      }
    } catch (error) {
      // Network error or server down - show guest UI as fallback
      console.warn("[app-navbar] Could not check auth status:", error.message);
      showGuestUI();
    }
  }

  // Show UI for logged-in users (Points, Profile, Logout)
  function showMemberUI() {
    // Show logout button
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

    // Show Profile button
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

    // Show Points display
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

    // Hide login buttons for logged-in users
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const mobileLoginBtn = document.getElementById("mobileLoginBtn");
    const mobileRegisterBtn = document.getElementById("mobileRegisterBtn");

    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";
    if (mobileLoginBtn) mobileLoginBtn.style.display = "none";
    if (mobileRegisterBtn) mobileRegisterBtn.style.display = "none";
  }

  // Show UI for guest users (Beranda, Login, Register)
  function showGuestUI() {
    // Hide logout button
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

    // Show login buttons for guest users
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const mobileLoginBtn = document.getElementById("mobileLoginBtn");
    const mobileRegisterBtn = document.getElementById("mobileRegisterBtn");

    if (loginBtn) loginBtn.style.display = "";
    if (registerBtn) registerBtn.style.display = "";
    if (mobileLoginBtn) {
      mobileLoginBtn.classList.remove("hidden");
      mobileLoginBtn.style.display = "block";
    }
    if (mobileRegisterBtn) {
      mobileRegisterBtn.classList.remove("hidden");
      mobileRegisterBtn.style.display = "block";
    }
  }

  // Initialize mobile kesehatan dropdown toggle
  function initMobileKesehatanDropdown() {
    const mobileKesehatanDropdown = document.getElementById("mobileKesehatanDropdown");
    const mobileMediaDropdown = document.getElementById("mobileMediaDropdown");
    const mobileToggle = mobileKesehatanDropdown?.querySelector(".mobile-nav-dropdown-toggle");

    if (!mobileKesehatanDropdown) {
      console.warn("mobileKesehatanDropdown element not found");
      return;
    }

    if (mobileToggle) {
      // Remove any existing listeners by cloning the element
      const newToggle = mobileToggle.cloneNode(true);
      mobileToggle.parentNode.replaceChild(newToggle, mobileToggle);

      newToggle.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Kesehatan dropdown clicked");

        // Close media dropdown if open
        if (mobileMediaDropdown) {
          mobileMediaDropdown.classList.remove("open");
        }

        // Toggle kesehatan dropdown
        mobileKesehatanDropdown.classList.toggle("open");
      });
    }
  }

  // Initialize mobile media dropdown toggle
  function initMobileMediaDropdown() {
    const mobileKesehatanDropdown = document.getElementById("mobileKesehatanDropdown");
    const mobileMediaDropdown = document.getElementById("mobileMediaDropdown");
    const mobileToggle = mobileMediaDropdown?.querySelector(".mobile-nav-dropdown-toggle");

    if (!mobileMediaDropdown) {
      console.warn("mobileMediaDropdown element not found");
      return;
    }

    if (mobileToggle) {
      // Remove any existing listeners by cloning the element
      const newToggle = mobileToggle.cloneNode(true);
      mobileToggle.parentNode.replaceChild(newToggle, mobileToggle);

      newToggle.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Media dropdown clicked");

        // Close kesehatan dropdown if open
        if (mobileKesehatanDropdown) {
          mobileKesehatanDropdown.classList.remove("open");
        }

        // Toggle media dropdown
        mobileMediaDropdown.classList.toggle("open");
      });
    }
  }

  // Initialize on DOM ready
  function init() {
    // Check auth status and update navbar
    checkAuthAndUpdateNavbar();
    // Initialize mobile dropdowns
    initMobileKesehatanDropdown();
    initMobileMediaDropdown();
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
