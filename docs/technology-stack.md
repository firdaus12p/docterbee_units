# Technology Stack - DocterBee Units

**Generated:** 2026-01-02  
**Project:** DocterBee Units (docterbee-media-ai)  
**Version:** 1.0.0

---

## Executive Summary

DocterBee Units is a **full-stack web application** combining health services, e-commerce, content management, and AI-powered features. The application uses a traditional **multi-tier architecture** with static HTML frontend, Node.js/Express backend, and MySQL database.

---

## Technology Stack Overview

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | Latest (ES Modules) | Server-side JavaScript runtime |
| **Backend Framework** | Express.js | ^4.21.2 | RESTful API server |
| **Database** | MySQL | ^3.11.5 (mysql2 driver) | Relational data storage |
| **Frontend** | Vanilla JavaScript | ES6+ | Client-side interactivity |
| **Frontend** | HTML5 | Latest | Page structure |
| **Frontend** | CSS3 | Latest | Styling and layout |
| **AI Integration** | Google Generative AI | ^0.21.0 | Gemini API for AI features |
| **Authentication** | bcryptjs | ^3.0.3 | Password hashing |
| **Session Management** | express-session | ^1.18.2 | User session handling |
| **File Upload** | Multer | ^2.0.2 | Multipart form data handling |
| **Media Integration** | YouTube APIs | Multiple | YouTube content integration |
| **Security** | CORS | ^2.8.5 | Cross-origin resource sharing |
| **Environment Config** | dotenv | ^16.4.5 | Environment variable management |

---

## Architecture Pattern

### **Layered Architecture** (3-Tier)

```
┌─────────────────────────────────────────────────┐
│         PRESENTATION LAYER (Frontend)           │
│   - 20 HTML pages (SPA-like with vanilla JS)   │
│   - Client-side JavaScript modules (/js)       │
│   - CSS styling (/css)                         │
│   - Static assets (/assets, /uploads)         │
└─────────────────────────────────────────────────┘
                      ↓ HTTP/AJAX
┌─────────────────────────────────────────────────┐
│         APPLICATION LAYER (Backend)             │
│   - Express.js server (backend/server.mjs)     │
│   - RESTful API routes (/backend/routes)       │
│   - Business logic & middleware                │
│   - AI integration (Gemini API)                │
│   - YouTube integration                        │
└─────────────────────────────────────────────────┘
                      ↓ mysql2
┌─────────────────────────────────────────────────┐
│         DATA LAYER (Database)                   │
│   - MySQL Database (unitdocterbee)             │
│   - 10 tables (users, products, orders, etc.)  │
│   - Migrations & seeding scripts               │
└─────────────────────────────────────────────────┘
```

---

## Frontend Stack Details

### Page Inventory (20 HTML Pages)

| Page | Purpose | Category |
|------|---------|----------|
| `index.html` | Homepage/Landing | Public |
| `about.html` | About page | Public |
| `services.html` | Services catalog | Public |
| `booking.html` | Service booking | Public |
| `events.html` | Events listing | Public |
| `store.html` | E-commerce store | Public |
| `article.html` | Article reader | Content |
| `insight.html` | Insights/Blog | Content |
| `media.html` | Media gallery | Content |
| `podcast.html` | Podcast player | Content |
| `youtube-ai.html` | YouTube AI features | AI-powered |
| `ai-advisor.html` | AI health advisor | AI-powered |
| `journey.html` | User journey/progress | User Features |
| `profile.html` | User profile | User Features |
| `member-check.html` | Membership verification | User Features |
| `login.html` | User login | Authentication |
| `register.html` | User registration | Authentication |
| `admin-dashboard.html` | Admin dashboard | Admin |
| `docterbee-periksa-kesehatan.html` | Health check | Features |
| `404.html` | Error page | System |

### JavaScript Modules (/js)

The application uses modular JavaScript files for different functionalities:
- Admin management (users, orders, rewards, journeys, podcasts)
- E-commerce (store, cart)
- User features (profile, progress sync)
- UI utilities (modals, navigation)
- API integration

### CSS Framework

- **Strategy:** Vanilla CSS (no framework)
- **Location:** `/css/` directory
- **Approach:** Custom styling with responsive design

---

## Backend Stack Details

### Core Technologies

#### Express.js Server
- **Entry Point:** `backend/server.mjs`
- **Module System:** ES Modules (`.mjs` extension)
- **Port:** Configurable via environment variables

#### Database Connection
- **Driver:** mysql2 (Promise-based)
- **Connection:** Pool-based for performance
- **Database:** `unitdocterbee`
- **Configuration:** Environment variables via dotenv

#### API Structure
- **Pattern:** RESTful API
- **Routes:** Modular route files in `/backend/routes/`
- **Middleware:** Authentication, CORS, body parsing

### Key Features

#### 1. AI Integration (Google Gemini)
- **Package:** `@google/generative-ai` v0.21.0
- **Use Cases:**
  - AI Health Advisor
  - Content generation
  - YouTube transcript analysis

