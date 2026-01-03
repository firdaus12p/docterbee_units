# Project Overview - DocterBee Units

**Generated:** 2026-01-02  
**Project Name:** DocterBee Units (docterbee-media-ai)  
**Version:** 1.0.0  
**Type:** Full-Stack Web Application

---

## Executive Summary

DocterBee Units is a comprehensive **health and wellness platform** with Islamic values, combining multiple services:
- 🏥 **Health Services Booking** - Online and offline consultations
- 🛒 **E-commerce Store** - Health products, Islamic remedies, natural ingredients
- 📚 **Content Platform** - Articles, podcasts, YouTube integration
- 🤖 **AI-Powered Features** - Gemini-based health advisor
- 🎯 **Gamification** - User journey with points and rewards system
- 👥 **Membership System** - Multiple card types for different demographics

---

## Project Purpose

DocterBee Units serves as a holistic health platform that:
1. **Bridges traditional Islamic health wisdom** with modern medical practices
2. **Provides accessible healthcare** through online/offline consultations
3. **Educates users** via articles, podcasts, and AI-powered advisors
4. **Promotes healthy products** through curated e-commerce
5. **Encourages healthy habits** through gamified journey tracking

---

## Target Audience

### Primary User Segments

| Segment | Card Type | Demographics | Needs |
|---------|-----------|--------------|-------|
| **Active Workers** | Active-Worker | Working adults 25-50 | Health maintenance, consultation |
| **Families** | Family-Member | Parents with children | Family health services |
| **Children** | Healthy-Smart-Kids | Kids 5-15 | Child health tracking |
| **Pregnant/New Parents** | Mums-Baby, Pregnant-Preparation | Expecting mothers | Pregnancy support, baby care |
| **Newlyweds** | New-Couple | Newly married couples | Pre-pregnancy planning |
| **Seniors** | Senja-Ceria | Adults 50+ | Senior health care |

---

## Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Vanilla JavaScript, HTML5, CSS3 | 20 interactive pages |
| **Backend** | Node.js + Express.js | RESTful API server |
| **Database** | MySQL | 10 normalized tables |
| **AI** | Google Gemini API | Health advisor, content generation |
| **Media** | YouTube APIs | Video content integration |
| **Auth** | express-session + bcryptjs | Session-based authentication |
| **File Upload** | Multer | Image and media handling |

---

## Repository Structure

```
docterbee_units/
├── frontend (20 HTML pages + assets)
│   ├── index.html, about.html, services.html, etc.
│   ├── js/ (20 JavaScript modules)
│   ├── css/ (5 stylesheets)
│   └── assets/ (images, media)
├── backend/
│   ├── server.mjs (main entry point)
│   ├── db.mjs (database connection & helpers)
│   ├── routes/ (15 API route modules)
│   ├── middleware/ (authentication)
│   ├── utils/ (helpers, rate limiter)
│   └── migrations/ (database seeding)
├── docs/ (project documentation)
├── database_schema.sql
└── package.json
```

---

## Core Features

### 1. **Health Services & Booking** 🏥
- **Service Categories:** Manual therapy, Clinical services, Consultations, Care services
- **Booking Modes:** Online (telemedicine) or Offline (in-clinic)
- **Multi-Branch:** Kolaka, Makassar, Kendari
- **Practitioner Assignment:** Specific healthcare providers
- **Pricing & Discounts:** Coupon system with server-side validation

### 2. **E-Commerce Store** 🛒
- **Product Categories:**
  - Zona Sunnah (Islamic remedies)
  - 1001 Rempah (Herbal spices)
  - Zona Honey (Honey products)
  - Cold Pressed oils
  - Coffee & Tea
  - Fresh Juices
- **Dual Pricing:** Member vs non-member prices
- **QR Code Orders:** Dine-in and take-away with time-limited QR codes
- **Stock Management:** Real-time inventory with race condition prevention
- **Points System:** Earn points on purchases

### 3. **Content Management** 📚
- **Articles:** Health and wellness content with categories (Nutrisi, Ibadah, Kebiasaan, Sains)
- **Podcasts:** Audio content library
- **YouTube Integration:** Transcript analysis, video metadata
- **Product-Linked Articles:** Educational content for products

### 4. **AI Features** 🤖
- **AI Health Advisor:** Gemini-powered conversational health assistant
- **YouTube AI:** Analyze and summarize health-related videos
- **Content Generation:** AI-assisted article creation

### 5. **User Journey & Gamification** 🎯
- **Journey Tracking:** Multi-level progress system
- **Points Accumulation:** Earn from orders, journey completion
- **Rewards Redemption:** Exchange points for benefits
- **Progress Visualization:** Track health journey milestones

### 6. **Membership System** 👥
- **Registration:** Email + phone + password
- **Card Types:** 7 demographic-specific membership cards
- **Digital Cards:** Front and back card visualization
- **Member Benefits:** Exclusive pricing, rewards access
- **Member Check:** Phone number lookup for card details

### 7. **Event Management** 📅
- **Event Types:** Online (Zoom/virtual) and Offline (in-person)
- **Topics:** Health workshops, seminars, webinars
- **Registration:** Fee-based or free events
- **Speaker Management:** Track event hosts/speakers

