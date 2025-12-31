# Docterbee Units - Agent Development Guide

This guide provides coding agents with essential commands, patterns, and conventions for working in this codebase.

## Project Stack

- **Backend**: Node.js (ES modules), Express.js, MySQL
- **Frontend**: Vanilla JavaScript (no frameworks), HTML, CSS
- **Testing**: Node.js built-in test runner
- **Database**: MySQL on port 3307 (XAMPP non-standard)
- **Auth**: Express session-based (not JWT)

## Essential Commands

### Development
```bash
npm run dev                    # Start server with auto-reload
npm start                      # Start production server
npm run setup                  # First-time setup: create admin + seed rewards
```

### Testing
```bash
# Run all tests (requires server running in background)
npm test

# Run single test file
node --test tests/auth.test.mjs

# Run specific test files
node --test tests/helpers.test.mjs tests/middleware.test.mjs

# Run tests with coverage
node --test --experimental-test-coverage tests/

# Unit tests (no server needed)
node --test tests/helpers.test.mjs tests/middleware.test.mjs

# Integration tests (server must be running)
npm start & node --test tests/auth.test.mjs tests/orders.test.mjs
```

### Linting
```bash
npm run lint                   # Check for issues
npm run lint:fix               # Auto-fix issues
```

### Migrations
```bash
npm run migrate:seed-rewards   # Seed default rewards
npm run create-admin           # Create default admin user
```

## Code Style Guidelines

### Formatting (.prettierrc)
- **Semicolons**: Required
- **Quotes**: Double quotes
- **Tab width**: 2 spaces
- **Print width**: 100 characters
- **Trailing comma**: ES5
- **Line endings**: Auto (CRLF on Windows, LF on Unix)

### Import Conventions

**Backend (ES Modules - .mjs):**
```javascript
// Standard imports first
import express from "express";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";

// Local imports
import { query, queryOne } from "../db.mjs";
import { requireAdmin } from "../middleware/auth.mjs";
import { generateOrderNumber } from "../utils/helpers.mjs";
```

**Frontend (Script mode - .js):**
```javascript
// No imports - uses global scope
// Include dependencies via <script> tags in HTML
// Functions are declared globally and accessed across files
```

### Naming Conventions

**Files:**
- Backend routes: Plural resource names (`orders.mjs`, `bookings.mjs`, `users.mjs`)
- Frontend: Kebab-case (`admin-dashboard.js`, `user-data-sync.js`)
- Tests: Resource name + `.test.mjs` (`auth.test.mjs`, `orders.test.mjs`)

**Functions:**
```javascript
// Backend: camelCase
async function getUserById(id) { }
const generateOrderNumber = () => { };

// Frontend: camelCase (global scope)
function formatDate(dateString) { }
async function loadOrders() { }
```

**Variables:**
```javascript
// camelCase for all variables
const userId = req.session.userId;
let orderTotal = 0;
const isAdmin = req.session.isAdmin;
```

**Constants:**
```javascript
// UPPER_SNAKE_CASE for true constants
const API_BASE = "http://localhost:3000/api";
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
```

**Database:**
- Tables: snake_case plural (`users`, `service_bookings`, `order_items`)
- Columns: snake_case (`user_id`, `created_at`, `is_active`)

### Type Annotations (JSDoc)

Use JSDoc for function documentation:
```javascript
/**
 * Format date to Indonesian locale
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  // Implementation
}

/**
 * Create new order
 * @param {Object} orderData - Order details
 * @param {number} orderData.userId - User ID
 * @param {Array<Object>} orderData.items - Order items
 * @returns {Promise<Object>} Created order with ID
 */
async function createOrder(orderData) {
  // Implementation
}
```

### Error Handling

**Backend:**
```javascript
// Always use try-catch in async route handlers
router.get("/endpoint", async (req, res) => {
  try {
    const data = await query("SELECT * FROM table");
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error description:", error);
    res.status(500).json({ success: false, error: "User-friendly message in Indonesian" });
  }
});

// Validation errors: 400 status
if (!requiredField) {
  return res.status(400).json({ success: false, error: "Field harus diisi" });
}

// Not found: 404 status
if (!resource) {
  return res.status(404).json({ success: false, error: "Resource tidak ditemukan" });
}

// Auth errors: 401 (not logged in) or 403 (insufficient permissions)
if (!req.session.userId) {
  return res.status(401).json({ success: false, error: "Silakan login terlebih dahulu" });
}
```

