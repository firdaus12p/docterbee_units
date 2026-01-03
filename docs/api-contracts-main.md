# API Contracts - DocterBee Units

**Generated:** 2026-01-02  
**API Base URL:** `/api`  
**Authentication:** Session-based (express-session)

---

## Table of Contents

- [Authentication & Authorization](#authentication--authorization)
- [Auth Endpoints](#1-authentication-endpoints)
- [User Management Endpoints (Admin)](#2-user-management-endpoints-admin)
- [Product Endpoints](#3-product-endpoints)
- [Service Endpoints](#4-service-endpoints)
- [Booking Endpoints](#5-booking-endpoints)
- [Order Endpoints](#6-order-endpoints)
- [Event Endpoints](#7-event-endpoints)
- [Article/Insight Endpoints](#8-articleinsight-endpoints)
- [Journey Endpoints](#9-journey-endpoints)
- [Podcast Endpoints](#10-podcast-endpoints)
- [Reward Endpoints](#11-reward-endpoints)
- [Coupon Endpoints](#12-coupon-endpoints)
- [User Data Endpoints](#13-user-data-endpoints)
- [Member Check Endpoints](#14-member-check-endpoints)
- [Upload Endpoints](#15-upload-endpoints)

---

## Authentication & Authorization

### Session-Based Authentication
- **Cookie Name:** `connect.sid`
- **Storage:** Server-side session store (express-session)
- **Session Data:**
  - `userId` - User ID
  - `userName` - User name
  - `userEmail` - User email
  - `userPhone` - User phone number  
  - `isAdmin` - Admin status (for admin users)

### Admin-Only Routes
Routes marked with **[Admin Only]** require `req.session.isAdmin === true`.  
Middleware: `requireAdmin` from `backend/middleware/auth.mjs`

### Rate Limiting
- **Login endpoint** has rate limiting enabled
- Failed attempts are tracked per session
- Users see remaining attempts in error message

---

## 1. Authentication Endpoints

Base path: `/api/auth`

### 1.1 Register New User

```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required, email format)",
  "phone": "string (required, unique)",
  "password": "string (required, min 6 chars)",
  "card_type": "string (optional, valid card type)"
}
```

**Valid Card Types:**
- `Active-Worker` (default)
- `Family-Member`
- `Healthy-Smart-Kids`
- `Mums-Baby`
- `New-Couple`
- `Pregnant-Preparation`
- `Senja-Ceria`

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "id": 1,
    "name": "string",
    "email": "string",
    "phone": "string",
    "card_type": "string"
  }
}
```

**Error Responses:**
- `400` - Validation error (missing fields, invalid email, password too short, duplicate email/phone)
- `500` - Server error

---

### 1.2 Login User

```http
POST /api/auth/login
Content-Type: application/json
```

**Rate Limiting:** ✅ Enabled

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "id": 1,
    "name": "string",
    "email": "string",
    "phone": "string"
  }
}
```

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid credentials (with remaining attempts info)
- `500` - Server error

---

### 1.3 Logout User

```http
POST /api/auth/logout
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout berhasil"
}
```

---

### 1.4 Get Current User

```http
GET /api/auth/me
```

**Auth Required:** Yes (session)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "string",
    "email": "string",
    "phone": "string",
    "card_type": "string",
    "created_at": "timestamp"
  }
}
```

**Error Responses:**
- `401` - Not logged in or user not found

---

### 1.5 Check Login Status

```http
GET /api/auth/check
```

**Success Response (200):**
```json
{
  "success": true,
  "loggedIn": true,
  "user": {
    "id": 1,
    "name": "string",
    "email": "string",
    "phone": "string"
  }
}
```

Or if not logged in:
```json
{
  "success": true,
  "loggedIn": false,
  "user": null
}
```

---

## 2. User Management Endpoints (Admin)

Base path: `/api/users`  
**All routes require admin authentication**

### 2.1 Get All Users **[Admin Only]**

```http
GET /api/users
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "string",
      "email": "string",
      "phone": "string",
      "created_at": "timestamp",
      "is_active": 1,
      "points": 0
    }
  ],
  "count": 10
}
```

---

### 2.2 Get Single User **[Admin Only]**

```http
GET /api/users/:id
```

**Path Parameters:**
- `id` - User ID (integer)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "string",
    "email": "string",
    "phone": "string",
    "created_at": "timestamp",
    "is_active": 1
  }
}
```

**Error Responses:**
- `404` - User not found

---

### 2.3 Reset User Password **[Admin Only]**

```http
PATCH /api/users/:id/password
Content-Type: application/json
```

**Request Body:**
```json
{
  "password": "string (required, min 6 chars)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password berhasil direset"
}
```

**Error Responses:**
- `400` - Invalid password
- `404` - User not found

---

### 2.4 Toggle User Active Status **[Admin Only]**

```http
PATCH /api/users/:id/toggle
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User berhasil diaktifkan/dinonaktifkan",
  "data": {
    "is_active": 1
  }
}
```

---

### 2.5 Delete User **[Admin Only]**

```http
DELETE /api/users/:id
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User berhasil dihapus"
}
```

**Error Responses:**
- `404` - User not found

---

### 2.6 Get User Reward History **[Admin Only]**

```http
GET /api/users/:id/rewards
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "string"
    },
    "rewards": [
      {
        "id": 1,
        "reward_name": "string",
        "points_cost": 100,
        "redeemed_at": "timestamp",
        "status": "pending|approved"
      }
    ]
  }
}
```

---

### 2.7 Approve Reward Redemption **[Admin Only]**

```http
PATCH /api/users/:userId/rewards/:redemptionId/approve
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Redemption berhasil di-approve"
}
```

**Error Responses:**
- `400` - Already approved
- `404` - Redemption not found

---

## 3. Product Endpoints

Base path: `/api/products`

### 3.1 Get All Products

```http
GET /api/products?category=:category&is_active=:isActive
```

**Query Parameters:**
- `category` (optional) - Filter by category ("all" shows all)
- `is_active` (optional) - Filter by active status ("true"|"false", default: true)

**Valid Categories:**
- `Zona Sunnah`
- `1001 Rempah`
- `Zona Honey`
- `Cold Pressed`
- `Coffee`
- `Tea`
- `Jus`

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "string",
      "category": "string",
      "price": "decimal",
      "member_price": "decimal|null",
      "promo_text": "string|null",
      "description": "string",
      "image_url": "string|null",
      "stock": 0,
      "is_active": 1,
      "article_slug": "string|null",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "count": 10
}
```

---

### 3.2 Get Single Product

```http
GET /api/products/:id
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "string",
    "category": "string",
    "price": "decimal",
    "member_price": "decimal|null",
    "promo_text": "string|null",
    "description": "string",
    "image_url": "string|null",
    "stock": 0,
    "is_active": 1,
    "created_at": "timestamp"
  }
}
```

**Error Responses:**
- `404` - Product not found

---

### 3.3 Create Product **[Admin Only]**

```http
POST /api/products
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "string (required)",
  "category": "string (required, must be valid category)",
  "price": "decimal (required)",
  "member_price": "decimal (optional, must be < price)",
  "promo_text": "string (optional)",
  "description": "string (required)",
  "image_url": "string (optional)",
  "stock": "integer (optional, default 0)"
}
```

**Validation Rules:**
- `member_price` must be greater than 0
- `member_price` must be less than `price`
- `category` must be one of the valid categories

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "string",
    "category": "string",
    "price": "decimal",
    "description": "string",
    "image_url": "string",
    "stock": 0
  }
}
```

---

### 3.4 Update Product **[Admin Only]**

```http
PATCH /api/products/:id
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "name": "string",
  "category": "string",
  "price": "decimal",
  "member_price": "decimal",
  "promo_text": "string",
  "description": "string",
  "image_url": "string",
  "stock": "integer",
  "is_active": "boolean"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    /* updated product object */
  }
}
```

---

### 3.5 Delete Product **[Admin Only]**

```http
DELETE /api/products/:id
```

**Note:** Hard delete - permanently removes from database

**Success Response (200):**
```json
{
  "success": true,
  "message": "Produk berhasil dihapus secara permanen"
}
```

**Error Responses:**
- `400` - Invalid product ID
- `404` - Product not found

---

## API Architecture Notes

### Common Response Pattern

All endpoints follow this pattern:

**Success:**
```json
{
  "success": true,
  "message": "optional descriptive message",
  "data": {/* response data */}
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message in Indonesian"
}
```

### Database Connection
- Uses `mysql2` with promise-based connection pool
- Helper functions: `query()` and `queryOne()` from `db.mjs`
- Automatic connection management

### Security Features
- Password hashing with bcryptjs (cost factor: 10)
- Session-based authentication
- Rate limiting on login endpoint
- Admin-only route protection
- SQL injection prevention via parameterized queries
- CORS enabled

### Error Handling
- All routes wrapped in try-catch
- Consistent error logging to console
- User-friendly error messages in Indonesian
- HTTP status codes follow REST standards

---

**Document Status:** Partial (Covers Auth, Users, Products)  
**Remaining Endpoints:** Services, Bookings, Orders, Events, Articles, Journeys, Podcasts, Rewards, Coupons, User Data, Member Check, Upload

**Note:** This is a comprehensive living document. More endpoint documentation will be added as the exhaustive scan progresses through remaining route files.
