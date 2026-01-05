---
project_name: 'docterbee_units'
user_name: 'Daus'
date: '2026-01-03'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'quality_workflow_rules', 'business_context', 'architecture_details']
existing_patterns_found: 12
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

### Business Model & Revenue Streams
1. **Product Sales**: Madu premium, herbal remedies, cold-pressed juices, coffee, tea
2. **Service Bookings**: Health consultations (online/offline), manual therapy, clinical treatments
3. **Membership Program**: Card-based membership with points system and reward redemption
4. **Educational Content**: Free health education to build community trust and engagement

### Target Audience
- **Demographics**: Ages 20-65, all religions (primarily Muslim), Indonesia-focused
- **Psychographics**: Health-conscious individuals seeking natural/herbal alternatives
- **Geographic**: Primary locations Makassar & Kolaka (Sulawesi), with nationwide shipping
- **Behavior**: Values traditional medicine backed by science, prefers holistic health approaches

### Critical User Flows
1. **Guest → Member Journey**:
   - Browse products/services as guest → Register → Select membership card type → Account activation → Access member benefits
2. **Shopping Flow**:
   - Browse store → Filter by category → Add to cart → Apply coupon (optional) → Generate QR code → Complete order at physical location
3. **Journey (Gamification)**:
   - Login → Access daily health questions → Answer based on Qur'an/Science/NBSN framework → Earn points → Track progress
4. **Reward Redemption**:
   - Accumulate points through purchases & journey completion → Browse rewards catalog → Request redemption → Admin approval → Claim reward

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

---

## Architecture & Infrastructure

### Database Migration Strategy
**Auto-Migration System** (located in `backend/db.mjs`):
- **On Server Restart**: Automatically creates missing tables via `initializeTables()` function
- **Idempotent Migrations**: Safe to run multiple times via `runMigrations()` with helper functions:
  - `safeAddColumn()`: Adds columns only if they don't exist
  - `safeAddIndex()`: Adds indexes only if they don't exist
  - `safeModifyEnum()`: Safely extends ENUM types
- **Default Data Seeding**: Automatically seeds "Journey Hidup Sehat" default data on first run
- **Developer Note**: To apply schema changes, simply restart the server. No manual migration commands needed.

### API Architecture
- **Current State**: Flat API structure (no versioning)
  - Format: `/api/{resource}` (e.g., `/api/products`, `/api/auth`, `/api/bookings`)
- **Future Consideration**: Migrate to `/api/v1/...` before major public launch to enable backward compatibility
- **Error Response Format**: Standardize as `{ success: false, error: { code: 'ERROR_CODE', message: '...' } }`
- **Success Response Format**: `{ success: true, data: {...} }`

### Performance Targets
- **API Response Time**: < 300ms average (excluding external AI calls)
- **Page Load (First Contentful Paint)**: < 1.5s
- **AI Endpoints (Gemini)**: < 5s (acceptable due to external API dependency)
- **Database Queries**: Optimize queries returning > 100 rows; use indexes on frequently queried columns

### Deployment Architecture
- **Environment**: Traditional server deployment (non-containerized)
- **File Structure for Production**:
  - **Required**: `backend/`, `js/`, `css/`, `assets/`, all `.html` files, `package.json`, `package-lock.json`
  - **Excluded**: `.git/`, `.env`, `node_modules/` (reinstall on server), `_bmad/`, `tests/`, all temp/dev files
- **Uploads Folder**: Create empty `uploads/` directory on server; do NOT sync local uploads to production

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

### Framework-Specific Rules

**Backend (Express.js):**
- **Architecture**: Separated Logic. Keep `server.mjs` clean. Move business logic to `backend/services/` and routing to `backend/routes/` (if/when refactoring).
- **Middleware**: Use middleware for cross-cutting concerns (auth, validation, logging).
- **Responses**: Standardize JSON response format (e.g., `{ success: true, data: ... }` vs `{ success: false, error: ... }`).
- **Security Headers**: Ensure CORS and Security headers are configured correctly for the specific frontend origin.

**Frontend (Vanilla HTML/CSS/JS):**
- **DOM Manipulation**: Use efficient selectors (id/class). Minimize layout thrashing.
- **Assets**: Keep `js/` for logic and `css/` for styles strict. No inline styles/scripts in HTML files unless absolutely necessary for critical rendering path.
- **AI Interactions**: Loading states MUST be shown during AI request processing (e.g., Gemini generation). Handle timeout/failures gracefully in the UI.

### Code Quality & Testing

- **Linting**: STRICTLY follow ESLint Configuration (v9+ Flat Config). Run `npm run lint` before committing.
- **Testing**:
  - Unit Tests: Use `node --test` (native test runner) as configured in `package.json`.
  - Structure: Tests located in `tests/` directory.
  - Coverage: Aim for high coverage on critical business logic (e.g., AI integration, Auth).
- **Comments**: Explain "WHY" not "WHAT". Document complex algorithm or AI prompt logic clearly.

### Development Workflow & Anti-Patterns

- **Git Scope**:
  - **Do NOT commit secrets (.env)**.
  - **Commit Messages**: Clear and descriptive (e.g., "feat: add ai chat endpoint", "fix: resolve login cors issue").
- **Dependency Analysis**: ALWAYS use MCP Serena (or equivalent tool) to analyze impact before making changes.
- **Stability First**: Prioritize code stability over "fancy" refactors. Do NOT over-engineer abstractions without need.
- **Security Anti-Pattern**: NEVER commit SQL dumps with real user data (`.sql` files in gitignore are there for a reason!).
