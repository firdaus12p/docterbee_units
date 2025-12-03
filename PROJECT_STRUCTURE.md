# Project Structure - Docterbee Units

## 📂 Root Directory

```
docterbee_units/
│
├── 📁 backend/              Backend API (Node.js + Express + MySQL)
├── 📁 css/                  Stylesheet files
├── 📁 docs/                 All documentation files
├── 📁 js/                   Frontend JavaScript files
├── 📁 node_modules/         Dependencies (auto-generated)
│
├── 📄 index.html            Main page - Journey tracking
├── 📄 booking.html          Booking appointment page
├── 📄 events.html           Events listing page
├── 📄 insight.html          Articles page
├── 📄 media.html            Media player page
├── 📄 services.html         Services page
├── 📄 admin-dashboard.html  Admin control panel
│
├── 📄 .env                  Environment configuration (gitignored)
├── 📄 .env.example          Environment template
├── 📄 package.json          Dependencies & scripts
├── 📄 server.mjs            Legacy server (fallback)
├── 📄 README.md             Main documentation
└── 📄 .gitignore            Git ignore rules
```

## 📁 Detailed Folder Structure

### `/backend` - Backend API

```
backend/
├── server.mjs           Main Express server
├── db.mjs               Database connection & initialization
└── routes/              API route modules
    ├── bookings.mjs     Booking CRUD operations
    ├── events.mjs       Events management
    ├── insight.mjs      Articles management
    └── coupons.mjs      Promo code management
```

### `/css` - Stylesheets

```
css/
└── style.css            Main stylesheet (Tailwind + custom)
                         - 1669 lines organized by component
                         - Animations, responsive design
                         - Dashboard, booking, events, insight, media styles
```

### `/js` - Frontend JavaScript

```
js/
├── script.js            Main JavaScript for public pages
│                        - Journey tracking logic
│                        - Booking system with promo validation
│                        - Events & insight rendering
│                        - Media player integration
│                        - localStorage state management
│
└── admin-dashboard.js   Admin dashboard logic
                         - Authentication
                         - CRUD operations for all sections
                         - API fetch calls
                         - Modal management
```

### `/docs` - Documentation

```
docs/
├── README.md              Documentation index
├── QUICKSTART.md          Quick start guide
├── SETUP_GUIDE.md         Complete setup + API docs
├── DATABASE_SCHEMA.md     Database schema + sample SQL
├── TROUBLESHOOTING.md     Common issues & solutions
├── README-GEMINI-API.md   Gemini API integration
├── QUOTA-LIMITS.md        API quota information
├── buatdashboard.md       Dashboard creation guide
└── techdev.md             Technical development guidelines
```

## 🔗 File Connections

### HTML Pages → CSS/JS

All HTML pages link to:

- `<link rel="stylesheet" href="css/style.css" />`
- `<script src="js/script.js"></script>` (public pages)
- `<script src="js/admin-dashboard.js"></script>` (admin page)

### Frontend → Backend API

JavaScript files connect to backend via fetch:

- `/api/bookings` - Booking operations
- `/api/events` - Events data
- `/api/insight` - Articles data
- `/api/coupons` - Promo validation
- `/api/summarize` - Gemini AI

### Backend → Database

Backend connects to MySQL via:

- `.env` configuration (DB_HOST, DB_PORT, DB_USER, etc.)
- `backend/db.mjs` connection pool
- Auto-creates 4 tables on startup

## 🚀 Entry Points

| File                   | URL                     | Purpose               |
| ---------------------- | ----------------------- | --------------------- |
| `index.html`           | `/` or `/index.html`    | Main journey tracking |
| `booking.html`         | `/booking.html`         | Appointment booking   |
| `events.html`          | `/events.html`          | Webinar & workshops   |
| `insight.html`         | `/insight.html`         | Educational articles  |
| `media.html`           | `/media.html`           | YouTube & podcast     |
| `admin-dashboard.html` | `/admin-dashboard.html` | Admin control panel   |
| `backend/server.mjs`   | http://localhost:3000   | Backend API server    |

## 📊 File Statistics

| Type    | Location                | Lines | Purpose               |
| ------- | ----------------------- | ----- | --------------------- |
| CSS     | `css/style.css`         | 1669  | All styling           |
| JS      | `js/script.js`          | 1700+ | Public pages logic    |
| JS      | `js/admin-dashboard.js` | 800+  | Admin dashboard logic |
| HTML    | `*.html` (7 files)      | ~4000 | All pages             |
| Backend | `backend/**/*.mjs`      | 1100+ | API server            |
| Docs    | `docs/*.md` (8 files)   | 2000+ | Documentation         |

## 🎯 Key Features by File

### `index.html` + `js/script.js`

- 6 daily units (24h routine, prayer, nutrition, exercise, emotion, nature)
- Point system with localStorage
- Question cards with Yes/No answers
- Score calculation with animations

### `booking.html` + `js/script.js`

- Date picker (max +3 months)
- Time slot selection
- Promo code validation
- WhatsApp integration (+62-821-8808-0688)
- Database booking save

### `events.html` + `js/script.js`

- Dynamic event cards from database
- Filter by mode (online/offline)
- Filter by topic
- Registration links

### `insight.html` + `js/script.js`

- Article cards with images
- AI-powered NBSN summaries
- Slug-based routing
- +2 points per summary

### `media.html` + `js/script.js`

- YouTube video player
- Podcast audio player
- AI content analysis
- +3 points per analysis

### `admin-dashboard.html` + `js/admin-dashboard.js`

- Session-based authentication
- 4 management sections:
  - Booking Monitor (status updates)
  - Events Manager (CRUD)
  - Insight Manager (CRUD)
  - Coupon Manager (CRUD)
- Real-time data from database
- Modal-based editing

## 🔧 Configuration Files

### `.env` (Gitignored)

Production configuration:

```env
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=
DB_NAME=docterbee_units
ADMIN_USERNAME=admin
ADMIN_PASSWORD=docterbee2025
GEMINI_API_KEY=your_key_here
PORT=3000
```

### `package.json`

Scripts:

- `npm start` - Run backend server
- `npm run dev` - Development mode with watch
- `npm run old-server` - Legacy server fallback

Dependencies:

- express (Web framework)
- mysql2 (Database driver)
- dotenv (Environment config)
- cors (Cross-origin requests)
- @google/generative-ai (Gemini API)

## 📝 Notes

- **No build process required** - Direct browser execution
- **ES Modules** - Backend uses `import/export`
- **CDN dependencies** - Tailwind CSS, Lucide Icons, Google Fonts
- **Static file serving** - Express serves HTML/CSS/JS directly
- **Database auto-init** - Tables created on server startup
- **XSS prevention** - All user input escaped via `escapeHtml()`
- **SQL injection prevention** - Parameterized queries via mysql2

---

Last updated: December 3, 2025
