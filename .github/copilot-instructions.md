# Docterbee Journey – AI Coding Agent Instructions

## Project Overview

Health journey tracking app combining Islamic teachings (Qur'an & Sunnah), modern science, and the NBSN framework (Neuron, Biomolekul, Sensorik, Nature). Users answer daily questions, book appointments, attend events, read insights, and analyze media content—all earning points/scores.

**Tech Stack**: Node.js + Express (backend), MySQL/XAMPP (database), Vanilla JS + Tailwind CSS (frontend)  
**Key Insight**: Frontend and backend are decoupled - frontend works standalone with localStorage/mock data, backend provides API persistence

## Architecture: Full-Stack Hybrid SPA

### Frontend (Multi-Page Pattern)

**Eight HTML pages with organized CSS/JS (moved to folders):**

- **`index.html`**: Journey tracking (6 units) - uses `localStorage` for state
- **`booking.html`**: Appointment + promo validation - calls `/api/bookings`, `/api/coupons/validate`
- **`events.html`**: Webinar listings - fetches from `/api/events` (falls back to mock `EVENTS_DATA`)
- **`insight.html`**: Articles - fetches from `/api/insight` (falls back to mock `INSIGHT_DATA`)
- **`media.html`**: YouTube/podcast player + AI analysis via `/api/summarize` (Gemini)
- **`ai-advisor.html`**: AI health advisor with Qur'an/Sunnah context - calls `/api/ai-advisor` (Gemini)
- **`admin-dashboard.html`**: CRUD for bookings/events/articles/coupons - uses `sessionStorage` auth
- **`services.html`**: Services listing - fetches from `/api/services` with filters (branch, mode, category)

**File Organization** (critical - paths changed from root):

- **`css/style.css`**: 1669 lines (Header: 119, Hero: 227, Booking: 697, Events: 1102, Insight: 1200, Media: 1339)
- **`js/script.js`**: 2500+ lines for public pages (UNITS: line 7, Storage helpers: ~250, Rendering: ~320, Services: ~2350, Page inits: 664+)
- **`js/admin-dashboard.js`**: 875 lines for admin (Auth check: line 18, Event listeners: 50-92, Tab switching: 117)

**All HTML pages link**: `href="css/style.css"` and `src="js/script.js"` (or `js/admin-dashboard.js` for admin)  
**Exception**: `ai-advisor.html` contains inline JavaScript (~570 lines) for AI analysis logic

### Backend (Express + MySQL)

**API server with auto-initializing database:**

- **`backend/server.mjs`**: Main server (627 lines) - mounts 4 routers, serves static files from root, 2 Gemini endpoints (`/api/summarize`, `/api/ai-advisor`)
- **`backend/db.mjs`**: Connection pool (250+ lines) - creates 5 tables on startup if missing
- **`backend/routes/`**: bookings.mjs, events.mjs, insight.mjs, coupons.mjs, services.mjs (each ~200-310 lines)

**Database Tables** (auto-created):

1. `bookings` - service_name, booking_date, booking_time, promo_code, status (enum), price, discount_amount, final_price, customer data (name, phone, age, gender, address), indexed
2. `events` - title, event_date, mode (enum: online/offline), topic, description, speaker, registration_fee, registration_deadline, location, link, is_active (soft delete)
3. `articles` - title, slug (unique), content, image_url, is_published (soft delete)
4. `coupons` - code (unique), discount_type (enum: percentage/fixed), value, usage_limit, is_active
5. `services` - name, category (enum: manual/klinis/konsultasi/perawatan), price, description, branch (comma-separated), mode (enum: online/offline/both), practitioner, is_active (soft delete)

**Critical**: MySQL runs on port **3307** (not default 3306) - XAMPP configuration. Set `DB_PORT=3307` in `.env`

## Critical Development Patterns

### 1. Event Handling (NO inline onclick!)

```javascript
// ❌ WRONG (old pattern): <button onclick="answer('u1','subuh',1)">Ya</button>

// ✅ CORRECT (current pattern in js/script.js):
<button class="btn-yes" data-unit="u1" data-key="subuh" data-value="1">
  Ya
</button>
// Attached via: attachUnitEventListeners() using addEventListener
```

**CRITICAL BUG PATTERN** - Modal functions with optional parameters:

```javascript
// ❌ WRONG - Event object passed as parameter:
.addEventListener("click", openCouponModal);
// This passes PointerEvent to openCouponModal(id = null), causing "[object PointerEvent]" in URLs

// ✅ CORRECT - Wrap in arrow function:
.addEventListener("click", () => openCouponModal());
// This ensures id parameter receives undefined, triggering default null value
```

**Applied in admin-dashboard.js** (lines 54, 68, 82): `openArticleModal()`, `openEventModal()`, `openCouponModal()`

**Exception**: `insight.html` uses inline `onclick="summarizeArticle(0)"` on article buttons (legacy pattern, accepted)  
**Exception**: `ai-advisor.html` uses inline `<script>` tag for all logic (~570 lines) - architectural decision for self-contained AI feature

### 2. String Safety (Escape quotes!)

```javascript
// ❌ WRONG: 'Apakah membaca Al-Qur'an?' → syntax error
// ✅ CORRECT: 'Apakah membaca Al-Qur\'an?' → escaped quote
// ✅ CORRECT: 'Nature: napas 2"' → use double quote inside single quote
```

**Critical**: When adding questions to `UNITS` array in `js/script.js`, escape single quotes with `\'`

### 3. XSS Prevention & Markdown Rendering (Frontend)

**Security**: All user-facing content uses `escapeHtml()` function (~line 380 in js/script.js) before inserting into DOM.

**Markdown Support**: For AI-generated content, use `markdownToHtml()` function (~line 2120 in js/script.js) which safely converts markdown formatting to HTML:

```javascript
// ✅ CORRECT: For AI responses with markdown (**, *, `)
<p class="text-slate-200/85">${markdownToHtml(aiResponse)}</p>

