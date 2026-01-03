# Source Tree Analysis - DocterBee Units

**Generated:** 2026-01-02  
**Project Root:** `c:\Projek\docterbee_units`  
**Repository Type:** Monolith  
**Total Size:** ~500+ files (excluding node_modules)

---

## Directory Structure Overview

```
docterbee_units/
├── 📁 _bmad/                    # BMad Method framework (workflow management)
├── 📁 _bmad-output/             # Generated BMM artifacts
├── 📁 assets/                   # Static assets (images, media)
├── 📁 backend/                  # Node.js/Express server
│   ├── 📄 server.mjs           # 🚀 ENTRY POINT (59.6 KB)
│   ├── 📄 db.mjs                # Database connection & helpers (33.2 KB)
│   ├── 📄 articles.mjs          # Article utilities (7.3 KB)
│   ├── 📁 middleware/           # Authentication middleware
│   ├── 📁 migrations/           # Database seeding scripts
│   ├── 📁 routes/               # 15 API route modules
│   ├── 📁 scripts/              # Setup & utility scripts
│   └── 📁 utils/                # Helper functions
├── 📁 css/                      # Stylesheets (5 files)
├── 📁 docs/                     # 📚 Project documentation
├── 📁 js/                       # Frontend JavaScript modules (20 files)
├── 📁 uploads/                  # User-uploaded files
│   └── 📁 gambar_kartu/         # Membership card images
├── 📄 *.html                    # 20 HTML pages
├── 📄 database_schema.sql       # Database schema definition
├── 📄 package.json              # Node.js dependencies
├── 📄 .env                      # Environment configuration
└── 📄 rules-for-ai.md           # AI agent coding rules
```

---

## Critical Directories

### 1. `/backend/` - Server Layer ⚙️

Purpose: Application server and business logic

```
backend/
├── server.mjs                   # Main Express server  
│   ├── Middleware setup (CORS, sessions, body-parser)
│   ├── Route mounting (/api/*)
│   ├── Static file serving
│   ├── Error handling
│   └── Port: 3000 or process.env.PORT
│
├── db.mjs                       # Database layer
│   ├── MySQL connection pool
│   ├── query(sql, params)      # Execute query
│   ├── queryOne(sql, params)   # Fetch single row
│   └── Transaction helpers
│
├── articles.mjs                 # Article-specific utilities
│
├── routes/                      # 🔗 API endpoint definitions
│   ├── auth.mjs                 # Authentication (register, login, logout)
│   ├── users.mjs                # User management (admin)
│   ├── products.mjs             # Product CRUD
│   ├── services.mjs             # Service CRUD
│   ├── bookings.mjs             # Booking management
│   ├── orders.mjs               # Order processing + QR codes
│   ├── events.mjs               # Event management
│   ├── insight.mjs              # Article/blog endpoints
│   ├── journeys.mjs             # Journey system
│   ├── podcasts.mjs             # Podcast management
│   ├── rewards.mjs              # Reward redemption
│   ├── coupons.mjs              # Coupon validation
│   ├── user-data.mjs            # User progress & cart sync
│   ├── member-check.mjs         # Membership lookup
│   └── upload.mjs               # File upload handling
│
├── middleware/
│   └── auth.mjs                 # requireAdmin middleware
│
├── migrations/
│   └── seed-default-rewards.mjs # Initial reward seeding
│
├── scripts/
│   └── create-default-admin.mjs # Create admin user
│
└── utils/
    ├── helpers.mjs              # Order helpers (QR, points, expiry)
    └── rate-limiter.mjs         # Login rate limiting
```

**Entry Point:** `backend/server.mjs`
- Loads environment variables (dotenv)
- Establishes database connection
- Mounts all API routes under `/api`
- Serves static HTML files from root
**Size:** ~170 KB total backend code

---

### 2. `/js/` - Client-Side JavaScript 💻

Purpose: Frontend interactivity and user experience