#### 2. YouTube Integration
- **Packages:**
  - `youtube-transcript` v1.2.1
  - `youtubei.js` v16.0.1
- **Features:**
  - Transcript extraction
  - Video metadata
  - Content analysis

#### 3. Authentication & Security
- **Password Hashing:** bcryptjs
- **Session Management:** express-session
- **CORS:** Configured for cross-origin requests
- **Environment:** Sensitive data via dotenv

#### 4. File Uploads
- **Package:** Multer v2.0.2
- **Storage:** Local filesystem (`/uploads/`)
- **Use Cases:**
  - User profile images
  - Product images
  - Content media

---

## Database Schema

### MySQL Database: `unitdocterbee`

#### Core Tables (10 total)

1. **users** - User accounts and authentication
   - Fields: id, name, email, phone, password, is_active
   - Indexes: email, phone

2. **services** - Health services catalog
   - Fields: id, name, category, price, description, branch, mode
   - Categories: manual, klinis, konsultasi, perawatan

3. **bookings** - Service appointments
   - Fields: id, service_name, branch, practitioner, booking_date, etc.
   - Includes pricing and discount tracking

4. **events** - Event management
   - Fields: id, title, event_date, mode, topic, speaker, etc.
   - Supports online/offline events

5. **articles** - Content management
   - Fields: id, title, slug, content, category, views, etc.
   - Support for product-linked articles

6. **products** - E-commerce products
   - Fields: id, name, category, price, description, stock
   - Categories: Zona Sunnah, 1001 Rempah, Zona Honey, etc.

7. **orders** - E-commerce orders
   - Fields: id, order_number, user_id, items (JSON), total_amount
   - Includes QR code and points system

8. **coupons** - Discount codes
   - Fields: id, code, discount_type, discount_value, max_uses
   - Supports percentage and fixed discounts

9. **user_progress** - User journey tracking
   - Fields: id, user_id, unit_data (JSON), points
   - Gamification system

10. **user_cart** - Shopping cart persistence
    - Fields: id, user_id, cart_data (JSON), last_qr_code
    - Session-independent cart storage

---

## Development Workflow

### Scripts (from package.json)

```bash
# Start production server
npm start

# Development with auto-reload
npm run dev

# Code linting
npm run lint
npm run lint:fix

# Testing
npm run test

# Database setup
npm run create-admin          # Create default admin user
npm run migrate:seed-rewards  # Seed default rewards
npm run setup                 # Full setup (admin + rewards)
```

### Environment Setup

Required environment variables (`.env`):
- Database credentials (host, user, password, database)
- API keys (Google Gemini, YouTube)
- Session secrets
- Server configuration

---

## Integration Points

### External APIs

1. **Google Generative AI (Gemini)**
   - Purpose: AI-powered features
   - Usage: Health advisor, content generation
   - Version: 0.21.0

2. **YouTube APIs**
   - Purpose: Video content integration
   - Usage: Transcript analysis, metadata
   - Packages: youtube-transcript, youtubei.js

### File System Integration

- **Upload Directory:** `/uploads/`
  - User uploads
  - Product images
  - Card designs (`/uploads/gambar_kartu/`)

- **Static Assets:** `/assets/`
  - Images, icons, media files

---

## Code Quality & Standards

### Linting
- **Tool:** ESLint v9.39.2
- **Config:** `@eslint/js`
- **Scope:** Backend (`.mjs`) and Frontend (`.js`)

### Testing
- **Framework:** Node.js built-in test runner
- **Location:** `/tests/` directory

---

## Project Keywords

- Health services platform
- Islamic health content
- AI-powered health advisor
- E-commerce integration
- Content management system
- YouTube integration
- Gamification (points, journey)

---

## Architecture Characteristics

### Strengths
✅ Clear separation of concerns (frontend/backend/database)  
✅ Modular code organization  
✅ Modern ES Modules usage  
✅ Comprehensive database schema  
✅ AI integration for enhanced features  
✅ Multiple authentication methods  

### Design Patterns
- **Backend:** MVC-like pattern with routes/controllers separation
- **Frontend:** Module pattern for JavaScript organization
- **Database:** Normalized relational schema with proper indexes
- **Security:** Environment-based configuration, password hashing

---

## Technology Decisions Rationale

| Decision | Rationale |
|----------|-----------|
| **Vanilla JS vs Framework** | Simplicity, no build step, direct DOM manipulation for smaller app |
| **Express.js** | Lightweight, flexible, industry standard for Node.js APIs |
| **MySQL** | Relational data requirements, mature ecosystem, transaction support |
| **ES Modules** | Modern JavaScript standard, better tree-shaking, clearer imports |
| **Session-based Auth** | Traditional approach suitable for server-rendered pages |
| **Gemini AI** | Google's latest AI model, good for health/content use cases |

---

**Last Updated:** 2026-01-02  
**Maintained By:** Development Team