// ✅ CORRECT: For user input without markdown
<div class="font-semibold">${escapeHtml(item.q)}</div>
```

**`markdownToHtml()` features**:

- Converts `**bold**` → `<strong class='font-semibold text-slate-100'>`
- Converts `*italic*` → `<em class='italic text-slate-200'>`
- Converts `` `code` `` → `<code class='px-1.5 py-0.5 rounded bg-slate-800 text-amber-300'>`
- Automatically escapes HTML first for XSS protection

**Usage locations**:

- `js/script.js`: `formatAISummary()` for media analysis, `summarizeArticleById()` for insight
- `ai-advisor.html`: All AI response rendering (verdict, steps, dalil, NBSN analysis)

Never insert raw strings into innerHTML without escaping or markdown processing.

### 4. SQL Injection Prevention (Backend)

All database queries use parameterized statements via mysql2:

```javascript
// ✅ CORRECT: Parameterized query in backend/routes/bookings.mjs
const booking = await queryOne("SELECT * FROM bookings WHERE id = ?", [id]);

// ❌ WRONG: String concatenation
const booking = await queryOne(`SELECT * FROM bookings WHERE id = ${id}`);
```

### 5. API Response Pattern

All backend routes follow consistent JSON structure:

```javascript
// Success response
res.json({ success: true, data: result, count: result.length });

// Error response
res.status(404).json({ success: false, error: "Resource tidak ditemukan" });
```

### 6. Soft Deletes (Not Hard Deletes)

Tables use `is_active` or `is_published` flags instead of DELETE:

```javascript
// backend/routes/events.mjs - Soft delete
await query("UPDATE events SET is_active = 0 WHERE id = ?", [id]);
// Never: await query("DELETE FROM events WHERE id = ?", [id]);
```

## Data Model: UNITS Array (script.js, line 7)

```javascript
const UNITS = [
  {
    id: "u1",
    title: "Unit 1 · 24 Jam Sehari",
    color: "text-amber-300", // Tailwind class
    items: [
      { key: "subuh", q: "...", dalil: "...", sains: "...", nbsn: "..." },
    ],
  },
];
```

**To add questions**:

1. Find the relevant unit in UNITS array
2. Append to `items` array with all 4 required fields
3. Ensure `key` is unique within the unit
4. Escape any single quotes in text with `\'`

## State Management (localStorage)

```javascript
// Storage keys:
'db_units'  → {u1: {subuh: 1, quranPagi: 0}, u2: {senyum: 1}}
'db_points' → {value: 150}

// Helper functions:
_db(name, value?)  // Get/set localStorage with JSON parse/stringify
getState()         // Get user answers
setState(state)    // Save user answers
_getPoints()       // Get current points
addPoints(value)   // Add points and refresh display
```

## CSS Architecture (style.css)

Organized by component with section headers:

- Keyframe Animations (lines 16-117): fadeIn, slideUp, pulse, shimmer, bounce, glow, rotate, counterGlow
- Header Styles (lines 119-223): Logo, nav links, hamburger button
- Hero Section (lines 227-295): Score counter, rotating gradient
- Tab Navigation (lines 297-339): Shimmer on hover, glow when active
- Question Cards (lines 361-429): Staggered slide-up animations
- Buttons (lines 441-625): Selected states (green/red), hover effects
- Booking Styles (lines 697-945): Form inputs, slot buttons, date picker
- **Events Styles** (line 1102): Filters, event cards with shimmer sweep
- **Insight Styles** (line 1200): Article cards, NBSN recommendation cards
- **Media Styles** (line 1339): YouTube player, podcast items, AI analysis cards

