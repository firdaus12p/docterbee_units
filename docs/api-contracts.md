# API Contracts Documentation

> **Purpose**: Document all API endpoints to ensure changes don't break existing functionality.

## Base URL: `/api`

---

## Auth Routes (`/api/auth`)

| Method | Endpoint | Request Body | Response | Side Effects |
|--------|----------|--------------|----------|--------------|
| `POST` | `/register` | `{name, email, phone, password, card_type}` | `{success, data: {id, name, email, phone, card_type}}` | Creates user, sets session |
| `POST` | `/login` | `{email, password}` | `{success, data: {id, name, email, phone}}` | Sets session |
| `POST` | `/logout` | - | `{success, message}` | Destroys session |
| `GET` | `/me` | - | `{success, data: user}` | - |
| `GET` | `/check` | - | `{success, loggedIn, user}` | - |

---

## Users Routes (`/api/users`)

| Method | Endpoint | Request Body | Response |
|--------|----------|--------------|----------|
| `GET` | `/` | - | `{success, data: users[], count}` |
| `GET` | `/:id` | - | `{success, data: user}` |
| `PATCH` | `/:id/password` | `{password}` | `{success, message}` |
| `PATCH` | `/:id/toggle` | - | `{success, message, data: {is_active}}` |
| `DELETE` | `/:id` | - | `{success, message}` |
| `GET` | `/:id/rewards` | - | `{success, data: {user, rewards[]}}` |
| `PATCH` | `/:userId/rewards/:redemptionId/approve` | - | `{success, message}` |

---

## Orders Routes (`/api/orders`)

| Method | Endpoint | Request Body | Response | Side Effects |
|--------|----------|--------------|----------|--------------|
| `GET` | `/check-pending` | - | `{success, has_pending, data?}` | May auto-expire orders |
| `POST` | `/` | `{guest_data?, order_type, store_location, items[], total_amount}` | `{success, data: {id, order_number, qr_code_data, expires_at, points_earned}}` | Creates order |
| `GET` | `/` | `?status&payment_status&limit&offset` | `{success, count, data: orders[]}` | - |
| `GET` | `/id/:id` | - | `{success, data: order}` | May auto-expire |
| `GET` | `/:orderNumber` | - | `{success, data: order}` | May auto-expire |
| `PATCH` | `/:id/complete` | - | `{success, message, points_added}` | Adds points to user |
| `PATCH` | `/:id/cancel` | - | `{success, message}` | - |
| `POST` | `/:id/assign-points-by-phone` | `{phone}` | `{success, message, data}` | Adds points |
| `DELETE` | `/:id` | - | `{success, message}` | - |

---

## Bookings Routes (`/api/bookings`)

| Method | Endpoint | Request Body | Response | Side Effects |
|--------|----------|--------------|----------|--------------|
| `GET` | `/` | `?status&date&branch&limit&offset` | `{success, count, data: bookings[]}` | - |
| `GET` | `/:id` | - | `{success, data: booking}` | - |
| `POST` | `/` | `{serviceName, branch, practitioner, date, time, mode, customer*, promo*}` | `{success, data}` | May increment coupon usage |
| `PATCH` | `/:id` | `{status?, notes?}` | `{success, message}` | - |
| `GET` | `/prices/:serviceName` | - | `{success, data: {serviceName, price}}` | - |
| `DELETE` | `/:id` | - | `{success, message}` | - |

---

## Products Routes (`/api/products`)

| Method | Endpoint | Request Body | Response |
|--------|----------|--------------|----------|
| `GET` | `/` | `?category&is_active` | `{success, data: products[], count}` |
| `GET` | `/:id` | - | `{success, data: product}` |
| `POST` | `/` | `{name, category, price, description, image_url?, stock?}` | `{success, data}` |
| `PATCH` | `/:id` | `{name?, category?, price?, ...}` | `{success, data}` |
| `DELETE` | `/:id` | - | `{success, message}` |

---

## Services Routes (`/api/services`)

| Method | Endpoint | Request Body | Response |
|--------|----------|--------------|----------|
| `GET` | `/` | `?category&branch&mode&is_active` | `{success, data: services[], count}` |
| `GET` | `/:id` | - | `{success, data: service}` |
| `POST` | `/` | `{name, category, price, description, branch, mode, practitioner?}` | `{success, data}` |
| `PATCH` | `/:id` | dynamic fields | `{success, data}` |
| `DELETE` | `/:id` | - | `{success, message}` |

---

## Events Routes (`/api/events`)

| Method | Endpoint | Response |
|--------|----------|----------|
| `GET` | `/` | `{success, count, data: events[]}` |
| `GET` | `/:id` | `{success, data: event}` |
| `POST` | `/` | `{success, message, data}` |
| `PATCH` | `/:id` | `{success, message}` |
| `DELETE` | `/:id` | `{success, message}` |

---

## Coupons Routes (`/api/coupons`)

| Method | Endpoint | Response |
|--------|----------|----------|
| `POST` | `/validate` | `{success, valid, data?: {code, description, discountType, discountValue, minBookingValue}}` |
| `GET` | `/` | `{success, count, data: coupons[]}` |
| `GET` | `/:id` | `{success, data: coupon}` |
| `POST` | `/` | `{success, message, data}` |
| `PATCH` | `/:id` | `{success, message}` |
| `DELETE` | `/:id` | `{success, message}` |

---

## Rewards Routes (`/api/rewards`)

| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| `GET` | `/` | Public | `{success, rewards[]}` |
| `GET` | `/admin/all` | Admin | `{success, rewards[]}` |
| `GET` | `/admin/:id` | Admin | `{success, reward}` |
| `POST` | `/admin` | Admin | `{success, message, id}` |
| `PATCH` | `/admin/:id` | Admin | `{success, message}` |
| `DELETE` | `/admin/:id` | Admin | `{success, message}` |

---

## Articles/Insight Routes (`/api/insight` & `/api/articles`)

| Method | Endpoint | Response |
|--------|----------|----------|
| `GET` | `/` | `{success, count, data: articles[]}` |
| `GET` | `/id/:id` | `{success, data: article}` |
| `GET` | `/:slug` | `{success, data: article}` |
| `POST` | `/` | `{success, message, data}` |
| `PATCH` | `/:id` | `{success, message}` |
| `DELETE` | `/:id` | `{success, message}` |

---

## Upload Routes (`/api/upload`)

| Method | Endpoint | Response |
|--------|----------|----------|
| `POST` | `/` | `{success, filePath, data: {url, filename, size}}` |
| `POST` | `/product-image` | `{success, data: {url, filename, size}}` |
| `DELETE` | `/product-image/:filename` | `{success, message}` |

---

## User Data Routes (`/api/user-data`)

| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| `GET` | `/progress` | User | `{success, data: {unitData, points, updatedAt}}` |
| `POST` | `/progress` | User | `{success, message}` |
| `GET` | `/rewards` | User | `{success, data: rewards[]}` |
| `POST` | `/rewards/redeem` | User | `{success, message, newPoints, redemptionId}` |
| `GET` | `/cart` | User | `{success, data: {cartData, lastQrCode, updatedAt}}` |
| `POST` | `/cart` | User | `{success, message}` |
| `DELETE` | `/cart` | User | `{success, message}` |

---

## Standard Response Contract

All endpoints return:
```json
{
  "success": true|false,
  "data": {...} | [...],  // on success
  "error": "message",     // on failure  
  "message": "..."        // optional info
}
```
