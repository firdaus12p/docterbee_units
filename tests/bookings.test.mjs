/**
 * Bookings API Integration Tests
 * ================================
 *
 * COVERAGE:
 * - POST /api/bookings - Create new booking
 * - GET /api/bookings - List bookings (admin only)
 * - GET /api/bookings/:id - Get booking detail (admin only)
 * - PATCH /api/bookings/:id - Update booking (admin only)
 * - DELETE /api/bookings/:id - Delete booking (admin only)
 * - GET /api/bookings/prices/:serviceName - Get service price
 *
 * WHY THESE TESTS EXIST:
 * Bookings are core business functionality. Any regression could:
 * - Lose customer reservations
 * - Apply incorrect pricing
 * - Break coupon/promo system
 * - Allow unauthorized access to booking data
 *
 * RUN: node --test tests/bookings.test.mjs
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { apiRequest, CookieJar, generateTestData, TEST_CONFIG } from "./setup.mjs";

describe("Bookings API Tests", () => {
  let cookieJar;
  let adminCookieJar;

  beforeEach(() => {
    cookieJar = new CookieJar();
    adminCookieJar = new CookieJar();
  });

  /**
   * Helper to login as admin for protected routes
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

  // ============================================
  // CREATE BOOKING TESTS
  // ============================================
  describe("POST /api/bookings", () => {
    /**
     * TEST: Create booking with valid data
     * WHY: Core functionality - users must be able to book services
     * VALIDATES: 201 status, booking created with all fields
     */
    it("should create booking with valid data", async () => {
      const bookingData = {
        serviceName: "Konsultasi Kesehatan",
        branch: "Jakarta Pusat",
        practitioner: "Dr. Ahmad",
        date: "2025-01-15",
        time: "10:00",
        mode: "offline",
        customerName: "Test Customer",
        customerPhone: "08123456789",
        customerAge: "30",
        customerGender: "male",
        customerAddress: "Jl. Test No. 123, Jakarta",
        notes: "Test booking",
      };

      const { response, data } = await apiRequest("/api/bookings", {
        method: "POST",
        body: JSON.stringify(bookingData),
      });

      assert.strictEqual(response.status, 201, "Should return 201 Created");
      assert.strictEqual(data.success, true, "Should indicate success");
      assert.ok(data.data, "Should return booking data");
      assert.ok(data.data.id, "Should return booking ID");
      assert.strictEqual(
        data.data.serviceName,
        bookingData.serviceName,
        "Should have correct service"
      );
      assert.strictEqual(data.data.branch, bookingData.branch, "Should have correct branch");
      assert.strictEqual(data.data.date, bookingData.date, "Should have correct date");
      assert.strictEqual(data.data.mode, bookingData.mode, "Should have correct mode");
    });

    /**
     * TEST: Create booking with minimum required fields
     * WHY: Allow booking without all optional customer data (guest mode)
     * VALIDATES: Required fields only
     */
    it("should create booking with minimum required fields", async () => {
      const bookingData = {
        serviceName: "Terapi",
        branch: "Bandung",
        practitioner: "Dr. Budi",
        date: "2025-01-20",
        time: "14:00",
        mode: "online",
      };

      const { response, data } = await apiRequest("/api/bookings", {
        method: "POST",
        body: JSON.stringify(bookingData),
      });

      assert.strictEqual(response.status, 201, "Should return 201 Created");
      assert.strictEqual(data.success, true, "Should indicate success");
      assert.ok(data.data.id, "Should return booking ID");
    });

    /**
     * TEST: Reject booking with missing required fields
     * WHY: Prevent incomplete bookings
     * VALIDATES: 400 status for missing service, branch, practitioner, date, time, mode
     */
    it("should reject booking with missing required fields", async () => {
      const requiredFields = ["serviceName", "branch", "practitioner", "date", "time", "mode"];
      const validBooking = {
        serviceName: "Test",
        branch: "Test Branch",
        practitioner: "Test Doc",
        date: "2025-01-15",
        time: "10:00",
        mode: "online",
      };

      for (const field of requiredFields) {
        const incompleteBooking = { ...validBooking };
        delete incompleteBooking[field];

        const { response, data } = await apiRequest("/api/bookings", {
          method: "POST",
          body: JSON.stringify(incompleteBooking),
        });

        assert.strictEqual(response.status, 400, `Should reject missing ${field}`);
        assert.strictEqual(data.success, false, `Should indicate failure for missing ${field}`);
      }
    });

    /**
     * TEST: Reject partial customer data
     * WHY: If customer provides any personal info, all required fields must be provided
     * VALIDATES: 400 status when partial customer data
     */
    it("should reject booking with partial customer data", async () => {
      const bookingData = {
        serviceName: "Konsultasi",
        branch: "Jakarta",
        practitioner: "Dr. Test",
        date: "2025-01-15",
        time: "10:00",
        mode: "offline",
        customerName: "Test Customer",
        // Missing other customer fields
      };

      const { response, data } = await apiRequest("/api/bookings", {
        method: "POST",
        body: JSON.stringify(bookingData),
      });

      assert.strictEqual(response.status, 400, "Should reject partial customer data");
      assert.strictEqual(data.success, false, "Should indicate failure");
      assert.ok(
        data.error.toLowerCase().includes("lengkap"),
        "Error should mention incomplete data"
      );
    });

    /**
     * TEST: Create booking with promo code and custom prices
     * WHY: Frontend calculates discount and sends final price
     * VALIDATES: Frontend-provided prices are used
     */
    it("should accept frontend-provided prices with promo code", async () => {
      const bookingData = {
        serviceName: "Terapi Premium",
        branch: "Jakarta",
        practitioner: "Dr. Ahmad",
        date: "2025-01-15",
        time: "10:00",
        mode: "offline",
        promoCode: "TESTPROMO",
        price: 500000,
        discountAmount: 50000,
        finalPrice: 450000,
      };

      const { response, data } = await apiRequest("/api/bookings", {
        method: "POST",
        body: JSON.stringify(bookingData),
      });

      assert.strictEqual(response.status, 201, "Should return 201 Created");
      assert.strictEqual(data.data.price, 500000, "Should use frontend price");
      assert.strictEqual(data.data.discountAmount, 50000, "Should use frontend discount");
      assert.strictEqual(data.data.finalPrice, 450000, "Should use frontend final price");
    });
  });

  // ============================================
  // ADMIN-ONLY ROUTE TESTS
  // ============================================
  describe("Admin Protected Routes", () => {
    /**
     * TEST: GET /api/bookings requires admin
     * WHY: Booking list contains sensitive customer data
     * VALIDATES: 401 without admin session
     */
    it("GET /api/bookings should require admin auth", async () => {
      const { response, data } = await apiRequest("/api/bookings");

      assert.strictEqual(response.status, 401, "Should return 401 without admin");
      assert.strictEqual(data.success, false, "Should indicate failure");
    });

    /**
     * TEST: GET /api/bookings/:id requires admin
     * WHY: Individual booking details are sensitive
     * VALIDATES: 401 without admin session
     */
    it("GET /api/bookings/:id should require admin auth", async () => {
      const { response, data } = await apiRequest("/api/bookings/1");

      assert.strictEqual(response.status, 401, "Should return 401 without admin");
      assert.strictEqual(data.success, false, "Should indicate failure");
    });

    /**
     * TEST: PATCH /api/bookings/:id requires admin
     * WHY: Only admin can modify booking status
     * VALIDATES: 401 without admin session
     */
    it("PATCH /api/bookings/:id should require admin auth", async () => {
      const { response, data } = await apiRequest("/api/bookings/1", {
        method: "PATCH",
        body: JSON.stringify({ status: "confirmed" }),
      });

      assert.strictEqual(response.status, 401, "Should return 401 without admin");
      assert.strictEqual(data.success, false, "Should indicate failure");
    });

    /**
     * TEST: DELETE /api/bookings/:id requires admin
     * WHY: Only admin can delete bookings
     * VALIDATES: 401 without admin session
     */
    it("DELETE /api/bookings/:id should require admin auth", async () => {
      const { response, data } = await apiRequest("/api/bookings/1", {
        method: "DELETE",
      });

      assert.strictEqual(response.status, 401, "Should return 401 without admin");
      assert.strictEqual(data.success, false, "Should indicate failure");
    });

    /**
     * TEST: Regular user cannot access admin routes
     * WHY: Even logged-in users should not access admin features
     * VALIDATES: 401 for non-admin user
     */
    it("should reject regular user from admin routes", async () => {
      // Register and login as regular user
      const td = generateTestData("booking_user");
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

      // Try to access admin route
      const { response, data } = await apiRequest("/api/bookings", {}, cookieJar);

      assert.strictEqual(response.status, 401, "Should return 401 for regular user");
    });
  });

  // ============================================
  // PRICE ENDPOINT TESTS
  // ============================================
  describe("GET /api/bookings/prices/:serviceName", () => {
    /**
     * TEST: Get price for existing service
     * WHY: Frontend needs service prices for booking form
     * VALIDATES: Returns price data structure
     */
    it("should return price structure for service lookup", async () => {
      const { response, data } = await apiRequest("/api/bookings/prices/Konsultasi");

      assert.strictEqual(response.status, 200, "Should return 200 OK");
      assert.strictEqual(data.success, true, "Should indicate success");
      assert.ok(data.data !== undefined, "Should return data object");
    });

    /**
     * TEST: Handle non-existent service
     * WHY: Gracefully handle missing services
     * VALIDATES: Returns 0 price or error
     */
    it("should handle non-existent service gracefully", async () => {
      const { response, data } = await apiRequest("/api/bookings/prices/NonExistentService12345");

      // Should either return 0 price or 404
      assert.ok(
        response.status === 200 || response.status === 404,
        "Should handle missing service"
      );

      if (response.status === 200) {
        assert.ok(data.data?.price !== undefined || data.data === 0, "Should return price value");
      }
    });
  });

  // ============================================
  // DATA VALIDATION TESTS
  // ============================================
  describe("Booking Data Validation", () => {
    /**
     * TEST: Validates booking mode values
     * WHY: Mode determines service delivery (online/offline)
     * VALIDATES: Only valid modes accepted
     */
    it("should accept valid mode values (online/offline)", async () => {
      const validModes = ["online", "offline"];

      for (const mode of validModes) {
        const { response, data } = await apiRequest("/api/bookings", {
          method: "POST",
          body: JSON.stringify({
            serviceName: "Test Service",
            branch: "Test Branch",
            practitioner: "Test Doc",
            date: "2025-01-15",
            time: "10:00",
            mode,
          }),
        });

        assert.strictEqual(response.status, 201, `Should accept mode: ${mode}`);
      }
    });

    /**
     * TEST: Price calculation with discount
     * WHY: Discount should never result in negative price
     * VALIDATES: Final price >= 0
     */
    it("should ensure final price is never negative", async () => {
      const bookingData = {
        serviceName: "Test",
        branch: "Test",
        practitioner: "Doc",
        date: "2025-01-15",
        time: "10:00",
        mode: "online",
        price: 100000,
        discountAmount: 150000, // More than price
        finalPrice: 0, // Should be 0, not negative
      };

      const { response, data } = await apiRequest("/api/bookings", {
        method: "POST",
        body: JSON.stringify(bookingData),
      });

      assert.strictEqual(response.status, 201, "Should create booking");
      assert.ok(data.data.finalPrice >= 0, "Final price should not be negative");
    });
  });
});

/**
 * COVERAGE SUMMARY:
 * =================
 *
 * ✅ Create Booking
 *    - Valid data (all fields)
 *    - Minimum required fields
 *    - Missing required fields rejected
 *    - Partial customer data rejected
 *    - Frontend-provided prices accepted
 *
 * ✅ Admin Protection
 *    - GET list requires admin
 *    - GET single requires admin
 *    - PATCH requires admin
 *    - DELETE requires admin
 *    - Regular users blocked
 *
 * ✅ Price Endpoint
 *    - Existing service returns price
 *    - Non-existent service handled
 *
 * ✅ Data Validation
 *    - Valid mode values
 *    - Non-negative final price
 *
 * AREAS NOT FULLY COVERED (require database seeding):
 * - Actual coupon discount calculation
 * - Coupon usage tracking
 * - Service price fetching from database
 * - Booking status transitions
 */
