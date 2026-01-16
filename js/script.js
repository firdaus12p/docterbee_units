/* ========================================
   Docterbee Journey - Main JavaScript
   ======================================== */
// Modal utilities are defined in modal-utils.js
/* global showSuccess, showError, showWarning, showConfirm */

// ==================== DATA MODEL ====================

// Dynamic units array - loaded from API
let UNITS = [];

// Current journey state
let currentJourney = {
  slug: null,
  name: "",
  description: "",
};

/**
 * Get current journey slug from URL path
 * @returns {string|null} Journey slug or null
 */
function getSlugFromURL() {
  const path = window.location.pathname;
  const match = path.match(/^\/journey\/([a-z0-9-]+)$/);
  return match ? match[1] : null;
}

/**
 * Load list of all journeys for selector
 * @returns {Promise<Array>} Array of journey objects
 */
async function loadJourneyList() {
  try {
    const response = await fetch("/api/journeys");
    const data = await response.json();

    if (data.success && data.data) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error("Error loading journey list:", error);
    return [];
  }
}

/**
 * Load journey data from API
 * @param {string} slug - Journey slug
 * @returns {Promise<Object|null>} Journey data or null
 */
async function loadJourneyFromAPI(slug) {
  try {
    const response = await fetch(`/api/journeys/${encodeURIComponent(slug)}`);
    const data = await response.json();

    if (data.success && data.data) {
      const journey = data.data;

      // Update current journey state
      currentJourney.slug = journey.slug;
      currentJourney.name = journey.name;
      currentJourney.description = journey.description;

      // Convert API format to UNITS format for compatibility
      UNITS = journey.units.map((unit) => ({
        id: String(unit.id),
        title: unit.title,
        color: unit.color_class,
        items: unit.items.map((item) => ({
          key: item.item_key,
          q: item.question,
          dalil: item.dalil,
          sains: item.sains,
          nbsn: item.nbsn,
        })),
      }));

      return journey;
    }
    return null;
  } catch (error) {
    console.error("Error loading journey:", error);
    return null;
  }
}

/**
 * Initialize journey selector dropdown
 * @param {Array} journeys - List of journeys
 */
function initJourneySelector(journeys) {
  const selector = document.getElementById("journeySelector");
  if (!selector) return;

  selector.innerHTML = "";

  journeys.forEach((journey) => {
    const option = document.createElement("option");
    option.value = journey.slug;
    option.textContent = journey.name;
    selector.appendChild(option);
  });

  // Set current selected
  if (currentJourney.slug) {
    selector.value = currentJourney.slug;
  }

  // Add change event listener
  selector.addEventListener("change", (e) => {
    const selectedSlug = e.target.value;
    if (selectedSlug && selectedSlug !== currentJourney.slug) {
      window.location.href = `/journey/${selectedSlug}`;
    }
  });
}

/**
 * Update UI with journey info
 */
function updateJourneyUI() {
  const titleEl = document.getElementById("journeyTitle");
  const descEl = document.getElementById("journeyDescription");

  if (titleEl) {
    titleEl.textContent = currentJourney.name || "Journey";
  }
  if (descEl) {
    descEl.textContent = currentJourney.description || "";
  }
}

// ==================== STORAGE HELPERS ====================

/**
 * LocalStorage helper function
 * @param {string} name - Storage key name
 * @param {*} value - Value to store (optional)
 * @returns {*} Stored value if no value parameter provided
 */
function _db(name, value) {
  if (value === undefined) {
    try {
      return JSON.parse(localStorage.getItem(name) || "{}");
    } catch {
      return {};
    }
  } else {
    localStorage.setItem(name, JSON.stringify(value));
  }
}

/**
 * Get current points from storage
 * @returns {number} Current points value
 */
function _getPoints() {
  const points = _db("db_points");
  return points.value || 0;
}

/**
 * Set points in storage
 * @param {number} value - Points value to set
 */
function _setPoints(value) {
  _db("db_points", { value: value });
}

/**
 * Add points and refresh display
 * @param {number} value - Points to add
 */
function addPoints(value) {
  let points = _getPoints();
  points += value;
  _setPoints(points);
  refreshNav();

  // Auto-save to database if sync is enabled
  if (window.UserDataSync && window.UserDataSync.isEnabled()) {
    window.UserDataSync.debouncedSaveProgress();
  }
}

/**
 * Refresh navigation points display
 */
function refreshNav() {
  const navPointsEl = document.getElementById("navPoints");
  if (navPointsEl) {
    navPointsEl.textContent = _getPoints();
  }

  const mobileNavPointsEl = document.getElementById("mobileNavPoints");
  if (mobileNavPointsEl) {
    mobileNavPointsEl.textContent = _getPoints();
  }
}

/**
 * Get user answers state for current journey
 * @returns {Object} User answers object for current journey
 */
function getState() {
  const allData = _db("db_journey_progress");
  const slug = currentJourney.slug || "hidup-sehat";
  return allData[slug] || {};
}

/**
 * Set user answers state for current journey
 * @param {Object} state - State object to save
 */
function setState(state) {
  const allData = _db("db_journey_progress") || {};
  const slug = currentJourney.slug || "hidup-sehat";
  allData[slug] = state;
  _db("db_journey_progress", allData);
}

// ==================== UI RENDERING ====================

/**
 * Show skeleton loading state for tabs
 * Called while journey data is being fetched
 */
function showTabsSkeleton() {
  const tabsContainer = document.getElementById("tabs");
  if (!tabsContainer) return;

  tabsContainer.innerHTML = "";
  // Show 4 skeleton tabs as placeholder
  for (let i = 0; i < 4; i++) {
    const skeletonTab = document.createElement("div");
    skeletonTab.className = "skeleton skeleton-tab";
    tabsContainer.appendChild(skeletonTab);
  }
}

/**
 * Show skeleton loading state for unit content
 * Called while journey data is being fetched
 */
function showUnitSkeleton() {
  const unitWrap = document.getElementById("unitWrap");
  if (!unitWrap) return;

  // Generate 3 skeleton cards as placeholder
  const skeletonCards = Array(3)
    .fill(0)
    .map(
      () => `
      <div class="skeleton-card">
        <div class="skeleton skeleton-line full"></div>
        <div class="skeleton skeleton-line medium"></div>
        <div class="skeleton skeleton-line short"></div>
        <div class="skeleton-buttons">
          <div class="skeleton skeleton-btn"></div>
          <div class="skeleton skeleton-btn"></div>
          <div class="skeleton skeleton-btn"></div>
        </div>
      </div>
    `
    )
    .join("");

  unitWrap.innerHTML = `
    <div class="unit-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-btn" style="width: 8rem;"></div>
    </div>
    <div class="card-grid">
      ${skeletonCards}
    </div>
  `;
}

/**
 * Build and render tab navigation
 */
function buildTabs() {
  const tabsContainer = document.getElementById("tabs");
  if (!tabsContainer) return;

  tabsContainer.innerHTML = "";

  UNITS.forEach((unit, index) => {
    const button = document.createElement("button");
    button.className = "tab-button" + (index === 0 ? " active" : "");
    button.textContent = unit.title;
    button.addEventListener("click", () => showUnit(unit.id));
    tabsContainer.appendChild(button);
  });
}

/**
 * Show unit content
 * @param {string} unitId - Unit ID to display
 */
function showUnit(unitId) {
  // Track current unit globally for re-rendering after data loads
  window.currentUnitId = unitId;

  const unit = UNITS.find((u) => u.id === unitId);
  if (!unit) return;

  const state = getState();
  const answers = state[unitId] || {};
  const unitWrap = document.getElementById("unitWrap");
  if (!unitWrap) return;

  // Generate question cards HTML
  const itemsHtml = unit.items
    .map((item) => {
      const isAnswered = answers[item.key] === 1;
      const statusClass = isAnswered ? "status-answered" : "status-unanswered";
      const statusText = isAnswered ? "Terpenuhi" : "Belum melakukan";

      return `
      <div class="question-card">
        <div class="question-head flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div class="font-semibold">${escapeHtml(item.q)}</div>
            <div class="text-xs text-slate-900 mt-1 font-medium">${escapeHtml(
              item.dalil
            )}</div>
          </div>
          <div class="text-xs ${
            unit.color
          } font-semibold">Dalil · Sains · NBSN</div>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <button class="btn-yes ${
            isAnswered ? "selected" : ""
          }" data-unit="${unitId}" data-key="${
        item.key
      }" data-value="1">Ya</button>
          <button class="btn-no ${
            !isAnswered && answers[item.key] === 0 ? "selected" : ""
          }" data-unit="${unitId}" data-key="${
        item.key
      }" data-value="0">Belum</button>
          <button class="btn-info" data-unit="${unitId}" data-key="${
        item.key
      }">Lihat Penjelasan</button>
        </div>
        <div id="info_${unitId}_${item.key}" class="info-box hidden">
          <div><b>Dalil:</b> ${escapeHtml(item.dalil)}</div>
          <div><b>Sains:</b> ${escapeHtml(item.sains)}</div>
          <div><b>NBSN:</b> ${escapeHtml(item.nbsn)}</div>
        </div>
        <div class="${statusClass}" id="ans_${unitId}_${
        item.key
      }">${statusText}</div>
      </div>
    `;
    })
    .join("");

  // Render unit content
  unitWrap.innerHTML = `
    <div class="unit-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
      <div class="text-lg font-semibold">${escapeHtml(unit.title)}</div>
      <div class="unit-actions flex flex-wrap items-center gap-2 sm:flex-nowrap">
        <button class="btn-calc-unit" data-unit="${unitId}">Hitung Skor Unit</button>
        <span class="text-2xl font-bold text-red-500" id="score_${unitId}">—</span>
      </div>
    </div>
    <div class="card-grid">
      ${itemsHtml}
    </div>
    <div class="mt-5 text-xs text-slate-400">
      *Jawaban disimpan di perangkat (demo). Dapatkan poin untuk jawaban "Ya".
    </div>
  `;

  // Attach event listeners
  attachUnitEventListeners(unitId);

  // Update active tab
  updateActiveTabs(unitId);
}

/**
 * Attach event listeners to unit buttons
 * @param {string} _unitId - Current unit ID (unused but kept for API consistency)
 */
function attachUnitEventListeners(_unitId) {
  // Answer buttons (Ya/Belum)
  const answerButtons = document.querySelectorAll(".btn-yes, .btn-no");
  answerButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const unit = this.getAttribute("data-unit");
      const key = this.getAttribute("data-key");
      const value = parseInt(this.getAttribute("data-value"));
      answer(unit, key, value);
    });
  });

  // Info toggle buttons
  const infoButtons = document.querySelectorAll(".btn-info");
  infoButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const unit = this.getAttribute("data-unit");
      const key = this.getAttribute("data-key");
      toggleInfo(unit, key);
    });
  });

  // Calculate unit score button
  const calcButton = document.querySelector(".btn-calc-unit");
  if (calcButton) {
    calcButton.addEventListener("click", function () {
      const unit = this.getAttribute("data-unit");
      calcUnit(unit);
    });
  }
}

/**
 * Update active tab styling
 * @param {string} activeUnitId - Currently active unit ID
 */
function updateActiveTabs(activeUnitId) {
  const tabs = document.querySelectorAll(".tab-button");
  tabs.forEach((tab, index) => {
    if (UNITS[index].id === activeUnitId) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });
}

// escapeHtml is now defined in utils.js (global)

// ==================== USER INTERACTIONS ====================

/**
 * Record user answer
 * @param {string} unitId - Unit ID
 * @param {string} key - Question key
 * @param {number} value - Answer value (0 or 1)
 */
function answer(unitId, key, value) {
  // Get current state
  let state = getState();

  // Ensure state is an object
  if (!state || typeof state !== "object") {
    state = {};
  }

  // Ensure unit exists in state
  if (!state[unitId] || typeof state[unitId] !== "object") {
    state[unitId] = {};
  }

  // Set answer
  state[unitId][key] = value;

  // Save state to localStorage
  setState(state);

  const element = document.getElementById("ans_" + unitId + "_" + key);
  if (!element) return;

  // Update status text
  if (value === 1) {
    element.textContent = "Terpenuhi";
    element.className = "status-answered";
    // NOTE: Journey answers do NOT add points to "My Points & Rewards"
    // Points only increase from product purchases (order completed)
  } else {
    element.textContent = "Belum melakukan";
    element.className = "status-unanswered";
  }

  // Update button selected states
  const yesBtn = document.querySelector(
    `.btn-yes[data-unit="${unitId}"][data-key="${key}"]`
  );
  const noBtn = document.querySelector(
    `.btn-no[data-unit="${unitId}"][data-key="${key}"]`
  );

  if (yesBtn && noBtn) {
    if (value === 1) {
      yesBtn.classList.add("selected");
      noBtn.classList.remove("selected");
    } else {
      yesBtn.classList.remove("selected");
      noBtn.classList.add("selected");
    }
  }

  // Auto-save to database if sync is enabled
  if (window.UserDataSync && window.UserDataSync.isEnabled()) {
    console.log("🔄 Triggering debounced save to database...");
    window.UserDataSync.debouncedSaveProgress();
  } else {
    console.log("👤 Guest mode - data saved to localStorage only");
  }
}

/**
 * Toggle information panel visibility
 * @param {string} unitId - Unit ID
 * @param {string} key - Question key
 */
function toggleInfo(unitId, key) {
  const element = document.getElementById("info_" + unitId + "_" + key);
  if (element) {
    element.classList.toggle("hidden");
  }
}

// ==================== SCORING CALCULATIONS ====================

/**
 * Calculate unit score
 * @param {string} unitId - Unit ID to calculate
 */
function calcUnit(unitId) {
  const unit = UNITS.find((u) => u.id === unitId);
  if (!unit) return;

  const state = getState();
  const answers = state[unitId] || {};

  const totalItems = unit.items.length;
  const yesCount = Object.values(answers).filter((v) => v === 1).length;
  const score = Math.round((yesCount / totalItems) * 100);

  const scoreElement = document.getElementById("score_" + unitId);
  if (scoreElement) {
    // Animate counter from 0 to score
    if (score > 0) {
      animateCounter(scoreElement, 0, score, 1200);
    } else {
      scoreElement.textContent = score;
    }
  }

  // NOTE: Journey scoring does NOT add points to "My Points & Rewards"
  // This is just for tracking daily health habits
  // Points only increase from product purchases (order completed)
}

/**
 * Animate counter from start to end value
 * @param {HTMLElement} element - Element to animate
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} duration - Animation duration in milliseconds
 */
