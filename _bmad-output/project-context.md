---
project_name: 'docterbee_units'
user_name: 'Daus'
date: '2026-01-13'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns', 'business_context', 'architecture_details', 'key_files', 'gallery_system', 'points_article']
status: 'complete'
rule_count: 72
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Business Context

### Product Overview
**DocterBee** is an integrated health ecosystem combining e-commerce, health education, and wellness services:
- **E-commerce Platform**: Premium honey, herbal products, healthy juices, and traditional spices
- **Health Services**: Professional health consultations and treatment bookings
- **Gamified Education**: "Journey Hidup Sehat" (Healthy Living Journey) with daily health challenges and rewards
- **AI-Powered Tools**: Health check advisor and YouTube content summarizer

### Critical User Flows
1. **Guest → Member Journey**: Browse products/services as guest → Register → Select membership card type → Account activation → Access member benefits
2. **Shopping Flow**: Browse store → Filter by category → Add to cart → Apply coupon (optional) → Generate QR code → Complete order at physical location
3. **Journey (Gamification)**: Login → Access daily health questions → Answer based on Qur'an/Science/NBSN framework → Earn points → Track progress
4. **Account Security**: Login → Access Profile → Change Password (self-service) → Logout.
5. **Reward Redemption**: Accumulate points → Browse rewards catalog → Request redemption → Admin approval → Claim reward
6. **Email Verification**: User inputs email → System sends verification link via Resend → User clicks link → Account marked as verified (Clean-as-you-go).
7. **Forgot Password**: Request reset link via email → Token generated (1h expiry) → Verify token → Set new password.
8. **Premium Article Purchase** (NEW): Browse articles → Click locked article → System checks points balance → Deduct points → Unlock article access permanently.
9. **Gallery Management** (Admin): Login admin → Navigate to Gallery section → Upload/Edit/Delete images → Set sort order → Toggle active status.

---

## Technology Stack & Versions

- **Runtime**: Node.js (ESM Modules enforced via `"type": "module"`)
- **Backend Framework**: Express.js ^4.21.2
- **AI/ML**: Google Generative AI SDK ^0.21.0 (Gemini)
- **Database**: MySQL via mysql2 ^3.11.5 driver
- **Authentication**: bcryptjs ^3.0.3 (password hashing)
- **Session Management**: express-session ^1.18.2
- **File Upload**: multer ^2.0.2
- **YouTube Integration**: youtubei.js ^16.0.1, youtube-transcript ^1.2.1
- **Linting**: ESLint v9+ (using `globals` and `@eslint/js`)
- **Email Service**: Resend (Transactional emails)

---

## Critical Implementation Rules

### Language-Specific Rules (JavaScript/Node.js)

- **Module System**: STRICTLY use ES Modules (`import`/`export`). ALWAYS include file extensions in imports (e.g., `import { foo } from './utils.mjs'`).
- **Async/Await**: Prefer `async/await` over raw Promises for better readability and error handling.
- **Error Handling**: Use `try/catch` blocks in all async route handlers. Never swallow errors; always log them and return appropriate HTTP status codes.
- **Strict Mode**: `const` over `let`. No `var`.
- **Naming**: camelCase for variables/functions. kebab-case for filenames.
- **Database**: Use parameterized queries or prepared statements via `mysql2` to prevent SQL injection.
- **Environment**: Access config via `process.env`. Validate existence of critical ENV variables on startup.
- **Math Precision**: Be careful with floating point math for prices. Use appropriate rounding/decimal handling logic.

### Framework-Specific Rules

**Backend (Express.js):**
- **Architecture**: Separated Logic. Keep `server.mjs` clean. Move business logic to `backend/services/` and routing to `backend/routes/`.
- **Middleware**: Use middleware for cross-cutting concerns (auth, validation, logging).
- **Responses**: Standardize JSON response format (e.g., `{ success: true, data: ... }` vs `{ success: false, error: ... }`).
- **Security Headers**: Ensure CORS and Security headers are configured correctly for the specific frontend origin.
- **Atomic Operations**: For critical data like **Stock Deduction**, ALWAYS use database transactions (`START TRANSACTION`, `COMMIT`, `ROLLBACK`) and locking (`FOR UPDATE`) to prevent race conditions.

**Frontend (Vanilla HTML/CSS/JS):**
- **DOM Manipulation**: Use efficient selectors (id/class). Minimize layout thrashing.
- **Assets**: Keep `js/` for logic and `css/` for styles strict. No inline styles/scripts in HTML files unless absolutely necessary for critical rendering path.
- **AI Interactions**: Loading states MUST be shown during AI request processing (e.g., Gemini generation). Handle timeout/failures gracefully in the UI.

### Code Quality & Testing

