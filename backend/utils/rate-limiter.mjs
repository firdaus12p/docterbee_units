/**
 * Rate Limiter Utility
 * Simple in-memory rate limiter for login endpoints
 * 
 * Features:
 * - Track failed attempts per IP
 * - Block after max attempts
 * - Auto-reset after cooldown period
 * - Memory cleanup to prevent leaks
 */

class RateLimiter {
  constructor(options = {}) {
    this.maxAttempts = options.maxAttempts || 8;
    this.cooldownMs = options.cooldownMs || 2 * 60 * 1000; // 2 minutes
    this.cleanupIntervalMs = options.cleanupIntervalMs || 5 * 60 * 1000; // 5 minutes
    
    // Store: { ip: { attempts: number, firstAttempt: timestamp, blockedUntil: timestamp } }
    this.store = new Map();
    
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => this.cleanup(), this.cleanupIntervalMs);
  }

  /**
   * Get client IP from request
   */
  getClientIP(req) {
    // Support for proxies (X-Forwarded-For) and direct connections
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.connection?.remoteAddress || 'unknown';
  }

  /**
   * Check if IP is rate limited
   * @returns {object} { limited: boolean, retryAfter: number (seconds), attemptsLeft: number }
   */
  check(ip) {
    const record = this.store.get(ip);
    const now = Date.now();

    if (!record) {
      return { limited: false, retryAfter: 0, attemptsLeft: this.maxAttempts };
    }

    // Check if still blocked
    if (record.blockedUntil && now < record.blockedUntil) {
      const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
      return { limited: true, retryAfter, attemptsLeft: 0 };
    }

    // If cooldown expired, reset
    if (record.blockedUntil && now >= record.blockedUntil) {
      this.store.delete(ip);
      return { limited: false, retryAfter: 0, attemptsLeft: this.maxAttempts };
    }

    const attemptsLeft = this.maxAttempts - record.attempts;
    return { limited: false, retryAfter: 0, attemptsLeft };
  }

  /**
   * Record a failed login attempt
   * @returns {object} { blocked: boolean, retryAfter: number }
   */
  recordFailure(ip) {
    const now = Date.now();
    let record = this.store.get(ip);

    if (!record) {
      record = { attempts: 0, firstAttempt: now, blockedUntil: null };
    }

    // If was blocked but cooldown expired, reset
    if (record.blockedUntil && now >= record.blockedUntil) {
      record = { attempts: 0, firstAttempt: now, blockedUntil: null };
    }

    record.attempts++;

    // Check if should block
    if (record.attempts >= this.maxAttempts) {
      record.blockedUntil = now + this.cooldownMs;
      this.store.set(ip, record);
      const retryAfter = Math.ceil(this.cooldownMs / 1000);
      return { blocked: true, retryAfter };
    }

    this.store.set(ip, record);
    return { blocked: false, retryAfter: 0, attemptsLeft: this.maxAttempts - record.attempts };
  }

  /**
   * Reset attempts for an IP (call on successful login)
   */
  reset(ip) {
    this.store.delete(ip);
  }

  /**
   * Cleanup old entries to prevent memory leak
   */
  cleanup() {
    const now = Date.now();
    const maxAge = this.cooldownMs * 2; // Keep entries for 2x cooldown period

    for (const [ip, record] of this.store.entries()) {
      // Remove entries that are old and not blocked
      if (!record.blockedUntil && (now - record.firstAttempt) > maxAge) {
        this.store.delete(ip);
      }
      // Remove entries whose block has expired
      if (record.blockedUntil && now > record.blockedUntil + maxAge) {
        this.store.delete(ip);
      }
    }
  }

  /**
   * Express middleware factory
   */
  middleware() {
    return (req, res, next) => {
      const ip = this.getClientIP(req);
      const status = this.check(ip);

      if (status.limited) {
        res.set('Retry-After', status.retryAfter.toString());
        return res.status(429).json({
          success: false,
          error: `Terlalu banyak percobaan login. Silakan coba lagi dalam ${Math.ceil(status.retryAfter / 60)} menit.`,
          retryAfter: status.retryAfter,
        });
      }

      // Attach helper methods to request for use in route handlers
      req.rateLimiter = {
        recordFailure: () => this.recordFailure(ip),
        reset: () => this.reset(ip),
        attemptsLeft: status.attemptsLeft,
      };

      next();
    };
  }

  /**
   * Stop cleanup interval (for graceful shutdown)
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Create login rate limiter instance
// 8 attempts, 2 minute cooldown
const loginRateLimiter = new RateLimiter({
  maxAttempts: 8,
  cooldownMs: 2 * 60 * 1000, // 2 minutes
});

// Create email rate limiter instance (stricter for email abuse prevention)
// 3 attempts, 10 minute cooldown - protects Resend billing and domain reputation
const emailRateLimiter = new RateLimiter({
  maxAttempts: 3,
  cooldownMs: 10 * 60 * 1000, // 10 minutes
});

export { RateLimiter, loginRateLimiter, emailRateLimiter };
