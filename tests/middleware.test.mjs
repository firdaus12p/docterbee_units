/**
 * Authentication Middleware Unit Tests
 * ======================================
 *
 * COVERAGE:
 * - requireAdmin - Admin-only route protection
 * - requireUser - Logged-in user route protection
 *
 * WHY THESE TESTS EXIST:
 * Middleware guards are the security gatekeepers. Any bug here could:
 * - Allow regular users to access admin features
 * - Allow guests to access user-only features
 * - Break legitimate admin/user access
 *
 * RUN: node --test tests/middleware.test.mjs
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { createMockRequest, createMockResponse } from "./setup.mjs";

// Import the actual middleware functions
import { requireAdmin, requireUser } from "../backend/middleware/auth.mjs";

describe("Authentication Middleware Tests", () => {
  // ============================================
  // requireAdmin MIDDLEWARE TESTS
  // ============================================
  describe("requireAdmin middleware", () => {
    /**
     * TEST: Allows admin user to proceed
     * WHY: Admin users must be able to access admin routes
     * VALIDATES: next() is called, no error response
     */
    it("should call next() when user is admin", async () => {
      const req = createMockRequest({
        session: { isAdmin: true },
      });
      const res = createMockResponse();
      let nextCalled = false;

      requireAdmin(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true, "next() should be called for admin");
      assert.strictEqual(res.getData(), null, "Should not send any response");
    });

    /**
     * TEST: Blocks non-admin user
     * WHY: Regular users must not access admin features
     * VALIDATES: 401 status, error response, next() NOT called
     */
    it("should return 401 when user is not admin", async () => {
      const req = createMockRequest({
        session: { isAdmin: false, userId: 123 }, // Logged in but not admin
      });
      const res = createMockResponse();
      let nextCalled = false;

      requireAdmin(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false, "next() should NOT be called");
      assert.strictEqual(res.getStatus(), 401, "Should return 401");
      assert.strictEqual(res.getData().success, false, "Should indicate failure");
      assert.ok(res.getData().error, "Should include error message");
    });

    /**
     * TEST: Blocks guest user (no session)
     * WHY: Unauthenticated requests must be blocked
     * VALIDATES: 401 status, error response
     */
    it("should return 401 when no session exists", async () => {
      const req = { session: null };
      const res = createMockResponse();
      let nextCalled = false;

      requireAdmin(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false, "next() should NOT be called");
      assert.strictEqual(res.getStatus(), 401, "Should return 401");
    });

    /**
     * TEST: Blocks request with undefined session.isAdmin
     * WHY: Edge case - session exists but isAdmin not set
     * VALIDATES: Treats undefined as not admin
     */
    it("should return 401 when isAdmin is undefined", async () => {
      const req = createMockRequest({
        session: { userId: 123 }, // isAdmin not set
      });
      const res = createMockResponse();
      let nextCalled = false;

      requireAdmin(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false, "next() should NOT be called");
      assert.strictEqual(res.getStatus(), 401, "Should return 401");
    });
  });

  // ============================================
  // requireUser MIDDLEWARE TESTS
  // ============================================
  describe("requireUser middleware", () => {
    /**
     * TEST: Allows logged-in user to proceed
     * WHY: Authenticated users must access protected resources
     * VALIDATES: next() is called, no error response
     */
    it("should call next() when user is logged in", async () => {
      const req = createMockRequest({
        session: {
          userId: 123,
          userName: "Test User",
          userEmail: "test@example.com",
        },
      });
      const res = createMockResponse();
      let nextCalled = false;

      requireUser(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true, "next() should be called for logged in user");
      assert.strictEqual(res.getData(), null, "Should not send any response");
    });

    /**
     * TEST: Blocks guest user (no userId)
     * WHY: Guest users must not access user-only features
     * VALIDATES: 401 status, error response, next() NOT called
     */
    it("should return 401 when user is not logged in", async () => {
      const req = createMockRequest({
        session: { userId: null },
      });
      const res = createMockResponse();
      let nextCalled = false;

      requireUser(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false, "next() should NOT be called");
      assert.strictEqual(res.getStatus(), 401, "Should return 401");
      assert.strictEqual(res.getData().success, false, "Should indicate failure");
      assert.ok(res.getData().error, "Should include error message");
    });

    /**
     * TEST: Blocks request with no session
     * WHY: Handle edge case of missing session object
     * VALIDATES: 401 status, error response
     */
    it("should return 401 when no session exists", async () => {
      const req = { session: null };
      const res = createMockResponse();
      let nextCalled = false;

      requireUser(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false, "next() should NOT be called");
      assert.strictEqual(res.getStatus(), 401, "Should return 401");
    });

    /**
     * TEST: Blocks request with userId = 0
     * WHY: userId of 0 should be treated as not logged in (falsy value)
     * VALIDATES: Falsy userId values are rejected
     */
    it("should return 401 when userId is 0", async () => {
      const req = createMockRequest({
        session: { userId: 0 },
      });
      const res = createMockResponse();
      let nextCalled = false;

      requireUser(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false, "next() should NOT be called for userId 0");
      assert.strictEqual(res.getStatus(), 401, "Should return 401");
    });

    /**
     * TEST: Allows user with minimal session data
     * WHY: userId alone should be sufficient for authentication
     * VALIDATES: Only userId is required, other fields optional
     */
    it("should allow user with only userId in session", async () => {
      const req = createMockRequest({
        session: { userId: 123 }, // Only userId, no name/email
      });
      const res = createMockResponse();
      let nextCalled = false;

      requireUser(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true, "next() should be called");
    });
  });

  // ============================================
  // INTERACTION TESTS
  // ============================================
  describe("Middleware Interaction", () => {
    /**
     * TEST: Admin user passes both middlewares
     * WHY: Admin users should also pass requireUser checks
     * VALIDATES: Admin can access both admin and user routes
     */
    it("admin user should pass both requireAdmin and requireUser", async () => {
      const req = createMockRequest({
        session: {
          userId: 1,
          isAdmin: true,
          userName: "Admin User",
        },
      });
      const res = createMockResponse();

      let adminPassed = false;
      let userPassed = false;

      requireAdmin(req, res, () => {
        adminPassed = true;
      });

      requireUser(req, res, () => {
        userPassed = true;
      });

      assert.strictEqual(adminPassed, true, "Should pass requireAdmin");
      assert.strictEqual(userPassed, true, "Should pass requireUser");
    });

    /**
     * TEST: Regular user fails requireAdmin but passes requireUser
     * WHY: Regular users have user access but not admin access
     * VALIDATES: Correct permission separation
     */
    it("regular user should fail requireAdmin but pass requireUser", async () => {
      const req = createMockRequest({
        session: {
          userId: 123,
          isAdmin: false,
          userName: "Regular User",
        },
      });
      const res1 = createMockResponse();
      const res2 = createMockResponse();

      let adminPassed = false;
      let userPassed = false;

      requireAdmin(req, res1, () => {
        adminPassed = true;
      });

      requireUser(req, res2, () => {
        userPassed = true;
      });

      assert.strictEqual(adminPassed, false, "Should fail requireAdmin");
      assert.strictEqual(res1.getStatus(), 401, "Should return 401 for admin check");
      assert.strictEqual(userPassed, true, "Should pass requireUser");
    });
  });
});

/**
 * COVERAGE SUMMARY:
 * =================
 *
 * ✅ requireAdmin - all paths covered
 *    - Admin allowed
 *    - Non-admin blocked
 *    - No session blocked
 *    - Undefined isAdmin blocked
 *
 * ✅ requireUser - all paths covered
 *    - Logged in allowed
 *    - Not logged in blocked
 *    - No session blocked
 *    - userId = 0 blocked
 *    - Minimal session data allowed
 *
 * ✅ Interaction tests
 *    - Admin passes both
 *    - Regular user passes only requireUser
 *
 * EDGE CASES COVERED:
 * - null/undefined session
 * - Falsy userId values (0, null, undefined)
 * - Missing isAdmin property
 */
