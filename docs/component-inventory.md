# Frontend Component Inventory - DocterBee Units

**Generated:** 2026-01-02  
**Location:** `/js/` directory  
**Total Modules:** 20 JavaScript files  
**Architecture:** Modular vanilla JavaScript

---

## Module Categories

### 1. Utility Modules (Core Infrastructure)

| Module | Size | Purpose | Exports |
|--------|------|---------|---------|
| **utils.js** | 3.5 KB | Common utilities | `escapeHtml`, `formatDate`, `formatCurrency`, `copyToClipboard`, `getCategoryColor` |
| **modal-utils.js** | 13.1 KB | Modal dialogs | `showSuccess`, `showError`, `showConfirm`, `showInfo`, `showDeleteModal` |
| **admin-api.js** | 1.7 KB | Admin API helpers | `API_BASE`, `adminFetch()` |
| **card-config.js** | 3.8 KB | Card type configuration | `CARD_TYPE_CONFIG`, `getCardConfig()`, `getAllCardTypes()` |

### 2. Admin Dashboard Modules

| Module | Size | Purpose | Features |
|--------|------|---------|----------|
| **admin-dashboard.js** | 83 KB | Main dashboard | Tab management, overview stats, logout |
| **users-manager.js** | 21.2 KB | User CRUD | List users, reset password, toggle status, delete |
| **orders-manager.js** | 24.1 KB | Order management | List orders, complete orders, assign points, QR scanning |
| **rewards-manager.js** | 8.9 KB | Reward system | Create rewards, manage redemptions, approve claims |
| **journey-manager.js** | 19.2 KB | Journey configuration | Create units, add items, manage journey structure |
| **podcasts-manager.js** | 11.5 KB | Podcast management | Upload audio, manage podcast library |

**Admin Module Total:** ~168 KB (6 files)

### 3. User-Facing Features

| Module | Size | Purpose | Key Functions |
|--------|------|---------|---------------|
| **script.js** | 121 KB | Core user functionality | Journey rendering, points management, navigation, auth |
| **store-cart.js** | 39.2 KB | Shopping cart | Add to cart, checkout, QR code generation, order tracking |
| **user-data-sync.js** | 10.3 KB | Data synchronization | Sync cart, sync journey progress, session management |
| **health-check.js** | 28.9 KB | Health check tool | Interactive health assessment, AI integration |

**User Feature Total:** ~199 KB (4 files)

### 4. Page-Specific Modules

| Module | Size | Purpose | Page |
|--------|------|---------|------|
| **article-reader.js** | 7 KB | Article display | article.html |
| **insight-articles.js** | 6.2 KB | Article listing | insight.html |
| **member-check.js** | 11 KB | Membership lookup | member-check.html |
| **register-card-preview.js** | 6.5 KB | Card preview | register.html |

### 5. Navigation Modules

| Module | Size | Purpose | Used On |
|--------|------|---------|---------|
| **app-navbar.js** | 8.8 KB | App navigation | Authenticated pages |
| **landing-navbar.js** | 14.3 KB | Landing navigation | Public pages |

---

## Detailed Module Breakdown

### Core Utility Modules

#### **utils.js** (3.5 KB)
```javascript
// Exported Functions:
- escapeHtml(unsafe)           // XSS prevention
- formatDate(dateString)       // Indonesian date formatting
- formatCurrency(amount)       // Rupiah formatting (Rp)
- copyToClipboard(text)        // Clipboard API
- getCategoryColor(category)   // Tailwind color classes for categories
```

**Dependencies:** None  
**Used By:** All modules

---

#### **modal-utils.js** (13.1 KB)
```javascript
// Modal Types:
- showSuccess(message, onClose)         // Success modal with ✓ icon
- showError(message, onClose)           // Error modal with ✗ icon  
- showConfirm(message, onConfirm, ...)  // Confirmation dialog
- showInfo(message, onClose)            // Info modal with ℹ icon
- showDeleteModal(message, onConfirm)   // Delete confirmation
```

**Features:**
- Backdrop overlay
- ESC key to close
- Promise-based callbacks
- Lucide icons integration
- Accessible (ARIA attributes)

**Used By:** All interactive modules

