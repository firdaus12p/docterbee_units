/**
 * Email Verification System - Frontend Logic
 * Handles the display of verification banner and email update modal
 */

(function () {
  "use strict";

  // Elements
  const banner = document.getElementById("verificationBanner");
  const modal = document.getElementById("emailVerifyModal");
  const modalBox = document.getElementById("emailVerifyModalBox");
  const btnOpenModal = document.getElementById("btnOpenVerifyModal");
  const btnCloseModal = document.getElementById("btnCloseVerifyModal");
  const emailForm = document.getElementById("emailVerifyForm");
  const newEmailInput = document.getElementById("newEmail");
  const btnSubmit = document.getElementById("btnSubmitEmail");

  /**
   * Check verification status and show banner if needed
   */
  async function checkVerificationStatus() {
    try {
      const response = await fetch("/api/auth/check", { credentials: "include" });
      const result = await response.json();

      if (result.success && result.loggedIn) {
        const user = result.user;
        
        // If email is NOT verified, show the banner
        if (user.is_email_verified === false) {
          banner.classList.remove("hidden");
          
          // Pre-fill email if it's not a local one
          if (user.email && !user.email.endsWith('.local')) {
            newEmailInput.value = user.email;
          }
        } else {
          banner.classList.add("hidden");
        }
      }
    } catch (error) {
      console.error("[verification] Check status failed:", error);
    }
  }

  /**
   * Open Modal
   */
  function openModal() {
    modal.style.display = "flex";
    setTimeout(() => {
      modal.classList.remove("hidden");
      modalBox.classList.remove("scale-95", "opacity-0");
      modalBox.classList.add("scale-100", "opacity-100");
    }, 10);
  }

  /**
   * Close Modal
   */
  function closeModal() {
    modalBox.classList.remove("scale-100", "opacity-100");
    modalBox.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      modal.classList.add("hidden");
      modal.style.display = "none";
    }, 200);
  }

  // Event Listeners
  if (btnOpenModal) btnOpenModal.addEventListener("click", openModal);
  if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
  
  // Close on backdrop click
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Form Submission
  if (emailForm) {
    emailForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const email = newEmailInput.value.trim();
      if (!email) return;

      // Loading state
      btnSubmit.disabled = true;
      btnSubmit.textContent = "Mengirim...";
      btnSubmit.classList.add("opacity-70", "cursor-not-allowed");

      try {
        const response = await fetch("/api/auth/update-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
          credentials: "include"
        });

        const result = await response.json();

        if (result.success) {
          // Close modal and show success using global utility
          closeModal();
          if (typeof window.showSuccess === "function") {
            window.showSuccess(result.message);
          } else {
            alert(result.message);
          }
          // Hide banner since email is now "pending verification"
          banner.classList.add("hidden");
        } else {
          if (typeof window.showError === "function") {
            window.showError(result.error || "Gagal mengirim email verifikasi");
          } else {
            alert(result.error || "Gagal mengirim email verifikasi");
          }
        }
      } catch (error) {
        console.error("[verification] Update failed:", error);
        if (typeof window.showError === "function") {
          window.showError("Terjadi kesalahan koneksi. Silakan coba lagi.");
        }
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Kirim Link";
        btnSubmit.classList.remove("opacity-70", "cursor-not-allowed");
      }
    });
  }

  // Initialize
  checkVerificationStatus();
})();
