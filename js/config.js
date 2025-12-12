/**
 * API Configuration for Docterbee
 * When deployed to production, API_BASE should be empty string (relative URL)
 * When developing locally, it can be set to "http://localhost:3000"
 */

// Automatically detect environment based on hostname
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// For production: use relative URL (empty string)
// For localhost development: optionally use full URL
const API_BASE = "";

// Export for use in other scripts
window.API_BASE = API_BASE;
