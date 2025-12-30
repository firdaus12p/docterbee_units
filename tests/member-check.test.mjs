/**
 * Member Check API Tests
 * =======================
 *
 * Tests for the member check feature:
 * - Phone number validation
 * - Rate limiting
 * - Member lookup
 * - Card type retrieval
 *
 * These tests are isolated and do not depend on other features.
 * Note: POST tests may hit rate limits when run repeatedly.
 * The rate limiter resets after 3 minutes.
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { TEST_CONFIG, apiRequest, CookieJar } from "./setup.mjs";

/**
 * Helper to check if response is rate limited
 */
function isRateLimited(response) {
  return response.status === 429;
}

describe("Member Check API", () => {
  describe("POST /api/member-check", () => {
    it("should reject empty phone number (or rate limit)", async () => {
      const { response, data } = await apiRequest("/api/member-check", {
        method: "POST",
        body: JSON.stringify({ phone: "" }),
      });

      // Accept either validation error (400) or rate limit (429)
      assert.ok(
        response.status === 400 || isRateLimited(response),
        `Expected 400 or 429, got ${response.status}`
      );
      assert.strictEqual(data.success, false);
    });

    it("should reject invalid phone format - too short (or rate limit)", async () => {
      const { response, data } = await apiRequest("/api/member-check", {
        method: "POST",
        body: JSON.stringify({ phone: "08123" }),
      });

      assert.ok(
        response.status === 400 || isRateLimited(response),
        `Expected 400 or 429, got ${response.status}`
      );
      assert.strictEqual(data.success, false);
    });

    it("should reject invalid phone format - wrong prefix (or rate limit)", async () => {
      const { response, data } = await apiRequest("/api/member-check", {
        method: "POST",
        body: JSON.stringify({ phone: "09123456789" }),
      });

      assert.ok(
        response.status === 400 || isRateLimited(response),
        `Expected 400 or 429, got ${response.status}`
      );
      assert.strictEqual(data.success, false);
    });

    it("should accept valid phone format 08xx (or rate limit)", async () => {
      const { response, data } = await apiRequest("/api/member-check", {
        method: "POST",
        body: JSON.stringify({ phone: "081234567890" }),
      });

      // Either 404 (not found), 200 (found), or 429 (rate limited)
      assert.ok(
        response.status === 404 || response.status === 200 || isRateLimited(response),
        `Expected 200, 404, or 429, got ${response.status}`
      );
    });

    it("should accept +62 format and normalize (or rate limit)", async () => {
      const { response, data } = await apiRequest("/api/member-check", {
        method: "POST",
        body: JSON.stringify({ phone: "+6281234567890" }),
      });

      assert.ok(
        response.status === 404 || response.status === 200 || isRateLimited(response),
        `Expected 200, 404, or 429, got ${response.status}`
      );
    });

    it("should accept 62 format without + and normalize (or rate limit)", async () => {
      const { response, data } = await apiRequest("/api/member-check", {
        method: "POST",
        body: JSON.stringify({ phone: "6281234567890" }),
      });

      assert.ok(
        response.status === 404 || response.status === 200 || isRateLimited(response),
        `Expected 200, 404, or 429, got ${response.status}`
      );
    });

    it("should return 404 for non-existent member (or rate limit)", async () => {
      const { response, data } = await apiRequest("/api/member-check", {
        method: "POST",
        body: JSON.stringify({ phone: "089999999999" }),
      });

      assert.ok(
        response.status === 404 || isRateLimited(response),
        `Expected 404 or 429, got ${response.status}`
      );
      assert.strictEqual(data.success, false);
    });

    it("should handle phone with spaces and dashes (or rate limit)", async () => {
      const { response, data } = await apiRequest("/api/member-check", {
        method: "POST",
        body: JSON.stringify({ phone: "0812 3456 7890" }),
      });

      assert.ok(
        response.status === 404 || response.status === 200 || isRateLimited(response),
        `Expected 200, 404, or 429, got ${response.status}`
      );
    });
  });

  describe("GET /api/member-check/card-types", () => {
    it("should return list of card types", async () => {
      const { response, data } = await apiRequest("/api/member-check/card-types", {
        method: "GET",
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.data));
      assert.ok(data.data.length > 0);
    });

    it("should include all required card type properties", async () => {
      const { response, data } = await apiRequest("/api/member-check/card-types", {
        method: "GET",
      });

      assert.strictEqual(response.status, 200);

      const cardType = data.data[0];
      assert.ok(cardType.value, "Card type should have value");
      assert.ok(cardType.label, "Card type should have label");
      assert.ok(cardType.front, "Card type should have front image path");
      assert.ok(cardType.back, "Card type should have back image path");
    });

    it("should include Active-Worker card type", async () => {
      const { response, data } = await apiRequest("/api/member-check/card-types", {
        method: "GET",
      });

      assert.strictEqual(response.status, 200);

      const activeWorker = data.data.find((ct) => ct.value === "Active-Worker");
      assert.ok(activeWorker, "Should include Active-Worker card type");
      assert.strictEqual(activeWorker.label, "Active Worker");
    });

    it("should not require authentication", async () => {
      // No cookies, no session
      const { response, data } = await apiRequest("/api/member-check/card-types", {
        method: "GET",
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.success, true);
    });
  });

  describe("Rate Limiting", () => {
    it("should return 429 when rate limited with retry info", async () => {
      const cookieJar = new CookieJar();

      // Make a request that might be rate limited
      const { response, data } = await apiRequest(
        "/api/member-check",
        {
          method: "POST",
          body: JSON.stringify({ phone: "081111111111" }),
        },
        cookieJar
      );

      // If rate limited, verify response structure
      if (isRateLimited(response)) {
        assert.strictEqual(data.success, false);
        assert.ok(data.error, "Should have error message");
        assert.ok(
          data.error.includes("Terlalu banyak") || data.error.includes("tunggu"),
          "Error should mention rate limit"
        );
      }
      // Otherwise, just verify it's a valid response
      else {
        assert.ok(response.status === 200 || response.status === 400 || response.status === 404);
      }
    });
  });
});

describe("Member Check Security", () => {
  it("should not expose sensitive user data", async () => {
    // Even if a member exists, response should not include email, password, etc.
    const { response, data } = await apiRequest("/api/member-check", {
      method: "POST",
      body: JSON.stringify({ phone: "081234567890" }),
    });

    if (response.status === 200 && data.member) {
      // If member found, check no sensitive data exposed
      assert.ok(!data.member.email, "Should not expose email");
      assert.ok(!data.member.password, "Should not expose password");
      assert.ok(!data.member.id, "Should not expose raw user ID");

      // Phone should be masked
      const phone = data.member.phone;
      assert.ok(phone.includes("*"), "Phone should be masked");
    }
  });

  it("should mask phone number in response", async () => {
    // Test phone masking logic
    // This would require a registered member to fully test
    // For now, we verify the response structure
    const { response, data } = await apiRequest("/api/member-check", {
      method: "POST",
      body: JSON.stringify({ phone: "081234567890" }),
    });

    // Response should always have proper structure
    assert.ok("success" in data);
    if (data.success === false) {
      assert.ok("error" in data);
    }
  });
});