---

#### **admin-api.js** (1.7 KB)
```javascript
// Exports:
- API_BASE = "/api"
- adminFetch(url, options)  // Fetch with credentials
```

**Purpose:** Centralized admin API configuration  
**Security:** Includes credentials (session cookie)  
**Created:** Part of decoupling refactor (PRD)

---

#### **card-config.js** (3.8 KB)
```javascript
// Exports:
- CARD_TYPE_CONFIG = {
    "Active-Worker": { front, back, label, smallName },
    "Family-Member": { ... },
    // ... 7 card types total
  }
- getSmallNameCardTypes()
- getCardConfig(cardType)
- getAllCardTypes()
```

**Purpose:** Single source of truth for membership cards  
**Created:** Part of decoupling refactor (PRD)

---

### Admin Dashboard Modules

#### **admin-dashboard.js** (83 KB)
**Main Entry Point for Admin Panel**

```javascript
// Core Features:
- Tab navigation system
- Overview statistics
- Admin authentication check
- Global logout functionality
- Modal integration
- Lucide icons initialization
```

**Architecture:**
```
admin-dashboard.js (core)
    ↓ loads
├── users-manager.js
├── orders-manager.js
├── rewards-manager.js
├── journey-manager.js
└── podcasts-manager.js
```

**Dependencies:**
- admin-api.js (API helpers)
- modal-utils.js (UI dialogs)
- utils.js (formatting)

---

#### **users-manager.js** (21.2 KB)
**User Management Interface**

```javascript
// Main Functions:
- initUsersManager()          // Initialize module
- loadUsers()                 // Fetch and display user list
- openAddUserModal()          // User creation (not implemented)
- resetUserPassword(userId)   // Password reset
- toggleUserStatus(userId)    // Activate/deactivate
- deleteUser(userId)          // Hard delete
- searchUsers()               // Client-side search
```

**Features:**
- Real-time user count display
- Points balance per user
- Status indicators (active/inactive)
- Search functionality
- Confirmation modals

**API Endpoints:**
- GET `/api/users`
- PATCH `/api/users/:id/password`
- PATCH `/api/users/:id/toggle`
- DELETE `/api/users/:id`

---

#### **orders-manager.js** (24.1 KB)
**Order & Point Management**

```javascript
// Main Functions:
- initOrdersManager()
- loadOrders(filter)          // Load with status filter
- completeOrder(orderId)      // Mark as complete
- showOrderDetails(order)     // Modal with full details
- assignPointsByPhone()       // Assign points to user by phone
- deleteOrder(orderId)        // Admin delete
```

**Unique Features:**
- QR code scanning simulation
- Point assignment to guest orders
- Phone number lookup integration
- Order expiry handling
- Status filtering (pending/completed/expired/cancelled)

**API Endpoints:**
- GET `/api/orders`
- PATCH `/api/orders/:id/complete`
- POST `/api/orders/:id/assign-points-by-phone`
- DELETE `/api/orders/:id`

---

#### **rewards-manager.js** (8.9 KB)
**Reward System Administration**

```javascript
// Main Functions:
- initRewardsManager()
- loadRewards()               // Load reward catalog
- loadRedemptions()           // Load pending redemptions
- addReward()                 // Create new reward
- approveRedemption(id)       // Approve user claim
- deleteReward(id)            // Remove reward
```

**Features:**
- Dual view: Rewards catalog & Redemption queue
- Points cost management
- Stock tracking for physical rewards
- Approval workflow

**API Endpoints:**
- GET `/api/rewards`
- POST `/api/rewards`
- GET `/api/rewards/redemptions`
- PATCH `/api/rewards/redemptions/:id/approve`
- DELETE `/api/rewards/:id`

---

#### **journey-manager.js** (19.2 KB)
**Journey Configuration Interface**

```javascript
// Main Functions:
- initJourneyManager()
- loadJourneys()              // Load journey units
- addJourneyUnit()            // Create new unit
- editJourneyUnit(id)         // Update unit
- deleteJourneyUnit(id)       // Remove unit
- addJourneyItem(unitId)      // Add item to unit
- editJourneyItem(unitId, itemId)
- deleteJourneyItem(unitId, itemId)
```

