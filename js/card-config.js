/**
 * Card Type Configuration Module
 * Centralized configuration for all membership card types
 *
 * Used by: register-card-preview.js, member-check.js
 *
 * @module card-config
 * @version 1.0.0
 */
(function () {
  "use strict";

  // ============================================
  // CARD TYPE CONFIGURATION
  // ============================================

  /**
   * Membership card type configurations
   * @constant {Object}
   *
   * @property {string} front - Path to front card image
   * @property {string} back - Path to back card image
   * @property {string} label - Display label for the card type
   * @property {boolean} smallName - Whether to use smaller font for name display
   */
  const CARD_TYPE_CONFIG = Object.freeze({
    "Active-Worker": {
      front: "/uploads/gambar_kartu/depan/Background-Active-Worker.png",
      back: "/uploads/gambar_kartu/belakang/Tampilan-Belakang-Active-Worker.png",
      label: "Active Worker",
      smallName: false,
    },
    "Family-Member": {
      front: "/uploads/gambar_kartu/depan/Background-Family-Member.png",
      back: "/uploads/gambar_kartu/belakang/Tampilan-Belakang-Family-Member.png",
      label: "Family Member",
      smallName: false,
    },
    "Healthy-Smart-Kids": {
      front: "/uploads/gambar_kartu/depan/Background-Healthy-&-Smart-Kids.png",
      back: "/uploads/gambar_kartu/belakang/Tampilan-Belakang-Healthy-&-Smart-Kids.png",
      label: "Healthy & Smart Kids",
      smallName: false,
    },
    "Mums-Baby": {
      front: "/uploads/gambar_kartu/depan/Background-Mums-&-Baby.png",
      back: "/uploads/gambar_kartu/belakang/Tampilan-Belakang-Mums-&-Baby.png",
      label: "Mums & Baby",
      smallName: true,
    },
    "New-Couple": {
      front: "/uploads/gambar_kartu/depan/Background-New-Couple.png",
      back: "/uploads/gambar_kartu/belakang/Tampilan-Belakang-New-Couple.png",
      label: "New Couple",
      smallName: true,
    },
    "Pregnant-Preparation": {
      front: "/uploads/gambar_kartu/depan/Background-Pregnant-Preparatiom.png",
      back: "/uploads/gambar_kartu/belakang/Tampilan-Belakang-Pregnant-Preparatiom.png",
      label: "Pregnant Preparation",
      smallName: true,
    },
    "Senja-Ceria": {
      front: "/uploads/gambar_kartu/depan/Background-Senja-Ceria.png",
      back: "/uploads/gambar_kartu/belakang/Tampilan-Belakang-Senja-Ceria.png",
      label: "Senja Ceria",
      smallName: false,
    },
  });

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  /**
   * Get list of card types that require smaller name font
   * @returns {string[]} Array of card type keys
   */
  function getSmallNameCardTypes() {
    return Object.entries(CARD_TYPE_CONFIG)
      .filter(([, config]) => config.smallName)
      .map(([key]) => key);
  }

  /**
   * Get card configuration by type
   * @param {string} cardType - Card type key
   * @returns {Object|null} Card configuration or null if not found
   */
  function getCardConfig(cardType) {
    return CARD_TYPE_CONFIG[cardType] || null;
  }

  /**
   * Get all available card types
   * @returns {string[]} Array of card type keys
   */
  function getAllCardTypes() {
    return Object.keys(CARD_TYPE_CONFIG);
  }

  // ============================================
  // EXPORT TO GLOBAL SCOPE
  // ============================================

  window.CARD_TYPE_CONFIG = CARD_TYPE_CONFIG;
  window.getSmallNameCardTypes = getSmallNameCardTypes;
  window.getCardConfig = getCardConfig;
  window.getAllCardTypes = getAllCardTypes;

  console.log("✅ Card Config Module Loaded");
})();