- **Linting**: STRICTLY use **ESLint v9+ Flat Config** (`eslint.config.js`). DO NOT create legacy `.eslintrc` files.
- **Testing**:
  - **Runner**: Use native `node --test` only. Import `test` from `node:test` and `assert` from `node:assert`.
  - **Structure**: Tests located in `tests/` directory.
  - **Coverage**: Focus coverage on business logic (Points Calculation, Stock Deduction), not just boilerplate.
- **Comments**: Explain "WHY" decisions were made, especially for complex SQL or AI prompt engineering.
- **Email Patterns**:
    - **Service**: Use `backend/utils/mailer.mjs` for all outgoing emails.
    - **Tracking**: Disable click tracking in Resend for verification links to avoid "Dangerous Link" warnings in Gmail.
    - **Sender**: Use domain-verified email (e.g., `admin@docterbee.com`) with `reply_to` pointing to the official Gmail.

### Development Workflow & Anti-Patterns

- **Migration Strategy (CRITICAL)**:
  - **System**: Use the **Idempotent Migration System** in `backend/db.mjs` (`initializeTables`).
  - **Rule**: Schema changes are applied on **Server Restart**. NEVER create manual `.sql` migration files implies urgency.
  - **Verification**: Always check server logs for "✅ Table/Column created" after restart.
- **Database Safety**:
  - **Dynamic SQL**: ALWAYS use the `query(sql, params)` helper with parameterized arrays `?`. NEVER use template literals `${}` for values.
  - **Soft Deletes**: When using `JOIN`, explicitly check `t1.deleted_at IS NULL AND t2.deleted_at IS NULL` for ALL tables supporting soft deletes.
- **AI Integration**:
  - **Timeouts**: ALL external API calls (Gemini/YouTube) MUST have a strictly enforced timeout (e.g., 15s) to prevent hanging requests.
  - **Token Management**: Truncate/summarize inputs before sending to Gemini to avoid context overflow errors.
- **Financial/Stock Logic**:
  - **Atomic Transactions**: Use `START TRANSACTION` + `FOR UPDATE` locking for any logic affecting Product Stock or User Points.
  - **Trust Levels**: NEVER trust price/discount calculations from the frontend. Re-calculate everything on the backend.

### Database Schema Highlights

**Table: `users` (Core Security Columns)**
- `password`: Hashed using `bcryptjs`.
- `is_email_verified`: Boolean (TINYINT). 0 = Unverified (needs cleanup), 1 = Verified. 
- `email_verification_token`: String. Used for email activation links.
- `email_verification_expires`: DATETIME. Token expires after 24 hours.
- `pending_email`: String. Stores new email during verification process to prevent locking out users.
- `reset_password_token`: String. Used for forgot password flow.
- `reset_password_expires`: DATETIME. Token expires after 1 hour.
- `created_at` / `updated_at`: Standard timestamps.

**Table: `coupon_usage` (Anti-Abuse)**
- Tracks which user used which coupon for what order.
- Prevents double-dipping on single-use coupons.

**Performance Indexes (Auto-Migrated)**
- `idx_email_verification_token`: Optimizes `/verify-email` token lookups.
- `idx_reset_password_token`: Optimizes `/reset-password` token lookups.

**Multi-Location Inventory System (Planned - Tech Spec: `tech-spec-multi-location-inventory.md`)**
- **Table: `locations`**: Dynamic store/warehouse management. Replaces hardcoded ENUMs.
  - Columns: `id`, `name`, `address`, `type` (ENUM: store, warehouse), `is_active`.
- **Table: `product_stocks`**: Per-location inventory tracking.
  - Columns: `id`, `product_id` (FK), `location_id` (FK), `quantity`, `updated_at`.
  - **Replaces**: `products.stock` column (legacy, will be deprecated).
- **Modified: `orders`**: Added `location_id` (INT, nullable) for new orders.
- **Modified: `reward_redemptions`**: Added `location_id` (INT) to track redemption location.

**Table: `gallery_images` (NEW - 2026-01-13)**
- Manages image gallery for landing page and promotional content.
- Columns: `id`, `title`, `description`, `image_url`, `sort_order`, `is_active`, `created_at`, `updated_at`.
- **Soft Active**: Uses `is_active` flag (not soft delete) to show/hide images.
- **Sorting**: `sort_order ASC, created_at DESC` for display order.

**Table: `articles` (Enhanced - 2026-01-13)**
- **NEW Columns for Points-Based Access**:
  - `points_cost` (INT): Number of points required to unlock article. 0 = free.
  - `is_free` (TINYINT): Boolean flag. Auto-set based on `points_cost`.
- **Purchase Tracking**: `article_purchases` table tracks which user purchased which article.

**Table: `ai_advisor_usage` (Tracking)**
- Logs AI Advisor usage with `points_cost` per query (currently 1 point).
- Columns: `user_id`, `question`, `points_cost`, `status`, `response_source`.

### Rate Limiting Strategy

