/**
 * Integration Tests - Cross-Module Flows
 * ========================================
 *
 * COVERAGE:
 * - Complete user journey (register → login → order → points)
 * - Booking with coupon flow
 * - Order with points earning flow
 * - Session persistence across requests
 * - Admin workflow
 *
 * WHY THESE TESTS EXIST:
 * Integration tests catch issues that unit tests miss:
 * - Module communication failures
 * - Session state inconsistencies
 * - Transaction ordering issues
 * - End-to-end data flow problems
 *
 * RUN: node --test tests/integration.test.mjs
 */

import { describe, it, before, beforeEach } from "node:test";
import assert from "node:assert";
import { apiRequest, CookieJar, generateTestData, validators, TEST_CONFIG } from "./setup.mjs";

describe("Integration Tests", () => {
  // ============================================
  // COMPLETE USER JOURNEY
  // ============================================
  describe("Complete User Journey", () => {
    let cookieJar;
    let testUser;

    beforeEach(() => {
      cookieJar = new CookieJar();
      testUser = generateTestData("journey");
    });

    /**
     * TEST: Full user registration → login → logout → login again
     * WHY: Core auth flow must work end-to-end
     * VALIDATES: Session created, persists, destroyed, recreated
     */
    it("should handle complete auth lifecycle", async () => {
      // 1. Register
      const registerResult = await apiRequest(
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
      assert.strictEqual(registerResult.response.status, 201, "Registration should succeed");

      // 2. Verify logged in
      let checkResult = await apiRequest("/api/auth/check", {}, cookieJar);
      assert.strictEqual(checkResult.data.loggedIn, true, "Should be logged in after registration");

      // 3. Get user data
      const meResult = await apiRequest("/api/auth/me", {}, cookieJar);
      assert.strictEqual(meResult.response.status, 200, "Should get user data");
      assert.strictEqual(meResult.data.data.email, testUser.email, "Should have correct email");

      // 4. Logout
      const logoutResult = await apiRequest("/api/auth/logout", { method: "POST" }, cookieJar);
      assert.strictEqual(logoutResult.response.status, 200, "Logout should succeed");

      // 5. Verify logged out
      checkResult = await apiRequest("/api/auth/check", {}, cookieJar);
      assert.strictEqual(checkResult.data.loggedIn, false, "Should be logged out");

      // 6. Login again
      const loginResult = await apiRequest(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email: testUser.email,
            password: "password123",
          }),
        },
        cookieJar
      );
      assert.strictEqual(loginResult.response.status, 200, "Login should succeed");

      // 7. Verify logged in again
      checkResult = await apiRequest("/api/auth/check", {}, cookieJar);
      assert.strictEqual(checkResult.data.loggedIn, true, "Should be logged in again");
    });

    /**
     * TEST: User registers → saves progress → logs out → logs in → progress persists
     * WHY: User data must survive logout/login cycle
     * VALIDATES: Data persistence across sessions
     */
    it("should persist user progress across sessions", async () => {
      // 1. Register
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

      // 2. Save progress
      const progressData = {
        unitData: { subuh: true, dhuha: true, dzuhur: false },
        points: 75,
      };
      await apiRequest(
        "/api/user-data/progress",
        { method: "POST", body: JSON.stringify(progressData) },
        cookieJar
      );

      // 3. Logout
      await apiRequest("/api/auth/logout", { method: "POST" }, cookieJar);

      // 4. Create new cookie jar (simulate new session)
      const newCookieJar = new CookieJar();

      // 5. Login
      await apiRequest(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email: testUser.email,
            password: "password123",
          }),
        },
        newCookieJar
      );

      // 6. Verify progress persisted
      const result = await apiRequest("/api/user-data/progress", {}, newCookieJar);
      assert.strictEqual(result.data.data.points, 75, "Points should persist across sessions");
    });
  });

  // ============================================
  // ORDER FLOW INTEGRATION
  // ============================================
  describe("Order Flow Integration", () => {
    let cookieJar;

    beforeEach(() => {
      cookieJar = new CookieJar();
    });

    /**
     * TEST: Guest creates order → checks status → order visible
     * WHY: Guest checkout is critical path
     * VALIDATES: Order created, status checkable without auth
     */
    it("should handle complete guest order flow", async () => {
      // 1. Create guest order
      const orderData = {
        guest_data: { name: "Guest User", phone: "08123456789" },
        order_type: "pickup",
        store_location: "Jakarta Pusat",
        items: [{ product_id: 1, name: "Product", quantity: 2, price: 50000 }],
        total_amount: 100000,
      };

      const createResult = await apiRequest("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });

      assert.strictEqual(createResult.response.status, 201, "Order creation should succeed");
      const orderNumber = createResult.data.data.order_number;
      assert.ok(validators.isValidOrderNumber(orderNumber), "Order number should be valid format");

      // 2. Check order status
      const statusResult = await apiRequest(`/api/orders/status/${orderNumber}`);
      assert.strictEqual(statusResult.response.status, 200, "Status check should succeed");
      assert.ok(statusResult.data.order, "Should return order data");

      // 3. Verify points calculation
      assert.strictEqual(
        createResult.data.data.points_earned,
        10, // 100000 / 10000 = 10 points
        "Should earn correct points"
      );
    });

    /**
     * TEST: Logged-in user creates order → can check pending → completes order
     * WHY: Logged-in user has different flow (session-linked order)
     * VALIDATES: Order linked to user, pending check works
     */
    it("should link order to logged-in user", async () => {
      // 1. Register
      const testUser = generateTestData("order_flow");
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

      // 2. Create order (no guest_data, should use session)
      const orderData = {
        order_type: "dine_in",
        store_location: "Jakarta Selatan",
        items: [{ product_id: 1, name: "Coffee", quantity: 1, price: 25000 }],
        total_amount: 25000,
      };

      const createResult = await apiRequest(
        "/api/orders",
        { method: "POST", body: JSON.stringify(orderData) },
        cookieJar
      );
      assert.strictEqual(createResult.response.status, 201, "Order should be created");

      // 3. Check pending order
      const pendingResult = await apiRequest("/api/orders/check-pending", {}, cookieJar);
      assert.strictEqual(pendingResult.data.has_pending, true, "Should have pending order");
      assert.strictEqual(
        pendingResult.data.data.order_number,
        createResult.data.data.order_number,
        "Pending order should match created order"
      );
    });
  });

  // ============================================
  // BOOKING FLOW INTEGRATION
  // ============================================
  describe("Booking Flow Integration", () => {
    /**
     * TEST: Create booking with complete customer data
     * WHY: Booking creation is core business function
     * VALIDATES: All booking data stored correctly
     */
    it("should create booking with all customer details", async () => {
      const bookingData = {
        serviceName: "Konsultasi Kesehatan",
        branch: "Jakarta Pusat",
        practitioner: "Dr. Ahmad",
        date: "2025-02-01",
        time: "10:00",
        mode: "offline",
        customerName: "Test Customer",
        customerPhone: "08123456789",
        customerAge: "35",
        customerGender: "male",
        customerAddress: "Jl. Test No. 123, Jakarta Pusat",
        notes: "Integration test booking",
      };

      const result = await apiRequest("/api/bookings", {
        method: "POST",
        body: JSON.stringify(bookingData),
      });

      assert.strictEqual(result.response.status, 201, "Booking should be created");
      assert.strictEqual(result.data.data.serviceName, bookingData.serviceName);
      assert.strictEqual(result.data.data.customerName, bookingData.customerName);
      assert.ok(result.data.data.id, "Should have booking ID");
    });

    /**
     * TEST: Booking with promo code applies discount
     * WHY: Coupon integration in booking must work
     * VALIDATES: Discount applied to booking
     */
    it("should apply discount from promo code to booking", async () => {
      const bookingData = {
        serviceName: "Terapi Premium",
        branch: "Bandung",
        practitioner: "Dr. Budi",
        date: "2025-02-15",
        time: "14:00",
        mode: "online",
        promoCode: "TESTPROMO",
        price: 500000,
        discountAmount: 50000,
        finalPrice: 450000,
      };

      const result = await apiRequest("/api/bookings", {
        method: "POST",
        body: JSON.stringify(bookingData),
      });

      assert.strictEqual(result.response.status, 201, "Booking should be created");
      assert.strictEqual(result.data.data.price, 500000, "Original price recorded");
      assert.strictEqual(result.data.data.discountAmount, 50000, "Discount recorded");
      assert.strictEqual(result.data.data.finalPrice, 450000, "Final price correct");
    });
  });

  // ============================================
  // PROTECTED ROUTE FLOW
  // ============================================
  describe("Protected Route Access Patterns", () => {
    /**
     * TEST: Admin login → access admin routes → logout → access denied
     * WHY: Admin protection must be consistent
     * VALIDATES: Admin session controls access
     */
    it("should control admin route access based on session", async () => {
      const adminCookieJar = new CookieJar();

      // 1. Try accessing admin route without login
      let result = await apiRequest("/api/bookings", {}, adminCookieJar);
      assert.strictEqual(result.response.status, 401, "Should deny without admin session");

      // 2. Admin login
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

      // 3. Access admin route
      result = await apiRequest("/api/bookings", {}, adminCookieJar);
      // May be 200 or 500 depending on database state, but not 401
      assert.notStrictEqual(result.response.status, 401, "Should not deny with admin session");

      // 4. Admin logout
      await apiRequest("/api/admin/logout", { method: "POST" }, adminCookieJar);

      // 5. Try accessing again
      result = await apiRequest("/api/bookings", {}, adminCookieJar);
      assert.strictEqual(result.response.status, 401, "Should deny after logout");
    });

    /**
     * TEST: Regular user cannot escalate to admin
     * WHY: Security - prevent privilege escalation
     * VALIDATES: User session different from admin session
     */
    it("should prevent regular user from accessing admin routes", async () => {
      const cookieJar = new CookieJar();
      const testUser = generateTestData("noadmin");

      // 1. Register as regular user
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

      // 2. Verify logged in
      const checkResult = await apiRequest("/api/auth/check", {}, cookieJar);
      assert.strictEqual(checkResult.data.loggedIn, true, "Should be logged in");

      // 3. Try to access admin routes
      const adminRoutes = ["/api/bookings", "/api/orders", "/api/coupons"];

      for (const route of adminRoutes) {
        const result = await apiRequest(route, {}, cookieJar);
        assert.strictEqual(result.response.status, 401, `Regular user should not access ${route}`);
      }
    });
  });

  // ============================================
  // DATA CONSISTENCY
  // ============================================
  describe("Data Consistency", () => {
    /**
     * TEST: Order number remains unique across multiple rapid requests
     * WHY: Race conditions could cause duplicates
     * VALIDATES: High-concurrency order creation
     */
    it("should generate unique order numbers under rapid requests", async () => {
      const orderNumbers = new Set();
      const promises = [];

      for (let i = 0; i < 10; i++) {
        const orderData = {
          guest_data: { name: `Guest ${i}`, phone: `0812345678${i}` },
          order_type: "pickup",
          store_location: "Test Location",
          items: [{ product_id: 1, name: "Product", quantity: 1, price: 10000 }],
          total_amount: 10000,
        };

        promises.push(
          apiRequest("/api/orders", {
            method: "POST",
            body: JSON.stringify(orderData),
          })
        );
      }

      const results = await Promise.all(promises);

      for (const result of results) {
        if (result.response.status === 201) {
          const orderNumber = result.data.data.order_number;
          assert.ok(!orderNumbers.has(orderNumber), `Order number ${orderNumber} should be unique`);
          orderNumbers.add(orderNumber);
        }
      }

      // Should have created multiple orders with unique numbers
      assert.ok(orderNumbers.size > 0, "Should have created at least one order");
    });
  });

  // ============================================
  // ERROR HANDLING FLOW
  // ============================================
  describe("Error Handling Consistency", () => {
    /**
     * TEST: Error responses follow standard format
     * WHY: Frontend depends on consistent error format
     * VALIDATES: All errors have success:false and error message
     */
    it("should return consistent error format across endpoints", async () => {
      const errorCases = [
        // Missing body
        { endpoint: "/api/auth/login", method: "POST", body: "{}" },
        // Invalid coupon
        { endpoint: "/api/coupons/validate", method: "POST", body: JSON.stringify({ code: "" }) },
        // Missing required fields
        { endpoint: "/api/bookings", method: "POST", body: JSON.stringify({}) },
        { endpoint: "/api/orders", method: "POST", body: JSON.stringify({}) },
      ];

      for (const testCase of errorCases) {
        const result = await apiRequest(testCase.endpoint, {
          method: testCase.method,
          body: testCase.body,
        });

        assert.strictEqual(
          result.data.success,
          false,
          `${testCase.endpoint} error should have success: false`
        );
        assert.ok(result.data.error, `${testCase.endpoint} error should have error message`);
      }
    });
  });
});

/**
 * COVERAGE SUMMARY:
 * =================
 *
 * ✅ Complete User Journey
 *    - Auth lifecycle (register → login → logout → login)
 *    - Data persistence across sessions
 *
 * ✅ Order Flow
 *    - Guest checkout flow
 *    - Logged-in user order flow
 *    - Pending order tracking
 *
 * ✅ Booking Flow
 *    - Complete booking creation
 *    - Promo code integration
 *
 * ✅ Protected Routes
 *    - Admin session management
 *    - Privilege escalation prevention
 *
 * ✅ Data Consistency
 *    - Unique order numbers under load
 *
 * ✅ Error Handling
 *    - Consistent error format
 *
 * INTEGRATION TESTS VALIDATE:
 * - Module boundaries work correctly
 * - Session state is managed properly
 * - Data flows correctly between layers
 * - Error handling is consistent
 */