```
js/
├── Core Utilities (22.4 KB)
│   ├── utils.js                 # formatCurrency, escapeHtml, formatDate
│   ├── modal-utils.js           # showSuccess, showError, showConfirm
│   ├── admin-api.js             # adminFetch, API_BASE
│   └── card-config.js           # CARD_TYPE_CONFIG (7 card types)
│
├── Admin Dashboard (168 KB)
│   ├── admin-dashboard.js       # Main dashboard, tab navigation
│   ├── users-manager.js         # User CRUD interface
│   ├── orders-manager.js        # Order management, QR scanning
│   ├── rewards-manager.js       # Reward creation & approval
│   ├── journey-manager.js       # Journey configuration
│   └── podcasts-manager.js      # Podcast upload & management
│
├── User Features (199 KB)
│   ├── script.js                # CORE: Journey, points, auth, rewards
│   ├── store-cart.js            # Shopping cart & checkout
│   ├── user-data-sync.js        # Cart/progress synchronization
│   └── health-check.js          # Health assessment tool
│
├── Page-Specific (31 KB)
│   ├── article-reader.js        # Article display
│   ├── insight-articles.js      # Article listings
│   ├── member-check.js          # Membership card lookup
│   └── register-card-preview.js # Card preview on registration
│
└── Navigation (23 KB)
    ├── app-navbar.js            # Logged-in user navigation
    └── landing-navbar.js        # Public page navigation
```

**Load Order (Example: admin-dashboard.html):**
```html
<script src="/js/utils.js"></script>           <!-- 1. Base utilities -->
<script src="/js/modal-utils.js"></script>     <!-- 2. UI components -->
<script src="/js/admin-api.js"></script>       <!-- 3. API helpers -->
<script src="/js/admin-dashboard.js"></script> <!-- 4. Main controller -->
<script src="/js/users-manager.js"></script>   <!-- 5+ Feature modules -->
<!-- etc. -->
```

---

### 3. `/` (Root) - HTML Pages 📄

Purpose: User interface pages

```
/ (root)
├── Public Pages (No Auth Required)
│   ├── index.html               # Homepage/Landing page
│   ├── about.html               # About DocterBee
│   ├── services.html            # Services catalog
│   ├── events.html              # Events listing
│   ├── store.html               # Product store
│   ├── article.html             # Article reader
│   ├── insight.html             # Insights/Blog
│   ├── podcast.html             # Podcast player
│   ├── media.html               # Media gallery
│   ├── youtube-ai.html          # YouTube AI tools
│   └── login.html               # User login
│   └── register.html            # User registration
│
├── Authenticated Pages (Login Required)
│   ├── profile.html             # User profile management
│   ├── booking.html             # Service booking
│   ├── journey.html             # User journey progress
│   ├── ai-advisor.html          # AI health advisor
│   ├── docterbee-periksa-kesehatan.html  # Health check
│   └── member-check.html        # Membership verification
│
├── Admin Pages (Admin Only)
│   └── admin-dashboard.html     # Admin control panel
│
└── System Pages
    └── 404.html                 # Error page
```

**Total Pages:** 20 HTML files

---

### 4. `/css/` - Stylesheets 🎨

Purpose: Visual styling

```
css/
├── style.css                    # Main stylesheet
├── admin.css                    # Admin dashboard styles
├── responsive.css               # Mobile/tablet adaptations
├── components.css               # Reusable UI components
└── utilities.css                # Utility classes
```

**Approach:** Custom CSS (no framework)  
**Strategy:** BEM-like naming, mobile-first responsive

---

### 5. `/docs/` - Documentation 📚

Purpose: Project knowledge base