| Endpoint Category | Max Attempts | Cooldown | Purpose |
|-------------------|--------------|----------|---------|
| Login (`/login`) | 8 | 2 min | Brute-force prevention |
| Email (`/update-email`, `/resend-verification`) | 3 | 10 min | Billing/reputation protection |
| Forgot Password (`/forgot-password`) | 8 | 2 min | Uses login limiter |

---

## Key Files Reference

**Backend Utilities:**
- `backend/utils/mailer.mjs`: Email service wrapper using Resend API. Contains `sendVerificationEmail()` and `sendForgotPasswordEmail()`.
- `backend/utils/rate-limiter.mjs`: In-memory rate limiter. Exports `loginRateLimiter` (8/2min) and `emailRateLimiter` (3/10min).

**Authentication Routes (`backend/routes/auth.mjs`):**
- `POST /api/auth/register`: New user registration.
- `POST /api/auth/login`: User login with rate limiting.
- `POST /api/auth/logout`: Session destruction.
- `POST /api/auth/change-password`: Self-service password change (requires verified email).
- `POST /api/auth/update-email`: Request email change with verification.
- `GET /api/auth/verify-email`: Token verification handler.
- `POST /api/auth/resend-verification`: Resend verification email.
- `POST /api/auth/forgot-password`: Request password reset link.
- `POST /api/auth/reset-password`: Set new password with valid token.

**Gallery Routes (`backend/routes/gallery.mjs`) (NEW - 2026-01-13):**
- `GET /api/gallery`: Public endpoint. Returns active gallery images sorted by `sort_order`.
- `GET /api/gallery/admin`: Admin only. Returns all images including inactive.
- `POST /api/gallery`: Admin only. Create new gallery image. Requires `image_url`.
- `PUT /api/gallery/:id`: Admin only. Update gallery image (partial update supported).
- `DELETE /api/gallery/:id`: Admin only. Hard delete gallery image.

**Insight/Article Routes (`backend/routes/insight.mjs`) (Enhanced - 2026-01-13):**
- `GET /api/insight`: List articles. Includes `points_cost` and `is_free` fields.
- `GET /api/insight/:slug`: Get article detail. **Points check enforced** - returns locked content for unpurchased premium articles.
- `POST /api/insight/:id/purchase`: **Purchase article with points**. Deducts `points_cost` from user's balance and grants permanent access.
- `POST /api/insight`: Admin only. Create article with optional `points_cost`.
- `PUT /api/insight/:id`: Admin only. Update article including `points_cost` and `is_free`.

**Frontend Shared Functions:**
- `js/utils.js`: Global utilities (`escapeHtml`, `formatCurrency`, `formatDate`, `debounce`, etc.). All exported to `window.*`.
- `js/modal-utils.js`: Modal dialogs (`showSuccess`, `showError`, `showWarning`, `showConfirm`).
- `js/script.js`: Main app logic. Contains `performLogout()` and `handleLogout()` (authoritative versions).
- `js/landing-navbar.js`: Navbar logic. Delegates logout to global `handleLogout` from script.js.

**Code Consolidation Notes (2026-01-05):**
- `handleLogout` and `performLogout`: Consolidated to single source in `script.js`. `landing-navbar.js` delegates to global version.
- `initMobileMenu`: Actual implementation in `landing-navbar.js`. Empty stub in `script.js` for backward compatibility.
- **Transaction History (2026-01-06)**:
  - Moved "Riwayat Aktivitas" from `profile.html` to `store.html` (via Floating History Button).
  - Logic centralized in `js/store-enhancements.js` (`loadStoreHistory`, `openHistoryOrderDetail`).
  - **Dual View Logic**: Pending orders show QR + Countdown + Check Status Button. Completed orders show full Receipt (Struk) style.
  - **Backend**: Added `expires_at` column to `GET /api/user-data/activities/order/:id` response to support countdowns.

**Updates (2026-01-13):**
- **Gallery Management**: Full CRUD in admin dashboard via `js/gallery-manager.js` (if exists) or embedded in `admin-dashboard.js`.
- **Points-Based Articles**: Articles can be set as premium (requires points to read). Purchase flow in `index.html` and `insight.html`.
- **Skeleton Loading Pattern**: Use CSS skeleton classes for loading states. Pattern: `<div class="skeleton skeleton-text"></div>` for text, `skeleton-card` for cards.
- **Admin Dashboard Sections**: Bookings, Articles (Insight), Events, Coupons, Services, Products, Rewards, Users, Reports, Event Registrations, Gallery.
- **UI Improvements**: Enhanced CSS in `landing-page.css` (+410 lines) for services and program display.


---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-01-13

---

## Changelog

| Date | Changes |
|------|--------|
| 2026-01-13 | Added Gallery Management System, Points-Based Article Purchase, Skeleton Loading patterns, Admin Dashboard enhancements |
| 2026-01-07 | Initial version with core features documented |
| 2026-01-06 | Transaction History moved to store.html |
| 2026-01-05 | Code consolidation (handleLogout, initMobileMenu) |