function animateCounter(element, start, end, duration) {
  if (!element) return;

  // Add counting class for CSS animation
  element.classList.add("counting");

  const startTime = performance.now();
  const range = end - start;

  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(start + range * easeOut);

    element.textContent = currentValue;

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      // Remove counting class when animation completes
      setTimeout(() => {
        element.classList.remove("counting");
      }, 500);
    }
  }

  requestAnimationFrame(updateCounter);
}

/**
 * Calculate total score across all units
 */
function calcAll() {
  let sum = 0;
  let count = 0;

  UNITS.forEach((unit) => {
    const state = getState();
    const answers = state[unit.id] || {};
    const totalItems = unit.items.length;
    const yesCount = Object.values(answers).filter((v) => v === 1).length;

    if (totalItems > 0) {
      sum += (yesCount / totalItems) * 100;
      count++;
    }
  });

  const total = count > 0 ? Math.round(sum / count) : 0;
  const totalScoreElement = document.getElementById("totalScore");

  if (totalScoreElement) {
    if (isNaN(total) || total === 0) {
      totalScoreElement.textContent = total === 0 ? "0" : "—";
    } else {
      // Animate counter from 0 to total score
      animateCounter(totalScoreElement, 0, total, 1500);
    }
  }

  // NOTE: Journey scoring does NOT add points to "My Points & Rewards"
  // This is just for tracking daily health habits
  // Points only increase from product purchases (order completed)
}

// ==================== MOBILE MENU ====================

/**
 * Initialize mobile menu functionality
 */
// ============================================
// LOGOUT HANDLER
// ============================================
async function performLogout() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    const data = await response.json();

    if (data.success) {
      // Clear local auth cache
      sessionStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("userPoints");

      // Clear user data sync
      if (window.UserDataSync) {
        window.UserDataSync.clear();
      }

      // Directly redirect without success modal (user already confirmed)
      window.location.href = "/";
    } else {
      showError("Logout gagal. Silakan coba lagi.");
    }
  } catch (error) {
    console.error("Logout error:", error);
    showError("Terjadi kesalahan saat logout. Silakan coba lagi.");
  }
}

async function handleLogout() {
  showConfirm(
    "Apakah Anda yakin ingin logout?",
    () => {
      performLogout();
    },
    null,
    "Konfirmasi Logout"
  );
}

function initLogout() {
  // Desktop logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  // Mobile logout button
  const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");
  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener("click", handleLogout);
  }
}

/**
 * Update login/logout button visibility based on auth status
 */