**Frontend:**
```javascript
// Use modal-utils.js for user-facing errors
try {
  const response = await fetch(url, { credentials: "include" });
  const data = await response.json();
  
  if (!data.success) {
    showError("Gagal", data.error);
    return;
  }
  
  showSuccess("Berhasil", "Operasi berhasil");
} catch (error) {
  console.error("Error:", error);
  showError("Kesalahan", "Terjadi kesalahan pada sistem");
}
```

## Critical Patterns

### API Response Format
```javascript
// Success (always include success: true)
{ success: true, data: any, message?: string }

// Error (always include success: false)
{ success: false, error: string }
```

### Database Queries
```javascript
// Multiple rows
const users = await query("SELECT * FROM users WHERE active = ?", [true]);

// Single row (returns null if not found)
const user = await queryOne("SELECT * FROM users WHERE id = ?", [userId]);

// Insert (result.insertId available)
const result = await query("INSERT INTO table (col) VALUES (?)", [value]);

// Update/Delete (result.affectedRows available)
const result = await query("UPDATE table SET col = ? WHERE id = ?", [value, id]);
```

### Authentication & Authorization
```javascript
// Backend middleware
import { requireAdmin, requireUser } from "../middleware/auth.mjs";

router.get("/admin-only", requireAdmin, async (req, res) => { });
router.get("/user-only", requireUser, async (req, res) => { });
router.get("/guest-ok", async (req, res) => { }); // No middleware

// Access session data
const userId = req.session.userId;
const isAdmin = req.session.isAdmin;
```

### Frontend Fetch Pattern
```javascript
// ALWAYS include credentials: "include" for session cookies
const response = await fetch("/api/endpoint", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",  // REQUIRED for session auth
  body: JSON.stringify(data),
});
```

## Testing Patterns

```javascript
import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert";
import { apiRequest, CookieJar, generateTestData } from "./setup.mjs";

describe("Feature Tests", () => {
  let cookieJar;
  
  beforeEach(() => {
    cookieJar = new CookieJar();
  });
  
  it("should do something", async () => {
    const { response, data } = await apiRequest("/api/endpoint", {
      method: "POST",
      body: JSON.stringify({ field: "value" }),
      cookieJar,
    });
    
    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
  });
});
```

## Common Pitfalls to Avoid

1. **DO NOT** add frontend frameworks (React/Vue) - intentionally vanilla JS
2. **DO NOT** use SQL files for migrations - use `.mjs` files with `up()` function
3. **DO NOT** change MySQL port from 3307
4. **DO NOT** forget `credentials: "include"` in frontend fetch calls
5. **DO NOT** create backup files (`*_backup.js`) - use git
6. **DO NOT** leave `console.log` debug statements in production code
7. **DO NOT** add `auth-check.js` to guest-accessible pages
8. **DO NOT** hardcode customer data in orders - check `req.session.userId`

## Before Making Changes

1. Search for all usages before modifying functions/endpoints
2. Check route protection level (`requireAdmin`/`requireUser` or guest)
3. Follow `{ success, data/error }` response format consistently
4. Run relevant tests: `node --test tests/{module}.test.mjs`
5. Verify import paths are correct (relative to file location)
6. Ensure error messages are in Indonesian for user-facing errors
7. Check ESLint config for environment-specific globals

## File-Specific Notes

### Backend Files
- `backend/server.mjs` - Main entry point, route mounting, middleware setup
- `backend/db.mjs` - Database pool, `query()`, `queryOne()`, table initialization
- `backend/utils/helpers.mjs` - Shared utilities (order numbers, points, expiry)

### Frontend Utility Modules (Shared)
- `js/utils.js` - Frontend utilities (formatting, escaping, debounce, getCategoryColor)
- `js/modal-utils.js` - User alerts (`showSuccess`, `showError`, `showConfirm`, `showDeleteModal`)
- `js/admin-api.js` - Admin API configuration (`API_BASE`, `adminFetch`) - **load before admin-dashboard.js**
- `js/card-config.js` - Card type configuration (`CARD_TYPE_CONFIG`, `getSmallNameCardTypes`) - **load before register-card-preview.js and member-check.js**
- `js/user-data-sync.js` - Guest/logged-in data synchronization

### Test Files
- `tests/setup.mjs` - Test utilities, mocks, `apiRequest`, `CookieJar`

## References

- `.github/copilot-instructions.md` - AI agent instructions (architecture patterns)
- `database_schema.sql` - Full database schema
- `eslint.config.mjs` - Linting rules for backend/frontend/tests
- `.prettierrc` - Code formatting configuration