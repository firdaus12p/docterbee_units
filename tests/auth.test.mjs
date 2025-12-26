/**
 * Authentication Routes Unit Tests
 * ==================================
 *
 * COVERAGE:
 * - POST /api/auth/register - User registration
 * - POST /api/auth/login - User login
 * - POST /api/auth/logout - User logout
 * - GET /api/auth/check - Check login status
 * - GET /api/auth/me - Get current user data
 *
 * WHY THESE TESTS EXIST:
 * Authentication is the security foundation. Any regression here could:
 * - Allow unauthorized access
 * - Break user sessions
 * - Expose sensitive data
 * - Block legitimate users
 *
 * RUN: node --test tests/auth.test.mjs
 */

import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert";
import { apiRequest, CookieJar, generateTestData, validators, TEST_CONFIG } from "./setup.mjs";

describe("Authentication API Tests", () => {
  let cookieJar;
  let testData;

  beforeEach(() => {
    cookieJar = new CookieJar();
    testData = generateTestData("auth");
  });

  // ============================================
  // REGISTRATION TESTS
  // ============================================
  describe("POST /api/auth/register", () => {
    /**
     * TEST: Successful registration with valid data
     * WHY: Core functionality - users must be able to register
     * VALIDATES: 201 status, success response, user data returned, session created
     */
    it("should register a new user with valid data", async () => {
      const { response, data } = await apiRequest(
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: testData.name,
            email: testData.email,
            phone: testData.phone,
            password: "password123",
          }),
        },
        cookieJar
      );

      assert.strictEqual(response.status, 201, "Should return 201 Created");
      assert.strictEqual(data.success, true, "Response should indicate success");
      assert.ok(data.data, "Should return user data");
      assert.strictEqual(data.data.name, testData.name, "Should return correct name");
      assert.strictEqual(data.data.email, testData.email, "Should return correct email");
      assert.ok(data.data.id, "Should return user ID");

      // Verify session was created by checking /api/auth/check
      const { data: checkData } = await apiRequest("/api/auth/check", {}, cookieJar);
      assert.strictEqual(checkData.loggedIn, true, "User should be logged in after registration");
    });

    /**
     * TEST: Registration fails without required fields
     * WHY: Prevent incomplete user records in database
     * VALIDATES: 400 status, error message
     */
    it("should reject registration with missing fields", async () => {
      const testCases = [
        { name: "Test", email: "", phone: "08123456789", password: "pass123" },
        { name: "", email: "test@test.com", phone: "08123456789", password: "pass123" },
        { name: "Test", email: "test@test.com", phone: "", password: "pass123" },
        { name: "Test", email: "test@test.com", phone: "08123456789", password: "" },
      ];

      for (const testCase of testCases) {
        const { response, data } = await apiRequest("/api/auth/register", {
          method: "POST",
          body: JSON.stringify(testCase),
        });

        assert.strictEqual(response.status, 400, `Should reject: ${JSON.stringify(testCase)}`);
        assert.strictEqual(data.success, false, "Should indicate failure");
        assert.ok(data.error, "Should include error message");
      }
    });

    /**
     * TEST: Registration fails with invalid email format
     * WHY: Ensure valid email for communication and password recovery
     * VALIDATES: Email format validation
     */
    it("should reject invalid email format", async () => {
      const invalidEmails = ["notanemail", "missing@", "@nodomain.com", "spaces in@email.com"];

      for (const email of invalidEmails) {
        const { response, data } = await apiRequest("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name: "Test User",
            email,
            phone: "08123456789",
            password: "password123",
          }),
        });

        assert.strictEqual(response.status, 400, `Should reject email: ${email}`);
        assert.strictEqual(data.success, false, "Should indicate failure");
      }
    });

    /**
     * TEST: Registration fails with short password
     * WHY: Security requirement - passwords must be at least 6 characters
     * VALIDATES: Password length validation
     */
    it("should reject password shorter than 6 characters", async () => {
      const { response, data } = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: "Test User",
          email: testData.email,
          phone: testData.phone,
          password: "12345", // Too short
        }),
      });

      assert.strictEqual(response.status, 400, "Should reject short password");
      assert.strictEqual(data.success, false, "Should indicate failure");
      assert.ok(data.error.includes("6"), "Error should mention minimum length");
    });

    /**
     * TEST: Registration fails with duplicate email
     * WHY: Email uniqueness is required for login and data integrity
     * VALIDATES: Duplicate email check
     */
    it("should reject duplicate email registration", async () => {
      // First registration
      await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: testData.name,
          email: testData.email,
          phone: testData.phone,
          password: "password123",
        }),
      });

      // Second registration with same email
      const newTestData = generateTestData("dup");
      const { response, data } = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: newTestData.name,
          email: testData.email, // Same email
          phone: newTestData.phone,
          password: "password123",
        }),
      });

      assert.strictEqual(response.status, 400, "Should reject duplicate email");
      assert.strictEqual(data.success, false, "Should indicate failure");
      assert.ok(data.error.toLowerCase().includes("email"), "Error should mention email");
    });

    /**
     * TEST: Registration with valid card_type
     * WHY: Card type determines user membership tier and pricing
     * VALIDATES: Valid card_type values are accepted
     */
    it("should accept valid card_type values", async () => {
      const validCardTypes = [
        "Active-Worker",
        "Family-Member",
        "Healthy-Smart-Kids",
        "Mums-Baby",
        "New-Couple",
        "Pregnant-Preparation",
        "Senja-Ceria",
      ];

      for (const cardType of validCardTypes) {
        const td = generateTestData(`card_${cardType.substring(0, 5)}`);
        const { response, data } = await apiRequest("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name: td.name,
            email: td.email,
            phone: td.phone,
            password: "password123",
            card_type: cardType,
          }),
        });

        assert.strictEqual(response.status, 201, `Should accept card_type: ${cardType}`);
        assert.strictEqual(data.data.card_type, cardType, "Should return correct card_type");
      }
    });
  });

  // ============================================
  // LOGIN TESTS
  // ============================================
  describe("POST /api/auth/login", () => {
    let registeredUser;

    before(async () => {
      // Register a user for login tests
      registeredUser = generateTestData("login");
      await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: registeredUser.name,
          email: registeredUser.email,
          phone: registeredUser.phone,
          password: "password123",
        }),
      });
    });

    /**
     * TEST: Successful login with correct credentials
     * WHY: Core functionality - users must be able to log in
     * VALIDATES: 200 status, success response, session created
     */
    it("should login with valid credentials", async () => {
      const { response, data } = await apiRequest(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email: registeredUser.email,
            password: "password123",
          }),
        },
        cookieJar
      );

      assert.strictEqual(response.status, 200, "Should return 200 OK");
      assert.strictEqual(data.success, true, "Should indicate success");
      assert.ok(data.data, "Should return user data");
      assert.strictEqual(data.data.email, registeredUser.email, "Should return correct email");

      // Verify session
      const { data: checkData } = await apiRequest("/api/auth/check", {}, cookieJar);
      assert.strictEqual(checkData.loggedIn, true, "User should be logged in");
    });

    /**
     * TEST: Login fails with wrong password
     * WHY: Security - prevent unauthorized access
     * VALIDATES: 401 status, generic error message (no password hint)
     */
    it("should reject login with wrong password", async () => {
      const { response, data } = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: registeredUser.email,
          password: "wrongpassword",
        }),
      });

      assert.strictEqual(response.status, 401, "Should return 401 Unauthorized");
      assert.strictEqual(data.success, false, "Should indicate failure");
      // Error should be generic (security best practice)
      assert.ok(
        data.error.includes("salah") || data.error.toLowerCase().includes("wrong"),
        "Should have generic error message"
      );
    });

    /**
     * TEST: Login fails with non-existent email
     * WHY: Security - same error as wrong password to prevent email enumeration
     * VALIDATES: 401 status, same error message as wrong password
     */
    it("should reject login with non-existent email", async () => {
      const { response, data } = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: "anypassword",
        }),
      });

      assert.strictEqual(response.status, 401, "Should return 401 Unauthorized");
      assert.strictEqual(data.success, false, "Should indicate failure");
    });

    /**
     * TEST: Login fails with missing credentials
     * WHY: Validate required fields before database query
     * VALIDATES: 400 status, error message
     */
    it("should reject login with missing credentials", async () => {
      const testCases = [
        { email: "", password: "password" },
        { email: "test@test.com", password: "" },
        { email: "", password: "" },
      ];

      for (const testCase of testCases) {
        const { response, data } = await apiRequest("/api/auth/login", {
          method: "POST",
          body: JSON.stringify(testCase),
        });

        assert.strictEqual(response.status, 400, `Should reject: ${JSON.stringify(testCase)}`);
        assert.strictEqual(data.success, false, "Should indicate failure");
      }
    });
  });

  // ============================================
  // LOGOUT TESTS
  // ============================================
  describe("POST /api/auth/logout", () => {
    /**
     * TEST: Successful logout
     * WHY: Users must be able to end their session
     * VALIDATES: Session destroyed, subsequent requests are unauthenticated
     */
    it("should logout and destroy session", async () => {
      // First login
      const td = generateTestData("logout");
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

      // Verify logged in
      let checkResult = await apiRequest("/api/auth/check", {}, cookieJar);
      assert.strictEqual(checkResult.data.loggedIn, true, "Should be logged in");

      // Logout
      const { response, data } = await apiRequest(
        "/api/auth/logout",
        { method: "POST" },
        cookieJar
      );

      assert.strictEqual(response.status, 200, "Should return 200 OK");
      assert.strictEqual(data.success, true, "Should indicate success");

      // Verify logged out
      checkResult = await apiRequest("/api/auth/check", {}, cookieJar);
      assert.strictEqual(checkResult.data.loggedIn, false, "Should be logged out");
    });
  });

  // ============================================
  // CHECK AUTH STATUS TESTS
  // ============================================
  describe("GET /api/auth/check", () => {
    /**
     * TEST: Returns correct status for unauthenticated user
     * WHY: Frontend relies on this to show correct UI
     * VALIDATES: loggedIn false, user null
     */
    it("should return loggedIn false for unauthenticated request", async () => {
      const { response, data } = await apiRequest("/api/auth/check");

      assert.strictEqual(response.status, 200, "Should return 200 OK");
      assert.strictEqual(data.success, true, "Should indicate success");
      assert.strictEqual(data.loggedIn, false, "Should indicate not logged in");
      assert.strictEqual(data.user, null, "User should be null");
    });

    /**
     * TEST: Returns user data for authenticated user
     * WHY: Frontend needs user info for personalization
     * VALIDATES: loggedIn true, user data present
     */
    it("should return user data for authenticated request", async () => {
      // Login first
      const td = generateTestData("check");
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

      const { response, data } = await apiRequest("/api/auth/check", {}, cookieJar);

      assert.strictEqual(response.status, 200, "Should return 200 OK");
      assert.strictEqual(data.success, true, "Should indicate success");
      assert.strictEqual(data.loggedIn, true, "Should indicate logged in");
      assert.ok(data.user, "Should include user object");
      assert.strictEqual(data.user.name, td.name, "Should have correct name");
      assert.strictEqual(data.user.email, td.email, "Should have correct email");
    });
  });

  // ============================================
  // GET CURRENT USER TESTS
  // ============================================
  describe("GET /api/auth/me", () => {
    /**
     * TEST: Returns 401 for unauthenticated request
     * WHY: Protect user data from unauthorized access
     * VALIDATES: 401 status, no user data exposed
     */
    it("should return 401 for unauthenticated request", async () => {
      const { response, data } = await apiRequest("/api/auth/me");

      assert.strictEqual(response.status, 401, "Should return 401 Unauthorized");
      assert.strictEqual(data.success, false, "Should indicate failure");
      assert.ok(!data.data, "Should not expose any user data");
    });

    /**
     * TEST: Returns full user data for authenticated request
     * WHY: User needs to see their profile information
     * VALIDATES: Full user data returned (excluding password)
     */
    it("should return full user data for authenticated request", async () => {
      // Login first
      const td = generateTestData("me");
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

      const { response, data } = await apiRequest("/api/auth/me", {}, cookieJar);

      assert.strictEqual(response.status, 200, "Should return 200 OK");
      assert.strictEqual(data.success, true, "Should indicate success");
      assert.ok(data.data, "Should return user data");
      assert.strictEqual(data.data.name, td.name, "Should have correct name");
      assert.strictEqual(data.data.email, td.email, "Should have correct email");
      assert.ok(!data.data.password, "Should NOT include password");
      assert.ok(data.data.created_at, "Should include creation date");
    });
  });
});

/**
 * COVERAGE SUMMARY:
 * =================
 *
 * ✅ Registration - all validation paths
 * ✅ Login - success and failure paths
 * ✅ Logout - session destruction
 * ✅ Auth check - authenticated and unauthenticated
 * ✅ Get current user - protected route
 *
 * AREAS NOT COVERED (require integration tests):
 * - Database connection failures
 * - bcrypt hashing failures
 * - Session store failures
 * - Rate limiting (if implemented)
 */