async function updateAuthButtons() {
  try {
    const response = await fetch("/api/auth/check", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    // Desktop buttons
    const desktopLogoutBtn = document.getElementById("logoutBtn");

    // Mobile buttons
    const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");
    const mobileLoginBtn = document.getElementById("mobileLoginBtn");

    if (data.loggedIn) {
      // User is logged in - show logout buttons
      if (desktopLogoutBtn) desktopLogoutBtn.classList.remove("hidden");
      if (mobileLogoutBtn) mobileLogoutBtn.classList.remove("hidden");
      if (mobileLoginBtn) mobileLoginBtn.classList.add("hidden");
    } else {
      // User is not logged in - show login button
      if (desktopLogoutBtn) desktopLogoutBtn.classList.add("hidden");
      if (mobileLogoutBtn) mobileLogoutBtn.classList.add("hidden");
      if (mobileLoginBtn) mobileLoginBtn.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Auth check error:", error);
    // On error, assume not logged in - show login button
    const desktopLogoutBtn = document.getElementById("logoutBtn");
    const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");
    const mobileLoginBtn = document.getElementById("mobileLoginBtn");

    if (desktopLogoutBtn) desktopLogoutBtn.classList.add("hidden");
    if (mobileLogoutBtn) mobileLogoutBtn.classList.add("hidden");
    if (mobileLoginBtn) mobileLoginBtn.classList.remove("hidden");
  }
}

// Flag to prevent multiple initializations
let mobileMenuInitialized = false;

/**
 * Initialize mobile menu functionality
 * NOTE: This function is intentionally empty/no-op.
 * Mobile menu is now exclusively handled by landing-navbar.js which is loaded on all pages.
 * This prevents duplicate event listener conflicts.
 */
function initMobileMenu() {
  // Mobile menu initialization is now handled by landing-navbar.js
  // This function is kept for backward compatibility but does nothing.
  // See js/landing-navbar.js initMobileMenu() for the actual implementation.
  mobileMenuInitialized = true;
}

// ==================== INITIALIZATION ====================

/**
 * Initialize application
 */
async function init() {
  // Set current year in footer
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Initialize user data sync FIRST (check if logged in and load data)
  // This must happen before rendering UI to ensure data is available
  if (window.UserDataSync && window.UserDataSync.autoInit) {
    await window.UserDataSync.autoInit();
  }

  // ===== JOURNEY-SPECIFIC LOGIC =====
  // Only run journey-related code if we're on a journey page
  // This prevents redirects from other pages (login, register, etc.)
  const currentPath = window.location.pathname;
  const isJourneyPage =
    currentPath === "/journey" || currentPath.startsWith("/journey/");

  if (!isJourneyPage) {
    // Not on journey page, skip journey-specific initialization
    // Other pages will call their own init functions (initBooking, renderEvents, etc.)
    return;
  }

  // Determine journey slug from URL or use default
  const slug = getSlugFromURL();

  // If no slug in URL (e.g., /journey without slug), redirect to default journey
  if (!slug) {
    // Load journey list to get the first/default journey
    const journeys = await loadJourneyList();
    if (journeys.length > 0) {
      window.location.href = `/journey/${journeys[0].slug}`;
      return; // Stop execution, page will redirect
    } else {
      // Fallback if no journeys exist
      console.error("No journeys found in database");
      const unitWrap = document.getElementById("unitWrap");
      if (unitWrap) {
        unitWrap.innerHTML = `<div class="text-center text-slate-500 p-8">Tidak ada journey yang tersedia.</div>`;
      }
      return;
    }
  }

  // Show skeleton loading state immediately while data loads
  showTabsSkeleton();
  showUnitSkeleton();

  // Load journey data from API
  const journey = await loadJourneyFromAPI(slug);

  if (!journey) {
    // Journey not found, redirect to default
    window.location.href = "/journey";
    return;
  }

  // Update UI with journey info
  updateJourneyUI();

  // Load and initialize journey selector
  const journeys = await loadJourneyList();
  initJourneySelector(journeys);

  // Build tabs and show first unit (after data is loaded)
  if (UNITS.length > 0) {
    buildTabs();
    showUnit(UNITS[0].id);
  } else {
    const unitWrap = document.getElementById("unitWrap");
    if (unitWrap) {
      unitWrap.innerHTML = `<div class="text-center text-slate-500 p-8">Journey ini belum memiliki unit.</div>`;
    }
  }

  // Attach calc all button listener
  const calcAllBtn = document.getElementById("btnCalcAll");
  if (calcAllBtn) {
    calcAllBtn.addEventListener("click", calcAll);
  }

  // Initialize logout functionality
  initLogout();

  // Initialize mobile menu
  initMobileMenu();

  // Update auth buttons visibility
  await updateAuthButtons();

  // Initialize Lucide icons
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }

  // Refresh navigation points
  refreshNav();
}

// ==================== BOOKING PAGE FUNCTIONS ====================

/**
 * Booking state
 */
const bookingState = {
  selectedTime: null,
  serviceName: null,
  validatedCoupon: null,
  price: 0,
  discountAmount: 0,
  finalPrice: 0,
};

/**
 * Generate time slots for booking
 */
function generateSlots() {
  const slotsContainer = document.getElementById("slots");
  if (!slotsContainer) return;

  const hours = [9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20];

  // Create select dropdown for time slots
  slotsContainer.innerHTML = `
    <select id="timeSlotSelect" class="booking-select w-full">
      <option value="">Pilih jam yang tersedia...</option>
      ${hours
        .map((hour) => {
          const timeStr = (hour < 10 ? "0" : "") + hour + ":00";
          return `<option value="${timeStr}">${timeStr}</option>`;
        })
        .join("")}
    </select>
  `;

  // Add event listener to the select element
  const selectElement = document.getElementById("timeSlotSelect");
  if (selectElement) {
    selectElement.addEventListener("change", (e) => selectSlot(e.target.value));
  }
}

/**
 * Select a time slot
 * @param {string} time - Selected time slot
 */
function selectSlot(time) {
  // Jika time kosong (user pilih default option), reset
  if (!time) {
    bookingState.selectedTime = null;
    updateBookingSummary();
    return;
  }

  bookingState.selectedTime = time;

  // Update the select element value
  const selectElement = document.getElementById("timeSlotSelect");
  if (selectElement && selectElement.value !== time) {
    selectElement.value = time;
  }

  updateBookingSummary();
}

/**
 * Format date to Indonesian format
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date string
 */
function formatDateIndo(dateStr) {
  if (!dateStr) return "";

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const date = new Date(dateStr + "T00:00:00");
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${day} ${month} ${year}`;
}

/**
 * Update booking summary display
 */
function updateBookingSummary() {
  const summaryEl = document.getElementById("summary");
  if (!summaryEl) return;

  const branch = document.getElementById("branch")?.value || "";
  const practitioner = document.getElementById("pract")?.value || "";
  const dateRaw = document.getElementById("date")?.value || "";
  const dateFormatted = dateRaw ? formatDateIndo(dateRaw) : "(belum dipilih)";
  const mode = document.getElementById("mode")?.value || "";
  const time = bookingState.selectedTime || "(belum dipilih)";
  const service = bookingState.serviceName || "(belum dipilih)";

  summaryEl.innerHTML = `
    <div class="grid md:grid-cols-2 gap-3">
      <div class="summary-card">
        <b>Layanan</b>
        <div class="opacity-80">${escapeHtml(service)}</div>
      </div>
      <div class="summary-card">
        <b>Mode</b>
        <div class="opacity-80">${escapeHtml(mode)}</div>
      </div>
      <div class="summary-card">
        <b>Cabang</b>
        <div class="opacity-80">${escapeHtml(branch)}</div>
      </div>
      <div class="summary-card">
        <b>Tanggal</b>
        <div class="opacity-80">${dateFormatted}</div>
      </div>
      <div class="summary-card">
        <b>Praktisi</b>
        <div class="opacity-80">${escapeHtml(practitioner)}</div>
      </div>
      <div class="summary-card">
        <b>Jam</b>
        <div class="opacity-80">${time}</div>
      </div>
    </div>
  `;
}

/**
 * Confirm booking and save to database
 */
async function confirmBooking() {
  updateBookingSummary();

  // Validasi data pribadi
  const customerName = document.getElementById("customerName")?.value.trim();
  const customerPhone = document.getElementById("customerPhone")?.value.trim();
  const customerAge = document.getElementById("customerAge")?.value;
  const customerGender = document.getElementById("customerGender")?.value;
  const customerAddress = document
    .getElementById("customerAddress")
    ?.value.trim();

  if (
    !customerName ||
    !customerPhone ||
    !customerAge ||
    !customerGender ||
    !customerAddress
  ) {
    showWarning(
      "Mohon lengkapi semua data pribadi yang bertanda * (wajib diisi)."
    );
    return;
  }

  // Validasi nomor HP format Indonesia
  const phoneRegex = /^(08|\+?628)[0-9]{8,13}$/;
  if (!phoneRegex.test(customerPhone.replace(/[\s-]/g, ""))) {
    showWarning(
      "Format nomor HP tidak valid. Gunakan format: 08xx-xxxx-xxxx atau +628xx-xxxx-xxxx"
    );
    return;
  }

  // Validasi umur
  if (customerAge < 1 || customerAge > 150) {
    showWarning("Umur tidak valid. Masukkan umur antara 1-150 tahun.");
    return;
  }

  // Validasi data booking
  const dateRaw = document.getElementById("date")?.value;
  if (!dateRaw || !bookingState.selectedTime) {
    showWarning("Pilih tanggal dan jam terlebih dahulu.");
    return;
  }

  // Save to database (form values are read in saveBookingToDatabase function)
  const saved = await saveBookingToDatabase();

  if (saved) {
    const service = bookingState.serviceName || "";
    showSuccess(
      `Halo ${customerName},\n` +
        `Booking Anda untuk ${service} telah tersimpan.\n\n` +
        `Admin kami akan segera menghubungi Anda di ${customerPhone} untuk konfirmasi jadwal.\n\n` +
        `Terima kasih! 🙏`,
      "Booking Berhasil"
    );

    // Reset form setelah sukses
    resetBookingForm();

    // Clear data pribadi
    document.getElementById("customerName").value = "";
    document.getElementById("customerPhone").value = "";
    document.getElementById("customerAge").value = "";
    document.getElementById("customerGender").value = "";
    document.getElementById("customerAddress").value = "";
    document.getElementById("promoCode").value = "";

    // Hide promo result
    const promoResult = document.getElementById("promoResult");
    if (promoResult) {
      promoResult.classList.add("hidden");
    }
  } else {
    showError(
      `Gagal menyimpan booking.\n\n` +
        `Mohon coba lagi atau hubungi admin kami jika masalah berlanjut.`
    );
  }
}

// Validate promo code
async function validatePromoCode() {
  const promoCodeInput = document.getElementById("promoCode");
  const promoResult = document.getElementById("promoResult");
  const code = promoCodeInput?.value.trim();

  if (!code) {
    promoResult.className = "text-sm text-slate-400";
    promoResult.textContent = "Masukkan kode promo terlebih dahulu";
    promoResult.classList.remove("hidden");
    return;
  }

  promoResult.className = "text-sm text-slate-400";
  promoResult.textContent = "Memvalidasi...";
  promoResult.classList.remove("hidden");

  try {
    // Get current booking price for validation
    const bookingPrice = bookingState.price || 0;

    const response = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code.toUpperCase(),
        booking_value: bookingPrice,
        type: "services", // Specify this is for services/booking
      }),
      credentials: "include", // Include session cookie for user tracking
    });

    const result = await response.json();

    if (result.success && result.valid) {
      promoResult.className =
        "text-sm text-emerald-400 bg-emerald-900/20 p-3 rounded-lg";
      promoResult.innerHTML = `
        <div class="flex items-center gap-2 mb-1">
          <i data-lucide="check-circle" class="w-4 h-4"></i>
          <b>Kode promo valid!</b>
        </div>
        <div class="text-xs opacity-80">${escapeHtml(
          result.data.description || ""
        )}</div>
        <div class="mt-1">
          Diskon: <b>${
            result.data.discountType === "percentage"
              ? result.data.discountValue + "%"
              : "Rp " + result.data.discountValue.toLocaleString()
          }</b>
        </div>
      `;

      // Refresh icons
      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }

      // Store validated coupon
      bookingState.validatedCoupon = result.data;

      // Update price display with discount
      updatePriceDisplay();
    } else {
      // Handle already used error with special styling
      if (result.alreadyUsed) {
        promoResult.className =
          "text-sm text-red-600 bg-red-900/20 p-3 rounded-lg";
        promoResult.innerHTML = `
          <div class="flex items-center gap-2 mb-1">
            <i data-lucide="alert-circle" class="w-4 h-4"></i>
            <b>Kupon sudah digunakan</b>
          </div>
          <div class="text-xs opacity-80">${escapeHtml(
            result.error || "Anda sudah pernah menggunakan kode promo ini"
          )}</div>
        `;
      } else {
        // Generic error
        promoResult.className =
          "text-sm text-red-400 bg-red-900/20 p-3 rounded-lg";
        promoResult.innerHTML = `
          <div class="flex items-center gap-2">
            <i data-lucide="x-circle" class="w-4 h-4"></i>
            <span>${escapeHtml(result.error || "Kode promo tidak valid")}</span>
          </div>
        `;
      }

      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }

      bookingState.validatedCoupon = null;

      // Update price display (remove discount)
      updatePriceDisplay();
    }
  } catch (error) {
    console.error("Error validating promo:", error);
    promoResult.className = "text-sm text-red-400 bg-red-900/20 p-3 rounded-lg";
    promoResult.textContent =
      "Gagal memvalidasi kode promo. Pastikan server backend berjalan.";
    bookingState.validatedCoupon = null;

    // Update price display (remove discount)
    updatePriceDisplay();
  }

  promoResult.classList.remove("hidden");
}

// Save booking to database
async function saveBookingToDatabase() {
  // Get customer data
  const customerName =
    document.getElementById("customerName")?.value.trim() || "";
  const customerPhone =
    document.getElementById("customerPhone")?.value.trim() || "";
  const customerAge = document.getElementById("customerAge")?.value;
  const customerGender = document.getElementById("customerGender")?.value || "";
  const customerAddress =
    document.getElementById("customerAddress")?.value.trim() || "";

  // Get booking data
  const dateRaw = document.getElementById("date")?.value;
  const branch = document.getElementById("branch")?.value || "";
  const practitioner = document.getElementById("pract")?.value || "";
  const mode = document.getElementById("mode")?.value || "";
  const promoCode =
    document.getElementById("promoCode")?.value.trim().toUpperCase() || null;
  const time = bookingState.selectedTime;
  const service = bookingState.serviceName || "";

  if (
    !dateRaw ||
    !time ||
    !customerName ||
    !customerPhone ||
    !customerAge ||
    !customerGender ||
    !customerAddress
  ) {
    return false;
  }

  // Extract mode value (remove text in parentheses)
  const modeValue = mode.toLowerCase().includes("online")
    ? "online"
    : "offline";

  try {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceName: service,
        branch: branch,
        practitioner: practitioner,
        date: dateRaw,
        time: time,
        mode: modeValue,
        promoCode: promoCode,
        customerName: customerName,
        customerPhone: customerPhone,
        customerAge: parseInt(customerAge),
        customerGender: customerGender,
        customerAddress: customerAddress,
        // Send calculated prices from frontend
        price: bookingState.price,
        discountAmount: bookingState.discountAmount,
        finalPrice: bookingState.finalPrice,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ Booking berhasil disimpan ke database:", result.data);
      console.log("💰 Harga yang dikirim:", {
        price: bookingState.price,
        discountAmount: bookingState.discountAmount,
        finalPrice: bookingState.finalPrice,
        promoCode: promoCode,
      });
      return true;
    } else {
      console.error("❌ Gagal menyimpan booking:", result.error);
      return false;
    }
  } catch (error) {
    console.error("❌ Error saat menyimpan booking:", error);
    return false;
  }
}

/**
 * Reset booking form
 */
// Load service price from API
async function loadServicePrice(serviceName) {
  try {
    const response = await fetch(
      `/api/bookings/prices/${encodeURIComponent(serviceName)}`
    );
    const result = await response.json();

    if (result.success) {
      bookingState.price = result.data.price;
      updatePriceDisplay();
    } else {
      console.error("Failed to load price:", result.error);
      bookingState.price = 0;
    }
  } catch (error) {
    console.error("Error loading service price:", error);
    bookingState.price = 0;
  }
}

// Update price display with discount calculation
function updatePriceDisplay() {
  const priceSummary = document.getElementById("priceSummary");
  const displayPrice = document.getElementById("displayPrice");
  const discountRow = document.getElementById("discountRow");
  const displayDiscount = document.getElementById("displayDiscount");
  const displayFinalPrice = document.getElementById("displayFinalPrice");

  if (!bookingState.price || bookingState.price === 0) {
    priceSummary?.classList.add("hidden");
    return;
  }

  // Show price summary
  priceSummary?.classList.remove("hidden");

  // Format price
  displayPrice.textContent = formatCurrency(bookingState.price);

  // Calculate discount if coupon is validated
  let discountAmount = 0;
  let finalPrice = bookingState.price;

  if (bookingState.validatedCoupon) {
    const coupon = bookingState.validatedCoupon;
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round(
        (bookingState.price * coupon.discountValue) / 100
      );
    } else {
      discountAmount = coupon.discountValue;
    }
    finalPrice = Math.max(0, bookingState.price - discountAmount);

    // Show discount row
    discountRow?.classList.remove("hidden");
    displayDiscount.textContent = `- ${formatCurrency(discountAmount)}`;
  } else {
    // Hide discount row
    discountRow?.classList.add("hidden");
  }

  // Display final price
  displayFinalPrice.textContent = formatCurrency(finalPrice);

  // Store for later use
  bookingState.discountAmount = discountAmount;
  bookingState.finalPrice = finalPrice;
}

function resetBookingForm() {
  const dateInput = document.getElementById("date");
  if (dateInput) {
    dateInput.value = "";
  }

  bookingState.selectedTime = null;
  generateSlots();
  updateBookingSummary();
}

/**
 * Initialize booking page
 */
function initBooking() {
  // Read service parameter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = urlParams.get("service");
  if (serviceParam) {
    bookingState.serviceName = decodeURIComponent(serviceParam);

    // Show service indicator
    const serviceIndicator = document.getElementById("serviceIndicator");
    const serviceIndicatorText = document.getElementById(
      "serviceIndicatorText"
    );
    if (serviceIndicator && serviceIndicatorText) {
      serviceIndicatorText.textContent = bookingState.serviceName;
      serviceIndicator.classList.remove("hidden");
    }

    // Load and display price
    loadServicePrice(bookingState.serviceName);
  }

  // Set current year in footer
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Initialize date picker with minimum date as today
  const dateInput = document.getElementById("date");
  if (dateInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;

    dateInput.setAttribute("min", todayStr);

    // Set max date to 3 months from now
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    const maxYear = maxDate.getFullYear();
    const maxMonth = String(maxDate.getMonth() + 1).padStart(2, "0");
    const maxDay = String(maxDate.getDate()).padStart(2, "0");
    const maxDateStr = `${maxYear}-${maxMonth}-${maxDay}`;

    dateInput.setAttribute("max", maxDateStr);
  }

  // Generate time slots
  generateSlots();
  updateBookingSummary();

  // Attach event listeners
  const confirmBtn = document.getElementById("btnConfirmBooking");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", confirmBooking);
  }

  const resetBtn = document.getElementById("btnResetForm");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetBookingForm);
  }

  // Validate promo button
  const validatePromoBtn = document.getElementById("btnValidatePromo");
  if (validatePromoBtn) {
    validatePromoBtn.addEventListener("click", validatePromoCode);
  }

  // Update summary when form fields change
  const formFields = ["branch", "pract", "date", "mode"];
  formFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener("change", updateBookingSummary);
    }
  });

  // Initialize logout
  initLogout();

  // Initialize mobile menu
  initMobileMenu();

  // Update auth buttons
  updateAuthButtons();

  // Initialize Lucide icons
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }

  // Refresh navigation points
  refreshNav();
}

// ==================== EVENTS PAGE FUNCTIONS ====================

/**
 * Render events based on filters
 */
async function renderEvents() {
  const modeFilter = document.getElementById("eventMode")?.value || "all";
  const topicFilter = document.getElementById("eventTopic")?.value || "all";
  const eventsContainer = document.getElementById("events");

  if (!eventsContainer) return;

  eventsContainer.innerHTML =
    '<div class="col-span-2 text-center text-slate-400 p-6">Loading events...</div>';

  try {
    // Build query params
    let url = "/api/events?limit=50";
    if (modeFilter !== "all") {
      url += `&mode=${modeFilter}`;
    }
    if (topicFilter !== "all") {
      url += `&topic=${topicFilter}`;
    }

    const response = await fetch(url);
    const result = await response.json();

    if (!result.success || result.data.length === 0) {
      eventsContainer.innerHTML =
        '<div class="col-span-2 text-center text-slate-400 p-6">Belum ada event tersedia</div>';
      return;
    }

    eventsContainer.innerHTML = "";

    result.data.forEach((event, index) => {
      const card = document.createElement("div");
      card.className = "event-card";
      card.style.animationDelay = `${0.1 + index * 0.1}s`;

      // Format registration fee
      const isFree = !event.registration_fee || event.registration_fee === 0;
      const feeText = isFree
        ? "GRATIS"
        : formatCurrency(event.registration_fee);
      const priceClass = isFree ? "event-price-free" : "event-price-paid";

      // Check if registration is closed
      let isRegistrationClosed = false;
      let deadlineHtml = "";
      if (event.registration_deadline) {
        const deadline = new Date(event.registration_deadline);
        deadline.setHours(23, 59, 59, 999);
        const now = new Date();
        isRegistrationClosed = now > deadline;

        deadlineHtml = `
          <div class="event-meta-item event-deadline">
            <i data-lucide="clock"></i>
            <span>Daftar sebelum: ${deadline.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}${
          isRegistrationClosed
            ? ' <span class="event-deadline-closed">(Ditutup)</span>'
            : ""
        }</span>
          </div>
        `;
      }

      // Format location for offline events
      let locationHtml = "";
      if (event.mode === "offline" && event.location) {
        locationHtml = `
          <div class="event-meta-item event-location">
            <i data-lucide="map-pin"></i>
            <span>${escapeHtml(event.location)}</span>
          </div>
        `;
      }

      // Speaker info
      let speakerHtml = "";
      if (event.speaker) {
        speakerHtml = `
          <div class="event-meta-item event-speaker">
            <i data-lucide="user"></i>
            <span>Pemateri: ${escapeHtml(event.speaker)}</span>
          </div>
        `;
      }

      // Image section
      const imageHtml = event.event_image
        ? `<img src="${escapeHtml(event.event_image)}" alt="${escapeHtml(
            event.title
          )}" loading="lazy">`
        : `<div class="event-card-image-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>`;

      // Badge for mode
      const modeBadgeClass =
        event.mode === "online" ? "event-badge-online" : "event-badge-offline";
      const modeIcon =
        event.mode === "online"
          ? '<i data-lucide="video" class="w-3 h-3"></i>'
          : '<i data-lucide="map-pin" class="w-3 h-3"></i>';

      // Determine button markup based on registration status
      let primaryButtonHtml;
      if (isRegistrationClosed) {
        primaryButtonHtml = `
          <button disabled class="btn-primary-sm" style="background: #9ca3af; cursor: not-allowed; opacity: 0.7;">
            Pendaftaran Ditutup
          </button>
        `;
      } else {
        primaryButtonHtml = `<button onclick="handleEventRegistration(${event.id})" class="btn-primary-sm">Daftar Sekarang</button>`;
      }

      // Info Program button
      let infoButtonHtml = "";
      if (event.speaker || event.description) {
        infoButtonHtml = `<button onclick='showClassInfoModal(${JSON.stringify({
          name: event.speaker || "DocterBee",
          photo: event.speaker_photo || "",
          bio: event.speaker_bio || "",
          eventTitle: event.title,
          description:
            event.description ||
            "Bergabunglah di program eksklusif ini bersama DocterBee.",
          eventImage: event.event_image || "",
        }).replace(
          /'/g,
          "&#39;"
        )})' class="btn-secondary-sm">Info Program</button>`;
      }

      card.innerHTML = `
        <!-- Image Section -->
        <div class="event-card-image">
          ${imageHtml}
        </div>
        
        <!-- Body Section -->
        <div class="event-card-body">
          <!-- Badges -->
          <div class="flex flex-wrap gap-2">
            <span class="event-badge ${modeBadgeClass}">
              ${modeIcon}
              ${event.mode.toUpperCase()}
            </span>
            <span class="event-badge event-badge-topic">${escapeHtml(
              event.topic
            )}</span>
          </div>
          
          <!-- Title -->
          <h3 class="event-card-title">${escapeHtml(event.title)}</h3>
          
          <!-- Meta Info -->
          <div class="event-meta">
            <div class="event-meta-item">
              <i data-lucide="calendar"></i>
              <span>${formatEventDate(event.event_date)}</span>
            </div>
            ${speakerHtml}
            ${locationHtml}
            ${deadlineHtml}
          </div>
          
          <!-- Price -->
          <div class="event-price ${priceClass}">${feeText}</div>
        </div>
        
        <!-- Footer Section -->
        <div class="event-card-footer">
          ${primaryButtonHtml}
          ${infoButtonHtml}
        </div>
      `;

      eventsContainer.appendChild(card);
    });

    // Re-initialize Lucide icons after all cards are added
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  } catch (error) {
    console.error("Error loading events:", error);
    eventsContainer.innerHTML =
      '<div class="col-span-2 text-center text-red-400 p-6">Gagal memuat events. Pastikan server backend berjalan.</div>';
  }
}

// Helper to format event date
function formatEventDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Initialize events page
 */
function initEvents() {
  // Set current year in footer
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Render events
  renderEvents();

  // Attach filter listeners
  const modeSelect = document.getElementById("eventMode");
  const topicSelect = document.getElementById("eventTopic");

  if (modeSelect) {
    modeSelect.addEventListener("change", renderEvents);
  }

  if (topicSelect) {
    topicSelect.addEventListener("change", renderEvents);
  }

  // Initialize logout
  initLogout();

  // Initialize mobile menu
  initMobileMenu();

  // Update auth buttons
  updateAuthButtons();

  // Initialize Lucide icons
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }

  // Refresh navigation points
  refreshNav();
}