**Custom classes replace inline styles**:

- `.logo-box` → amber square logo with pulse animation
- `.btn-yes` / `.btn-no` → gold border default, green/red when selected
- `.hamburger-btn` → mobile menu trigger (visible only on `md:hidden`)
- `.mobile-menu` → 280px slide-in drawer from right (-100% to 0)
- `.mobile-menu-overlay` → backdrop with blur effect

## JavaScript Architecture (script.js)

**Organized by feature with page-specific sections:**

1. **DATA MODEL** (line 7): `UNITS` array (6 units), `EVENTS_DATA` (line 941), `INSIGHT_DATA` (line 1082), `PODCAST_DATA` (line 1189)
2. **STORAGE HELPERS** (line ~250): `_db()`, `getState()`, `addPoints()`, `refreshNav()`
3. **UI RENDERING** (line ~320): `buildTabs()`, `showUnit()`, DOM manipulation with `escapeHtml()`
4. **USER INTERACTIONS** (line ~420): `answer()` with button state toggling, `toggleInfo()`
5. **SCORING** (line ~470): `calcUnit()`, `calcAll()` with `animateCounter()` (ease-out cubic, 1500ms)
6. **MOBILE MENU** (line 618): `initMobileMenu()` - hamburger, overlay, scroll lock
7. **PAGE INITS** (line 664+): `init()`, `initBooking()` (874), `initEvents()` (1029), `initInsight()` (1154), `initMedia()` (1442)
8. **APP STARTUP** (line 1481): Page detection via unique element IDs (`slots`, `events`, `articles`, `ytPlayer`)

**Scoring formulas & point rewards**:

- Unit score: `(yesCount / totalItems) * 100` → bonus = `floor(score/20)`
- Total score: average of all units → bonus = `floor(total/25)`
- Each "Ya" answer: +1 point immediate | Insight summary: +2 points | Media analysis: +3 points

## Development Workflow

### Frontend Development

1. **Edit data**: Modify `UNITS` array in `js/script.js` (line 7)
2. **Edit styles**: Update `css/style.css` (never add inline styles to HTML)
3. **Edit logic**: Update functions in `js/script.js` (maintain section organization by feature)
4. **Test frontend**: Open `http://localhost:3000/index.html` in browser (requires backend running)
5. **Debug localStorage**: DevTools → Application → Local Storage → `db_units`, `db_points`
6. **Clear state**: Console → `localStorage.clear()`

### Backend Development

1. **Start server**: `npm start` (or `npm run dev` for watch mode)
2. **Check database**: phpMyAdmin → `docterbee_units` database (via XAMPP)
3. **Test API**: Use browser or Postman - all endpoints return JSON
4. **View logs**: Console shows connection status, errors, request logs
5. **Auto-restart**: Use `npm run dev` for automatic reload on file changes

### Critical Setup Steps

```bash
# 1. Install dependencies (first time only)
npm install

# 2. Start XAMPP MySQL (port 3307)
# Open XAMPP Control Panel → Start MySQL

# 3. Configure environment
cp .env.example .env
# Edit: DB_PORT=3307, GEMINI_API_KEY=your_key

# 4. Start backend (auto-creates tables)
npm start
# Expected: "✅ Database connected" + "✅ Table: bookings/events/articles/coupons"

# 5. Open frontend
# http://localhost:3000/index.html
# http://localhost:3000/admin-dashboard.html (admin/docterbee2025)
```

### Common Commands

- `npm start` - Production mode (backend server)
- `npm run dev` - Development mode with auto-reload (Node v18+ with --watch flag)
- `npm run old-server` - Fallback to legacy server.mjs (no database)
- `Get-Process node | Stop-Process` - PowerShell: Kill all Node processes
- `netstat -ano | Select-String ":3000"` - PowerShell: Check port usage

### Debugging Tips

**Browser DevTools Network Tab**: Check for `[object PointerEvent]` in request URLs - indicates event object passed incorrectly as function parameter

**Console Logging**: Add strategic console.logs in event handlers to trace data flow:

```javascript
console.log(
  "Form submit - ID field value:",
  document.getElementById("couponId").value
);
```

**MCP Playwright Integration**: Use browser automation tools for real-world testing:

