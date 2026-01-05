# Docterbee Units - AI Coding Agent Instructions

Health & wellness platform: Express.js + MySQL backend, **vanilla JS frontend** (intentionally no frameworks).

## Architecture

### Session-Based Auth (Not JWT)

```javascript
// Backend: req.session.userId (user), req.session.isAdmin (admin)
// Frontend: ALWAYS include { credentials: "include" } in fetch calls
```

- Middleware: `requireAdmin`, `requireUser` from [backend/middleware/auth.mjs](../backend/middleware/auth.mjs)
- Most pages support **guest mode** - only add `auth-check.js` to protected pages
- Rate limiting: Use `RateLimiter` class from [backend/utils/rate-limiter.mjs](../backend/utils/rate-limiter.mjs) - see login & member-check endpoints

### API Response Format (Strict)

```javascript
{ success: true, data?: any, message?: string }  // Success
{ success: false, error: "Indonesian message" }  // Error - ALWAYS Indonesian
```

### Database (Port 3307)

- Connection pool via [backend/db.mjs](../backend/db.mjs): `query()` → rows array, `queryOne()` → single row or null
- Auto-initializes tables on startup with `initializeTables()` - idempotent migrations
- Migrations: `.mjs` files with `async up()` in `backend/migrations/` - NOT SQL files
- Uses prepared statements via `pool.execute()` (transaction commands use `pool.query()`)

**Important Tables**:

- `users` - card_type ENUM with 7 types (Active-Worker, Family-Member, etc.) - see [js/card-config.js](../js/card-config.js)
- `journeys` → `journey_units` → `unit_items` - Dynamic 3-level hierarchy for health education content
- `user_progress`, `user_cart` - JSON storage for guest→user data sync

### Guest + Logged-in Hybrid Architecture

**Critical Design Pattern**: Most features work for both guest and logged-in users. Database syncs only when user is authenticated.

```javascript
// Backend orders.mjs - dual user pattern
const userId = req.session?.userId || null;
const customerName = userId ? req.session.userName : guest_data?.name;

// Frontend user-data-sync.js - conditional sync
if (currentUserId) {
  await syncProgressToDatabase(); // Only sync when logged in
} else {
  // Guest: localStorage only, no server sync
}
```

**Key Insight**: Guest users interact with all features (store, bookings) using `localStorage`. Login triggers database sync via `initUserDataSync()` in [js/user-data-sync.js](../js/user-data-sync.js).

## Commands

```bash
npm run dev                                    # Watch mode (--watch flag, no nodemon)
npm run setup                                  # First-time: admin + rewards
npm run lint:fix                               # Auto-fix ESLint
node --test tests/helpers.test.mjs             # Unit test (no server needed)
npm start & node --test tests/orders.test.mjs  # Integration (server required)
```

## Key Patterns

### Frontend Script Load Order (Critical)

Frontend uses global scope - load dependencies BEFORE consumers:

```html
<!-- Shared utilities first -->
<script src="/js/utils.js"></script>
<script src="/js/modal-utils.js"></script>
<!-- Config modules before feature scripts -->
<script src="/js/admin-api.js"></script>
<!-- Before admin-dashboard.js -->
<script src="/js/card-config.js"></script>
<!-- Before register-card-preview.js and member-check.js -->
<!-- Feature scripts last -->
<script src="/js/admin-dashboard.js"></script>
```

**Why**: No module system - functions declared in later scripts depend on earlier globals. ESLint config declares these in `globals` ([eslint.config.mjs](../eslint.config.mjs)).

**Card Config Pattern**: [js/card-config.js](../js/card-config.js) exports `CARD_TYPE_CONFIG` (7 membership card types with front/back images, labels, name sizing rules). Used by register & member-check pages.

### Route Handler Template

```javascript
// backend/routes/{resource}.mjs - plural naming
import express from "express";
import { requireAdmin } from "../middleware/auth.mjs";
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
export default router;
```

**Pattern**: Always use `query()` for multiple rows, `queryOne()` for single row (returns `null` if not found). Import order matters (standard libs → local modules).

### Guest vs Logged-in User Flow

```javascript
// Backend: Always handle both cases
const userId = req.session?.userId || null;
if (userId) {
  // Logged-in user - get data from session
  customerName = req.session.userName;
} else if (guest_data) {
  // Guest checkout - use provided data
  customerName = guest_data.name;
}
```

**Orders Example** ([backend/routes/orders.mjs](../backend/routes/orders.mjs)): Logged-in users get `user_id` foreign key; guests store data in JSON columns with `user_id = NULL`.

### Frontend Modals (Not alert())

```javascript
showSuccess("Berhasil!", "Data tersimpan");
showError("Gagal", "Terjadi kesalahan");
showConfirm("Hapus?", "Data akan dihapus", onConfirm);
```

**Implementation**: Custom modals in [js/modal-utils.js](../js/modal-utils.js) - declared as globals, used across all HTML pages.

### Shared Utilities

- **Backend:** [backend/utils/helpers.mjs](../backend/utils/helpers.mjs) - `generateOrderNumber()`, `calculatePoints()`, `calculateExpiryTime()`
- **Frontend:** [js/utils.js](../js/utils.js) - `escapeHtml()`, `formatDate()`, `formatCurrency()`, `debounce()`, `getCategoryColor()`

**Critical**: Do NOT duplicate logic - extract to shared utils. Backend uses ES modules (`.mjs`), frontend uses global functions (`.js`).