/**
 * Handle event registration button click
 * Check if user is logged in before allowing registration
 * @param {number} eventId - Event ID to register for
 */
async function handleEventRegistration(eventId) {
  try {
    // Check if user is logged in
    const response = await fetch("/api/auth/check", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (data.loggedIn) {
      // User is logged in, redirect to registration
      window.location.href = `/event-registration?eventId=${eventId}`;
    } else {
      // User is not logged in, show modal
      if (typeof showModal === "function") {
        showModal({
          title: "Login Diperlukan",
          message:
            "Untuk mendaftar event, Anda harus login terlebih dahulu.\n\nSilakan daftar akun atau login jika sudah memiliki akun.",
          type: "warning",
          confirmText: "Daftar Akun",
          showCancel: true,
          cancelText: "Login",
          autoCloseDelay: 0,
          onConfirm: () => {
            window.location.href = "/register";
          },
          onCancel: () => {
            window.location.href = "/login";
          },
        });
      } else {
        alert("Silakan login terlebih dahulu untuk mendaftar event.");
        window.location.href = "/login";
      }
    }
  } catch (error) {
    console.error("Error checking auth status:", error);
    // On error, assume not logged in
    if (typeof showModal === "function") {
      showModal({
        title: "Login Diperlukan",
        message: "Untuk mendaftar event, Anda harus login terlebih dahulu.",
        type: "warning",
        confirmText: "Login",
        autoCloseDelay: 0,
        onConfirm: () => {
          window.location.href = "/login";
        },
      });
    } else {
      alert("Silakan login terlebih dahulu.");
      window.location.href = "/login";
    }
  }
}

/**
 * Show Class Info Modal (formerly Speaker Info)
 */
function showClassInfoModal(data) {
  // Remove existing modal if any
  const existingModal = document.getElementById("speakerInfoModal");
  if (existingModal) existingModal.remove();

  // 1. Hero Image (Boxy & Large - Tall Portrait Style)
  // Use eventImage (dedicated banner) first, then fall back to speaker photo
  const heroImageSrc = data.eventImage || data.photo;
  const heroImageHtml = heroImageSrc
    ? `<img src="${escapeHtml(heroImageSrc)}" alt="${escapeHtml(
        data.eventTitle
      )}" 
           class="w-full aspect-[4/5] md:aspect-[3/2] object-cover rounded-xl shadow-md mb-6" loading="lazy" 
           onerror="this.parentElement.innerHTML='<div class=\\'w-full aspect-[4/5] md:aspect-[3/2] bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-3xl font-bold rounded-xl shadow-md mb-6\\'>${data.name
             .charAt(0)
             .toUpperCase()}</div>'"/>`
    : `<div class="w-full aspect-[4/5] md:aspect-[3/2] bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-3xl font-bold rounded-xl shadow-md mb-6">
         ${data.name.charAt(0).toUpperCase()}
       </div>`;

  // 2. Class Description Section
  // 2. Class Description Section
  const classInfoHtml = `
    <div class="mb-6 w-full">
      <h4 class="font-bold text-black text-lg mb-2">Tentang Kelas</h4>
      <div class="text-slate-700 text-sm leading-relaxed whitespace-pre-line break-words w-full">${escapeHtml(
        data.description
      )}</div>
    </div>
  `;

  // 3. Speaker Section
  const speakerInfoHtml = `
    <div class="w-full">
      <h4 class="font-bold text-xl text-slate-900 mb-2">Pemateri</h4>
      <div class="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 w-full">
        <div class="flex-shrink-0">
             ${
               data.photo
                 ? `<img src="${escapeHtml(
                     data.photo
                   )}" class="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" loading="lazy">`
                 : `<div class="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xl">${data.name.charAt(
                     0
                   )}</div>`
             }
        </div>
        <div class="min-w-0 flex-1">
            <div class="font-semibold text-slate-900 break-words">${escapeHtml(
              data.name
            )}</div>
            <div class="text-xs text-red-500 font-medium mb-1">Praktisi DocterBee</div>
            <div class="text-slate-600 text-sm leading-relaxed whitespace-pre-line mt-1 break-words">${escapeHtml(
              data.bio || "Informasi profil belum tersedia."
            )}</div>
        </div>
      </div>
    </div>
  `;

  // Create modal HTML
  const modalHtml = `
    <div id="speakerInfoModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onclick="if(event.target === this) this.remove()">
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
          <h3 class="font-bold text-lg text-slate-900 truncate pr-4">${escapeHtml(
            data.eventTitle
          )}</h3>
          <button onclick="document.getElementById('speakerInfoModal').remove()" class="text-slate-400 hover:text-red-500 transition bg-slate-100 p-1.5 rounded-full">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <!-- Content (Scrollable) -->
        <div class="p-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
          ${heroImageHtml}
          ${classInfoHtml}
          ${speakerInfoHtml}
        </div>
        
        <!-- Footer -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button onclick="document.getElementById('speakerInfoModal').remove()" 
                  class="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition shadow-lg shadow-slate-200/50">
            Tutup
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

// ==================== INSIGHT PAGE FUNCTIONS ====================

/**
 * Render insight articles
 */
