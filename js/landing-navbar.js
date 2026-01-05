// Landing Page Navbar - Authentication-based Display
// This script checks if user is logged in and adjusts navbar accordingly
// Modal utilities are defined in modal-utils.js (optional dependency)
/* global showError, showConfirm */

(function () {
  "use strict";

  // Check authentication status and update navbar
  async function checkAuthAndUpdateNavbar() {
    // --- FAST PATH: Instant UI from Cache ---
    const cachedAuthState = sessionStorage.getItem("isLoggedIn");
    if (cachedAuthState === "true") {
      showMemberNavbar();
      // Optionally show cached points if available to reduce layout shift
      const cachedPoints = sessionStorage.getItem("userPoints");
      if (cachedPoints) {
        if (document.getElementById("navPoints")) document.getElementById("navPoints").textContent = cachedPoints;
        if (document.getElementById("mobileNavPoints")) document.getElementById("mobileNavPoints").textContent = cachedPoints;
      }
    } else {
      showGuestNavbar();
    }

    console.log("[landing-navbar] Verifying auth status with server...");
    try {
      const response = await fetch("/api/auth/check", {
        credentials: "include",
      });

      if (!response.ok) {
        sessionStorage.setItem("isLoggedIn", "false");
        showGuestNavbar();
        return;
      }

      const result = await response.json();
      
      if (result.loggedIn && result.user) {
        // Update cache and show proper UI
        sessionStorage.setItem("isLoggedIn", "true");
        showMemberNavbar();
        fetchAndDisplayPoints();
      } else {
        sessionStorage.setItem("isLoggedIn", "false");
        showGuestNavbar();
      }
    } catch (error) {
      console.warn("[landing-navbar] Could not verify auth status:", error.message);
      // Keep existing UI if network fails
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
          
          // Save to session cache for next page load
          sessionStorage.setItem("userPoints", points);

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

  // Handle logout - delegate to global handleLogout from script.js if available.
  // This prevents duplicate code and ensures consistent logout behavior.
  // Fallback implementation only used on rare pages that don't load script.js.
  function handleLogout() {
    // Check if global handleLogout exists (from script.js)
    if (typeof window.handleLogout === "function") {
      window.handleLogout();
      return;
    }

    // Fallback: minimal implementation for pages without script.js
    const doLogout = async () => {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });

        // Clear local cache instantly
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("userPoints");

        if (response.ok) {
          window.location.reload();
        } else {
          alert("Gagal logout. Silakan coba lagi.");
        }
      } catch (error) {
        console.error("Logout error:", error);
        alert("Terjadi kesalahan saat logout.");
      }
    };

    if (typeof showConfirm === "function") {
      showConfirm(
        "Apakah Anda yakin ingin logout?",
        doLogout,
        null,
        "Konfirmasi Logout"
      );
    } else if (confirm("Apakah Anda yakin ingin logout?")) {
      doLogout();
    }
  }

  // Initialize mobile menu (hamburger button) toggle
  function initMobileMenu() {
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");
    const mobileMenuClose = document.getElementById("mobileMenuClose");
    const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

    if (!hamburgerBtn || !mobileMenu || !mobileMenuOverlay) return;

    // Prevent double initialization (may happen if inline script already initialized)
    if (hamburgerBtn.dataset.mobileMenuInitialized) return;
    hamburgerBtn.dataset.mobileMenuInitialized = "true";

    function openMobileMenu() {
      hamburgerBtn.classList.add("active");
      mobileMenu.classList.add("active");
      mobileMenuOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    function closeMobileMenu() {
      hamburgerBtn.classList.remove("active");
      mobileMenu.classList.remove("active");
      mobileMenuOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }

    hamburgerBtn.addEventListener("click", () => {
      if (mobileMenu.classList.contains("active")) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    if (mobileMenuClose) {
      mobileMenuClose.addEventListener("click", closeMobileMenu);
    }

    mobileMenuOverlay.addEventListener("click", closeMobileMenu);

    // Close menu when clicking nav links
    mobileNavLinks.forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileMenu();
      });
    });

    // Close menu on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu.classList.contains("active")) {
        closeMobileMenu();
      }
    });
  }

  // Initialize mobile kesehatan dropdown toggle
  function initMobileKesehatanDropdown() {
    const mobileKesehatanDropdown = document.getElementById(
      "mobileKesehatanDropdown"
    );
    const mobileMediaDropdown = document.getElementById("mobileMediaDropdown");
    const mobileToggle = mobileKesehatanDropdown?.querySelector(
      ".mobile-nav-dropdown-toggle"
    );

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
    const mobileKesehatanDropdown = document.getElementById(
      "mobileKesehatanDropdown"
    );
    const mobileMediaDropdown = document.getElementById("mobileMediaDropdown");
    const mobileToggle = mobileMediaDropdown?.querySelector(
      ".mobile-nav-dropdown-toggle"
    );

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

  // Set active navigation link based on current page
  function setActiveNavLink() {
    const currentPath = window.location.pathname;

    // Map of paths to link hrefs (normalize paths for matching)
    const pathMap = {
      "/": "/",
      "/index": "/",
      "/index.html": "/",
      "/store": "/store",
      "/store.html": "/store",
      "/services": "/services",
      "/services.html": "/services",
      "/booking": "/booking",
      "/booking.html": "/booking",
      "/journey": "/journey",
      "/journey.html": "/journey",
      "/periksa-kesehatan": "/periksa-kesehatan",
      "/docterbee-periksa-kesehatan.html": "/periksa-kesehatan",
      "/insight": "/insight",
      "/insight.html": "/insight",
      "/events": "/events",
      "/events.html": "/events",
      "/ai-advisor": "/ai-advisor",
      "/ai-advisor.html": "/ai-advisor",
      "/media": "/media",
      "/media.html": "/media",
      "/youtube-ai": "/youtube-ai",
      "/youtube-ai.html": "/youtube-ai",
      "/podcast": "/podcast",
      "/podcast.html": "/podcast",
      "/article": "/article",
      "/article.html": "/article",
    };

    // Get normalized path for matching
    const normalizedPath = pathMap[currentPath] || currentPath;

    // Desktop navigation links
    const desktopNavLinks = document.querySelectorAll(
      ".nav-links a:not(#authButtons a):not(.nav-dropdown a)"
    );
    desktopNavLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === normalizedPath) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Mobile navigation links
    const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
    mobileNavLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === normalizedPath) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Special handling for dropdown items (Kesehatan dropdown: services, booking, journey, periksa-kesehatan)
    const kesehatanPages = [
      "/services",
      "/booking",
      "/journey",
      "/periksa-kesehatan",
    ];
    const mediaPages = [
      "/media",
      "/youtube-ai",
      "/podcast",
      "/article",
      "/insight",
      "/about",
    ];

    if (kesehatanPages.some((page) => normalizedPath.startsWith(page))) {
      // Highlight parent "Kesehatan" dropdown button on desktop if on a sub-page
      const kesehatanDropdown = document.querySelector(".nav-dropdown");
      if (kesehatanDropdown) {
        const dropdownToggle = kesehatanDropdown.querySelector(
          ".nav-dropdown-toggle"
        );
        if (dropdownToggle) {
          dropdownToggle.classList.add("active");
        }
      }
    }

    if (mediaPages.some((page) => normalizedPath.startsWith(page))) {
      // Highlight parent "Media" dropdown button on desktop if on a sub-page
      const mediaDropdown = document.querySelectorAll(".nav-dropdown")[1]; // Second dropdown
      if (mediaDropdown) {
        const dropdownToggle = mediaDropdown.querySelector(
          ".nav-dropdown-toggle"
        );
        if (dropdownToggle) {
          dropdownToggle.classList.add("active");
        }
      }
    }
  }

  // Initialize on DOM ready
  function init() {
    // Check auth status and update navbar
    checkAuthAndUpdateNavbar();

    // Set active navigation link based on current page
    setActiveNavLink();

    // Initialize mobile menu (hamburger button)
    initMobileMenu();

    // Initialize mobile dropdowns
    initMobileKesehatanDropdown();
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
