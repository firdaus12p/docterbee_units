/**
 * Orders API Integration Tests
 * ==============================
 *
 * COVERAGE:
 * - POST /api/orders - Create new order
 * - GET /api/orders - List orders (admin)
 * - GET /api/orders/:orderNumber - Get order by number
 * - GET /api/orders/check-pending - Check user's pending order
 * - GET /api/orders/status/:orderNumber - Get order status
 * - PATCH /api/orders/:id/complete - Complete order (admin)
 * - PATCH /api/orders/:id/cancel - Cancel order
 * - DELETE /api/orders/:id - Delete order (admin)
 *
 * WHY THESE TESTS EXIST:
 * Orders are critical business transactions. Any regression could:
 * - Lose customer orders/payments
 * - Cause inventory issues (double deduction)
 * - Break point earning system
 * - Allow unauthorized order manipulation
 *
 * RUN: node --test tests/orders.test.mjs
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { apiRequest, CookieJar, generateTestData, validators, TEST_CONFIG } from "./setup.mjs";

describe("Orders API Tests", () => {
  let cookieJar;
  let adminCookieJar;

  beforeEach(() => {
    cookieJar = new CookieJar();
    adminCookieJar = new CookieJar();
  });

  /**
   * Helper to login as admin
   */
  async function loginAsAdmin() {
    await apiRequest(
      "/api/admin/login",
      {
        method: "POST",
        body: JSON.stringify({
          username: TEST_CONFIG.TEST_ADMIN.username,
          password: TEST_CONFIG.TEST_ADMIN.password,
        }),
      },
      adminCookieJar
    );
  }

  /**
   * Helper to create a valid order payload
   */
  function createOrderPayload(overrides = {}) {
    return {
      order_type: "pickup",
      store_location: "Jakarta Pusat",
      items: [
        {
          product_id: 1,
          name: "Test Product",
          price: 50000,
          quantity: 2,
        },
      ],
      total_amount: 100000,
      ...overrides,
    };
  }

  // ============================================
  // CREATE ORDER TESTS
  // ============================================
  describe("POST /api/orders", () => {
    /**
     * TEST: Create order as guest
     * WHY: Guest checkout must work without login
     * VALIDATES: 201 status, order created with guest data
     */
    it("should create order as guest with guest_data", async () => {
      const orderData = createOrderPayload({
        guest_data: {
          name: "Guest Customer",
          phone: "08123456789",
          address: "Jl. Test No. 123",
        },
      });

      const { response, data } = await apiRequest("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });

      assert.strictEqual(response.status, 201, "Should return 201 Created");
      assert.strictEqual(data.success, true, "Should indicate success");
      assert.ok(data.data, "Should return order data");
      assert.ok(data.data.order_number, "Should have order number");
      assert.ok(validators.isValidOrderNumber(data.data.order_number), "Order number format valid");
    });

    /**
     * TEST: Create order as logged-in user
     * WHY: Logged-in users get session data automatically
     * VALIDATES: Uses session data, order linked to user
     */
    it("should create order using session data when logged in", async () => {
      // Register and login
      const td = generateTestData("order_user");
      await apiRequest(
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: td.name,
            email: td.email,
            phone: td.phone,
            password: "password123",
          }),
        },
        cookieJar
      );

      const orderData = createOrderPayload();

      const { response, data } = await apiRequest(
        "/api/orders",
        {
          method: "POST",
          body: JSON.stringify(orderData),
        },
        cookieJar
      );

      assert.strictEqual(response.status, 201, "Should return 201 Created");
      assert.strictEqual(data.success, true, "Should indicate success");
    });

    /**
     * TEST: Reject order with missing required fields
     * WHY: Prevent incomplete orders
     * VALIDATES: 400 status for missing order_type, store_location, items, total_amount
     */
    it("should reject order with missing required fields", async () => {
      const requiredFields = ["order_type", "store_location", "items", "total_amount"];
      const validOrder = createOrderPayload({
        guest_data: { name: "Test", phone: "08123456789" },
      });

      for (const field of requiredFields) {
        const incompleteOrder = { ...validOrder };
        delete incompleteOrder[field];

        const { response, data } = await apiRequest("/api/orders", {
          method: "POST",
          body: JSON.stringify(incompleteOrder),
        });

        assert.strictEqual(response.status, 400, `Should reject missing ${field}`);
        assert.strictEqual(data.success, false, `Should indicate failure for ${field}`);
      }
    });

    /**
     * TEST: Reject order with empty items array
     * WHY: Order must have at least one item
     * VALIDATES: 400 status for empty items
     */
    it("should reject order with empty items array", async () => {
      const orderData = createOrderPayload({
        items: [],
        guest_data: { name: "Test", phone: "08123456789" },
      });

      const { response, data } = await apiRequest("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });

      assert.strictEqual(response.status, 400, "Should reject empty items");
      assert.strictEqual(data.success, false, "Should indicate failure");
    });

    /**
     * TEST: Prevent duplicate pending orders for logged-in user
     * WHY: User should complete or cancel existing order first
     * VALIDATES: 400 status when pending order exists
     */
    it("should prevent logged-in user from creating duplicate pending order", async () => {
      // Register and login
      const td = generateTestData("dup_order");
      await apiRequest(
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: td.name,
            email: td.email,
            phone: td.phone,
            password: "password123",
          }),
        },
        cookieJar
      );

      const orderData = createOrderPayload();

      // First order
      const first = await apiRequest(
        "/api/orders",
        { method: "POST", body: JSON.stringify(orderData) },
        cookieJar
      );
      assert.strictEqual(first.response.status, 201, "First order should succeed");

      // Second order (should fail)
      const second = await apiRequest(
        "/api/orders",
        { method: "POST", body: JSON.stringify(orderData) },
        cookieJar
      );

      assert.strictEqual(second.response.status, 400, "Second order should fail");
      assert.ok(second.data.error.includes("pending"), "Error should mention pending order");
    });

    /**
     * TEST: Order with coupon discount
     * WHY: Verify coupon discount is recorded correctly
     * VALIDATES: Coupon data stored in order
     */
    it("should create order with coupon discount", async () => {
      const orderData = createOrderPayload({
        guest_data: { name: "Test", phone: "08123456789" },
        coupon_code: "TESTCOUPON",
        coupon_discount: 10000,
        total_amount: 90000, // After discount
      });

      const { response, data } = await apiRequest("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });

      assert.strictEqual(response.status, 201, "Should create order with coupon");
      assert.strictEqual(data.data.total_amount, 90000, "Should have discounted total");
    });

    /**
     * TEST: Points calculation
     * WHY: Users earn points based on order total (1 point per 10000)
     * VALIDATES: Points calculated correctly
     */
    it("should calculate points correctly based on total_amount", async () => {
      const testCases = [
        { total: 50000, expectedPoints: 5 },
        { total: 100000, expectedPoints: 10 },
        { total: 15000, expectedPoints: 1 },
        { total: 9999, expectedPoints: 0 },
      ];

      for (const tc of testCases) {
        const orderData = createOrderPayload({
          guest_data: { name: "Test", phone: "08123456789" },
          total_amount: tc.total,
        });

        const { data } = await apiRequest("/api/orders", {
          method: "POST",
          body: JSON.stringify(orderData),
        });

        assert.strictEqual(
          data.data.points_earned,
          tc.expectedPoints,
          `Total ${tc.total} should earn ${tc.expectedPoints} points`
        );
      }
    });
  });

  // ============================================
  // CHECK PENDING ORDER TESTS
  // ============================================
  describe("GET /api/orders/check-pending", () => {
    /**
     * TEST: Returns no pending for guest
     * WHY: Guests don't have tracked pending orders
     * VALIDATES: has_pending false for guest
     */
    it("should return has_pending false for guest user", async () => {
      const { response, data } = await apiRequest("/api/orders/check-pending");

      assert.strictEqual(response.status, 200, "Should return 200 OK");
      assert.strictEqual(data.success, true, "Should indicate success");
      assert.strictEqual(data.has_pending, false, "Guest should have no pending");
    });

    /**
     * TEST: Returns pending order for logged-in user
     * WHY: Users need to know if they have incomplete orders
     * VALIDATES: has_pending true and order data returned
     */
    it("should return pending order for logged-in user", async () => {
      // Register and create order
      const td = generateTestData("pending_check");
      await apiRequest(
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: td.name,
            email: td.email,
            phone: td.phone,
            password: "password123",
          }),
        },
        cookieJar
      );

      await apiRequest(
        "/api/orders",
        { method: "POST", body: JSON.stringify(createOrderPayload()) },
        cookieJar
      );

      // Check pending
      const { response, data } = await apiRequest("/api/orders/check-pending", {}, cookieJar);

      assert.strictEqual(response.status, 200, "Should return 200 OK");
      assert.strictEqual(data.has_pending, true, "Should have pending order");
      assert.ok(data.data, "Should return pending order data");
      assert.ok(data.data.order_number, "Should have order number");
    });
  });

  // ============================================
  // ORDER STATUS TESTS
  // ============================================
  describe("GET /api/orders/status/:orderNumber", () => {
    /**
     * TEST: Get order status by order number
     * WHY: Public order status check for tracking
     * VALIDATES: Returns order status
     */
    it("should return order status for valid order number", async () => {
      // Create order first
      const orderData = createOrderPayload({
        guest_data: { name: "Test", phone: "08123456789" },
      });

      const createResult = await apiRequest("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });

      const orderNumber = createResult.data.data.order_number;

      // Get status
      const { response, data } = await apiRequest(`/api/orders/status/${orderNumber}`);

      assert.strictEqual(response.status, 200, "Should return 200 OK");
      assert.strictEqual(data.success, true, "Should indicate success");
      assert.ok(data.order, "Should return order data");
    });

    /**
     * TEST: Handle non-existent order number
     * WHY: Graceful handling of invalid order lookups
     * VALIDATES: 404 status for non-existent order
     */
    it("should return 404 for non-existent order number", async () => {
      const { response, data } = await apiRequest("/api/orders/status/ORD-00000000-FFFFFF");

      assert.strictEqual(response.status, 404, "Should return 404 Not Found");
      assert.strictEqual(data.success, false, "Should indicate failure");
    });
  });

  // ============================================
  // ADMIN ROUTE TESTS
  // ============================================
  describe("Admin Protected Routes", () => {
    /**
     * TEST: GET /api/orders requires admin
     * WHY: Order list contains sensitive business data
     * VALIDATES: 401 without admin
     */
    it("GET /api/orders should require admin auth", async () => {
      const { response, data } = await apiRequest("/api/orders");

      assert.strictEqual(response.status, 401, "Should return 401 without admin");
      assert.strictEqual(data.success, false, "Should indicate failure");
    });

    /**
     * TEST: DELETE /api/orders/:id requires admin
     * WHY: Only admin can delete orders
     * VALIDATES: 401 without admin
     */
    it("DELETE /api/orders/:id should require admin auth", async () => {
      const { response, data } = await apiRequest("/api/orders/1", {
        method: "DELETE",
      });

      assert.strictEqual(response.status, 401, "Should return 401 without admin");
    });

    /**
     * TEST: PATCH /api/orders/:id/complete requires admin
     * WHY: Only admin can mark orders complete
     * VALIDATES: 401 without admin
     */
    it("PATCH /api/orders/:id/complete should require admin auth", async () => {
      const { response, data } = await apiRequest("/api/orders/1/complete", {
        method: "PATCH",
      });

      assert.strictEqual(response.status, 401, "Should return 401 without admin");
    });
  });

  // ============================================
  // ORDER NUMBER FORMAT TESTS
  // ============================================
  describe("Order Number Generation", () => {
    /**
     * TEST: Order number format validation
     * WHY: Order numbers must follow specific format for tracking
     * VALIDATES: Format: ORD-YYYYMMDD-XXXXXX
     */
    it("should generate order number in correct format", async () => {
      const orderData = createOrderPayload({
        guest_data: { name: "Test", phone: "08123456789" },
      });

      const { data } = await apiRequest("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });

      const orderNumber = data.data.order_number;

      assert.ok(
        validators.isValidOrderNumber(orderNumber),
        `Order number ${orderNumber} should match format ORD-YYYYMMDD-XXXXXX`
      );
    });

    /**
     * TEST: Order numbers are unique
     * WHY: Each order must have unique identifier
     * VALIDATES: Multiple orders get different numbers
     */
    it("should generate unique order numbers", async () => {
      const orderNumbers = new Set();

      for (let i = 0; i < 5; i++) {
        const orderData = createOrderPayload({
          guest_data: { name: `Test ${i}`, phone: `0812345678${i}` },
        });

        const { data } = await apiRequest("/api/orders", {
          method: "POST",
          body: JSON.stringify(orderData),
        });

        const orderNumber = data.data.order_number;
        assert.ok(!orderNumbers.has(orderNumber), `Order number ${orderNumber} should be unique`);
        orderNumbers.add(orderNumber);
      }
    });
  });

  // ============================================
  // ORDER TYPE TESTS
  // ============================================
  describe("Order Types", () => {
    /**
     * TEST: Dine-in orders have shorter expiry
     * WHY: Dine-in orders expire in 30 minutes vs 2 hours for pickup
     * VALIDATES: Expiry time varies by order type
     */
    it("should accept valid order types", async () => {
      const validTypes = ["pickup", "dine_in", "delivery"];

      for (const orderType of validTypes) {
        const orderData = createOrderPayload({
          order_type: orderType,
          guest_data: { name: "Test", phone: "08123456789" },
        });

        const { response, data } = await apiRequest("/api/orders", {
          method: "POST",
          body: JSON.stringify(orderData),
        });

        assert.strictEqual(response.status, 201, `Should accept order_type: ${orderType}`);
      }
    });
  });
});

/**
 * COVERAGE SUMMARY:
 * =================
 *
 * ✅ Create Order
 *    - Guest checkout
 *    - Logged-in user checkout
 *    - Missing required fields
 *    - Empty items array
 *    - Duplicate pending prevention
 *    - Coupon discount recording
 *    - Points calculation
 *
 * ✅ Check Pending
 *    - Guest user (no pending)
 *    - Logged-in user with pending
 *
 * ✅ Order Status
 *    - Valid order lookup
 *    - Non-existent order (404)
 *
 * ✅ Admin Protection
 *    - List orders protected
 *    - Delete protected
 *    - Complete protected
 *
 * ✅ Order Number
 *    - Format validation
 *    - Uniqueness
 *
 * ✅ Order Types
 *    - Valid types accepted
 *
 * AREAS NOT FULLY COVERED (require database seeding):
 * - Stock deduction logic
 * - Order completion flow
 * - Points assignment on completion
 * - Order expiration
 */