async function renderInsightArticles() {
  const articlesContainer = document.getElementById("articles");
  if (!articlesContainer) return;

  articlesContainer.innerHTML =
    '<div class="col-span-3 text-center text-slate-400 p-6">Loading articles...</div>';

  try {
    const response = await fetch("/api/insight?limit=20");
    const result = await response.json();

    if (!result.success || result.data.length === 0) {
      articlesContainer.innerHTML =
        '<div class="col-span-3 text-center text-slate-400 p-6">Belum ada artikel tersedia</div>';
      return;
    }

    articlesContainer.innerHTML = "";

    result.data.forEach((article) => {
      const card = document.createElement("div");
      card.className = "article-card";
      card.innerHTML = `
        <div class="text-lg font-semibold">${escapeHtml(article.title)}</div>
        <div class="text-xs text-red-600 mt-1 font-medium">${escapeHtml(
          article.tags || "Article"
        )}</div>
        <p class="text-sm text-slate-900 mt-2">${escapeHtml(
          article.excerpt || article.content.substring(0, 150) + "..."
        )}</p>
        <div class="mt-3 flex gap-2">
          <button onclick="summarizeArticleById('${escapeHtml(
            article.slug
          )}')" class="btn-primary-sm">Ringkas & Rekomendasi</button>
        </div>
      `;
      articlesContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading articles:", error);
    articlesContainer.innerHTML =
      '<div class="col-span-3 text-center text-red-400 p-6">Gagal memuat articles. Pastikan server backend berjalan.</div>';
  }
}

// Summarize article by slug (load from API)
async function summarizeArticleById(slug) {
  const resultContainer = document.getElementById("insightResult");

  if (!resultContainer) return;

  resultContainer.innerHTML =
    '<p class="text-slate-400">Loading article...</p>';

  try {
    const response = await fetch(`/api/insight/${slug}`);
    const result = await response.json();

    if (!result.success) {
      resultContainer.innerHTML =
        '<p class="text-red-400">Artikel tidak ditemukan</p>';
      return;
    }

    const article = result.data;

    const nbsnHTML = `
      <div class="grid md:grid-cols-2 gap-4">
        <div class="nbsn-card">
          <div class="font-semibold mb-1">Ringkasan</div>
          <p class="text-slate-200/85">${markdownToHtml(
            article.excerpt || article.content.substring(0, 300) + "..."
          )}</p>
        </div>
        <div class="nbsn-card">
          <div class="font-semibold mb-1">Rekomendasi NBSN</div>
          <ul class="list-disc pl-5 text-slate-200/85">
            <li><b>Neuron:</b> catat emosi & syukur harian.</li>
            <li><b>Biomolekul:</b> madu murni 1–2 sdm/hari, hidrasi cukup.</li>
            <li><b>Sensorik:</b> tidur 7–8 jam, paparan matahari pagi.</li>
            <li><b>Nature:</b> puasa sunnah & kurangi gula rafinasi.</li>
          </ul>
        </div>
      </div>
    `;

    resultContainer.innerHTML = nbsnHTML;

    // Add points for reading insight
    addPoints(2);
  } catch (error) {
    console.error("Error loading article:", error);
    resultContainer.innerHTML =
      '<p class="text-red-400">Gagal memuat artikel</p>';
  }
}

/**
 * Initialize insight page
 */
function initInsight() {
  // Set current year in footer
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Render articles
  renderInsightArticles();

  // Initialize logout
  initLogout();

  // Initialize mobile menu
  initMobileMenu();

  // Update auth buttons
  updateAuthButtons();

  // Initialize Lucide icons
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }

  // Refresh navigation points
  refreshNav();
}

// ==================== MEDIA PAGE FUNCTIONS ====================

/**
 * Fallback podcast data (used when API is unavailable)
 */
const FALLBACK_PODCAST_DATA = [
  {
    title: "Cara Hidup Rasulullah – Subuh Routine",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    title: "Tadabbur Al-Qur'an – QS. Al-Mulk",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    title: "Obat dalam Sunnah – Madu & Habbatussauda",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    title: "Science by Docterbee – Autofagi & Puasa",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
];

// Track currently playing podcast
let currentPodcastUrl = null;

/**
 * Render podcast list from API or fallback data
 */
async function renderPodcastList() {
  const podcastList = document.getElementById("podcastList");
  if (!podcastList) return;

  // Show loading state
  podcastList.innerHTML =
    '<p class="text-slate-400 text-sm animate-pulse">Memuat podcast...</p>';

  try {
    // Fetch podcasts from API
    const response = await fetch("/api/podcasts");
    const data = await response.json();

    if (data.success && data.data && data.data.length > 0) {
      // Use API data
      renderPodcastItems(podcastList, data.data);
      console.log("✅ Podcasts loaded from API:", data.data.length, "items");
    } else {
      // No podcasts in database, use fallback
      console.log("⚠️ No podcasts in database, using fallback data");
      renderPodcastItems(podcastList, FALLBACK_PODCAST_DATA);
    }
  } catch (error) {
    console.error("❌ Error loading podcasts from API:", error);
    // Use fallback data on error
    renderPodcastItems(podcastList, FALLBACK_PODCAST_DATA);
  }

  // Setup audio player event listeners
  setupAudioPlayerEvents();
}

/**
 * Render podcast items with play/pause buttons
 * @param {HTMLElement} container - The podcast list container
 * @param {Array} podcasts - Array of podcast objects
 */
function renderPodcastItems(container, podcasts) {
  container.innerHTML = "";
  podcasts.forEach((podcast) => {
    const item = document.createElement("div");
    item.className = "podcast-item flex items-center gap-3";
    item.dataset.url = podcast.audio_url;

    // Play/Pause button
    const playBtn = document.createElement("button");
    playBtn.className = "podcast-play-btn flex-shrink-0";
    playBtn.innerHTML = '<i data-lucide="play" class="w-4 h-4"></i>';
    playBtn.title = "Putar";
    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePlayPodcast(podcast.title, podcast.audio_url);
    });

    // Title
    const title = document.createElement("span");
    title.className = "podcast-title flex-1 text-left";
    title.textContent = podcast.title;
    title.addEventListener("click", () => {
      togglePlayPodcast(podcast.title, podcast.audio_url);
    });

    item.appendChild(playBtn);
    item.appendChild(title);
    container.appendChild(item);
  });

  // Re-initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/**
 * Toggle play/pause for a podcast
 * @param {string} title - Podcast title
 * @param {string} url - Podcast URL
 */
function togglePlayPodcast(title, url) {
  const audioPlayer = document.getElementById("audioPlayerPodcast");
  if (!audioPlayer) return;

  const isSamePodcast = currentPodcastUrl === url;
  const isPlaying = !audioPlayer.paused;

  if (isSamePodcast && isPlaying) {
    // Pause current podcast
    audioPlayer.pause();
  } else if (isSamePodcast && !isPlaying) {
    // Resume current podcast
    audioPlayer.play().catch(() => console.log("Audio play prevented"));
  } else {
    // Play new podcast
    playPodcast(title, url);
  }
}

/**
 * Play podcast
 * @param {string} title - Podcast title
 * @param {string} url - Podcast URL
 */
function playPodcast(title, url) {
  const nowPlayingPodcast = document.getElementById("nowPlayingPodcast");
  const audioPlayer = document.getElementById("audioPlayerPodcast");

  if (nowPlayingPodcast) {
    nowPlayingPodcast.textContent = title;
  }

  if (audioPlayer) {
    currentPodcastUrl = url;
    audioPlayer.src = url;
    audioPlayer.play().catch(() => {
      console.log("Audio autoplay prevented");
    });
  }

  // Update all play buttons state
  updatePlayButtonStates();
}

/**
 * Setup audio player event listeners for play/pause sync
 */
function setupAudioPlayerEvents() {
  const audioPlayer = document.getElementById("audioPlayerPodcast");
  if (!audioPlayer) return;

  // Remove existing listeners to avoid duplicates
  audioPlayer.removeEventListener("play", updatePlayButtonStates);
  audioPlayer.removeEventListener("pause", updatePlayButtonStates);
  audioPlayer.removeEventListener("ended", handleAudioEnded);

  // Add event listeners
  audioPlayer.addEventListener("play", updatePlayButtonStates);
  audioPlayer.addEventListener("pause", updatePlayButtonStates);
  audioPlayer.addEventListener("ended", handleAudioEnded);
}

/**
 * Handle audio ended event
 */
function handleAudioEnded() {
  currentPodcastUrl = null;
  updatePlayButtonStates();
}

/**
 * Update all play button states based on current audio state
 */
function updatePlayButtonStates() {
  const audioPlayer = document.getElementById("audioPlayerPodcast");
  const podcastItems = document.querySelectorAll(".podcast-item");

  if (!audioPlayer) return;

  const isPlaying = !audioPlayer.paused;

  podcastItems.forEach((item) => {
    const btn = item.querySelector(".podcast-play-btn");
    const itemUrl = item.dataset.url;

    if (!btn) return;

    if (itemUrl === currentPodcastUrl && isPlaying) {
      // Show pause icon
      btn.innerHTML = '<i data-lucide="pause" class="w-4 h-4"></i>';
      btn.title = "Pause";
      item.classList.add("playing");
    } else if (itemUrl === currentPodcastUrl && !isPlaying) {
      // Show play icon but keep highlighting
      btn.innerHTML = '<i data-lucide="play" class="w-4 h-4"></i>';
      btn.title = "Putar";
      item.classList.add("playing");
    } else {
      // Show play icon
      btn.innerHTML = '<i data-lucide="play" class="w-4 h-4"></i>';
      btn.title = "Putar";
      item.classList.remove("playing");
    }
  });

  // Re-initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/**
 * Load YouTube video
 */
function loadYouTube() {
  const ytUrl = document.getElementById("ytUrl")?.value.trim();
  const ytPlayer = document.getElementById("ytPlayer");

  if (!ytPlayer) return;

  if (!ytUrl) {
    ytPlayer.innerHTML =
      '<div class="p-6 text-center text-slate-400">Masukkan URL YouTube terlebih dahulu.</div>';
    return;
  }

  // Extract video ID from URL
  const videoId = extractYouTubeId(ytUrl);

  if (!videoId) {
    ytPlayer.innerHTML =
      '<div class="p-6 text-center text-slate-400">URL tidak valid.</div>';
    return;
  }

  ytPlayer.innerHTML = `<iframe class="w-full h-full rounded-xl" src="https://www.youtube.com/embed/${escapeHtml(
    videoId
  )}" title="YouTube video" allowfullscreen></iframe>`;
}

/**
 * Extract YouTube video ID from URL
 * @param {string} url - YouTube URL
 * @returns {string} Video ID or empty string
 */
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
    /youtube\.com\/embed\/([^&\s]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return "";
}

/**
 * Load custom audio
 */
function loadCustomAudio() {
  const customUrl = document.getElementById("customAudioUrl")?.value.trim();

  if (!customUrl) {
    showWarning("Tempel URL .mp3 terlebih dahulu.");
    return;
  }

  playPodcast("Custom Audio", customUrl);
}

/**
 * Check if transcript is available for YouTube video
 */
async function checkTranscript() {
  const youtubeUrl = document.getElementById("ytUrl")?.value || "";
  const btnCheck = document.getElementById("btnCheckTranscript");
  const transcriptStatus = document.getElementById("transcriptStatus");

  if (!youtubeUrl) {
    showWarning("Masukkan URL YouTube terlebih dahulu.");
    return;
  }

  // Show loading
  if (btnCheck) {
    btnCheck.disabled = true;
    btnCheck.innerHTML =
      '<i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i> Checking...';
    lucide.createIcons();
  }

  if (transcriptStatus) {
    transcriptStatus.innerHTML = `
      <div class="flex items-center gap-2 text-slate-600 text-sm">
        <i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>
        <span>Memeriksa ketersediaan transcript...</span>
      </div>
    `;
    lucide.createIcons();
  }

  try {
    const response = await fetch("/api/check-transcript", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youtubeUrl }),
    });

    const data = await response.json();

    if (transcriptStatus) {
      if (data.available) {
        // ✅ Video can be analyzed
        const isGeminiDirect = data.source === "gemini-direct";
        const sourceLabel = isGeminiDirect
          ? "🎬 AI Vision (Gemini dapat melihat video langsung)"
          : `📝 Transcript (${
              data.segmentCount
            } segmen • ${data.characterCount.toLocaleString()} karakter)`;

        transcriptStatus.innerHTML = `
          <div class="bg-emerald-100 border border-emerald-400/50 rounded-lg p-3">
            <div class="flex items-start gap-2">
              <i data-lucide="check-circle" class="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"></i>
              <div class="flex-1">
                <div class="font-medium text-emerald-700 mb-1">✅ Video Siap Dianalisis!</div>
                <div class="text-sm text-slate-700">${data.message}</div>
                <div class="text-xs text-slate-600 mt-1">
                  ${sourceLabel}
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        // ❌ Transcript not available
        transcriptStatus.innerHTML = `
          <div class="bg-red-100 border border-red-600/50 rounded-lg p-3">
            <div class="flex items-start gap-2">
              <i data-lucide="alert-triangle" class="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5"></i>
              <div class="flex-1">
                <div class="font-medium text-red-800 mb-1">⚠️ Transcript Tidak Tersedia</div>
                <div class="text-sm text-slate-700 whitespace-pre-line">${data.message}</div>
              </div>
            </div>
          </div>
        `;
      }
      lucide.createIcons();
    }
  } catch (error) {
    console.error("Error checking transcript:", error);
    if (transcriptStatus) {
      transcriptStatus.innerHTML = `
        <div class="bg-red-100 border border-red-400/50 rounded-lg p-3">
          <div class="flex items-start gap-2">
            <i data-lucide="x-circle" class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"></i>
            <div class="flex-1">
              <div class="font-medium text-red-700 mb-1">❌ Error</div>
              <div class="text-sm text-slate-700">Gagal memeriksa transcript: ${error.message}</div>
            </div>
          </div>
        </div>
      `;
      lucide.createIcons();
    }
  } finally {
    // Reset button
    if (btnCheck) {
      btnCheck.disabled = false;
      btnCheck.innerHTML =
        '<i data-lucide="search" class="w-3 h-3"></i> Check Transcript';
      lucide.createIcons();
    }
  }
}

/**
 * Analyze media content with AI using Gemini API
 */
async function analyzeMedia() {
  const youtubeUrl = document.getElementById("ytUrl")?.value || "";
  const notes = document.getElementById("mediaNotes")?.value || "";
  const aiResult = document.getElementById("aiResult");
  const btnAnalyze = document.getElementById("btnAnalyze");
  const mediaNotes = document.getElementById("mediaNotes");

  if (!aiResult) return;

  // Validation
  if (!youtubeUrl && !notes) {
    showWarning("Masukkan URL YouTube atau catatan terlebih dahulu.");
    return;
  }

  // Auto-fetch transcript message
  if (youtubeUrl && !notes) {
    if (mediaNotes) {
      mediaNotes.value = "Mengambil transcript otomatis...";
      mediaNotes.disabled = true;
    }
  }

  // Show loading state
  if (btnAnalyze) {
    btnAnalyze.disabled = true;
    btnAnalyze.innerHTML =
      '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Menganalisis...';
    lucide.createIcons();
  }

  aiResult.innerHTML = `
    <div class="ai-analysis-card text-center">
      <i data-lucide="loader-2" class="w-6 h-6 animate-spin mx-auto mb-2 text-red-600"></i>
      <p class="text-slate-700">
        ${
          youtubeUrl && !notes
            ? "Mengambil transcript YouTube..."
            : "Menganalisis dengan Gemini AI..."
        }
      </p>
      <p class="text-xs text-slate-600 mt-2">Mohon tunggu 5-15 detik</p>
    </div>
  `;
  lucide.createIcons();

  try {
    // Debug: Log what we're sending
    console.log("📤 Sending to backend:", {
      youtubeUrl: youtubeUrl || "(empty)",
      notes: notes ? notes.substring(0, 50) + "..." : "(empty)",
      notesLength: notes.length,
    });

    // Call backend API
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        youtubeUrl: youtubeUrl,
        notes: notes,
      }),
    });

    const data = await response.json();

    // Debug: Log response
    console.log("📥 Response from backend:", {
      ok: response.ok,
      status: response.status,
      hasTranscript: data.hasTranscript,
      source: data.source,
      transcriptLength: data.transcriptLength,
    });

    if (!response.ok) {
      // Re-enable textarea if transcript fetch failed
      if (mediaNotes) {
        mediaNotes.disabled = false;
        if (data.transcriptError) {
          mediaNotes.value = "";
          mediaNotes.placeholder =
            "⚠️ Transcript tidak tersedia untuk video ini. Silakan tulis catatan/ringkasan video secara manual...";

          // Show alert to user
          showError(
            "Transcript YouTube tidak tersedia untuk video ini.\n\n" +
              "Solusi:\n" +
              "1. Tonton video dan tulis ringkasan di kolom 'Catatan'\n" +
              "2. Atau cari video lain yang memiliki subtitle/CC\n\n" +
              "Error: " +
              data.transcriptError
          );
        }
      }
      throw new Error(data.error || "Gagal menganalisis konten");
    }

    // Re-enable textarea and show transcript source info
    if (mediaNotes) {
      mediaNotes.disabled = false;
      if (data.hasTranscript && !notes) {
        // If auto-transcript was used, show it in textarea
        mediaNotes.value = `✅ Transcript otomatis diambil (${data.transcriptLength} karakter)\n\nAnda bisa edit atau tambahkan catatan di sini...`;
      }
    }

    // Display AI summary with metadata
    const formattedSummary = formatAISummary(data.summary, data);
    aiResult.innerHTML = formattedSummary;

    // Re-initialize Lucide icons
    if (typeof lucide !== "undefined" && lucide.createIcons) {
      lucide.createIcons();
    }

    // Add points for successful analysis
    addPoints(3);
  } catch (error) {
    console.error("Gemini API error:", error);

    // Check if it's a quota error
    const isQuotaError =
      error.message.includes("Kuota") ||
      error.message.includes("quota") ||
      error.message.includes("429");

    // Show error with troubleshooting
    aiResult.innerHTML = `
      <div class="ai-analysis-card border-${
        isQuotaError ? "amber" : "red"
      }-500/30">
        <div class="font-semibold mb-2 flex items-center gap-2 text-${
          isQuotaError ? "amber" : "red"
        }-600">
          <i data-lucide="${
            isQuotaError ? "clock" : "alert-triangle"
          }" class="w-5 h-5"></i>
          ${isQuotaError ? "Kuota API Tercapai" : "Gagal Menganalisis"}
        </div>
        <p class="text-slate-700 mb-3">${escapeHtml(error.message)}</p>
        <div class="text-sm text-slate-600">
          <p class="font-semibold mb-1">${
            isQuotaError ? "Solusi" : "Troubleshooting"
          }:</p>
          <ul class="list-disc pl-5 space-y-1">
            ${
              isQuotaError
                ? `
              <li><b>Tunggu 1-2 menit</b> lalu coba lagi (Free tier: 15 requests/menit)</li>
              <li>Refresh halaman ini setelah menunggu</li>
              <li>Atau upgrade ke <a href="https://ai.google.dev/pricing" target="_blank" class="text-red-700 underline">paid plan</a> untuk quota lebih besar</li>
            `
                : `
              <li>Pastikan server backend berjalan: <code class="bg-slate-200 text-slate-800 px-1 rounded">npm start</code></li>
              <li>Cek koneksi ke <code class="bg-slate-200 text-slate-800 px-1 rounded">http://localhost:3000</code></li>
              <li>Periksa API key Gemini di file <code class="bg-slate-200 text-slate-800 px-1 rounded">.env</code></li>
              <li>Lihat console browser (F12) untuk detail error</li>
            `
            }
          </ul>
        </div>
      </div>
    `;

    if (typeof lucide !== "undefined" && lucide.createIcons) {
      lucide.createIcons();
    }
  } finally {
    // Reset button state
    if (btnAnalyze) {
      btnAnalyze.disabled = false;
      btnAnalyze.innerHTML =
        '<i data-lucide="sparkles" class="w-4 h-4"></i> Analisis AI';
      lucide.createIcons();
    }

    // Re-enable textarea
    if (mediaNotes && mediaNotes.disabled) {
      mediaNotes.disabled = false;
    }
  }
}

/**
 * Format AI summary from Gemini API response to styled HTML
 */
/**
 * Convert markdown formatting to HTML
 */
function markdownToHtml(text) {
  if (!text) return "";

  // Escape HTML first
  let html = escapeHtml(text);

  // Convert **bold** to <strong>
  html = html.replace(
    /\*\*(.+?)\*\*/g,
    "<strong class='font-semibold text-slate-900'>$1</strong>"
  );

  // Convert *italic* to <em> (only if not part of **bold**)
  html = html.replace(
    /(?<!\*)\*([^*]+?)\*(?!\*)/g,
    "<em class='italic text-slate-800'>$1</em>"
  );

  // Convert `code` to <code>
  html = html.replace(
    /`(.+?)`/g,
    "<code class='px-1.5 py-0.5 rounded bg-slate-200 text-red-800 text-sm font-mono'>$1</code>"
  );

  return html;
}

function formatAISummary(text, metadata = {}) {
  if (!text) return "<p class='text-slate-400'>Tidak ada hasil analisis.</p>";

  // Add metadata badge if available
  let metadataBadge = "";
  if (metadata.source) {
    const sourceLabel =
      metadata.source === "auto-transcript"
        ? "✨ Auto Transcript"
        : "📝 User Notes";
    const sourceColor =
      metadata.source === "auto-transcript"
        ? "bg-emerald-100 border-emerald-400/50 text-emerald-700"
        : "bg-sky-100 border-sky-400/50 text-sky-700";

    metadataBadge = `
      <div class="mb-4 inline-flex items-center gap-2 ${sourceColor} border rounded-lg px-3 py-1.5 text-xs">
        <i data-lucide="${
          metadata.source === "auto-transcript" ? "sparkles" : "file-text"
        }" class="w-3 h-3"></i>
        <span>${sourceLabel}</span>
        ${
          metadata.transcriptLength
            ? `<span class="opacity-70">(${metadata.transcriptLength} karakter)</span>`
            : ""
        }
      </div>
    `;
  }

  // Split into sections (assuming Gemini returns structured text)
  const lines = text.split("\n").filter((line) => line.trim());

  let html = metadataBadge + '<div class="space-y-4">';
  let currentSection = "";
  let currentList = [];

  lines.forEach((line) => {
    const trimmed = line.trim();

    // Detect markdown headers (### or ####)
    const markdownHeaderMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (markdownHeaderMatch) {
      // Close previous section
      if (currentList.length > 0) {
        html += `<ul class="list-disc pl-5 text-slate-700">${currentList.join(
          ""
        )}</ul>`;
        currentList = [];
      }
      // Close previous section card if exists
      if (currentSection) {
        html += "</div>";
      }

      const headerText = markdownHeaderMatch[2].replace(/\*\*/g, "").trim();
      let iconName = "info";
      let iconColor = "text-sky-500";

      if (
        headerText.includes("Ringkasan") ||
        headerText.includes("ringkasan")
      ) {
        iconName = "info";
        iconColor = "text-sky-500";
      } else if (
        headerText.includes("Kesesuaian") ||
        headerText.includes("kesesuaian") ||
        headerText.includes("Qur'an") ||
        headerText.includes("Hadis")
      ) {
        iconName = "book-open";
        iconColor = "text-emerald-500";
      } else if (
        headerText.includes("Selaras") ||
        headerText.includes("selaras")
      ) {
        iconName = "check-circle";
        iconColor = "text-emerald-500";
      } else if (
        headerText.includes("Koreksi") ||
        headerText.includes("koreksi") ||
        headerText.includes("Catatan")
      ) {
        iconName = "alert-circle";
        iconColor = "text-red-600";
      } else if (
        headerText.includes("Sains") ||
        headerText.includes("sains") ||
        headerText.includes("Ilmiah")
      ) {
        iconName = "flask-conical";
        iconColor = "text-sky-500";
      } else if (
        headerText.includes("NBSN") ||
        headerText.includes("Rekomendasi")
      ) {
        iconName = "brain";
        iconColor = "text-purple-500";
      } else if (
        headerText.includes("Analisis") ||
        headerText.includes("Konten")
      ) {
        iconName = "file-text";
        iconColor = "text-blue-500";
      }

      html += `
        <div class="ai-analysis-card">
          <div class="font-semibold mb-2 flex items-center gap-2 text-slate-900">
            <i data-lucide="${iconName}" class="w-4 h-4 ${iconColor}"></i>
            ${escapeHtml(headerText)}
          </div>
      `;
      currentSection = headerText;
    }
    // Detect section headers (bold text with **)
    else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      // Close previous section
      if (currentList.length > 0) {
        html += `<ul class="list-disc pl-5 text-slate-700">${currentList.join(
          ""
        )}</ul>`;
        currentList = [];
      }
      // Close previous section card if exists
      if (currentSection) {
        html += "</div>";
      }

      // Add new section header
      const headerText = trimmed.replace(/\*\*/g, "");
      let iconName = "info";
      let iconColor = "text-sky-500";

      if (headerText.includes("Selaras") || headerText.includes("selaras")) {
        iconName = "check-circle";
        iconColor = "text-emerald-500";
      } else if (
        headerText.includes("Koreksi") ||
        headerText.includes("koreksi")
      ) {
        iconName = "alert-circle";
        iconColor = "text-red-600";
      } else if (headerText.includes("Sains") || headerText.includes("sains")) {
        iconName = "flask-conical";
        iconColor = "text-sky-500";
      } else if (headerText.includes("NBSN")) {
        iconName = "brain";
        iconColor = "text-purple-500";
      }

      html += `
        <div class="ai-analysis-card">
          <div class="font-semibold mb-2 flex items-center gap-2 text-slate-900">
            <i data-lucide="${iconName}" class="w-4 h-4 ${iconColor}"></i>
            ${escapeHtml(headerText)}
          </div>
      `;
      currentSection = headerText;
    }
    // Detect numbered lists (1. 2. 3.)
    else if (/^\d+\.\s/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s/, "");
      currentList.push(`<li>${markdownToHtml(content)}</li>`);
    }
    // Detect bullet points (- or *)
    else if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
      const content = trimmed.substring(1).trim();
      currentList.push(`<li>${markdownToHtml(content)}</li>`);
    }
    // Regular paragraph
    else if (trimmed) {
      if (currentList.length > 0) {
        html += `<ul class="list-disc pl-5 text-slate-700">${currentList.join(
          ""
        )}</ul>`;
        currentList = [];
      }
      html += `<p class="text-slate-700">${markdownToHtml(trimmed)}</p>`;
    }
  });

  // Close remaining list
  if (currentList.length > 0) {
    html += `<ul class="list-disc pl-5 text-slate-700">${currentList.join(
      ""
    )}</ul>`;
  }

  // Close last section
  if (currentSection) {
    html += "</div>";
  }

  html += "</div>";

  return html;
}

function initMedia() {
  // Set current year in footer
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Render podcast list
  renderPodcastList();

  // Attach event listeners
  const btnLoadYT = document.getElementById("btnLoadYT");
  if (btnLoadYT) {
    btnLoadYT.addEventListener("click", loadYouTube);
  }

  const btnAnalyze = document.getElementById("btnAnalyze");
  if (btnAnalyze) {
    btnAnalyze.addEventListener("click", analyzeMedia);
  }

  const btnLoadCustomAudio = document.getElementById("btnLoadCustomAudio");
  if (btnLoadCustomAudio) {
    btnLoadCustomAudio.addEventListener("click", loadCustomAudio);
  }

  // Initialize logout
  initLogout();

  // Initialize mobile menu
  initMobileMenu();

  // Update auth buttons
  updateAuthButtons();

  // Initialize Lucide icons
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }

  // Refresh navigation points
  refreshNav();
}

// ==================== SERVICES PAGE ====================

/**
 * Render services from API with filters
 */
async function renderServices() {
  const grid = document.getElementById("servicesGrid");
  if (!grid) return;

  // Get filter values
  const branchFilter = document.getElementById("branchFilter")?.value || "all";
  const modeFilter = document.getElementById("modeFilter")?.value || "all";

  try {
    // Build query params
    const params = new URLSearchParams();
    if (branchFilter !== "all") params.append("branch", branchFilter);
    if (modeFilter !== "all") params.append("mode", modeFilter);
    params.append("is_active", "1"); // Only show active services

    const response = await fetch(`/api/services?${params.toString()}`);
    const result = await response.json();

    if (!result.success) {
      grid.innerHTML = `
        <div class="md:col-span-2 text-center py-12">
          <p class="text-slate-400">Gagal memuat layanan</p>
        </div>
      `;
      return;
    }

    const services = result.data;

    if (services.length === 0) {
      grid.innerHTML = `
        <div class="md:col-span-2 text-center py-12">
          <i data-lucide="search-x" class="w-12 h-12 mx-auto mb-3 text-slate-600"></i>
          <p class="text-slate-400">Tidak ada layanan yang sesuai dengan filter</p>
        </div>
      `;
      if (typeof lucide !== "undefined") lucide.createIcons();
      return;
    }

    // Render services
    grid.innerHTML = services
      .map((service, index) => {
        const categoryBadge = getCategoryBadgeHTML(service.category);
        const price = formatPrice(service.price);

        // Mode badge class
        const modeBadgeClass =
          service.mode === "online"
            ? "event-badge-online"
            : "event-badge-offline";
        const modeIcon = service.mode === "online" ? "video" : "home";
        const modeLabel =
          service.mode === "online"
            ? "ONLINE"
            : service.mode === "offline"
            ? "OFFLINE"
            : "ONLINE & OFFLINE";

        // Image placeholder atau gambar service jika ada
        const imageHtml = service.image
          ? `<img src="${escapeHtml(service.image)}" alt="${escapeHtml(
              service.name
            )}" loading="lazy">`
          : `<div class="event-card-image-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>`;

        return `
          <div class="service-card" style="animation-delay: ${
            0.1 + index * 0.1
          }s;">
            <!-- Image Section -->
            <div class="event-card-image">
              ${imageHtml}
            </div>
            
            <!-- Body Section -->
            <div class="event-card-body">
              <!-- Badges -->
              <div class="flex flex-wrap gap-2">
                <span class="event-badge ${modeBadgeClass}">
                  <i data-lucide="${modeIcon}" class="w-3 h-3"></i>
                  ${modeLabel}
                </span>
                ${categoryBadge}
              </div>
              
              <!-- Title -->
              <h3 class="event-card-title">${escapeHtml(service.name)}</h3>
              
              <!-- Description -->
              <p class="text-sm text-slate-600 line-clamp-2">${escapeHtml(
                service.description
              )}</p>
              
              <!-- Meta Info -->
              <div class="event-meta">
                ${
                  service.practitioner
                    ? `
                  <div class="event-meta-item event-speaker">
                    <i data-lucide="user-check"></i>
                    <span>Praktisi: ${escapeHtml(service.practitioner)}</span>
                  </div>
                `
                    : ""
                }
                <div class="event-meta-item event-location">
                  <i data-lucide="map-pin"></i>
                  <span>${escapeHtml(service.branch)}</span>
                </div>
              </div>
              
              <!-- Price -->
              <div class="event-price event-price-paid">${price}</div>
            </div>
            
            <!-- Footer Section -->
            <div class="event-card-footer">
              <a
                href="/booking?service=${encodeURIComponent(service.name)}"
                class="btn-primary-sm flex items-center justify-center gap-2 w-full"
              >
                <i data-lucide="calendar" class="w-4 h-4"></i>
                Booking Sekarang
              </a>
            </div>
          </div>
        `;
      })
      .join("");

    // Reinitialize Lucide icons
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  } catch (error) {
    console.error("Error loading services:", error);
    grid.innerHTML = `
      <div class="md:col-span-2 text-center py-12">
        <p class="text-slate-400">Gagal memuat layanan. Silakan coba lagi.</p>
      </div>
    `;
  }
}