```
docs/
├── 📊 Generated Documentation (BMad Master)
│   ├── project-overview.md      # High-level project summary
│   ├── technology-stack.md      # Tech stack details
│   ├── api-contracts-main.md    # API endpoint documentation
│   ├── component-inventory.md   # Frontend module catalog
│   ├── source-tree-analysis.md  # This file
│   ├── project-scan-report.json # Workflow state tracking
│   └── index.md                 # Master navigation (to be generated)
│
└── 📋 Existing Documentation
    ├── PRD-Decoupling-Refactor.md       # Refactoring requirements
    ├── DUAL_PRICING_IMPLEMENTATION.md   # Member pricing guide
    ├── API_KEY_SECURITY.md              # Security documentation
    ├── TEST_COVERAGE.md                 # Testing guidelines
    └── api-contracts.md                 # API specifications
```

---

### 6. `/assets/` - Static Assets 🎭

Purpose: Images, icons, media files

```
assets/
├── images/                      # General images
├── icons/                       # Icon files
└── media/                       # Video/audio assets
```

---

### 7. `/uploads/` - User Content 📤

Purpose: User-generated and uploaded files

```
uploads/
├── gambar_kartu/                # Membership card designs
│   ├── depan/                   # Front card images
│   │   ├── Background-Active-Worker.png
│   │   ├── Background-Family-Member.png
│   │   ├── Background-Healthy-&-Smart-Kids.png
│   │   ├── Background-Mums-&-Baby.png
│   │   ├── Background-New-Couple.png
│   │   ├── Background-Pregnant-Preparatiom.png
│   │   └── Background-Senja-Ceria.png
│   │
│   └── belakang/                # Back card images
│       ├── Tampilan-Belakang-Active-Worker.png
│       ├── Tampilan-Belakang-Family-Member.png
│       └── (... 7 card types total)
│
├── profile-images/              # User profile pictures
├── product-images/              # Product photos
├── article-images/              # Article headers
└── podcast-files/               # Uploaded podcasts
```

---

### 8. `/_bmad/` - BMad Method Framework 🧙

Purpose: Project management and workflow automation

```
_bmad/
├── core/                        # Core BMM system
│   ├── agents/                  # Agent definitions
│   ├── workflows/               # Workflow templates
│   ├── tasks/                   # Task definitions
│   └── config.yaml              # BMM configuration
│
└── bmm/                         # BMM module (planning & implementation)
    ├── agents/                  # PM, Dev, QA, Architect agents
    ├── workflows/               # PRD, Architecture, Stories, Dev workflows  
    └── config.yaml              # Project-specific config
```

**Note:** This is the workflow management system, not application code

---

### 9. `/_bmad-output/` - Generated Artifacts 📝

Purpose: BMM workflow output files

```
_bmad-output/
├── planning-artifacts/          # Planning documents
│   ├── PRDs/
│   ├── architecture/
│   └── epics-stories/
│
└── implementation-artifacts/    # Development artifacts
    └── (to be generated)
```

---

## Key Configuration Files

### `package.json` (Root)
```json
{
  "name": "docterbee-media-ai",
  "type": "module",  // ES Modules
  "main": "backend/server.mjs",
  "scripts": {
    "start": "node backend/server.mjs",
    "dev": "node --watch backend/server.mjs",
    ...
  }
}
```

### `.env` (Root - IGNORED BY GIT)
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=***
DB_NAME=unitdocterbee

# API Keys
GEMINI_API_KEY=***
YOUTUBE_API_KEY=***

# Session
SESSION_SECRET=***

# Server
PORT=3000
NODE_ENV=development
```

### `database_schema.sql` (Root)
- Complete MySQL schema definition
- Creates 10+ tables
- Includes indexes and foreign keys
- Safe to re-run (CREATE IF NOT EXISTS)

### `.gitignore` (Root)
```
node_modules/
.env
uploads/
_bmad-output/
*.log
```

---

## Integration Points

### Frontend ↔ Backend
```
HTML Pages
    ↓ fetch()