```javascript
// Check network requests after form submit
const requests = await page.evaluate(() =>
  performance.getEntriesByType("resource")
);
```

## Page-Specific Patterns

### Booking Page (booking.html)

**State**: `bookingState` object for selected time slot + validated coupon  
**Key functions**: `generateSlots()`, `selectSlot()`, `validatePromoCode()` (async), `saveBookingToDatabase()` (async), `confirmBooking()`  
**API integration**:

- `POST /api/coupons/validate` - Validates promo code, returns discount info
- `POST /api/bookings` - Saves booking, auto-increments coupon usage_count
  **WhatsApp integration**: `confirmBooking()` opens wa.me link (+62-821-8808-0688) with formatted message  
  **Datepicker**: Min = today, max = +3 months (set in `initBooking()`)

### Events Page (events.html)

**State**: `EVENTS_DATA` mock array (fallback), loads from `/api/events?mode=&topic=` on init  
**Key functions**: `renderEvents()` (async) with filter logic, `formatEventDate()` helper  
**Filter IDs**: `eventMode`, `eventTopic` - both default to "all", triggers re-render on change

### Insight Page (insight.html)

**State**: `INSIGHT_DATA` mock array (fallback), loads from `/api/insight` on init  
**Key functions**: `renderInsightArticles()` (async), `summarizeArticleById(slug)` (async with API call)  
**Pattern**: onclick attribute used for article buttons (`onclick="summarizeArticle(0)"`) - legacy exception  
**Points**: +2 points when user clicks "Lihat Rekomendasi NBSN"

### Media Page (media.html)

**State**: `PODCAST_DATA` array (4 episodes with sample URLs)  
**Key functions**: `loadYouTube()`, `extractYouTubeId()`, `playPodcast()`, `analyzeMedia()` with keyword detection  
**YouTube**: Supports youtube.com/watch?v=, youtu.be/, embed URLs (iframe injection)  
**AI Analysis**: Sends notes to `/api/summarize` (Gemini), checks alignment with Qur'an/Sunnah (+3 points)

### AI Advisor Page (ai-advisor.html)

**State**: Inline JavaScript with `SAMPLES` (3 sample questions), `DALIL_DATABASE` (8 dalil entries)  
**Key functions**: `analyzeQuestion()` (async), `renderStructuredResponse()`, `renderFallbackResponse()`, `pickRelevantDalil()`  
**Pattern**: Uses inline `<script>` tag (~570 lines) instead of separate JS file - **architectural exception**  
**API integration**: `POST /api/ai-advisor` with JSON prompt engineering for structured output (verdict, recommendations, NBSN analysis)  
**Fallback**: Local analysis using keyword matching if API fails or quota exceeded  
**Points**: +3 points when AI analysis completes successfully

### Services Page (services.html)

**State**: Fetches from `/api/services` with filters (branch, mode, category)  
**Key functions**: `renderServices()` (async), `getCategoryBadgeHTML()`, `getModeInfoHTML()`, `formatPrice()`, `initServices()`  
**Filter IDs**: `branchFilter` (Kolaka/Makassar/Kendari), `modeFilter` (online/offline), category checkboxes  
**Dynamic rendering**: Replaces static HTML cards with API data from database  
**Integration**: Services managed via admin dashboard appear on public page automatically

### Admin Dashboard (admin-dashboard.html)

**Authentication**: Simple sessionStorage-based (`admin_session` key), credentials: `admin/docterbee2025`  
**Structure**: 5 sections with tab navigation (Bookings, Events, Insight, Coupons, Services)  
**Key patterns**:

- `sessionStorage` check on load (line 18 in js/admin-dashboard.js)
- All CRUD uses fetch API to backend (`API_BASE = "http://localhost:3000/api"`)
- Modal-based editing (open/close functions per section)
- Status dropdown for bookings (pending/confirmed/completed/cancelled)
- Soft delete for events/articles/services (sets `is_active=0` or `is_published=0`)

**Critical functions per section**:

- Bookings: `loadBookings()`, `updateBookingStatus()`, `filterBookingStatus`
- Events: `loadEvents()`, `openEventModal()`, `handleEventSubmit()`, `deleteEvent()`
- Insight: `loadArticles()`, `openArticleModal()`, `handleArticleSubmit()`, `deleteArticle()`
- Coupons: `loadCoupons()`, `openCouponModal()`, `handleCouponSubmit()`, `deleteCoupon()`
- Services: `loadServices()`, `openServiceModal()`, `handleServiceSubmit()`, `editService()`, `confirmDeleteService()`

## Testing & Validation

### Browser Automation Testing

