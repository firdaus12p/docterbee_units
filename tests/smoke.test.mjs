/**
 * Smoke Tests for DocterBee API
 * Uses Node.js built-in test runner (node --test)
 * 
 * Run: npm test
 */

import { describe, it, before, after } from "node:test";
import assert from "node:assert";

// Test configuration
const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

/**
 * Helper to make API requests
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => null);
  return { response, data };
}

describe("API Smoke Tests", () => {
  // ========================================
  // Health Check
  // ========================================
  describe("Health Check", () => {
    it("should return debug info", async () => {
      const { response, data } = await apiRequest("/api/debug");
      
      assert.strictEqual(response.ok, true, "Response should be OK");
      assert.strictEqual(data.status, "OK", "Status should be OK");
    });
  });

  // ========================================
  // Auth Routes
  // ========================================
  describe("Auth Routes", () => {
    it("GET /api/auth/check should return success", async () => {
      const { response, data } = await apiRequest("/api/auth/check");
      
      assert.strictEqual(response.ok, true, "Response should be OK");
      assert.strictEqual(data.success, true, "Should have success field");
      assert.strictEqual(typeof data.loggedIn, "boolean", "loggedIn should be boolean");
    });
  });

  // ========================================
  // Products Routes
  // ========================================
  describe("Products Routes", () => {
    it("GET /api/products should return products array", async () => {
      const { response, data } = await apiRequest("/api/products");
      
      assert.strictEqual(response.ok, true, "Response should be OK");
      assert.strictEqual(data.success, true, "Should have success field");
      assert.strictEqual(Array.isArray(data.data), true, "data should be array");
    });
  });

  // ========================================
  // Services Routes
  // ========================================
  describe("Services Routes", () => {
    it("GET /api/services should return services array", async () => {
      const { response, data } = await apiRequest("/api/services");
      
      assert.strictEqual(response.ok, true, "Response should be OK");
      assert.strictEqual(data.success, true, "Should have success field");
      assert.strictEqual(Array.isArray(data.data), true, "data should be array");
    });
  });

  // ========================================
  // Events Routes
  // ========================================
  describe("Events Routes", () => {
    it("GET /api/events should return events array", async () => {
      const { response, data } = await apiRequest("/api/events");
      
      assert.strictEqual(response.ok, true, "Response should be OK");
      assert.strictEqual(data.success, true, "Should have success field");
      assert.strictEqual(Array.isArray(data.data), true, "data should be array");
    });
  });

  // ========================================
  // Rewards Routes
  // ========================================
  describe("Rewards Routes", () => {
    it("GET /api/rewards should return rewards array", async () => {
      const { response, data } = await apiRequest("/api/rewards");
      
      assert.strictEqual(response.ok, true, "Response should be OK");
      assert.strictEqual(data.success, true, "Should have success field");
      assert.strictEqual(Array.isArray(data.rewards), true, "rewards should be array");
    });
  });
});