/**
 * Get category badge HTML
 */
function getCategoryBadgeHTML(category) {
  const badges = {
    manual:
      '<span class="event-badge event-badge-topic" style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); color: #dc2626; border-color: rgba(220, 38, 38, 0.2);">Manual</span>',
    klinis:
      '<span class="event-badge event-badge-topic" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); color: #0284c7; border-color: rgba(2, 132, 199, 0.2);">Klinis</span>',
    konsultasi:
      '<span class="event-badge event-badge-topic" style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); color: #9333ea; border-color: rgba(147, 51, 234, 0.2);">Konsultasi</span>',
    perawatan:
      '<span class="event-badge event-badge-topic" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); color: #059669; border-color: rgba(5, 150, 105, 0.2);">Perawatan</span>',
  };
  return badges[category] || "";
}

/**
 * Get mode info HTML
 */
function getModeInfoHTML(mode) {
  const icons = {
    online: "video",
    offline: "home",
    both: "video",
  };
  const labels = {
    online: "Online",
    offline: "Offline",
    both: "Online & Offline",
  };

  return `
    <div class="flex items-center gap-2 mb-3 text-xs text-slate-900">
      <i data-lucide="${
        icons[mode] || "video"
      }" class="w-3.5 h-3.5 text-emerald-400"></i>
      <span>${labels[mode] || mode}</span>
    </div>
  `;
}

/**
 * Format price to Indonesian Rupiah
 */
function formatPrice(price) {
  return `Rp ${formatNumber(price)}`;
}

/**
 * Initialize services page
 */
function initServices() {
  // Set current year in footer
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Render services
  renderServices();

  // Attach filter listeners
  const branchFilter = document.getElementById("branchFilter");
  const modeFilter = document.getElementById("modeFilter");

  if (branchFilter) {
    branchFilter.addEventListener("change", renderServices);
  }

  if (modeFilter) {
    modeFilter.addEventListener("change", renderServices);
  }

  // Initialize logout
  initLogout();

  // Initialize mobile menu
  initMobileMenu();

  // Update auth buttons
  updateAuthButtons();

  // Initialize Lucide icons
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }

  // Refresh navigation points
  refreshNav();
}

// ==================== STORE / POINTS / WELLNESS PAGE ====================

// ========================================
// STORE PAGE - DOCTERBEE HEALTH STORE & CAFÉ
// ========================================

// Product catalog dengan 16 items across 8 categories
// Products data - will be loaded from API
let PRODUCTS = [];

// Location data untuk 3 branches
const LOCATIONS = [
  {
    id: "kolaka",
    name: "Docterbee Kolaka ZE Center",
    address: "Jl. DI Panjaitan No. 88, Kolaka",
    phone: "0851-9155-4056",
    hours: "08:00 - 20:00 WIB",
  },
  {
    id: "makassar",
    name: "Docterbee Makassar Pettarani",
    address: "Jl. A.P. Pettarani No. 45, Makassar",
    phone: "0851-9155-4056",
    hours: "08:00 - 21:00 WITA",
  },
  {
    id: "kendari",
    name: "Docterbee Kendari ByPass",
    address: "Jl. By Pass No. 123, Kendari",
    phone: "0851-9155-4056",
    hours: "08:00 - 20:00 WITA",
  },
];

// LocalStorage helpers for store
function _storeGet(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function _storeSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Tab switching untuk 4 sections
function showStoreTab(tabName) {
  // Hide all sections
  const sections = ["page-store", "page-dinein", "page-points", "page-locator"];
  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });

  // Remove active styles dari semua tabs and restore hover
  const tabs = ["tabStore", "tabDineIn", "tabPoints", "tabLocator"];
  tabs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove("bg-red-600", "text-white");
      el.classList.add("bg-slate-800", "text-slate-300", "hover:bg-slate-700");
    }
  });

  // Show selected section
  const sectionMap = {
    store: "page-store",
    dinein: "page-dinein",
    points: "page-points",
    locator: "page-locator",
  };

  const tabMap = {
    store: "tabStore",
    dinein: "tabDineIn",
    points: "tabPoints",
    locator: "tabLocator",
  };

  const targetSection = document.getElementById(sectionMap[tabName]);
  const targetTab = document.getElementById(tabMap[tabName]);

  if (targetSection) targetSection.classList.remove("hidden");
  if (targetTab) {
    targetTab.classList.remove(
      "bg-slate-800",
      "text-slate-300",
      "hover:bg-slate-700"
    );
    targetTab.classList.add("bg-red-600", "text-white");
  }

  // Reload rewards when switching to points tab
  if (tabName === "points") {
    loadAndRenderRewards();
  }

  // Render dine-in menu when switching to dinein tab
  if (tabName === "dinein") {
    renderDineInMenu();
  }
}

