/**
 * Register Page - Card Preview with Flip Animation
 * Handles membership card preview and flip interaction
 */

(function () {
  "use strict";

  // Card configuration is now in card-config.js
  // Use window.CARD_TYPE_CONFIG and getSmallNameCardTypes()
  const cardTypeMapping = window.CARD_TYPE_CONFIG;

  // Initialize card preview functionality
  function initCardPreview() {
    const nameInput = document.getElementById("name");
    const phoneInput = document.getElementById("phone");
    const cardTypeSelect = document.getElementById("card_type");

    // Desktop card elements
    const cardPreviewContainer = document.getElementById("cardPreviewContainer");
    const cardPlaceholder = document.getElementById("cardPlaceholder");
    const cardFlipWrapper = document.getElementById("cardFlipWrapper");
    const cardFrontImage = document.getElementById("cardFrontImage");
    const cardBackImage = document.getElementById("cardBackImage");
    const cardNameDisplay = document.getElementById("cardNameDisplay");
    const cardPhoneDisplay = document.getElementById("cardPhoneDisplay");
    const cardInfo = document.getElementById("cardInfo");

    // Mobile card elements
    const cardPreviewContainerMobile = document.getElementById("cardPreviewContainerMobile");
    const cardFlipWrapperMobile = document.getElementById("cardFlipWrapperMobile");
    const cardFrontImageMobile = document.getElementById("cardFrontImageMobile");
    const cardBackImageMobile = document.getElementById("cardBackImageMobile");
    const cardNameDisplayMobile = document.getElementById("cardNameDisplayMobile");
    const cardPhoneDisplayMobile = document.getElementById("cardPhoneDisplayMobile");
    const cardInfoMobile = document.getElementById("cardInfoMobile");

    // Check if all required elements exist
    if (
      !nameInput ||
      !phoneInput ||
      !cardTypeSelect ||
      !cardFlipWrapper ||
      !cardFrontImage ||
      !cardBackImage
    ) {
      console.warn("[register-card-preview] Required elements not found");
      return;
    }

    // Update card preview when name changes
    nameInput.addEventListener("input", function () {
      const name = this.value.trim();
      const displayName = name || "Nama Anda";
      if (cardNameDisplay) cardNameDisplay.textContent = displayName;
      if (cardNameDisplayMobile) cardNameDisplayMobile.textContent = displayName;
    });

    // Update card preview when phone changes
    phoneInput.addEventListener("input", function () {
      const phone = this.value.trim();
      const displayPhone = phone || "08xxxxxxxxxx";
      if (cardPhoneDisplay) cardPhoneDisplay.textContent = displayPhone;
      if (cardPhoneDisplayMobile) cardPhoneDisplayMobile.textContent = displayPhone;
    });

    // Update card preview when card type changes
    cardTypeSelect.addEventListener("change", function () {
      const selectedType = this.value;

      if (selectedType && cardTypeMapping[selectedType]) {
        const cardData = cardTypeMapping[selectedType];

        // Update desktop images
        cardFrontImage.src = cardData.front;
        cardBackImage.src = cardData.back;

        // Update mobile images
        if (cardFrontImageMobile) cardFrontImageMobile.src = cardData.front;
        if (cardBackImageMobile) cardBackImageMobile.src = cardData.back;

        // Apply smaller font and lower position for specific card types
        const smallNameTypes = window.getSmallNameCardTypes
          ? window.getSmallNameCardTypes()
          : ["Mums-Baby", "New-Couple", "Pregnant-Preparation"];
        if (smallNameTypes.includes(selectedType)) {
          if (cardNameDisplay) cardNameDisplay.classList.add("card-name-small");
          if (cardNameDisplayMobile) cardNameDisplayMobile.classList.add("card-name-small");
          if (cardInfo) cardInfo.classList.add("card-info-lower");
          if (cardInfoMobile) cardInfoMobile.classList.add("card-info-lower");
        } else {
          if (cardNameDisplay) cardNameDisplay.classList.remove("card-name-small");
          if (cardNameDisplayMobile) cardNameDisplayMobile.classList.remove("card-name-small");
          if (cardInfo) cardInfo.classList.remove("card-info-lower");
          if (cardInfoMobile) cardInfoMobile.classList.remove("card-info-lower");
        }

        // Show preview, hide placeholder
        if (cardPreviewContainer) cardPreviewContainer.style.display = "block";
        if (cardPlaceholder) cardPlaceholder.style.display = "none";
        if (cardPreviewContainerMobile) cardPreviewContainerMobile.style.display = "block";
      } else {
        // Hide preview if no type selected, show placeholder
        if (cardPreviewContainer) cardPreviewContainer.style.display = "none";
        if (cardPlaceholder) cardPlaceholder.style.display = "block";
        if (cardPreviewContainerMobile) cardPreviewContainerMobile.style.display = "none";

        // Remove small class when no type selected
        if (cardNameDisplay) cardNameDisplay.classList.remove("card-name-small");
        if (cardNameDisplayMobile) cardNameDisplayMobile.classList.remove("card-name-small");
        if (cardInfo) cardInfo.classList.remove("card-info-lower");
        if (cardInfoMobile) cardInfoMobile.classList.remove("card-info-lower");
      }
    });

    // Flip card on click (desktop)
    if (cardFlipWrapper) {
      cardFlipWrapper.addEventListener("click", function (e) {
        // Prevent event bubbling
        e.stopPropagation();
        this.classList.toggle("flipped");
        console.log("[register-card-preview] Desktop card flipped:", this.classList.contains("flipped"));
      });
    }

    // Flip card on click (mobile)
    if (cardFlipWrapperMobile) {
      cardFlipWrapperMobile.addEventListener("click", function (e) {
        // Prevent event bubbling
        e.stopPropagation();
        this.classList.toggle("flipped");
        console.log("[register-card-preview] Mobile card flipped:", this.classList.contains("flipped"));
      });
    }

    console.log("[register-card-preview] Card preview initialized successfully");
  }

  // Initialize on DOM ready
  function init() {
    initCardPreview();
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
