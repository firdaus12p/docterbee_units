/**
 * Member Check - Phone Number Lookup
 * Allows users to check their membership status using phone number
 *
 * Card configuration is now shared via card-config.js
 */

(function () {
  "use strict";

  // ========================================
  // CARD TYPE CONFIGURATION
  // Now defined in card-config.js (shared with register-card-preview.js)
  // ========================================
  const CARD_TYPE_CONFIG = window.CARD_TYPE_CONFIG;

  // ========================================
  // DOM ELEMENTS
  // ========================================
  let elements = {};

  /**
   * Initialize DOM element references
   */
  function initElements() {
    elements = {
      // Form elements
      form: document.getElementById("memberCheckForm"),
      phoneInput: document.getElementById("phone"),
      checkBtn: document.getElementById("checkBtn"),
      checkBtnText: document.getElementById("checkBtnText"),
      rateLimitWarning: document.getElementById("rateLimitWarning"),
      rateLimitMessage: document.getElementById("rateLimitMessage"),

      // Section containers
      memberCardSection: document.getElementById("memberCardSection"),
      notFoundSection: document.getElementById("notFoundSection"),
      placeholderSection: document.getElementById("placeholderSection"),

      // Member info display
      memberName: document.getElementById("memberName"),
      memberId: document.getElementById("memberId"),
      memberCardType: document.getElementById("memberCardType"),
      memberSince: document.getElementById("memberSince"),

      // Card preview elements
      memberCardFlipWrapper: document.getElementById("memberCardFlipWrapper"),
      memberCardFrontImage: document.getElementById("memberCardFrontImage"),
      memberCardBackImage: document.getElementById("memberCardBackImage"),
      memberCardName: document.getElementById("memberCardName"),
      memberCardPhone: document.getElementById("memberCardPhone"),
      memberCardInfo: document.getElementById("memberCardInfo"),
    };
  }

  // ========================================
  // UI STATE MANAGEMENT
  // ========================================

  /**
   * Show loading state on button
   */
  function setLoading(loading) {
    if (!elements.checkBtn || !elements.checkBtnText) return;

    if (loading) {
      elements.checkBtn.disabled = true;
      elements.checkBtnText.innerHTML = '<span class="loading-spinner"></span> Mencari...';
    } else {
      elements.checkBtn.disabled = false;
      elements.checkBtnText.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        Cek Status Member
      `;
    }
  }

  /**
   * Show/hide sections based on result
   * @param {'placeholder'|'found'|'notfound'} state
   */
  function showSection(state) {
    const sections = {
      placeholder: elements.placeholderSection,
      found: elements.memberCardSection,
      notfound: elements.notFoundSection,
    };

    // Hide all sections first
    Object.values(sections).forEach((section) => {
      if (section) section.classList.add("hidden");
    });

    // Show the requested section
    if (sections[state]) {
      sections[state].classList.remove("hidden");
    }
  }

  /**
   * Show rate limit warning
   * @param {string} message
   * @param {number} retryAfter - seconds to wait
   */
  function showRateLimitWarning(message, retryAfter) {
    if (!elements.rateLimitWarning || !elements.rateLimitMessage) return;

    elements.rateLimitMessage.textContent = message;
    elements.rateLimitWarning.classList.remove("hidden");

    // Hide after retry period
    if (retryAfter > 0) {
      setTimeout(() => {
        hideRateLimitWarning();
      }, retryAfter * 1000);
    }
  }

  /**
   * Hide rate limit warning
   */
  function hideRateLimitWarning() {
    if (elements.rateLimitWarning) {
      elements.rateLimitWarning.classList.add("hidden");
    }
  }

  // ========================================
  // CARD DISPLAY
  // ========================================

  /**
   * Display member card with data
   * @param {Object} member - Member data from API
   */
  function displayMemberCard(member) {
    // Update member info
    if (elements.memberName) elements.memberName.textContent = member.name;
    if (elements.memberId) elements.memberId.textContent = member.member_id;
    if (elements.memberSince) elements.memberSince.textContent = member.member_since;

    // Get card type config
    const cardType = member.card_type || "Active-Worker";
    const cardConfig = CARD_TYPE_CONFIG[cardType] || CARD_TYPE_CONFIG["Active-Worker"];

    // Update card type display with badge
    if (elements.memberCardType) {
      elements.memberCardType.innerHTML = `<span class="card-type-badge">${cardConfig.label}</span>`;
    }

    // Update card images
    if (elements.memberCardFrontImage) {
      elements.memberCardFrontImage.src = cardConfig.front;
      elements.memberCardFrontImage.alt = `${cardConfig.label} Card Front`;
    }
    if (elements.memberCardBackImage) {
      elements.memberCardBackImage.src = cardConfig.back;
      elements.memberCardBackImage.alt = `${cardConfig.label} Card Back`;
    }

    // Update card overlay info
    if (elements.memberCardName) {
      elements.memberCardName.textContent = member.name;
      // Apply small name class for specific card types
      if (cardConfig.smallName) {
        elements.memberCardName.classList.add("member-card-name-small");
      } else {
        elements.memberCardName.classList.remove("member-card-name-small");
      }
    }
    if (elements.memberCardPhone) {
      elements.memberCardPhone.textContent = member.phone;
    }

    // Apply lower info position for specific card types
    if (elements.memberCardInfo) {
      if (cardConfig.smallName) {
        elements.memberCardInfo.classList.add("member-card-info-lower");
      } else {
        elements.memberCardInfo.classList.remove("member-card-info-lower");
      }
    }

    // Reset flip state
    if (elements.memberCardFlipWrapper) {
      elements.memberCardFlipWrapper.classList.remove("flipped");
    }

    // Show member card section
    showSection("found");
  }

  // ========================================
  // API COMMUNICATION
  // ========================================

  /**
   * Check member by phone number
   * @param {string} phone - Phone number to check
   */
  async function checkMember(phone) {
    setLoading(true);
    hideRateLimitWarning();

    try {
      const response = await fetch("/api/member-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.status === 429) {
        // Rate limited
        const retryAfter = data.retryAfter || 180;
        showRateLimitWarning(data.error, retryAfter);
        showSection("placeholder");
        return;
      }

      if (data.success && data.member) {
        displayMemberCard(data.member);
        // Use modal-utils if available
        if (typeof showSuccess === "function") {
          showSuccess("Member ditemukan!", "Data kartu member berhasil dimuat.");
        }
      } else {
        showSection("notfound");
        // Optional: show error via modal
        if (typeof showWarning === "function") {
          showWarning("Tidak Ditemukan", data.error || "Nomor HP tidak terdaftar");
        }
      }
    } catch (error) {
      console.error("[member-check] Error:", error);
      showSection("placeholder");
      if (typeof showError === "function") {
        showError("Kesalahan Sistem", "Terjadi kesalahan. Silakan coba lagi nanti.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // INPUT VALIDATION
  // ========================================

  /**
   * Validate phone number format (client-side)
   * @param {string} phone
   * @returns {boolean}
   */
  function isValidPhone(phone) {
    if (!phone || typeof phone !== "string") return false;

    // Remove all non-digit characters except leading +
    let cleaned = phone.trim().replace(/[^\d+]/g, "");

    // Normalize different formats
    if (cleaned.startsWith("+62")) {
      cleaned = "0" + cleaned.slice(3);
    } else if (cleaned.startsWith("62") && cleaned.length > 10) {
      cleaned = "0" + cleaned.slice(2);
    }

    // Indonesian mobile: starts with 08, 10-15 digits total
    const phoneRegex = /^08[1-9][0-9]{7,11}$/;
    return phoneRegex.test(cleaned);
  }

  // ========================================
  // EVENT HANDLERS
  // ========================================

  /**
   * Handle form submission
   * @param {Event} e
   */
  function handleFormSubmit(e) {
    e.preventDefault();

    const phone = elements.phoneInput?.value?.trim();

    if (!phone) {
      if (typeof showWarning === "function") {
        showWarning("Input Diperlukan", "Silakan masukkan nomor HP Anda");
      }
      return;
    }

    if (!isValidPhone(phone)) {
      if (typeof showWarning === "function") {
        showWarning("Format Salah", "Format nomor HP tidak valid. Gunakan format 08xxxxxxxxxx");
      }
      return;
    }

    checkMember(phone);
  }

  /**
   * Handle card flip on click
   */
  function handleCardFlip() {
    if (elements.memberCardFlipWrapper) {
      elements.memberCardFlipWrapper.classList.toggle("flipped");
    }
  }

  // ========================================
  // INITIALIZATION
  // ========================================

  /**
   * Initialize the member check module
   */
  function init() {
    initElements();

    // Check if required elements exist
    if (!elements.form || !elements.phoneInput) {
      console.warn("[member-check] Required form elements not found");
      return;
    }

    // Attach event listeners
    elements.form.addEventListener("submit", handleFormSubmit);

    // Card flip listener
    if (elements.memberCardFlipWrapper) {
      elements.memberCardFlipWrapper.addEventListener("click", handleCardFlip);
    }

    // Show placeholder initially
    showSection("placeholder");

    console.log("[member-check] Module initialized successfully");
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