// Fetch products from API
async function loadProductsFromAPI() {
  try {
    // Get current location from storage
    const locationData = JSON.parse(
      localStorage.getItem("docterbee_store_location") || "null"
    );
    const locationId = locationData ? locationData.id : "";

    // Append location_id to URL if exists
    const url = locationId
      ? `/api/products?location_id=${locationId}`
      : "/api/products";

    const response = await fetch(url);
    const result = await response.json();

    if (result.success && result.data) {
      // Transform API data to match existing structure
      PRODUCTS = result.data.map((product) => ({
        id: product.id,
        name: product.name,
        cat: product.category, // API uses "category" field
        price: parseFloat(product.price),
        member_price: product.member_price
          ? parseFloat(product.member_price)
          : null,
        promo_text: product.promo_text || null,
        description: product.description,
        image: product.image_url,
        stock: product.stock,
        article_slug: product.article_slug || null,
      }));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error loading products:", error);
    return false;
  }
}

/**
 * Render Dine-In Menu from products API
 * Displays products organized by category with name, prices (member + normal), and description
 */
async function renderDineInMenu() {
  const container = document.getElementById("dineInMenuContainer");
  if (!container) return;

  // Show loading state
  container.innerHTML =
    '<p class="text-slate-400 text-sm text-center py-8 animate-pulse">Memuat menu...</p>';

  // Load products if not already loaded
  if (PRODUCTS.length === 0) {
    const loaded = await loadProductsFromAPI();
    if (!loaded) {
      container.innerHTML =
        '<p class="text-red-400 text-sm text-center py-8">Gagal memuat menu. Silakan refresh halaman.</p>';
      return;
    }
  }

  if (PRODUCTS.length === 0) {
    container.innerHTML =
      '<p class="text-slate-400 text-sm text-center py-8">Belum ada menu tersedia.</p>';
    return;
  }

  // Group products by category
  const categorizedProducts = {};
  PRODUCTS.forEach((product) => {
    const category = product.cat || "Lainnya";
    if (!categorizedProducts[category]) {
      categorizedProducts[category] = [];
    }
    categorizedProducts[category].push(product);
  });

  // Category icons and colors
  const categoryStyles = {
    Coffee: { icon: "☕", color: "amber" },
    "Cold Pressed": { icon: "🥤", color: "sky" },
    Tea: { icon: "🍵", color: "emerald" },
    Jus: { icon: "🧃", color: "orange" },
    "Zona Honey": { icon: "🍯", color: "amber" },
    "Zona Sunnah": { icon: "🌙", color: "amber" },
    "1001 Rempah": { icon: "🧂", color: "emerald" },
    Lainnya: { icon: "📦", color: "slate" },
  };

  // Define category order for consistent rendering
  const CATEGORY_ORDER = [
    "Coffee",
    "Cold Pressed",
    "Tea",
    "Jus",
    "Zona Honey",
    "Zona Sunnah",
    "1001 Rempah",
  ];

  // Render categories in defined order
  let html = "";

  // First render categories in order
  CATEGORY_ORDER.forEach((category) => {
    if (categorizedProducts[category]) {
      const products = categorizedProducts[category];
      const style = categoryStyles[category] || categoryStyles["Lainnya"];

      html += `
        <div>
          <h3 class="font-semibold text-${style.color}-500 mb-2">
            ${style.icon} ${escapeHtml(category)}
          </h3>
          <div class="grid gap-3 sm:grid-cols-2">
            ${products
              .map((p) => renderDineInMenuItem(p, style.color))
              .join("")}
          </div>
        </div>
      `;
    }
  });

  // Then render any remaining categories not in the order list
  Object.keys(categorizedProducts).forEach((category) => {
    if (!CATEGORY_ORDER.includes(category)) {
      const products = categorizedProducts[category];
      const style = categoryStyles[category] || categoryStyles["Lainnya"];

      html += `
        <div>
          <h3 class="font-semibold text-${style.color}-500 mb-2">
            ${style.icon} ${escapeHtml(category)}
          </h3>
          <div class="grid gap-3 sm:grid-cols-2">
            ${products
              .map((p) => renderDineInMenuItem(p, style.color))
              .join("")}
          </div>
        </div>
      `;
    }
  });

  container.innerHTML = html;

  // Reinitialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/**
 * Render a single dine-in menu item
 * @param {Object} product - Product object
 * @param {string} color - Tailwind color name for styling
 * @returns {string} HTML string
 */
function renderDineInMenuItem(product, color) {
  const hasMemberPrice =
    product.member_price && product.member_price < product.price;

  // Format prices
  const normalPrice = `Rp ${formatNumber(product.price)}`;
  const memberPrice = hasMemberPrice
    ? `Rp ${formatNumber(product.member_price)}`
    : null;

  return `
    <div class="rounded-lg border border-gray-200 bg-white p-3 hover:border-${color}-400/50 transition-all">
      <div class="flex justify-between items-start mb-1 gap-2">
        <span class="font-semibold text-slate-900">${escapeHtml(
          product.name
        )}</span>
        <div class="text-right flex-shrink-0">
          ${
            hasMemberPrice
              ? `
            <div class="text-${color}-500 font-bold text-sm">${memberPrice}</div>
            <div class="text-slate-400 text-xs line-through">${normalPrice}</div>
          `
              : `
            <span class="text-${color}-500 font-bold">${normalPrice}</span>
          `
          }
        </div>
      </div>
      ${
        hasMemberPrice
          ? `
        <div class="text-xs text-emerald-600 mb-1">
          <span class="bg-emerald-50 px-1.5 py-0.5 rounded">Harga Member</span>
        </div>
      `
          : ""
      }
      <p class="text-xs text-slate-600">
        ${
          product.description
            ? escapeHtml(product.description)
            : "Produk kesehatan berkualitas"
        }
      </p>
    </div>
  `;
}

// Check if user is logged in (member)
let isUserLoggedIn = false;

async function checkUserLoginStatus() {
  try {
    const response = await fetch("/api/auth/check", {
      credentials: "include",
    });
    const result = await response.json();
    isUserLoggedIn = result.success && result.loggedIn;
    return isUserLoggedIn;
  } catch (error) {
    console.error("Error checking login status:", error);
    isUserLoggedIn = false;
    return false;
  }
}

// Render product pricing with member/normal price display
function renderProductPricing(product) {
  const hasMemberPrice =
    product.member_price !== null && product.member_price > 0;

  // If logged in and has member price: show member price large, normal price strikethrough
  if (isUserLoggedIn && hasMemberPrice) {
    const savings = product.price - product.member_price;
    const savingsPercent = Math.round((savings / product.price) * 100);
    return `
      <div class="space-y-1">
        <div class="text-emerald-600 font-bold text-xl">
          Rp ${formatNumber(product.member_price)}
        </div>
        <div class="flex items-center gap-2">
          <span class="text-slate-400 text-sm line-through">
            Rp ${formatNumber(product.price)}
          </span>
          <span class="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded">
            Hemat ${savingsPercent}%
          </span>
        </div>
        ${
          product.promo_text
            ? `<div class="text-xs text-red-700 font-medium">${escapeHtml(
                product.promo_text
              )}</div>`
            : ""
        }
      </div>
    `;
  }

  // If guest and has member price: show normal price + member CTA
  if (!isUserLoggedIn && hasMemberPrice) {
    return `
      <div class="space-y-1">
        <div class="text-red-600 font-bold text-lg">
          Rp ${formatNumber(product.price)}
        </div>
        <a href="/login.html" class="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:text-emerald-700">
          🔐 Hemat hingga 20% untuk member
        </a>
        ${
          product.promo_text
            ? `<div class="text-xs text-red-700 font-medium">${escapeHtml(
                product.promo_text
              )}</div>`
            : ""
        }
      </div>
    `;
  }

  // No member price: just show normal price
  return `
    <div class="text-red-600 font-bold text-lg">
      Rp ${formatNumber(product.price)}
    </div>
    ${
      product.promo_text
        ? `<div class="text-xs text-red-700 font-medium">${escapeHtml(
            product.promo_text
          )}</div>`
        : ""
    }
  `;
}

// Add product to cart (wrapper function for store)
// showToast is defined in store-cart.js which loads after this file
/* global showToast */
function addToCart(productId) {
  const product = PRODUCTS.find((p) => p.id === parseInt(productId));

  if (!product) {
    showToast("Produk tidak ditemukan", "error");
    return;
  }

  // Check stock availability
  if (product.stock === 0) {
    showToast("Maaf, produk ini sedang habis stok", "error");
    return;
  }

  // Call store cart function
  if (typeof window.addToStoreCart === "function") {
    window.addToStoreCart(
      product.id,
      product.name,
      product.price,
      product.image
    );
  } else {
    console.error("addToStoreCart function not available");
    showToast("Error: Tidak dapat menambahkan ke keranjang", "error");
  }
}

// Filter products by category
async function filterStoreCategory(category) {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  // Category order for sorting products (used when showing "all")
  const CATEGORY_ORDER = [
    "Coffee",
    "Cold Pressed",
    "Tea",
    "Jus",
    "Zona Honey",
    "Zona Sunnah",
    "1001 Rempah",
  ];

  // Update active state for filter buttons IMMEDIATELY (synchronous)
  const filterButtons = [
    { id: "filterAll", category: "all" },
    { id: "filterCoffee", category: "Coffee" },
    { id: "filterColdPressed", category: "Cold Pressed" },
    { id: "filterTea", category: "Tea" },
    { id: "filterJus", category: "Jus" },
    { id: "filterZonaHoney", category: "Zona Honey" },
    { id: "filterZonaSunnah", category: "Zona Sunnah" },
    { id: "filter1001Rempah", category: "1001 Rempah" },
  ];

  filterButtons.forEach((btn) => {
    const buttonEl = document.getElementById(btn.id);
    if (buttonEl) {
      if (btn.category === category) {
        // Active state: red background with white text, remove hover effects
        buttonEl.classList.remove(
          "bg-slate-800",
          "text-slate-300",
          "hover:bg-slate-700"
        );
        buttonEl.classList.add("bg-red-600", "text-white");
      } else {
        // Inactive state: dark background with light text, restore hover
        buttonEl.classList.remove("bg-red-600", "text-white");
        buttonEl.classList.add(
          "bg-slate-800",
          "text-slate-300",
          "hover:bg-slate-700"
        );
      }
    }
  });

  // Show loading state
  grid.innerHTML =
    '<div class="col-span-full text-center text-slate-400 py-8">Loading products...</div>';

  // Check login status for member pricing
  await checkUserLoginStatus();

  // Load products if not already loaded
  if (PRODUCTS.length === 0) {
    const loaded = await loadProductsFromAPI();
    if (!loaded) {
      grid.innerHTML =
        '<div class="col-span-full text-center text-red-400 py-8">Failed to load products. Please try again.</div>';
      return;
    }
  }

  let filtered = PRODUCTS;
  if (category && category !== "all") {
    filtered = PRODUCTS.filter((p) => p.cat === category);
  } else {
    // For "all" category, sort products by category order
    filtered = [...PRODUCTS].sort((a, b) => {
      const indexA = CATEGORY_ORDER.indexOf(a.cat);
      const indexB = CATEGORY_ORDER.indexOf(b.cat);
      // If category not in order list, put at end
      const orderA = indexA === -1 ? CATEGORY_ORDER.length : indexA;
      const orderB = indexB === -1 ? CATEGORY_ORDER.length : indexB;
      return orderA - orderB;
    });
  }

  if (filtered.length === 0) {
    grid.innerHTML =
      '<div class="col-span-full text-center text-slate-400 py-8">Belum ada produk di kategori ini</div>';
    return;
  }

  grid.innerHTML = filtered
    .map(
      (p) => `
    <div class="event-card overflow-hidden space-y-0 p-0">
      ${
        p.image
          ? `<img src="${escapeHtml(p.image)}" 
               alt="${escapeHtml(p.name)}" 
               class="w-full h-48 object-cover"
               loading="lazy"
               onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">`
          : `<div class="w-full h-48 bg-slate-200 flex items-center justify-center text-slate-400">
               <i data-lucide="image-off" class="w-12 h-12"></i>
             </div>`
      }
      <div class="p-4 space-y-3">
        <div>
          <div class="text-xs uppercase tracking-wider text-red-600 mb-1 font-semibold">${getCategoryLabel(
            p.cat
          )}</div>
          <div class="font-semibold text-slate-900 text-lg">${escapeHtml(
            p.name
          )}</div>
          ${
            p.description
              ? `<p class="text-sm text-slate-600 mt-1 line-clamp-2">${escapeHtml(
                  p.description
                )}</p>`
              : ""
          }
        </div>
        <div class="flex flex-col gap-2">
          ${renderProductPricing(p)}
          
          <!-- Stock Indicator -->
          <div class="flex items-center justify-between">
            ${
              p.stock === 0
                ? '<span class="text-xs bg-red-500/20 text-red-600 px-2 py-1 rounded font-semibold">Stok Habis</span>'
                : p.stock <= 5
                ? `<span class="text-xs bg-red-600/20 text-red-700 px-2 py-1 rounded font-semibold">Stok Tersisa: ${p.stock}</span>`
                : `<span class="text-xs bg-emerald-500/20 text-emerald-600 px-2 py-1 rounded font-semibold">Stok: ${p.stock}</span>`
            }
          </div>
          
          <!-- Add to Cart Button -->
          <div class="flex items-center justify-between gap-2">
            ${
              p.stock > 0
                ? `<button class="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-red-600 to-red-600 text-white px-3 py-2 text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-sm hover:shadow-md" onclick="addToCart('${p.id}')">
                    <i data-lucide="plus" class="w-3 h-3"></i>
                    Tambah
                  </button>`
                : `<button disabled class="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-slate-300 text-slate-500 px-3 py-2 text-sm font-semibold cursor-not-allowed">
                    <i data-lucide="x-circle" class="w-3 h-3"></i>
                    Tidak Tersedia
                  </button>`
            }
          </div>
          ${
            p.article_slug
              ? `<a href="/article?slug=${encodeURIComponent(p.article_slug)}" 
                   class="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 text-sm font-semibold transition-all">
                   <i data-lucide="book-open" class="w-4 h-4"></i>
                   Baca Artikel
                 </a>`
              : ""
          }
        </div>
      </div>
    </div>
  `
    )
    .join("");

  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }
}

function getCategoryLabel(cat) {
  const labels = {
    Coffee: "☕ Coffee",
    "Cold Pressed": "🥤 Cold Pressed",
    Tea: "🍵 Tea",
    Jus: "🧃 Jus",
    "Zona Honey": "🍯 Zona Honey",
    "Zona Sunnah": "🌙 Zona Sunnah",
    "1001 Rempah": "🧂 1001 Rempah",
    // Legacy support for old category names
    "zona-sunnah": "🌙 Zona Sunnah",
    rempah: "🧂 1001 Rempah",
    honey: "🍯 Zona Honey",
    "cold-pressed": "🥤 Cold Pressed",
    coffee: "☕ Coffee",
    coffeebee: "☕ CoffeeBee",
    teabee: "🍵 TeaBee",
    tea: "🍵 Tea",
    jus: "🧃 Jus",
    "susu-kurma": "🥛 Susu Kurma",
    "buah-lokal": "🍊 Buah Lokal",
  };
  return labels[cat] || cat;
}

// Duplicate addToCart function removed - using the one defined at line 2810

// Update cart display in locator section
function updateCartDisplay() {
  const cartContainer = document.getElementById("cartList");
  if (!cartContainer) return;

  const cart = _storeGet("db_cart", []);
  const cartCount = document.getElementById("cartCount");

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  if (cartCount) {
    cartCount.textContent = totalItems;
    cartCount.classList.toggle("hidden", totalItems === 0);
  }

  if (cart.length === 0) {
    cartContainer.innerHTML =
      '<div class="text-sm text-slate-400">Keranjang masih kosong</div>';
    return;
  }

  let total = 0;
  const rows = cart
    .map((item) => {
      const subtotal = item.price * item.qty;
      total += subtotal;
      return `
      <div class="flex items-center justify-between text-sm border-b border-slate-800 pb-2">
        <div class="flex-1">
          <div class="font-medium text-slate-200">${escapeHtml(item.name)}</div>
          <div class="text-xs text-slate-400">${item.qty} × Rp ${formatNumber(
        item.price
      )}</div>
        </div>
        <div class="font-semibold text-red-500">Rp ${subtotal.toLocaleString(
          "id-ID"
        )}</div>
      </div>
    `;
    })
    .join("");

  cartContainer.innerHTML = `
    <div class="space-y-2">
      ${rows}
      <div class="flex items-center justify-between pt-2 font-bold">
        <span class="text-slate-300">Total</span>
        <span class="text-red-500">Rp ${formatNumber(total)}</span>
      </div>
    </div>
  `;
}

// Update points display
function updatePointsView() {
  const data = _db("db_points");
  const points = data.value || 0;

  // Update big display in points section
  const bigPoints = document.getElementById("pointsBig");
  if (bigPoints) bigPoints.textContent = points;

  // Update mobile nav badge (cart count)
  const cart = _storeGet("db_cart", []);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const mobileBadge = document.querySelector(".mobile-cart-badge");
  if (mobileBadge) {
    mobileBadge.textContent = totalItems;
    mobileBadge.classList.toggle("hidden", totalItems === 0);
  }
}

// Redeem rewards
async function redeemReward(cost, rewardName, rewardId = null) {
  const data = _db("db_points");
  const current = data.value || 0;

  if (current < cost) {
    showWarning(
      `Points kamu belum cukup. Butuh ${cost} points untuk redeem ${rewardName}.`
    );
    return;
  }

  showConfirm(
    `Tukar ${cost} poin untuk ${rewardName}?`,
    async () => {
      try {
        // Save to server if logged in
        const response = await fetch("/api/user-data/rewards/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            rewardId: rewardId,
            rewardName: rewardName,
            pointsCost: cost,
          }),
        });

        const result = await response.json();

        if (result.success) {
          // Update local storage
          const newValue = result.newPoints;
          _db("db_points", { value: newValue });
          addPoints(0); // Trigger nav refresh
          updatePointsView();

          // Show success with coupon code if available
          if (result.couponCode) {
            // Show coupon code in a prominent way
            const expiryDate = result.expiresAt
              ? new Date(result.expiresAt).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "30 hari";

            showSuccess(
              `🎉 Selamat! Kamu berhasil menukar ${rewardName}!\n\n` +
                `📋 KODE VOUCHER KAMU:\n` +
                `━━━━━━━━━━━━━━━━━━━━\n` +
                `🎫  ${result.couponCode}\n` +
                `━━━━━━━━━━━━━━━━━━━━\n\n` +
                `📅 Berlaku sampai: ${expiryDate}\n` +
                `💡 Gunakan kode ini di checkout untuk mendapatkan reward!\n\n` +
                `Poin tersisa: ${newValue}`,
              "Voucher Berhasil Didapat! 🎁"
            );

            // Also copy to clipboard automatically
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard
                .writeText(result.couponCode)
                .then(() => {
                  showToast(
                    "📋 Kode voucher sudah disalin ke clipboard!",
                    "success"
                  );
                })
                .catch(() => {});
            }
          } else {
            showSuccess(
              `Kamu berhasil redeem ${rewardName}. Points tersisa: ${newValue}`,
              "Redeem Berhasil"
            );
          }
        } else {
          // Handle specific error codes
          if (result.error === "VERIFICATION_REQUIRED") {
            showWarning(
              result.message ||
                `Email Belum Terverifikasi!\n\n` +
                  `Silakan verifikasi email Anda di halaman Profil untuk menukarkan poin.`,
              "Verifikasi Diperlukan"
            );
            return;
          }

          if (
            result.error === "Tidak terautentikasi" ||
            response.status === 401
          ) {
            showError("Silahkan login terlebih dahulu untuk menukar reward.");
            return;
          }

          // Generic error - don't fallback to local if it's a server-side rejection
          showError(
            result.error || "Gagal melakukan redeem. Silakan coba lagi nanti."
          );
        }
      } catch (error) {
        console.error("Error redeeming reward:", error);
        showError("Terjadi kesalahan teknis. Silakan coba lagi nanti.");
      }
    },
    null,
    "Konfirmasi Redeem"
  );
}

// Load rewards from API and render them dynamically
async function loadAndRenderRewards() {
  try {
    const response = await fetch("/api/rewards", {
      credentials: "include",
    });
    const data = await response.json();

    if (data.success && data.rewards && data.rewards.length > 0) {
      renderRewards(data.rewards);
    } else {
      // Fallback to default rewards if API fails or returns no data
      console.warn("No rewards from API, using defaults");
      renderDefaultRewards();
    }
  } catch (error) {
    console.error("Error loading rewards:", error);
    // Fallback to default rewards on error
    renderDefaultRewards();
  }
}

/**
 * Refresh points display - reload from server and update UI
 * Called from HTML onclick
 */
// eslint-disable-next-line no-unused-vars
async function refreshPoints() {
  const pointsBigEl = document.getElementById("pointsBig");
  const refreshBtn = event?.target?.closest("button");

  // Show loading state
  if (pointsBigEl) {
    pointsBigEl.innerHTML =
      '<i data-lucide="loader-2" class="w-12 h-12 animate-spin inline-block"></i>';
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }

  // Disable button during refresh
  if (refreshBtn) {
    refreshBtn.disabled = true;
    refreshBtn.classList.add("opacity-50", "cursor-not-allowed");
  }

  try {
    // Check if user is logged in first
    const authResponse = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
    });

    if (!authResponse.ok || authResponse.status === 401) {
      throw new Error("Anda harus login terlebih dahulu untuk melihat poin");
    }

    // Fetch latest user data including points
    const response = await fetch("/api/user-data/progress", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch points");
    }

    const data = await response.json();

    if (data.success && data.data) {
      // Update points display
      const newPoints = data.data.points || 0;
      if (pointsBigEl) {
        // Animate number change
        animatePointsChange(
          pointsBigEl,
          parseInt(pointsBigEl.textContent) || 0,
          newPoints
        );
      }

      // Update navbar points
      if (typeof refreshNav === "function") {
        refreshNav();
      }

      // Show success feedback (silent update, no alert)
      console.log("✅ Points refreshed successfully");
    } else {
      throw new Error(data.error || "Failed to fetch points");
    }
  } catch (error) {
    console.error("Error refreshing points:", error);

    // Show user-friendly message
    if (error.message.includes("login")) {
      showWarning(
        "Hanya Member yang dapat melihat poin, Silahkan daftar terlebih dahulu."
      );
    } else {
      showError("Gagal memuat poin terbaru");
    }

    // Restore previous value or show 0
    if (pointsBigEl && pointsBigEl.textContent.includes("loader")) {
      pointsBigEl.textContent = "0";
    }
  } finally {
    // Re-enable button
    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.classList.remove("opacity-50", "cursor-not-allowed");
    }
  }
}

/**
 * Animate points number change
 */
function animatePointsChange(element, from, to) {
  const duration = 800;
  const startTime = performance.now();
  const difference = to - from;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(from + difference * easeOut);

    element.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Render rewards from API data
function renderRewards(rewards) {
  const rewardsContainer = document.querySelector(
    ".grid.gap-3.sm\\:grid-cols-2.md\\:grid-cols-4"
  );

  if (!rewardsContainer) {
    console.warn("Rewards container not found");
    return;
  }

  rewardsContainer.innerHTML = rewards
    .map((reward) => {
      const colorClass = `${reward.color_theme}-400`;
      const hoverBgClass = `${reward.color_theme}-50`;
      const hoverBorderClass = `${reward.color_theme}-400/50`;

      return `
        <button
          onclick="redeemReward(${reward.points_cost}, '${escapeJsString(
        reward.name
      )}', ${reward.id})"
          class="rounded-lg border border-gray-200 bg-white p-3 hover:border-${hoverBorderClass} hover:bg-${hoverBgClass} transition text-left"
        >
          <div class="text-xs text-${colorClass} mb-1 font-semibold">
            ${reward.points_cost} poin
          </div>
          <div class="font-semibold text-sm text-slate-900">${escapeHtml(
            reward.name
          )}</div>
          ${
            reward.description
              ? `<p class="text-xs text-slate-600 mt-1">${escapeHtml(
                  reward.description
                )}</p>`
              : ""
          }
        </button>
      `;
    })
    .join("");

  // Also update "Tukar Poin" sidebar list to keep them synchronized
  renderTukarPoinList(rewards);
}

// Render default fallback rewards (if API fails)
function renderDefaultRewards() {
  // Define fallback rewards data
  const defaultRewards = [
    {
      id: null,
      name: "Diskon 10%",
      points_cost: 20,
      color_theme: "amber",
      description: null,
    },
    {
      id: null,
      name: "Konsultasi Gratis",
      points_cost: 50,
      color_theme: "emerald",
      description: null,
    },
    {
      id: null,
      name: "Free Product Kecil",
      points_cost: 80,
      color_theme: "purple",
      description: null,
    },
    {
      id: null,
      name: "Voucher Rp 50K",
      points_cost: 100,
      color_theme: "sky",
      description: null,
    },
  ];

  const rewardsContainer = document.querySelector(
    ".grid.gap-3.sm\\:grid-cols-2.md\\:grid-cols-4"
  );

  if (!rewardsContainer) {
    return;
  }

  // Keep existing hardcoded rewards as fallback
  rewardsContainer.innerHTML = defaultRewards
    .map(
      (reward) => `
      <button
        onclick="redeemReward(${reward.points_cost}, '${escapeHtml(
        reward.name
      )}')"
        class="rounded-lg border border-gray-200 bg-white p-3 hover:border-${
          reward.color_theme
        }-400/50 hover:bg-${reward.color_theme}-50 transition text-left"
      >
        <div class="text-xs text-${
          reward.color_theme
        }-500 mb-1 font-semibold">${reward.points_cost} poin</div>
        <div class="font-semibold text-sm text-slate-900">${escapeHtml(
          reward.name
        )}</div>
      </button>
    `
    )
    .join("");

  // Also update "Tukar Poin" sidebar list with same fallback data
  renderTukarPoinList(defaultRewards);
}

/**
 * Render "Tukar Poin" sidebar list - synchronized with rewards data
 * @param {Array} rewards - Array of reward objects from API or fallback
 */
function renderTukarPoinList(rewards) {
  const tukarPoinList = document.getElementById("tukarPoinList");

  if (!tukarPoinList) {
    return;
  }

  if (!rewards || rewards.length === 0) {
    tukarPoinList.innerHTML =
      '<li class="text-slate-400 text-sm">Tidak ada reward tersedia</li>';
    return;
  }

  tukarPoinList.innerHTML = rewards
    .map(
      (reward) =>
        `<li>🎁 ${escapeHtml(reward.name)}: ${reward.points_cost} poin</li>`
    )
    .join("");
}

// Render locations
function renderLocations() {
  const grid = document.getElementById("locationGrid");
  if (!grid) return;

  grid.innerHTML = LOCATIONS.map(
    (loc) => `
    <div class="rounded-2xl border border-gray-200 bg-white p-4 space-y-3 hover:border-red-600/50 transition-all">
      <div class="flex items-start gap-3">
        <div class="mt-1">
          <i data-lucide="map-pin" class="w-5 h-5 text-red-600"></i>
        </div>
        <div class="flex-1">
          <div class="font-semibold text-slate-900 mb-1">${escapeHtml(
            loc.name
          )}</div>
          <div class="text-xs text-slate-900 mb-2">${escapeHtml(
            loc.address
          )}</div>
          <div class="text-xs text-slate-700 space-y-1">
            <div><i data-lucide="phone" class="w-3 h-3 inline"></i> ${escapeHtml(
              loc.phone
            )}</div>
            <div><i data-lucide="clock" class="w-3 h-3 inline"></i> ${escapeHtml(
              loc.hours
            )}</div>
          </div>
        </div>
      </div>
      <div class="mt-3">
        <a href="https://maps.google.com/?q=${encodeURIComponent(loc.address)}" 
           target="_blank" 
           rel="noopener noreferrer"
           class="w-full inline-flex items-center justify-center gap-2 rounded-lg text-white px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90" 
           style="background-color: #F66D14;">
          <i data-lucide="map-pin" class="w-4 h-4"></i>
          Lihat Lokasi
        </a>
      </div>
    </div>
  `
  ).join("");

  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }
}

// Initialize store page
function initStorePage() {
  // Set tahun footer
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Event listener untuk category filter
  const categoryFilter = document.getElementById("categoryFilter");
  if (categoryFilter) {
    categoryFilter.addEventListener("change", (e) => {
      filterStoreCategory(e.target.value);
    });
  }

  // Render initial data
  filterStoreCategory("all"); // Show all products
  renderLocations();
  updateCartDisplay();
  updatePointsView();
  showStoreTab("store"); // Default tab

  // Load rewards from API
  loadAndRenderRewards();

  // Init mobile menu
  initMobileMenu();

  // Init Lucide icons
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }
}

// ==================== APP STARTUP ====================

// Initialize on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    // Check which page we're on
    if (document.getElementById("slots")) {
      initBooking();
    } else if (document.getElementById("events")) {
      initEvents();
    } else if (document.getElementById("ytPlayer")) {
      initMedia();
    } else if (document.getElementById("storePageRoot")) {
      initStorePage();
    } else if (document.getElementById("servicesGrid")) {
      initServices();
    } else {
      init();
    }
  });
} else {
  // Check which page we're on
  if (document.getElementById("slots")) {
    initBooking();
  } else if (document.getElementById("events")) {
    initEvents();
  } else if (document.getElementById("ytPlayer")) {
    initMedia();
  } else if (document.getElementById("page-store")) {
    initStorePage();
  } else if (document.getElementById("servicesGrid")) {
    initServices();
  } else {
    init();
  }
}

// Expose addPoints to window for cross-file usage (e.g., store-cart.js)
// Keeping this for backward compatibility
window.addPoints = addPoints;

// ==================== EVENT LISTENERS FOR DECOUPLED MODULES ====================
// Listen for points earned events from other modules (e.g., store-cart.js)
// This decouples store-cart.js from directly calling addPoints
document.addEventListener("docterbee:pointsEarned", (e) => {
  const points = e.detail?.points;
  if (typeof points === "number" && points > 0) {
    addPoints(points);
    console.log(
      `✅ [script.js] Received pointsEarned event, added ${points} points`
    );
  }
});
