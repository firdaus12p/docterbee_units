# Docterbee Journey – AI Coding Agent Instructions

## Project Overview

Health journey tracking app combining Islamic teachings (Qur'an & Sunnah), modern science, and the NBSN framework (Neuron, Biomolekul, Sensorik, Nature). Users answer daily questions, book appointments, attend events, read insights, and analyze media content—all earning points/scores.

## Architecture: Multi-Page SPA Pattern

**Five-page structure sharing single CSS/JS:**

- **`index.html`**: Journey tracking (6 units with daily questions)
- **`booking.html`**: Practitioner appointment scheduling with WhatsApp integration (+62-821-8808-0688)
- **`events.html`**: Webinar & workshop listings with mode/topic filters
- **`insight.html`**: Educational articles with AI-powered NBSN recommendations
- **`media.html`**: YouTube player + podcast audio + AI content analysis
- **`style.css`**: Shared CSS organized by page sections (Events: line 1102, Insight: 1200, Media: 1339)
- **`script.js`**: Unified JavaScript (1512 lines) with page-specific init functions

**External dependencies**: Tailwind CDN, Lucide icons CDN, Google Fonts (Inter)  
**No build system**: Direct browser execution - open any HTML file  
**Navigation**: Consistent navbar across all 5 pages + mobile hamburger menu with slide-in drawer

## Critical Code Patterns

### 1. Event Handling (NO inline onclick!)

```javascript
// ❌ WRONG (old pattern in docterbee_units.html):
<button onclick="answer('u1','subuh',1)">Ya</button>

// ✅ CORRECT (current pattern in script.js):
<button class="btn-yes" data-unit="u1" data-key="subuh" data-value="1">Ya</button>
// Attached via: attachUnitEventListeners() using addEventListener
```

### 2. String Safety (Escape quotes!)

```javascript
// ❌ WRONG: 'Apakah membaca Al-Qur'an?' → syntax error
// ✅ CORRECT: 'Apakah membaca Al-Qur\'an?' → escaped quote
// ✅ CORRECT: 'Nature: napas 2"' → use double quote inside single quote
```

**Critical**: When adding questions to UNITS array, escape single quotes with `\'`

### 3. XSS Prevention

All user-facing content uses `escapeHtml()` function (line ~380 in script.js):

```javascript
<div class="font-semibold">${escapeHtml(item.q)}</div>
```

Never insert raw strings into innerHTML without escaping.

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

1. **Edit data**: Modify UNITS array in `script.js`
2. **Edit styles**: Update `style.css` (never add inline styles to HTML)
3. **Edit logic**: Update functions in `script.js` (maintain section organization)
4. **Test**: Open `index.html` in browser
5. **Debug localStorage**: DevTools → Application → Local Storage
6. **Clear state**: Console → `localStorage.clear()`

## Page-Specific Patterns

### Booking Page (booking.html)

**State**: `bookingState` object for selected time slot  
**Key functions**: `generateSlots()`, `selectSlot()`, `updateBookingSummary()`, `formatDateIndo()`, `confirmBooking()`  
**WhatsApp integration**: `confirmBooking()` opens wa.me link with formatted booking message to +62-821-8808-0688  
**Datepicker**: Min date = today, max date = +3 months (set in `initBooking()`)  
**Validation**: Must select both date and time before confirm

### Events Page (events.html)

**State**: `EVENTS_DATA` array with mode (online/offline) and topic filters  
**Key functions**: `renderEvents()` with filter logic, re-renders on select change  
**Filter IDs**: `eventMode`, `eventTopic` - both default to "all"

### Insight Page (insight.html)

**State**: `INSIGHT_DATA` array (4 articles)  
**Key functions**: `renderInsightArticles()`, `summarizeArticle(index)` - creates NBSN cards and adds +2 points  
**Pattern**: onclick attribute used for article buttons (exception to event listener rule)

### Media Page (media.html)

**State**: `PODCAST_DATA` array (4 episodes with sample URLs)  
**Key functions**: `loadYouTube()`, `extractYouTubeId()`, `playPodcast()`, `analyzeMedia()` with keyword detection  
**YouTube**: Supports youtube.com/watch?v=, youtu.be/, and embed URLs  
**AI Analysis**: Keyword-based simulation checking alignment with Qur'an/Sunnah (+3 points on analyze)

## Common Pitfalls to Avoid

1. ❌ Don't add inline onclick handlers to HTML (except `summarizeArticle()` on insight page buttons)
2. ❌ Don't add inline styles to HTML
3. ❌ Don't forget to escape quotes in UNITS array strings with `\'`
4. ❌ Don't skip XSS escaping when inserting dynamic content via `escapeHtml()`
5. ❌ Don't forget to update ALL 5 pages when changing shared components (header/footer/nav)
6. ❌ Don't forget `initMobileMenu()` call when creating new pages
7. ❌ Don't use page-specific element IDs in shared functions (breaks page detection logic)

## Page Structure

Current pages in project:

- **`index.html`** - Journey tracking (6 units with daily questions)
- **`booking.html`** - Appointment booking with praktisi
- **`events.html`** - Webinar & workshop listings
- **`insight.html`** - Educational articles with AI summaries
- **`media.html`** - YouTube player, podcast audio, AI content analysis

**Navigation pattern**: Five-page nav (Journey, Booking, Events, Insight, Media)  
When modifying header/footer, update ALL HTML files for consistency.

## Language & Content

- **Primary language**: Indonesian (Bahasa Indonesia)
- **Islamic terms**: Keep Arabic terminology (Subuh, Zuhur, Qur'an, etc.)
- **Tone**: Friendly, educational, faith-integrated wellness
