/**
 * Shared Frontend Utilities
 * Common functions used across multiple JS files
 * 
 * Include this file before other JS files that use these utilities.
 * <script src="/js/utils.js"></script>
 */

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text safe for HTML insertion
 */
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Format date to Indonesian locale
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format date with time
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date and time string
 */
function formatDateTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format currency to Indonesian Rupiah
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
  return new Intl.NumberFormat("id-ID").format(num);
}

/**
 * Debounce function to limit rapid calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} True if successful
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
}
/**
 * Get Tailwind CSS classes for article category badge
 * @param {string} category - Category name
 * @returns {string} Tailwind CSS classes for badge styling
 */
function getCategoryColor(category) {
  const colors = {
    Nutrisi: "bg-green-100 text-green-700",
    Ibadah: "bg-blue-100 text-blue-700",
    Kebiasaan: "bg-purple-100 text-purple-700",
    Sains: "bg-orange-100 text-orange-700",
  };
  return colors[category] || "bg-gray-100 text-gray-700";
}

/**
 * Get status badge configuration for activity history
 * Unified function to avoid duplication between profile and admin pages
 * @param {string} status - Status value (pending, completed, approved, etc.)
 * @param {string} activityType - Type of activity: 'order' or 'reward'
 * @returns {Object} { className: string, label: string }
 */
function getActivityStatusConfig(status, activityType) {
  const statusLower = (status || "").toLowerCase();
  
  // Default config
  let config = { className: "status-pending", label: status || "Unknown" };
  
  if (activityType === "order") {
    // Order statuses
    const orderConfigs = {
      completed: { className: "status-completed", label: "Selesai" },
      pending: { className: "status-pending", label: "Menunggu" },
      cancelled: { className: "status-cancelled", label: "Dibatalkan" },
      expired: { className: "status-expired", label: "Kedaluwarsa" }
    };
    config = orderConfigs[statusLower] || config;
  } else if (activityType === "reward") {
    // Reward redemption statuses
    const rewardConfigs = {
      approved: { className: "status-approved", label: "Disetujui" },
      pending: { className: "status-pending", label: "Menunggu" },
      rejected: { className: "status-rejected", label: "Ditolak" }
    };
    config = rewardConfigs[statusLower] || config;
  }
  
  return config;
}

/**
 * Generate status badge HTML for activity history
 * @param {string} status - Status value
 * @param {string} activityType - 'order' or 'reward'
 * @returns {string} HTML string for status badge
 */
function getActivityStatusBadgeHtml(status, activityType) {
  const config = getActivityStatusConfig(status, activityType);
  return `<span class="status-badge ${config.className}">${config.label}</span>`;
}

// Make functions globally available
window.escapeHtml = escapeHtml;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.formatCurrency = formatCurrency;
window.formatNumber = formatNumber;
window.debounce = debounce;
window.copyToClipboard = copyToClipboard;
window.getCategoryColor = getCategoryColor;
window.getActivityStatusConfig = getActivityStatusConfig;
window.getActivityStatusBadgeHtml = getActivityStatusBadgeHtml;

