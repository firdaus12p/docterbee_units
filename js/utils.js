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
 * Escape string for use in JavaScript string literals within HTML attributes
 * Prevents XSS when inserting user data into onclick handlers etc.
 * @param {string} text - Text to escape
 * @returns {string} Escaped text safe for JS string in HTML attribute
 */
function escapeJsString(text) {
  if (!text) return "";
  return String(text)
    .replace(/\\/g, "\\\\") // Escape backslash first
    .replace(/'/g, "\\'") // Escape single quotes
    .replace(/"/g, "&quot;") // Escape double quotes for HTML attribute
    .replace(/</g, "\\x3c") // Escape < to prevent script injection
    .replace(/>/g, "\\x3e") // Escape > to prevent script injection
    .replace(/\n/g, "\\n") // Escape newlines
    .replace(/\r/g, "\\r"); // Escape carriage returns
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

// Make functions globally available
window.escapeHtml = escapeHtml;
window.escapeJsString = escapeJsString;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.formatCurrency = formatCurrency;
window.formatNumber = formatNumber;
window.debounce = debounce;
window.copyToClipboard = copyToClipboard;
window.getCategoryColor = getCategoryColor;