### Testing

```javascript
// Unit test (no server): tests/helpers.test.mjs, tests/middleware.test.mjs
import { createMockRequest, createMockResponse } from "./setup.mjs";

// Integration test (server running): tests/orders.test.mjs, tests/auth.test.mjs
import { apiRequest, CookieJar } from "./setup.mjs";
const { response, data } = await apiRequest("/api/endpoint", { cookieJar });
```

**Test Coverage Strategy**: Unit tests for pure functions ([tests/helpers.test.mjs](../tests/helpers.test.mjs)), integration tests with `CookieJar` for session persistence ([tests/setup.mjs](../tests/setup.mjs)).

## Data Flow Architecture

### Client → Server → Database

1. **Frontend** (`*.html` + `js/*.js`): Vanilla JS, global scope, uses `fetch()` with `credentials: "include"`
2. **Session Layer** ([backend/server.mjs](../backend/server.mjs)): `express-session` stores `userId`, `isAdmin` in cookies
3. **Routes** (`backend/routes/*.mjs`): Express routers mounted at `/api/{resource}`
4. **Database** ([backend/db.mjs](../backend/db.mjs)): MySQL pool, prepared statements, auto-migrations

### Guest-to-User Transition

When guest signs up/logs in:

1. Frontend calls `initUserDataSync(userId)` from [js/user-data-sync.js](../js/user-data-sync.js)
2. Backend `POST /api/user-data/sync-progress` merges `localStorage` with database
3. Future changes auto-sync (Journey units, cart, points)

**Implementation**: `user_progress` and `user_cart` tables store JSON blobs; `loadUserProgress()` populates `localStorage` from DB.

## Data Structures

### Journey System (Dynamic Content)

Three-level hierarchy in database ([backend/db.mjs](../backend/db.mjs) lines 390-450):

```javascript
// Journeys (top level) - e.g., "Hidup Sehat"
journeys { slug, name, description }

// Units (middle level) - e.g., "Unit 1 · 24 Jam Sehari"
journey_units { journey_id, title, color_class }

// Items (questions) - e.g., "Sudah shalat Subuh tepat waktu?"
unit_items { unit_id, item_key, question, dalil, sains, nbsn }
```

- Default journey "hidup-sehat" seeded on first install ([backend/db.mjs](../backend/db.mjs) `seedDefaultJourney()`)
- Admin can create/edit journeys via [js/journey-manager.js](../js/journey-manager.js)
- Frontend loads via `GET /api/journeys/:slug` and stores user answers in `localStorage`
- Answers sync to `user_progress` table when logged in ([js/user-data-sync.js](../js/user-data-sync.js))

### Card Type System

7 membership card types with configuration in [js/card-config.js](../js/card-config.js):

- Active-Worker, Family-Member, Healthy-Smart-Kids, Mums-Baby, New-Couple, Pregnant-Preparation, Senja-Ceria
- Each type has front/back images in `/uploads/gambar_kartu/`, display label, and `smallName` flag for name rendering
- Used by: `register.html` (card preview), `member-check.html` (card verification)
- Database: `users.card_type` ENUM field

## Security & Production

### Session Configuration

**Development**: `secure: false`, `sameSite: 'lax'` (HTTP allowed)  
**Production**: `secure: true`, `sameSite: 'strict'` (HTTPS required), `trust proxy: 1` for reverse proxy

**Critical**: `SESSION_SECRET` MUST be set in production (64+ chars random string) - server exits if missing ([backend/server.mjs](../backend/server.mjs) lines 48-57).

### Rate Limiting

Login endpoint protected: `loginRateLimiter` (5 attempts/15min per IP) in [backend/utils/rate-limiter.mjs](../backend/utils/rate-limiter.mjs).

**Pattern for adding rate limiting to any route**:

```javascript
import { RateLimiter } from "../utils/rate-limiter.mjs";
const myRateLimiter = new RateLimiter({
  maxAttempts: 5,
  cooldownMs: 15 * 60 * 1000,
});

router.post("/endpoint", myRateLimiter.middleware(), async (req, res) => {
  // In handler: req.rateLimiter.recordFailure() on error, req.rateLimiter.reset() on success
});
```

### CORS

Whitelist-only: `docterbee.com`, `localhost:3000` ([backend/server.mjs](../backend/server.mjs) lines 85-104). Allows same-origin when no `Origin` header.

## DO NOT

1. Add frontend frameworks (React/Vue) - vanilla JS is intentional
2. Create backup files (`*_backup.js`) - use git
3. Leave `console.log` debug statements
4. Change MySQL port from 3307 (XAMPP non-standard)
5. Hardcode customer data - check `req.session.userId`
6. Add `auth-check.js` to guest-accessible pages (store, booking, etc.)
7. Modify migration files after deployment - create new ones

## Before Editing

1. Search all usages before modifying functions (use MCP Serena: `find_referencing_symbols`)
2. Check route protection level (`requireAdmin`/`requireUser` or guest)
3. Error messages in **Indonesian** for user-facing responses
4. Run `node --test tests/{module}.test.mjs` after changes
5. Verify relative import paths (ES modules: `../db.mjs`)
6. Check ESLint globals if adding new cross-file function dependencies

## References

- [rules-for-ai.md](../rules-for-ai.md) - Detailed editing constraints
- [AGENTS.md](../AGENTS.md) - Code style and naming conventions
- [database_schema.sql](../database_schema.sql) - Full schema reference