Backend REST API (/api/*)
    ↓ mysql2
MySQL Database
```

### Backend ↔ External Services
```
Backend
    ├─→ Google Gemini API (AI features)
    ├─→ YouTube APIs (transcripts, metadata)
    └─→ File System (uploads/)
```

---

## Entry Points by Use Case

### 1. **User Access**
```
Browser → index.html → landing-navbar.js → services.html → booking.html
```

### 2. **Shopping**
```
Browser → store.html → store-cart.js → /api/orders → QR Code
```

### 3. **Admin Operations**
```
Browser → admin-dashboard.html → admin-dashboard.js → users-manager.js → /api/users
```

### 4. **Backend Startup**
```
npm start → backend/server.mjs → db.mjs → routes/*.mjs → Listen on :3000
```

---

## Critical Paths

### 🔥 Authentication Flow
```
1. login.html
2. /api/auth/login (POST)
3. Session created
4. Redirect to profile.html
5. app-navbar.js loads user data
6. script.js initializes journey/points
```

### 🔥 Order Flow
```
1. store.html → Product selection
2. store-cart.js → Add to cart (sessionStorage)
3. Checkout → /api/orders (POST)
4. Stock deduction (transaction)
5. QR code generated
6. Scan at cashier
7. /api/orders/:id/complete (PATCH)
8. Points added to user
```

### 🔥 Admin Management
```
1. admin-dashboard.html
2. admin-dashboard.js → Initialize tabs
3. users-manager.js → Load user list (/api/users)
4. Action → CRUD operation → /api/users/:id
5. modal-utils.js → Show confirmation
6. Success → Reload data
```

---

## Code Organization Patterns

### Backend Pattern (MVC-like)
```
Route (routes/*.mjs)
    ↓ validates input
Controller Logic (inline in route)
    ↓ calls
Model/Database (db.mjs)
    ↓ returns
Response JSON
```

### Frontend Pattern (Module)
```
Page HTML
    ↓ loads
Module.js (IIFE)
    ↓ init()
Load Data (fetch /api/*)
    ↓ render
Update DOM
    ↓ attach
Event Listeners
```

---

## File Naming Conventions

### Backend
- **`.mjs` extension** - ES Module syntax
- **`kebab-case.mjs`** - Route files
- **`camelCase.mjs`** - Utility files

### Frontend
- **`.js` extension** - Standard JavaScript
- **`kebab-case.js`** - Module files
- **Descriptive names** - `user-data-sync.js`, not `uds.js`

### HTML
- **`kebab-case.html`** - Page files
- **Descriptive names** - `admin-dashboard.html`, `member-check.html`

---

## Deployment Structure

### Production Build
```
docterbee_units/ (deployed folder)
├── backend/
├── js/
├── css/
├── assets/
├── uploads/
├── *.html
├── package.json
├── .env (configured for production)
└── node_modules/ (npm install --production)
```

**Not Deployed:**
- `_bmad/` (development tool)
- `_bmad-output/` (temporary artifacts)
- `.git/` (version control)
- `docs/` (optional - for reference)

---

## Size Analysis

| Directory | Size (approx) | File Count |
|-----------|---------------|------------|
| `/backend/` | ~170 KB | 20 files |
| `/js/` | ~443 KB | 20 files |
| `/css/` | ~50 KB | 5 files |
| `/*.html` | ~800 KB | 20 files |
| `/assets/` | Variable | ~100 files |
| `/uploads/` | Variable | User-generated |
| **Total Code** | **~1.5 MB** | **65+ files** |

**Note:** Excludes node_modules (~50 MB), uploads, and BMad framework

---

## Observability & Debugging

### Logging
- **Server:** `console.log`, `console.error` to stdout/stderr
- **Client:** `console.log` for debugging (removed in production)
- **Audit:** Order deletions logged with details

### Error Handling
✅ Try-catch in all async functions  
✅ Consistent error responses (`{ success: false, error: "message" }`)  
✅ HTTP status codes (400, 401, 403, 404, 500)  
✅ User-friendly Indonesian error messages  

---

**Last Updated:** 2026-01-02  
**Scan Depth:** Exhaustive  
**Generated By:** BMad Master
