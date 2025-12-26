# Docterbee Units - AI Coding Agent Instructions

## Project Overview

Full-stack Node.js health & wellness platform (Islamic values). **Vanilla JS frontend** (no React/Vue/Angular), Express.js + MySQL backend.

**Core Features:** Member journey tracking, service bookings, e-commerce store, events, AI health advisor (Gemini API)

## Architecture Essentials

### Session-Based Auth (Not JWT)

```javascript
// Backend: Check session for user identity
if (req.session.userId) {
  /* logged in */
}
if (req.session.isAdmin) {
  /* admin access */
}

// Frontend: Always include credentials for session cookies
fetch("/api/...", { credentials: "include" });
```

- Most pages support **guest mode** - don't add auth-check.js unless truly protected
- User context: `req.session.userId`, `req.session.userName`, `req.session.userEmail`
- Middleware: `requireAdmin`, `requireUser` from `backend/middleware/auth.mjs`

### API Response Pattern

```javascript
// Success: { success: true, data?: any, message?: string }
// Error:   { success: false, error: string }
```

### Database Patterns

- Connection pool in `backend/db.mjs` - use `query()` (multiple rows) or `queryOne()` (single row)
- Tables auto-initialize on server start via `initializeTables()`
- Migrations are `.mjs` files in `backend/migrations/` (NOT SQL files)
- MySQL runs on **port 3307** (XAMPP non-standard)

## File Organization

```
Root:           HTML pages, frontend assets
backend/
├── server.mjs      # Main entry, route mounting
├── db.mjs          # Database connection pool
├── routes/         # Express routers (plural naming: orders.mjs, bookings.mjs)
├── middleware/     # Auth middleware (requireAdmin, requireUser)
├── utils/          # Shared helpers (generateOrderNumber, calculatePoints)
└── migrations/     # JavaScript migration files
js/                 # Frontend JS (vanilla ES6+, no bundler)
tests/              # Node.js test runner tests
docs/               # Markdown documentation
```

## Development Commands

```bash
npm start                    # Production server
npm run dev                  # Watch mode with auto-reload

# Testing (Node.js built-in test runner)
node --test tests/helpers.test.mjs tests/middleware.test.mjs  # Unit tests (no server)
npm start & node --test "tests/*.test.mjs"                    # Full tests (needs server)
```

## Critical Patterns

### 1. Route Handler Template

```javascript
// backend/routes/{resource}.mjs
import express from "express";
import { requireAdmin, requireUser } from "../middleware/auth.mjs";
import { query, queryOne } from "../db.mjs";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const data = await query("SELECT * FROM table_name");
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Gagal mengambil data" });
  }
});

router.post("/admin-only", requireAdmin, async (req, res) => {
  /* ... */
});

export default router;
```

### 2. Frontend Modal Alerts

```javascript
// js/modal-utils.js provides these - don't use window.alert()
showSuccess("Berhasil!", "Data tersimpan");
showError("Gagal", "Terjadi kesalahan");
showConfirm("Hapus?", "Data akan dihapus", onConfirm);
```

### 3. User Data Sync (Guest vs Logged-in)

- Guest: localStorage only
- Logged-in: `UserDataSync` class syncs to database via `/api/user-data/*`
- See `js/user-data-sync.js` for implementation

### 4. Helper Functions (backend/utils/helpers.mjs)

```javascript
generateOrderNumber(); // Format: ORD-YYYYMMDD-XXXXXX
calculateExpiryTime(type); // 30min for dine_in, 2hr for others
calculatePoints(amount); // 1 point per 10,000 IDR
```

## Testing Infrastructure

Test files in `tests/` use Node.js built-in test runner with mocks from `tests/setup.mjs`:

| File                  | Type        | Coverage                             |
| --------------------- | ----------- | ------------------------------------ |
| `helpers.test.mjs`    | Unit        | Pure functions, validators           |
| `middleware.test.mjs` | Unit        | Auth middleware (mocked req/res)     |
| `auth.test.mjs`       | Integration | Login, register, logout, sessions    |
| `orders.test.mjs`     | Integration | Order flow, validation, admin routes |
| `bookings.test.mjs`   | Integration | Booking CRUD, pricing                |

See `docs/TEST_COVERAGE.md` for full documentation.

## Common Pitfalls

1. **Don't add frontend frameworks** - Intentionally vanilla JS
2. **Don't use SQL migration files** - Use `.mjs` files in `backend/migrations/`
3. **Don't hardcode customer data in orders** - Check `req.session.userId` first
4. **Don't change MySQL port** - XAMPP uses 3307, not 3306
5. **Don't add auth-check.js to guest-accessible pages** - Most pages support guest mode
6. **Don't create backup files** - Use git (see `rules-for-ai.md`)
7. **Don't leave console.log debug statements** - Remove after fixing

## Before Making Changes

1. Use MCP Serena or search tools to find all usages of functions/components
2. Check if the route is protected (`requireAdmin`/`requireUser`)
3. Verify response format follows `{ success, data/error }` pattern
4. Run relevant tests: `node --test tests/{module}.test.mjs`

## References

- `rules-for-ai.md` - Comprehensive editing guidelines
- `docs/TEST_COVERAGE.md` - Test documentation
- `database_schema.sql` - Database structure
- `docs/API_KEY_SECURITY.md` - API key handling
