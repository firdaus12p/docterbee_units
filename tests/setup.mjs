/**
 * Test Setup & Configuration
 * ============================
 *
 * This file provides:
 * - Test environment configuration
 * - Database mocking utilities
 * - Session mocking for auth tests
 * - Common test helpers
 *
 * WHY: To ensure tests are isolated, repeatable, and don't affect production data.
 */

import { before, after, beforeEach, afterEach } from "node:test";

// Test configuration
export const TEST_CONFIG = {
  BASE_URL: process.env.TEST_URL || "http://localhost:3000",
  TIMEOUT: 10000,
  TEST_USER: {
    name: "Test User",
    email: "testuser@example.com",
    phone: "081234567890",
    password: "password123",
  },
  TEST_ADMIN: {
    username: "admin",
    password: "admin123",
  },
};

/**
 * Mock session object for testing authentication middleware
 * WHY: Tests middleware without needing actual Express session
 */
export function createMockSession(overrides = {}) {
  return {
    userId: null,
    userName: null,
    userEmail: null,
    userPhone: null,
    isAdmin: false,
    destroy: (cb) => cb && cb(),
    ...overrides,
  };
}

/**
 * Mock request object for unit testing route handlers
 * WHY: Allows testing route logic without HTTP overhead
 */
export function createMockRequest(overrides = {}) {
  const session = createMockSession(overrides.session);
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    session,
    ...overrides,
  };
}

/**
 * Mock response object that captures responses for assertions
 * WHY: Captures all response data for validation in tests
 */
export function createMockResponse() {
  let statusCode = 200;
  let responseData = null;
  let cookies = {};

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    send(data) {
      responseData = data;
      return this;
    },
    clearCookie(name) {
      delete cookies[name];
      return this;
    },
    cookie(name, value, options) {
      cookies[name] = { value, options };
      return this;
    },
    // Getters for assertions
    getStatus: () => statusCode,
    getData: () => responseData,
    getCookies: () => cookies,
  };

  return res;
}

/**
 * Cookie jar for managing session across multiple requests
 * WHY: Maintains session state for integration tests
 */
export class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  setCookies(setCookieHeaders) {
    if (!setCookieHeaders) return;
    const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];

    for (const header of headers) {
      const [cookiePart] = header.split(";");
      const [name, value] = cookiePart.split("=");
      this.cookies.set(name.trim(), value.trim());
    }
  }

  getCookieString() {
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }

  clear() {
    this.cookies.clear();
  }
}

/**
 * API request helper with session support
 * WHY: Simplifies making authenticated API calls in tests
 *
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @param {CookieJar} cookieJar - Optional cookie jar for session
 */
export async function apiRequest(endpoint, options = {}, cookieJar = null) {
  const url = `${TEST_CONFIG.BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (cookieJar) {
    headers.Cookie = cookieJar.getCookieString();
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  // Store cookies from response
  if (cookieJar) {
    cookieJar.setCookies(response.headers.get("set-cookie"));
  }

  let data = null;
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  return { response, data };
}

/**
 * Wait for a condition to be true (useful for async operations)
 */
export function waitFor(conditionFn, timeout = 5000, interval = 100) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      if (conditionFn()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error("Timeout waiting for condition"));
      } else {
        setTimeout(check, interval);
      }
    };

    check();
  });
}

/**
 * Generate unique test data to avoid conflicts
 */
export function generateTestData(prefix = "test") {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);

  return {
    email: `${prefix}_${timestamp}_${random}@test.com`,
    phone: `08${timestamp.toString().slice(-10)}`,
    name: `${prefix}_user_${random}`,
  };
}

/**
 * Test data cleanup helper
 * WHY: Ensures test isolation by cleaning up created data
 */
export async function cleanupTestData(queries) {
  // This would be implemented to clean up test data from database
  // In unit tests with mocks, this is not needed
  // For integration tests, implement actual cleanup
  console.log("[Test Cleanup] Would clean up:", queries);
}

// Validation helpers for assertions
export const validators = {
  /**
   * Validate standard success response structure
   */
  isSuccessResponse(data) {
    return data && data.success === true;
  },

  /**
   * Validate standard error response structure
   */
  isErrorResponse(data) {
    return data && data.success === false && typeof data.error === "string";
  },

  /**
   * Validate order number format: ORD-YYYYMMDD-XXXXXX
   */
  isValidOrderNumber(orderNumber) {
    return /^ORD-\d{8}-[A-F0-9]{6}$/.test(orderNumber);
  },

  /**
   * Validate email format
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /**
   * Validate Indonesian phone number
   */
  isValidPhone(phone) {
    return /^08\d{8,12}$/.test(phone);
  },
};

export default {
  TEST_CONFIG,
  createMockSession,
  createMockRequest,
  createMockResponse,
  CookieJar,
  apiRequest,
  waitFor,
  generateTestData,
  cleanupTestData,
  validators,
};