**Data Structure:**
```javascript
// Journey Unit
{
  id: number,
  title: string,
  description: string,
  items: JourneyItem[]
}

// Journey Item
{
  id: string,
  title: string,
  description: string,
  points: number,
  type: 'task' | 'milestone',
  required: boolean
}
```

**Features:**
- Hierarchical structure (Units → Items)
- Points configuration per item
- Required vs optional items
- Drag-and-drop ordering (future enhancement)

---

#### **podcasts-manager.js** (11.5 KB)
**Podcast Library Management**

```javascript
// Main Functions:
- initPodcastsManager()
- loadPodcasts()
- addPodcast()                // Upload new podcast
- editPodcast(id)
- deletePodcast(id)
```

**Features:**
- Audio file upload
- Metadata management (title, topic, speaker)
- Duration tracking
- Topic categorization

---

### User-Facing Feature Modules

#### **script.js** (121 KB)
**Core User Experience Module**

```javascript
// Major Sections:
1. Authentication & Session Management
2. Navigation & Menu Control
3. Journey System Rendering
4. Points Management
5. Profile Management
6. Reward Redemption
7. Event Handling
8. Cart Integration
```

**Key Functions:**
```javascript
// Auth
- checkAuthStatus()
- handleLogin(email, password)
- handleLogout()

// Journey
- loadJourneyData()
- renderJourney(journeyData)
- toggleUnit(unitId)
- toggleItem(unitId, itemId)
- saveProgress()

// Points
- loadUserPoints()
- addPoints(amount)
- refreshNav()

// Rewards
- loadRewards()
- redeemReward(rewardId)
```

**State Management:**
- Session storage for cart
- Local storage for offline capability
- Server sync via user-data-sync.js

---

#### **store-cart.js** (39.2 KB)
**E-Commerce Shopping Cart**

```javascript
// Core Features:
1. Cart State Management
2. Product Addition/Removal
3. Quantity Updates
4. Checkout Flow
5. QR Code Generation
6. Order Tracking
7. Coupon Application
```

**Key Functions:**
```javascript
// Cart Operations
- addToCart(product, quantity)
- updateCartQuantity(productId, quantity)
- removeFromCart(productId)
- clearCart()

// Checkout
- proceedToCheckout()
- submitOrder(orderData)
- generateQRCode(orderNumber)

// Coupon
- applyCoupon(code)
- validateCoupon(code)

// Points
- claimOrderPoints(orderId)  // After order completion
```

**Features:**
- Guest and logged-in checkout
- Real-time total calculation
- Member price detection
- QR code with expiry timer
- Order status polling
- Points claim workflow

**🔒 Security:**
- Server-side price validation
- Coupon verification on backend
- Stock availability check
- Race condition prevention

---

#### **user-data-sync.js** (10.3 KB)
**Data Synchronization Module**

```javascript
// Sync Functions:
- syncCartToServer()          // Upload cart to user_cart table
- syncCartFromServer()        // Download saved cart
- syncJourneyProgress()       // Sync journey state
- handleLogin()               // Merge guest + user data
- handleLogout()              // Clear synced data
```

**Sync Strategy:**
```
Guest User:
  Cart → sessionStorage only

Logged-in User:
  Cart → sessionStorage + MySQL (user_cart table)
  Journey → MySQL (user_progress table)
  Points → MySQL (user_progress table)
```

**Conflict Resolution:**
- Login: Merge guest cart with saved cart
- Logout: Keep sessionStorage (guest mode)
- Network Error: Retry with exponential backoff

---

#### **health-check.js** (28.9 KB)
**Interactive Health Assessment Tool**

```javascript
// Main Features:
1. Multi-step health questionnaire
2. AI-powered health insights (future)
3. Results calculation
4. Recommendations engine
5. History tracking
```

**Components:**
```javascript
// Question Types:
- Multiple choice
- Scale rating (1-10)
- Yes/No
- Text input

// Scoring:
- Category-based scoring
- Weighted questions
- Risk assessment levels
```

**Integration Points:**
- Gemini API for insights generation (planned)
- Journey system integration
- Points reward for completion

---

### Page-Specific Modules

