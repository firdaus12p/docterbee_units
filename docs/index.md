# DocterBee Units - Documentation Index

**Project:** DocterBee Units (docterbee-media-ai)  
**Version:** 1.0.0  
**Generated:** 2026-01-02  
**Documentation Type:** Exhaustive Scan

---

## 🎯 Quick Navigation

| For... | Start Here |
|--------|-----------|
| **New Developers** | [Project Overview](#project-overview) → [Technology Stack](#technology-stack) → [Source Tree](#source-tree-analysis) |
| **API Integration** | [API Contracts](#api-contracts) |
| **Frontend Work** | [Component Inventory](#component-inventory) |
| **Database Work** | [Database Schema](#database-schema) |
| **Planning/PRD** | [Existing Documentation](#existing-documentation) |

---

## 📋 Project Overview

**File:** [`project-overview.md`](./project-overview.md)

Comprehensive high-level summary of the DocterBee Units platform.

**Contents:**
- Executive summary
- Project purpose and goals
- Target audience segments (7 demographic groups)
- Core features breakdown
  - 🏥 Health Services & Booking
  - 🛒 E-Commerce Store (7 product categories)
  - 📚 Content Management (articles, podcasts)
  - 🤖 AI Features (Gemini integration)
  - 🎯 Gamification (journey, points, rewards)
  - 👥 Membership System (7 card types)
  - 📅 Event Management
  - 🔧 Admin Dashboard
- Business flows and user journeys
- Architecture type and patterns
- Unique features (Islamic health, hybrid ordering, etc.)
- Keywords and project metadata

**Size:** Comprehensive (500+ lines)  
**Best For:** Understanding what the project does and why

---

## ⚙️ Technology Stack

**File:** [`technology-stack.md`](./technology-stack.md)

Complete technology stack documentation covering all layers.

**Contents:**
- Technology overview table
- Architecture pattern (3-tier layered)
- Frontend stack details
  - 20 HTML pages inventory
  - JavaScript modules breakdown
  - CSS approach (vanilla, no framework)
- Backend stack details
  - Express.js configuration
  - Database connection (mysql2)
  - API structure
- AI & Media integrations
  - Google Gemini API
  - YouTube APIs
- Database schema overview (10 core tables)
- Development workflow and scripts
- Integration points
- Code quality standards
- Technology decision rationale

**Size:** 350+ lines  
**Best For:** Understanding technical decisions and architecture

---

## 🔗 API Contracts

**File:** [`api-contracts-main.md`](./api-contracts-main.md)

RESTful API endpoint documentation with request/response schemas.

**Contents:**
- Authentication & authorization overview
- Session-based auth details
- Rate limiting configuration
- **Endpoint Documentation:**
  1. Authentication Endpoints (`/api/auth`)
     - Register, Login, Logout, Get Current User, Check Status
  2. User Management Endpoints (`/api/users`) **[Admin Only]**
     - CRUD operations, Password reset, Status toggle, Reward history
  3. Product Endpoints (`/api/products`)
     - List, Get, Create, Update, Delete with dual pricing
  4. Service Endpoints (`/api/services`)
  5. Booking Endpoints (`/api/bookings`)
  6. Order Endpoints (`/api/orders`)
  7. Event, Article, Journey, Podcast, Reward, Coupon endpoints
- Common response patterns
- Security features
- Error handling conventions

**Status:** Partial (Auth, Users, Products documented)  
**Remaining:** 12 endpoint groups to be documented  
**Best For:** API integration and frontend development

---

## 💻 Component Inventory

**File:** [`component-inventory.md`](./component-inventory.md)

Complete frontend JavaScript module catalog and documentation.

**Contents:**
- **Module Categories:**
  1. **Utility Modules** (4 files, 22 KB)
     - utils.js, modal-utils.js, admin-api.js, card-config.js
  2. **Admin Dashboard Modules** (6 files, 168 KB)
     - admin-dashboard.js, users-manager, orders-manager, rewards-manager, journey-manager, podcasts-manager
  3. **User-Facing Features** (4 files, 199 KB)
     - script.js (main), store-cart.js, user-data-sync.js, health-check.js
  4. **Page-Specific Modules** (4 files, 31 KB)
     - article-reader, insight-articles, member-check, register-card-preview
  5. **Navigation Modules** (2 files, 23 KB)
     - app-navbar, landing-navbar
- Detailed module breakdowns with:
  - Function signatures and purposes
  - Dependencies and integration points
  - Code patterns and conventions
- Module dependency graph
- Naming conventions
- Code quality metrics
- File size summary (443 KB total)

**Best For:** Frontend development and refactoring

---

## 🌳 Source Tree Analysis

**File:** [`source-tree-analysis.md`](./source-tree-analysis.md)

Complete directory structure with annotated critical paths.

**Contents:**
- Directory structure overview
- **Critical Directories:**
  1. `/backend/` - Server layer (170 KB, 20 files)
  2. `/js/` - Client-side JavaScript (443 KB, 20 files)
  3. `/` (root) - HTML pages (20 files)
  4. `/css/` - Stylesheets (5 files)
  5. `/docs/` - Documentation
  6. `/assets/` - Static assets
  7. `/uploads/` - User content (membership cards, etc.)
  8. `/_bmad/` - BMad Method framework
- Key configuration files
  - package.json, .env, database_schema.sql
- Integration points (frontend ↔ backend ↔ database)
- Entry points by use case
- **Critical Paths:**
  - Authentication flow
  - Order flow with QR codes
  - Admin management flow
- Code organization patterns (MVC-like backend, Module pattern frontend)
- File naming conventions
- Deployment structure
- Size analysis

**Best For:** Navigating the codebase and understanding structure

---

## 🗄️ Database Schema

**File:** `database_schema.sql` (root directory)

Complete MySQL database schema with all tables, relationships, and indexes.

**Core Tables:**
1. `users` - User accounts and authentication
2. `services` - Health service catalog
3. `bookings` - Service appointments
4. `products` - E-commerce products
5. `orders` - Orders with QR codes and points
6. `articles` - Content management
7. `events` - Event scheduling
8. `coupons` - Discount code management
9. `user_progress` - Journey tracking and points
10. `user_cart` - Persistent shopping cart

**Additional Tables:**
- `journey_units`, `journey_items` - Journey structure
- `rewards`, `reward_redemptions` - Rewards system
- `podcasts` - Audio content
- `admins` - Admin accounts
- `coupon_usage` - One-time coupon tracking

**Features:**
- Normalized schema (3NF)
- Foreign key constraints
- Proper indexes for performance
- ENUM types for status fields
- JSON columns for flexible data (cart_data, order items)
- Timestamps (created_at, updated_at)

**Best For:** Database setup and schema understanding

---

## 📚 Existing Documentation

### Planning & Requirements

| Document | Location | Purpose |
|----------|----------|---------|
| **PRD: Decoupling Refactor** | [PRD-Decoupling-Refactor.md](../PRD-Decoupling-Refactor.md) | JavaScript modularization refactoring plan |
| **Dual Pricing Implementation** | [DUAL_PRICING_IMPLEMENTATION.md](./DUAL_PRICING_IMPLEMENTATION.md) | Member vs non-member pricing system |
| **API Contracts (Original)** | [api-contracts.md](./api-contracts.md) | Earlier API specification |

### Technical & Security

| Document | Location | Purpose |
|----------|----------|---------|
| **API Key Security** | [API_KEY_SECURITY.md](./API_KEY_SECURITY.md) | Security guidelines for API keys |
| **Test Coverage** | [TEST_COVERAGE.md](./TEST_COVERAGE.md) | Testing strategy and coverage |

### Development

| Document | Location | Purpose |
|----------|----------|---------|
| **Rules for AI** | [../rules-for-ai.md](../rules-for-ai.md) | AI agent coding rules and guidelines |
| **Admin System** | [../ADMIN_SYSTEM.md](../ADMIN_SYSTEM.md) | Admin dashboard documentation |
| **Agents** | [../AGENTS.md](../AGENTS.md) | Agent system documentation |
| **Walkthrough: Decoupling** | [../WALKTHROUGH_DECOUPLING.md](../WALKTHROUGH_DECOUPLING.md) | Refactoring implementation guide |
| **Cleanup Audit** | [../CLEANUP_AUDIT.md](../CLEANUP_AUDIT.md) | Code cleanup notes |

---

## 🚀 Getting Started

### For New Developers

**1. Understand the Project**
```
Read: project-overview.md
     → Know what we're building and why
```

**2. Set Up Local Environment**
```bash
# Clone repository
git clone <repo-url>
cd docterbee_units

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and API keys

# Set up database
mysql -u root -p < database_schema.sql
# Or import via phpMyAdmin

# Create admin user
npm run create-admin

# Seed default rewards
npm run migrate:seed-rewards

# Or run both:
npm run setup
```

**3. Study the Architecture**
```
Read: technology-stack.md
     → Understand tech choices

Read: source-tree-analysis.md
     → Navigate the code structure
```

**4. Start Development**
```bash
# Run development server (auto-reload)
npm run dev

# Server starts at http://localhost:3000
```

**5. Explore the Code**
```
Read: component-inventory.md
     → Understand frontend modules

Read: api-contracts-main.md
     → Learn the API endpoints

Explore: /backend/routes/ files
       → See backend implementation

Explore: /js/ files
       → See frontend implementation
```

---

### For Frontend Developers

**Focus Areas:**
1. [`component-inventory.md`](./component-inventory.md) - All JS modules
2. [`source-tree-analysis.md`](./source-tree-analysis.md) - File locations
3. `/js/` directory - Module implementations
4. `/*.html` files - Page structure

**Key Modules:**
- `script.js` - Main user features
- `store-cart.js` - E-commerce
- `admin-dashboard.js` - Admin UI
- `modal-utils.js` - Reusable dialogs

---

### For Backend Developers

**Focus Areas:**
1. [`api-contracts-main.md`](./api-contracts-main.md) - API specs
2. [`technology-stack.md`](./technology-stack.md) - Backend details
3. `backend/routes/` - API implementations
4. `database_schema.sql` - Database structure

**Key Files:**
- `backend/server.mjs` - Entry point
- `backend/db.mjs` - Database helpers
- `backend/routes/*.mjs` - API endpoints
- `backend/middleware/auth.mjs` - Authentication

---

### For Database Administrators

**Focus Areas:**
1. `database_schema.sql` - Complete schema
2. [`technology-stack.md`](./technology-stack.md) - Database section
3. [`project-overview.md`](./project-overview.md) - Data requirements

**Connection:**
- Driver: mysql2 (Node.js)
- Database: `unitdocterbee`
- Pool-based connections
- Parameterized queries (SQL injection safe)

---

## 📊 Project Statistics

### Code Base
- **Languages:** JavaScript (ES6+), SQL, HTML5, CSS3
- **Backend LOC:** ~10,000 lines
- **Frontend LOC:** ~20,000 lines
- **Total Files:** 65+ code files (excluding node_modules)

### Features
- **API Endpoints:** 50+ RESTful endpoints
- **HTML Pages:** 20 interactive pages
- **JavaScript Modules:** 20 modular files
- **Database Tables:** 15+ tables
- **User Roles:** 2 (User, Admin)
- **External APIs:** 2 (Gemini, YouTube)

### Coverage
- **Business Domains:** 8 (Auth, Products, Services, Bookings, Orders, Content, Rewards, Admin)
- **User Segments:** 7 demographic card types
- **Product Categories:** 7 categories
- **Service Categories:** 4 types

---

## 🔍 Search Guide

### Finding Information

**"How do I..."**
- Add a new API endpoint? → Check `/backend/routes/` and `api-contracts-main.md`
- Create a new page? → See `source-tree-analysis.md` for HTML structure
- Modify the cart? → See `component-inventory.md` → store-cart.js section
- Change database schema? → Edit `database_schema.sql`, then migrate
- Add a new product category? → Update ENUM in schema + frontend constants

**"Where is..."**
- User authentication? → `/backend/routes/auth.mjs` + `/js/script.js`
- Shopping cart logic? → `/js/store-cart.js`
- Admin dashboard? → `/admin-dashboard.html` + `/js/admin-dashboard.js`
- Database connection? → `/backend/db.mjs`
- Membership cards? → `/uploads/gambar_kartu/`

---

## 🛠️ Development Workflow

### Making Changes

**1. Frontend Changes**
```
Edit HTML/CSS/JS → Refresh browser → Test
No build step required (vanilla JS)
```

**2. Backend Changes**
```
Edit .mjs file → npm run dev (auto-reload) → Test with Postman/frontend
```

**3. Database Changes**
```
Edit database_schema.sql → Re-run SQL → Update backend code → Test
```

**4. Adding New Features**
1. Plan (refer to PRDs in docs/)
2. Update database schema if needed
3. Create/modify backend route (`/backend/routes/`)
4. Create/modify frontend module (`/js/`)
5. Update HTML pages if needed
6. Test thoroughly
7. Update documentation (this index + api-contracts)

---

## 📖 Documentation Conventions

### Markdown Files
- **Headers:** Follow hierarchical structure (# → ## → ###)
- **Code Blocks:** Use syntax highlighting (```javascript, ```sql)
- **Tables:** For structured data comparisons
- **Emojis:** For visual navigation (🔧, 📚, ⚙️, etc.)
- **Links:** Relative links between docs

### Code Comments
- **Backend:** JSDoc style for functions
- **Frontend:** Inline comments for complex logic
- **SQL:** Comments for complex queries

---

## 🔐 Security Notes

✅ Passwords hashed with bcryptjs  
✅ Session-based authentication  
✅ Rate limiting on login  
✅ SQL injection prevention (parameterized queries)  
✅ XSS prevention (input escaping)  
✅ CORS configured  
✅ Environment variables for secrets  
✅ Admin-only routes protected  
✅ Server-side price validation  

**Important:** Never commit `.env` file to version control!

---

## 📞 Support & Maintenance

### Common Tasks

**Database Backup:**
```bash
mysqldump -u root -p unitdocterbee > backup_$(date +%Y%m%d).sql
```

**Check Server Logs:**
```bash
npm start 2>&1 | tee server.log
```

**Lint Code:**
```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

**Run Tests:**
```bash
npm test
```

---

## 🎓 Learning Resources

### Understanding the Stack
- **Express.js:** https://expressjs.com/
- **MySQL:** https://dev.mysql.com/doc/
- **Vanilla JavaScript:** https://javascript.info/
- **ES Modules:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules

### Project-Specific
- **Gemini API:** https://ai.google.dev/docs
- **YouTube APIs:** https://developers.google.com/youtube

---

## 📝 Documentation Maintenance

**This documentation was generated via exhaustive scan.**

### Keeping Docs Updated

**When to Update:**
- ✅ New API endpoint added → Update `api-contracts-main.md`
- ✅ New JS module created → Update `component-inventory.md`
- ✅ Major refactoring → Update `source-tree-analysis.md`
- ✅ Database schema change → Update comments in `database_schema.sql`
- ✅ New feature added → Update `project-overview.md`

**How to Update:**
1. Manually edit the relevant .md file
2. Follow existing format and structure
3. Update the "Last Updated" date
4. Commit changes with descriptive message

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| **1.0.0** | 2026-01-02 | Initial exhaustive documentation scan |

---

## 📬 Contact

**Project:** DocterBee Units  
**Type:** Health & Wellness Platform  
**Language:** Indonesian (Bahasa Indonesia)  
**License:** ISC  

**For questions about this documentation:**
- Refer to inline comments in code files
- Check existing PRDs in `/docs/`
- Review `rules-for-ai.md` for development guidelines

---

**Generated By:** BMad Master (Exhaustive Scan)  
**Scan Date:** 2026-01-02  
**Scan Type:** Complete codebase analysis  
**Files Analyzed:** 65+ code files  
**Documentation Generated:** 6 comprehensive guides

---

**🎯 Remember:** This platform combines health services, e-commerce, AI, and Islamic values to serve 7 demographic segments with a gamified user experience. Always consider the holistic health mission when making changes!
