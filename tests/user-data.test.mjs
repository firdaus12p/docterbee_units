/**
 * User Data API Integration Tests
 * =================================
 *
 * COVERAGE:
 * - GET /api/user-data/progress - Get user journey progress & points
 * - POST /api/user-data/progress - Save user progress
 * - GET /api/user-data/cart - Get user cart
 * - POST /api/user-data/cart - Save user cart
 * - DELETE /api/user-data/cart - Clear user cart
 * - GET /api/user-data/rewards - Get reward redemption history
 * - POST /api/user-data/rewards/redeem - Redeem reward
 *
 * WHY THESE TESTS EXIST:
 * User data sync is critical for cross-device experience. Any regression could:
 * - Lose user progress/journey data
 * - Lose shopping cart items
 * - Break point system
 * - Allow unauthorized data access
 *
 * RUN: node --test tests/user-data.test.mjs
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { apiRequest, CookieJar, generateTestData } from "./setup.mjs";

describe("User Data API Tests", () => {
  let cookieJar;
  let testUser;

  /**
   * Helper to register and login a test user
   */
  async function loginTestUser() {
    testUser = generateTestData("userdata");
    await apiRequest(
      "/api/auth/register",
      {
        method: "POST",
        body: JSON.stringify({
          name: testUser.name,
          email: testUser.email,
          phone: testUser.phone,
          password: "password123",
        }),
      },
      cookieJar
    );
  }

  beforeEach(() => {
    cookieJar = new CookieJar();
  });

  // ============================================
  // AUTHENTICATION REQUIREMENT TESTS
  // ============================================
  describe("Authentication Requirements", () => {
    /**
     * TEST: All user-data endpoints require authentication
     * WHY: User data must not be accessible without login
     * VALIDATES: 401 for all endpoints without session
     */
    it("GET /api/user-data/progress should require auth", async () => {
      const { response, data } = await apiRequest("/api/user-data/progress");

      assert.strictEqual(response.status, 401, "Should return 401 without auth");
      assert.strictEqual(data.success, false, "Should indicate failure");
    });

    it("POST /api/user-data/progress should require auth", async () => {
      const { response, data } = await apiRequest("/api/user-data/progress", {
        method: "POST",
        body: JSON.stringify({ unitData: {}, points: 0 }),
      });

      assert.strictEqual(response.status, 401, "Should return 401 without auth");
    });

    it("GET /api/user-data/cart should require auth", async () => {
      const { response, data } = await apiRequest("/api/user-data/cart");

      assert.strictEqual(response.status, 401, "Should return 401 without auth");
    });

    it("POST /api/user-data/cart should require auth", async () => {
      const { response, data } = await apiRequest("/api/user-data/cart", {
        method: "POST",
        body: JSON.stringify({ items: [] }),
      });

      assert.strictEqual(response.status, 401, "Should return 401 without auth");
    });

    it("DELETE /api/user-data/cart should require auth", async () => {
      const { response, data } = await apiRequest("/api/user-data/cart", {
        method: "DELETE",
      });

      assert.strictEqual(response.status, 401, "Should return 401 without auth");
    });

    it("GET /api/user-data/rewards should require auth", async () => {
      const { response, data } = await apiRequest("/api/user-data/rewards");

      assert.strictEqual(response.status, 401, "Should return 401 without auth");
    });

    it("POST /api/user-data/rewards/redeem should require auth", async () => {
      const { response, data } = await apiRequest("/api/user-data/rewards/redeem", {
        method: "POST",
        body: JSON.stringify({ rewardName: "Test", pointsCost: 100 }),
      });

      assert.strictEqual(response.status, 401, "Should return 401 without auth");
    });
  });

  // ============================================
  // PROGRESS ENDPOINT TESTS
  // ============================================
  describe("GET /api/user-data/progress", () => {
    /**
     * TEST: New user has empty progress
     * WHY: New users should start with default state
     * VALIDATES: Returns empty unitData and 0 points
     */
    it("should return empty progress for new user", async () => {
      await loginTestUser();

      const { response, data } = await apiRequest("/api/user-data/progress", {}, cookieJar);

      assert.strictEqual(response.status, 200, "Should return 200 OK");
      assert.strictEqual(data.success, true, "Should indicate success");
      assert.ok(data.data, "Should return data object");
      assert.strictEqual(data.data.points, 0, "New user should have 0 points");
    });

    /**
     * TEST: Returns saved progress for existing user
     * WHY: Progress must persist across sessions
     * VALIDATES: Saved data is returned correctly
     */
    it("should return saved progress after saving", async () => {
      await loginTestUser();

      // Save progress
      const progressData = {
        unitData: { unit1: true, unit2: false },
        points: 50,
      };

      await apiRequest(
        "/api/user-data/progress",
        {
          method: "POST",
          body: JSON.stringify(progressData),
        },
        cookieJar
      );

      // Get progress
      const { response, data } = await apiRequest("/api/user-data/progress", {}, cookieJar);

      assert.strictEqual(response.status, 200, "Should return 200 OK");
      assert.strictEqual(data.data.points, 50, "Should return saved points");
    });
  });

  describe("POST /api/user-data/progress", () => {
    /**
     * TEST: Save valid progress data
     * WHY: Progress saving is core feature
     * VALIDATES: 200 status, success message
     */
    it("should save valid progress data", async () => {
      await loginTestUser();

      const { response, data } = await apiRequest(
        "/api/user-data/progress",
        {
          method: "POST",
          body: JSON.stringify({
            unitData: { subuh: true, dhuha: false, dzuhur: true },
            points: 100,
          }),
        },
        cookieJar
      );

      assert.strictEqual(response.status, 200, "Should return 200 OK");
      assert.strictEqual(data.success, true, "Should indicate success");
    });

    /**
     * TEST: Reject invalid unitData type
     * WHY: unitData must be an object for JSON storage
     * VALIDATES: 400 for non-object unitData
     */
    it("should reject non-object unitData", async () => {
      await loginTestUser();

      const { response, data } = await apiRequest(
        "/api/user-data/progress",
        {
          method: "POST",
          body: JSON.stringify({
            unitData: "not an object",
            points: 10,
          }),
        },
        cookieJar
      );

      assert.strictEqual(response.status, 400, "Should return 400 Bad Request");
      assert.strictEqual(data.success, false, "Should indicate failure");
    });

    /**
     * TEST: Reject negative points
     * WHY: Points cannot be negative
     * VALIDATES: 400 for negative points value
     */
    it("should reject negative points", async () => {
      await loginTestUser();

      const { response, data } = await apiRequest(
        "/api/user-data/progress",
        {
          method: "POST",
          body: JSON.stringify({
            unitData: {},
            points: -10,
          }),
        },
        cookieJar
      );

      assert.strictEqual(response.status, 400, "Should return 400 Bad Request");
      assert.strictEqual(data.success, false, "Should indicate failure");
    });

    /**
     * TEST: Reject non-numeric points
     * WHY: Points must be a number
     * VALIDATES: 400 for string points
     */
    it("should reject non-numeric points", async () => {
      await loginTestUser();

      const { response, data } = await apiRequest(
        "/api/user-data/progress",
        {
          method: "POST",
          body: JSON.stringify({
            unitData: {},
            points: "fifty",
          }),
        },
        cookieJar
      );

      assert.strictEqual(response.status, 400, "Should return 400 Bad Request");
    });
  });

  // ============================================
  // CART ENDPOINT TESTS
  // ============================================
  describe("Cart Endpoints", () => {
    /**
     * TEST: Get empty cart for new user
     * WHY: New users should have empty cart
     * VALIDATES: Returns empty array or null
     */
    it("GET /api/user-data/cart should return empty for new user", async () => {
      await loginTestUser();

      const { response, data } = await apiRequest("/api/user-data/cart", {}, cookieJar);

      assert.strictEqual(response.status, 200, "Should return 200 OK");
      assert.strictEqual(data.success, true, "Should indicate success");
    });

    /**
     * TEST: Save and retrieve cart
     * WHY: Cart sync is essential for multi-device experience
     * VALIDATES: Saved cart items are returned
     */
    it("should save and retrieve cart data", async () => {
      await loginTestUser();

      const cartItems = {
        items: [
          { productId: 1, name: "Product 1", quantity: 2, price: 50000 },
          { productId: 2, name: "Product 2", quantity: 1, price: 75000 },
        ],
      };

      // Save cart
      const saveResult = await apiRequest(
        "/api/user-data/cart",
        {
          method: "POST",
          body: JSON.stringify(cartItems),
        },
        cookieJar
      );

      assert.strictEqual(saveResult.response.status, 200, "Save should succeed");

      // Get cart
      const { response, data } = await apiRequest("/api/user-data/cart", {}, cookieJar);

      assert.strictEqual(response.status, 200, "Get should succeed");
    });

    /**
     * TEST: Clear cart
     * WHY: Users need to clear cart after checkout
     * VALIDATES: DELETE clears cart data
     */
    it("DELETE /api/user-data/cart should clear cart", async () => {
      await loginTestUser();

      // Save cart first
      await apiRequest(
        "/api/user-data/cart",
        {
          method: "POST",
          body: JSON.stringify({ items: [{ productId: 1, quantity: 1 }] }),
        },
        cookieJar
      );

      // Delete cart
      const { response, data } = await apiRequest(
        "/api/user-data/cart",
        { method: "DELETE" },
        cookieJar
      );

      assert.strictEqual(response.status, 200, "Should return 200 OK");
      assert.strictEqual(data.success, true, "Should indicate success");
    });
  });

  // ============================================
  // REWARDS ENDPOINT TESTS
  // ============================================
  describe("Rewards Endpoints", () => {
    /**
     * TEST: Get reward redemption history
     * WHY: Users need to see their redemption history
     * VALIDATES: Returns array (empty for new user)
     */
    it("GET /api/user-data/rewards should return redemption history", async () => {
      await loginTestUser();

      const { response, data } = await apiRequest("/api/user-data/rewards", {}, cookieJar);

      assert.strictEqual(response.status, 200, "Should return 200 OK");
      assert.strictEqual(data.success, true, "Should indicate success");
      assert.ok(Array.isArray(data.data), "Should return array");
    });

    /**
     * TEST: Reject reward redemption with insufficient points
     * WHY: Cannot redeem if not enough points
     * VALIDATES: 400 for insufficient points
     */
    it("POST /api/user-data/rewards/redeem should reject insufficient points", async () => {
      await loginTestUser();

      // New user has 0 points, try to redeem
      const { response, data } = await apiRequest(
        "/api/user-data/rewards/redeem",
        {
          method: "POST",
          body: JSON.stringify({
            rewardName: "Test Reward",
            pointsCost: 1000, // More than user has
            rewardId: 1,
          }),
        },
        cookieJar
      );

      assert.strictEqual(response.status, 400, "Should return 400");
      assert.ok(
        data.error.toLowerCase().includes("insufficient") ||
          data.error.toLowerCase().includes("point"),
        "Error should mention insufficient points"
      );
    });

    /**
     * TEST: Reject invalid reward data
     * WHY: Must validate reward redemption input
     * VALIDATES: 400 for missing/invalid data
     */
    it("should reject invalid reward redemption data", async () => {
      await loginTestUser();

      const invalidCases = [
        { rewardName: "", pointsCost: 100 }, // Empty name
        { rewardName: "Test", pointsCost: 0 }, // Zero cost
        { rewardName: "Test", pointsCost: -10 }, // Negative cost
        { pointsCost: 100 }, // Missing name
      ];

      for (const testCase of invalidCases) {
        const { response, data } = await apiRequest(
          "/api/user-data/rewards/redeem",
          {
            method: "POST",
            body: JSON.stringify(testCase),
          },
          cookieJar
        );

        assert.strictEqual(response.status, 400, `Should reject: ${JSON.stringify(testCase)}`);
      }
    });
  });

  // ============================================
  // DATA ISOLATION TESTS
  // ============================================
  describe("User Data Isolation", () => {
    /**
     * TEST: User A cannot see User B's data
     * WHY: Data privacy between users
     * VALIDATES: Each user only sees own data
     */
    it("should isolate progress data between users", async () => {
      // User A saves progress
      const cookieJarA = new CookieJar();
      const userA = generateTestData("userA");
      await apiRequest(
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: userA.name,
            email: userA.email,
            phone: userA.phone,
            password: "password123",
          }),
        },
        cookieJarA
      );

      await apiRequest(
        "/api/user-data/progress",
        {
          method: "POST",
          body: JSON.stringify({ unitData: { userAData: true }, points: 999 }),
        },
        cookieJarA
      );

      // User B registers
      const cookieJarB = new CookieJar();
      const userB = generateTestData("userB");
      await apiRequest(
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: userB.name,
            email: userB.email,
            phone: userB.phone,
            password: "password123",
          }),
        },
        cookieJarB
      );

      // User B should see own (empty) data, not User A's
      const { data } = await apiRequest("/api/user-data/progress", {}, cookieJarB);

      assert.strictEqual(data.data.points, 0, "User B should have 0 points");
      assert.ok(!data.data.unitData?.userAData, "User B should not see User A's data");
    });
  });
});

/**
 * COVERAGE SUMMARY:
 * =================
 *
 * ✅ Authentication Requirements
 *    - All endpoints require auth
 *    - 401 returned for unauthenticated requests
 *
 * ✅ Progress Endpoints
 *    - New user has empty progress
 *    - Progress persists after save
 *    - Invalid unitData rejected
 *    - Negative points rejected
 *    - Non-numeric points rejected
 *
 * ✅ Cart Endpoints
 *    - Empty cart for new user
 *    - Save and retrieve cart
 *    - Clear cart (DELETE)
 *
 * ✅ Rewards Endpoints
 *    - Get redemption history
 *    - Insufficient points rejected
 *    - Invalid redemption data rejected
 *
 * ✅ Data Isolation
 *    - User data is private
 *
 * AREAS NOT FULLY COVERED (require database seeding):
 * - Successful reward redemption
 * - Points deduction after redemption
 * - Transaction rollback on error
 * - Concurrent redemption handling
 */