### 8. **Admin Dashboard** 🔧
- **User Management:** CRUD, password reset, active/inactive toggle
- **Service Management:** Add/edit services, practitioners, pricing
- **Product Management:** Inventory, pricing, categories
- **Order Management:** View, complete, assign points
- **Booking Management:** Approve, track, manage appointments
- **Reward Management:** Create rewards, approve redemptions
- **Journey Management:** Configure journey units and items
- **Podcast Management:** Upload and manage audio content
- **Analytics:** User stats, order tracking

---

## Key Business Flows

### 🛒 E-Commerce Flow
```
Browse Products → Add to Cart → Checkout → 
Generate QR Code → Show at Cashier → 
Scan QR → Complete Order → Earn Points
```

### 🏥 Service Booking Flow
```
Browse Services → Select Service/Practitioner → 
Choose Date/Time → Fill Customer Info → 
Apply Coupon (optional) → Submit Booking → 
Admin Confirms → Appointment Completed
```

### 🎯 User Journey Flow
```
Register → Complete Journey Units → 
Earn Points → Redeem Rewards → 
Admin Approves → Receive Benefit
```

### 🤖 AI Advisor Flow
```
Ask Health Question → Gemini API → 
Generate Answer → Display Response → 
Optional: Save to History
```

---

## Architecture Type

**Multi-Tier Monolithic Architecture**

- **Presentation Layer:** Static HTML + Dynamic JavaScript
- **Application Layer:** Express.js RESTful API
- **Data Layer:** MySQL relational database
- **Integration Layer:** External APIs (Gemini, YouTube)

**Communication Pattern:** Client-side AJAX/Fetch → Backend REST API → Database

---

## Database Schema Overview

### Core Tables (10)

1. **users** - User accounts (authentication, profile)
2. **services** - Health service catalog
3. **bookings** - Service appointments
4. **products** - E-commerce product catalog
5. **orders** - E-commerce orders with QR codes
6. **articles** - Content management
7. **events** - Event scheduling
8. **coupons** - Discount code management
9. **user_progress** - Journey tracking and points
10. **user_cart** - Persistent shopping cart

### Additional Tables
- **journey_units, journey_items** - Journey structure
- **rewards, reward_redemptions** - Rewards system
- **podcasts** - Audio content
- **admins** - Admin user accounts
- **coupon_usage** - One-time coupon tracking

---

## Security Features

✅ **Authentication:** Session-based with HTTP-only cookies  
✅ **Password Hashing:** bcryptjs with cost factor 10  
✅ **Rate Limiting:** Login attempt throttling  
✅ **SQL Injection Prevention:** Parameterized queries  
✅ **Authorization:** Role-based access (admin vs user)  
✅ **Server-Side Validation:** Price verification, stock checks  
✅ **Data Masking:** Sensitive data hidden in limited views  
✅ **Environment Variables:** API keys and secrets in .env  

---

## Unique Features

### 🌙 Islamic Health Integration
- Islamic remedies and products (Zona Sunnah)
- Content categorized with "Ibadah" (worship) perspective
- Halal product focus

### 📱 Hybrid Ordering System
- Traditional web checkout
- QR code-based orders for in-store pickup
- Time-limited order validity

### 🎮 Gamification
- Multi-level journey system
- Points accumulation from multiple sources
- Reward redemption marketplace

### 🤖 AI-Powered Content
- Gemini API integration for health advice
- YouTube transcript analysis
- Intelligent content recommendations

### 💳 Flexible Membership
- 7 demographic-specific card types
- Dual pricing (member vs non-member)
- Digital membership cards

---

## Development Status

**Current Version:** 1.0.0  
**Stage:** Production-ready  
**Code Quality:** ESLint configured  
**Testing:** Test runner configured  

### Recent Major Work
Based on existing PRDs and documentation:
- ✅ Decoupling refactor (modular JavaScript architecture)
- ✅ Dual pricing implementation (member pricing system)
- ✅ API key security enhancements
- ✅ Test coverage improvements

---

## Deployment Information

### Scripts Available
```bash
npm start              # Production server
npm run dev            # Development with hot-reload
npm run lint           # Code linting
npm run lint:fix       # Auto-fix linting issues
npm test               # Run tests
npm run setup          # Initial setup (admin + rewards)
```

### Environment Requirements
- Node.js (ES Modules support)
- MySQL database
- Google Gemini API key
- YouTube API access

---

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript ES6+ required
- No framework dependencies (vanilla JS)
- Responsive design for mobile/tablet/desktop

---

## Keywords & Tags

**Health:** Consultation, Telemedicine, Health Services, Wellness  
**Islamic:** Sunnah, Halal, Islamic Health, Worship  
**E-commerce:** Products, Store, Shopping, Order  
**AI:** Gemini, Artificial Intelligence, Health Advisor  
**Content:** Articles, Podcasts, YouTube, Media  
**Gamification:** Journey, Points, Rewards, Progress  

---

## Contact & Support

**Project Type:** Health & Wellness Platform  
**Primary Language:** Indonesian (Bahasa Indonesia)  
**Documentation Language:** Indonesian  
**Code Comments:** Mixed (English & Indonesian)  

---

**Last Updated:** 2026-01-02  
**Documentation Generated By:** BMad Master (Exhaustive Scan)
