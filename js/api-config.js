// ==================== API Configuration ====================
// Production-ready API configuration
// Automatically uses current domain in production

/**
 * Get API base URL dynamically
 * - In production: uses window.location.origin (current domain)
 * - In development: uses localhost:3000
 */
function getApiBase() {
  if (typeof window !== "undefined") {
    // Browser environment
    const isDevelopment =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (isDevelopment) {
      return `http://localhost:3000`;
    } else {
      return window.location.origin;
    }
  }

  // Node.js environment (fallback)
  return "http://localhost:3000";
}

/**
 * Build API URL with optional path and query parameters
 * @param {string} path - API path (e.g., '/api/services')
 * @param {object} params - Query parameters (optional)
 * @returns {string} - Complete API URL
 */
function buildApiUrl(path, params = {}) {
  const baseUrl = getApiBase();
  const url = new URL(path, baseUrl);

  // Add query parameters if provided
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.append(key, value);
    }
  });

  return url.toString();
}

/**
 * Make API request with error handling
 * @param {string} path - API path
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<object>} - Response data
 */
async function apiCall(path, options = {}) {
  const url = buildApiUrl(path);

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Call Failed: ${path}`, error);
    throw error;
  }
}

// Export for ES modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { getApiBase, buildApiUrl, apiCall };
}
