# Docterbee Journey – AI Coding Agent Instructions

## Project Overview

Health journey tracking app combining Islamic teachings (Qur'an & Sunnah), modern science, and the NBSN framework (Neuron, Biomolekul, Sensorik, Nature). Users answer daily questions across 6 units and earn points/scores.

## Architecture: Multi-Page Structure

**The project uses a modular multi-page structure:**

- **`index.html`**: Main journey tracking page (6 units daily questions)
- **`booking.html`**: Booking praktisi page (appointment scheduling)
- **`style.css`**: Shared CSS for all pages, organized by component sections
- **`script.js`**: Shared JavaScript with page-specific logic

**External dependencies**: Tailwind CDN, Lucide icons CDN, Google Fonts (Inter)  
**No build system**: Direct browser execution - open any HTML file  
**Navigation**: Simplified navbar with Journey and Booking links only

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

- Header Styles (lines 11-40)
- Hero Section (lines 42-60)
- Tab Navigation (lines 62-85)
- Question Cards (lines 87-110)
- Buttons (lines 112-180)
- Status Indicators (lines 220-236)

**Custom classes replace inline styles**:

- `.logo-box` → amber square logo
- `.btn-yes` → green "Ya" button
- `.btn-no` → gray "Belum" button
- `.status-answered` → emerald text for completed
- `.status-unanswered` → slate text for incomplete

## JavaScript Architecture (script.js)

**Six main sections** (follow this structure when adding features):

1. **DATA MODEL** (line 7): UNITS array with all questions
2. **STORAGE HELPERS** (line 250): localStorage wrapper functions
3. **UI RENDERING** (line 320): buildTabs(), showUnit(), DOM manipulation
4. **USER INTERACTIONS** (line 420): answer(), toggleInfo() handlers
5. **SCORING CALCULATIONS** (line 470): calcUnit(), calcAll() formulas
6. **INITIALIZATION** (line 520): init() function, DOMContentLoaded

**Scoring formulas**:

- Unit score: `(yesCount / totalItems) * 100` → bonus = `floor(score/20)`
- Total score: average of all units → bonus = `floor(total/25)`
- Each "Ya" answer: immediate +1 point

## Development Workflow

1. **Edit data**: Modify UNITS array in `script.js`
2. **Edit styles**: Update `style.css` (never add inline styles to HTML)
3. **Edit logic**: Update functions in `script.js` (maintain section organization)
4. **Test**: Open `index.html` in browser
5. **Debug localStorage**: DevTools → Application → Local Storage
6. **Clear state**: Console → `localStorage.clear()`

## Booking Page Pattern (booking.html)

**State management**: Uses `bookingState` object for selected time slot  
**Key functions**:

- `generateSlots()` - Creates time slot buttons
- `selectSlot(time)` - Handles slot selection with visual feedback
- `updateBookingSummary()` - Updates booking summary display
- `confirmBooking()` - Validates and confirms booking
- `resetBookingForm()` - Resets form to initial state

**Form fields**: branch, practitioner, date, mode, time slots  
**Validation**: Must select both date and time before confirm

## Common Pitfalls to Avoid

1. ❌ Don't add inline onclick handlers to HTML
2. ❌ Don't add inline styles to HTML
3. ❌ Don't forget to escape quotes in UNITS array strings
4. ❌ Don't skip XSS escaping when inserting dynamic content
5. ❌ Don't forget to update both pages when changing shared components (header/footer)

## Page Structure

Current pages in project:

- **`index.html`** - Journey tracking (6 units with daily questions)
- **`booking.html`** - Appointment booking with praktisi

**Navigation pattern**: Simple two-page nav (Journey, Booking)  
When modifying header/footer, update both HTML files for consistency.

## Language & Content

- **Primary language**: Indonesian (Bahasa Indonesia)
- **Islamic terms**: Keep Arabic terminology (Subuh, Zuhur, Qur'an, etc.)
- **Tone**: Friendly, educational, faith-integrated wellness