#### **article-reader.js** (7 KB)
```javascript
// Features:
- Load article by slug
- Render markdown/HTML content
- View count increment
- Category badge styling
- Related articles
```

---

#### **insight-articles.js** (6.2 KB)
```javascript
// Features:
- Article listing with pagination
- Category filtering
- Search functionality
- Card-based layout
- Category color coding
```

---

#### **member-check.js** (11 KB)
```javascript
// Features:
- Phone number lookup
- Digital card display (front/back)
- Card flip animation
- Member info display
- QR code integration
```

---

#### **register-card-preview.js** (6.5 KB)
```javascript
// Features:
- Real-time card preview
- Card type selection
- Name rendering on card
- Font size adjustment for long names
- Card background switching
```

---

### Navigation Modules

#### **app-navbar.js** (8.8 KB)
**Authenticated User Navigation**

```javascript
// Features:
- User profile display
- Points balance
- Notification bell
- Logout button
- Mobile hamburger menu
- Active page highlighting
```

---

#### **landing-navbar.js** (14.3 KB)
**Public Page Navigation**

```javascript
// Features:
- CTA buttons (Login/Register)
- Public page links
- Mobile responsive menu
- Scroll behavior
- Sticky header
```

---

## Module Dependencies

### Dependency Graph

```
Core Layer:
  utils.js ← (used by all)
  modal-utils.js ← (used by all interactive modules)
  admin-api.js ← (used by admin modules only)
  card-config.js ← (used by register, member-check)

Admin Layer:
  admin-dashboard.js
    ├─→ users-manager.js
    ├─→ orders-manager.js
    ├─→ rewards-manager.js
    ├─→ journey-manager.js
    └─→ podcasts-manager.js
    All depend on: admin-api.js, modal-utils.js, utils.js

User Layer:
  script.js (main)
    ├─→ user-data-sync.js
    └─→ store-cart.js
  
  app-navbar.js (navigation)
  
  Page-specific modules:
    article-reader.js
    insight-articles.js  
    member-check.js → card-config.js
    register-card-preview.js → card-config.js
    health-check.js
```

---

## Naming Conventions

### Function Naming Patterns
- **`init**()`** - Module initialization
- **`load**()`** - Fetch and display data
- **`show**()`** - Display UI elements
- **`handle**()`** - Event handlers
- **`toggle**()`** - Toggle states
- **`open/close*Modal()`** - Modal operations

### Variable Naming
- **camelCase** for functions and variables
- **UPPER_CASE** for constants
- **Descriptive names** (no abbreviations)

---

## Code Quality

### Standards
✅ ESLint configured  
✅ Consistent formatting  
✅ JSDoc comments for complex functions  
✅ Error handling with try-catch  
✅ Input validation  

### Patterns Used
- **Module Pattern** (IIFE for encapsulation)
- **Event Delegation** (efficient DOM handling)
- **Promise-based async** (async/await)
- **Functional approach** (pure functions where possible)

---

## Browser APIs Used

- **Fetch API** - AJAX requests
- **sessionStorage** - Cart persistence
- **localStorage** - Offline data
- **CustomEvent** - Inter-module communication
- **Clipboard API** - Copy functionality
- **FormData** - File uploads
- **History API** - SPA-like navigation

---

## External Dependencies

### JavaScript Libraries
- **Lucide Icons** - Icon library (loaded via CDN)
- **Tailwind CSS** - Used for utility classes

### No Framework
✅ **Zero framework dependencies** - Pure vanilla JavaScript  
✅ **No build step required** - Direct browser execution  
✅ **Modern ES6+ syntax** - Classes, async/await, arrow functions

---

## File Size Summary

| Category | File Count | Total Size |
|----------|-----------|-----------|
| **Admin Modules** | 6 | ~168 KB |
| **User Modules** | 4 | ~199 KB |
| **Page Modules** | 4 | ~31 KB |
| **Navigation** | 2 | ~23 KB |
| **Utilities** | 4 | ~22 KB |
| **TOTAL** | **20 files** | **~443 KB** |

---

**Last Updated:** 2026-01-02  
**Scan Type:** Exhaustive  
**Generated By:** BMad Master
