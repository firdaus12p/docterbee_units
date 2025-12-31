/**
 * Admin API Module
 * Centralized API configuration and fetch helper for admin dashboard
 *
 * This file MUST be loaded before any admin manager files.
 *
 * @module admin-api
 * @version 1.0.0
 */
(function () {
  "use strict";

  // ============================================
  // CONFIGURATION
  // ============================================

  /**
   * Base URL for all API endpoints
   * @constant {string}
   */
  const API_BASE = "/api";

  // ============================================
  // API HELPER FUNCTION
  // ============================================

  /**
   * Fetch wrapper for admin API requests
   * Automatically includes credentials (session cookie) for authentication
   *
   * @param {string} url - API URL to fetch
   * @param {Object} options - Fetch options (method, headers, body, etc.)
   * @returns {Promise<Response>} Fetch response
   *
   * @example
   * // GET request
   * const response = await adminFetch(`${API_BASE}/users`);
   *
   * @example
   * // POST request
   * const response = await adminFetch(`${API_BASE}/users`, {
   *   method: "POST",
   *   body: JSON.stringify({ name: "John" })
   * });
   */
  async function adminFetch(url, options = {}) {
    return fetch(url, {
      ...options,
      credentials: "include", // Always include session cookie
      headers: {
        ...options.headers,
      },
    });
  }

  // ============================================
  // EXPORT TO GLOBAL SCOPE
  // ============================================

  window.API_BASE = API_BASE;
  window.adminFetch = adminFetch;

  console.log("✅ Admin API Module Loaded");
})();