Use MCP Playwright for end-to-end testing of CRUD operations:

```javascript
// Example: Test coupon creation flow
await page.click('[data-section="coupons"]');
await page.click("#btnNewCoupon");
await page.fill("#couponCode", "TEST2025");
await page.selectOption("#couponDiscountType", "percentage");
await page.fill("#couponDiscountValue", "15");

// Verify hidden ID field is empty (not event object!)
const couponId = await page.inputValue("#couponId");
console.log("couponId before submit:", couponId); // Should be ""

// Submit and check for success alert
page.once("dialog", (dialog) => dialog.accept());
await page.click('#couponForm button[type="submit"]');
```

### Common Test Scenarios

1. **Login flow**: `admin/docterbee2025` → verify dashboard loads
2. **Create operations**: Test all 3 types (coupon/event/article) for `[object PointerEvent]` bug
3. **Edit operations**: Verify modal pre-fills with existing data
4. **Network inspection**: Check PATCH/POST URLs don't contain event objects
5. **localStorage state**: Verify `db_units`, `db_points` persist correctly
6. ❌ Don't forget to update ALL 8 HTML pages when changing shared components (header/footer/nav)

## Common Pitfalls to Avoid

1. ❌ Don't add inline onclick handlers to HTML (except `summarizeArticle()` on insight page buttons and `analyzeQuestion()` on ai-advisor)
2. ❌ Don't add inline styles to HTML - all styling in `css/style.css`
3. ❌ Don't forget to escape quotes in UNITS array strings with `\'`
4. ❌ Don't skip XSS escaping when inserting dynamic content - use `escapeHtml()` for plain text or `markdownToHtml()` for AI responses
5. ❌ Don't display raw markdown symbols (\*_, _, `) in AI responses - always use `markdownToHtml()` for proper formatting
6. ❌ Don't use string concatenation in SQL queries - always use parameterized statements
7. ❌ Don't hard delete database records - use soft delete flags (`is_active`, `is_published`)
8. ❌ Don't forget to update ALL 8 HTML pages when changing shared components (header/footer/nav)
9. ❌ Don't forget `initMobileMenu()` call when creating new pages
10. ❌ Don't assume MySQL default port 3306 - this project uses 3307 (XAMPP config)
11. ❌ Don't use `require()` in backend - this project uses ES Modules (`import/export`)
12. ❌ Don't pass functions directly to addEventListener if they have optional parameters - use arrow functions

## Project Structure

```
docterbee_units/
├── backend/              # Node.js + Express API
│   ├── server.mjs       # Main server with route mounting
│   ├── db.mjs           # MySQL pool + table initialization
│   └── routes/          # Modular API endpoints
│       ├── bookings.mjs
│       ├── events.mjs
│       ├── insight.mjs
│       ├── coupons.mjs
│       └── services.mjs
├── css/                 # Organized stylesheets
│   └── style.css        # 1669 lines, component-organized
├── js/                  # Organized JavaScript
│   ├── script.js        # 2500+ lines, public pages logic
│   └── admin-dashboard.js # 1573 lines, admin CRUD
├── docs/                # All documentation
│   ├── QUICKSTART.md
**Current pages**:

- **`index.html`** - Journey tracking (6 units with daily questions)
- **`booking.html`** - Appointment booking with promo validation
- **`events.html`** - Webinar & workshop listings
- **`insight.html`** - Educational articles with AI summaries
- **`media.html`** - YouTube player, podcast audio, AI content analysis
- **`ai-advisor.html`** - AI health advisor with Islamic context (NEW)
- **`services.html`** - Services listing
- **`admin-dashboard.html`** - Admin control panel (protected)

**Navigation pattern**: Six-page public nav (Journey, Services, Booking, Events, Insight, Media, AI Advisor)
When modifying header/footer, update ALL 8 HTML files for consistency.
- **`booking.html`** - Appointment booking with promo validation
- **`events.html`** - Webinar & workshop listings
- **`insight.html`** - Educational articles with AI summaries
- **`media.html`** - YouTube player, podcast audio, AI content analysis
- **`services.html`** - Services listing
- **`admin-dashboard.html`** - Admin control panel (protected)

**Navigation pattern**: Five-page public nav (Journey, Booking, Events, Insight, Media)
When modifying header/footer, update ALL 7 HTML files for consistency.

## Language & Content

- **Primary language**: Indonesian (Bahasa Indonesia)
- **Islamic terms**: Keep Arabic terminology (Subuh, Zuhur, Qur'an, etc.)
- **Tone**: Friendly, educational, faith-integrated wellness
- **API responses**: JSON with `success`, `data`, `error` fields
```
