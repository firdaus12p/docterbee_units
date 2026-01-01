# Test Coverage Documentation

**Last Updated:** Auto-generated  
**Test Framework:** Node.js Built-in Test Runner (`node --test`)

---

## Quick Start

```bash
# Run unit tests only (no server required)
node --test tests/helpers.test.mjs tests/middleware.test.mjs

# Run all tests (requires server at localhost:3000 + MySQL)
npm start &
node --test "tests/*.test.mjs"
```

---

## Test Categories

### 1. Unit Tests (No Server Required) ✅

These tests use mocks and don't require a running server or database.

| File                  | Tests | Coverage                                                                                    |
| --------------------- | ----- | ------------------------------------------------------------------------------------------- |
| `helpers.test.mjs`    | 21    | Pure functions: `generateOrderNumber`, `calculateExpiryTime`, `calculatePoints`, validators |
| `middleware.test.mjs` | 10    | `requireAdmin`, `requireUser` middleware with mocked req/res                                |

**Total: 31 tests**

### 2. Integration Tests (Require Running Server) 🔧

These tests make HTTP requests to the API and require:

- Server running at `localhost:3000`
- MySQL database connection (XAMPP on port 3307)

| File                   | Test Suites | Coverage                                                                    |
| ---------------------- | ----------- | --------------------------------------------------------------------------- |
| `auth.test.mjs`        | 5 suites    | Registration, login, logout, session check, current user                    |
| `bookings.test.mjs`    | 5 suites    | Booking CRUD, admin protection, price endpoint                              |
| `orders.test.mjs`      | 6 suites    | Order creation, pending tracking, status, admin routes, order number format |
| `coupons.test.mjs`     | 4 suites    | Coupon validation, discount calculation, usage limits, admin protection     |
| `user-data.test.mjs`   | 6 suites    | Progress sync, cart operations, rewards redemption                          |
| `integration.test.mjs` | 6 suites    | Cross-module flows: auth lifecycle, order flow, booking flow                |
| `smoke.test.mjs`       | 2 suites    | Basic API health checks                                                     |

---

## Module Coverage Detail

### Authentication (`auth.mjs`) ✅

| Scenario                          | Status | Notes                             |
| --------------------------------- | ------ | --------------------------------- |
| User registration with validation | ✅     | Email, phone, password validation |
| Duplicate email prevention        | ✅     |                                   |
| Duplicate phone prevention        | ✅     |                                   |
| Login with valid credentials      | ✅     | Session creation                  |
| Login with invalid credentials    | ✅     | 401 response                      |
| Logout and session destruction    | ✅     |                                   |
| Auth check endpoint               | ✅     |                                   |
| Get current user (/me)            | ✅     |                                   |
| Card type in registration         | ✅     | green, silver, gold, platinum     |

### Middleware (`auth.mjs`) ✅

| Middleware                            | Status | Notes       |
| ------------------------------------- | ------ | ----------- |
| `requireAdmin` - allows admin         | ✅     |             |
| `requireAdmin` - blocks non-admin     | ✅     | Returns 401 |
| `requireAdmin` - blocks null session  | ✅     |             |
| `requireUser` - allows logged-in user | ✅     |             |
| `requireUser` - blocks guest          | ✅     | Returns 401 |
| `requireUser` - blocks userId=0       | ✅     | Edge case   |

### Bookings (`bookings.mjs`) ✅

| Scenario                                | Status | Notes                                |
| --------------------------------------- | ------ | ------------------------------------ |
| Create booking with valid data          | ✅     | Includes branch_id, service_id, etc. |
| Validation of required fields           | ✅     |                                      |
| GET /api/bookings requires admin        | ✅     |                                      |
| DELETE /api/bookings/:id requires admin | ✅     |                                      |
| Price calculation endpoint              | ✅     | Member vs non-member pricing         |

### Orders (`orders.mjs`) ✅

| Scenario                                  | Status | Notes                       |
| ----------------------------------------- | ------ | --------------------------- |
| Guest checkout                            | ✅     | No session required         |
| Logged-in user order                      | ✅     | Session data used           |
| Order number format (ORD-YYYYMMDD-XXXXXX) | ✅     |                             |
| Order number uniqueness                   | ✅     |                             |
| Empty items rejection                     | ✅     |                             |
| Duplicate pending order prevention        | ✅     |                             |
| Order status retrieval                    | ✅     |                             |
| Pending order check                       | ✅     |                             |
| GET /api/orders admin only                | ✅     |                             |
| DELETE /api/orders/:id admin only         | ✅     |                             |
| PATCH /api/orders/:id/complete admin only | ✅     |                             |
| Points calculation                        | ✅     | 1 point per 10,000 IDR      |
| Valid order types                         | ✅     | dine_in, takeaway, delivery |
| Expiry time calculation                   | ✅     | 30min dine_in, 2hr others   |

### Coupons (`coupons.mjs`) ✅

| Scenario                      | Status | Notes                      |
| ----------------------------- | ------ | -------------------------- |
| Valid coupon validation       | ✅     | validate_only=true         |
| Invalid coupon code rejection | ✅     |                            |
| Expired coupon rejection      | ✅     |                            |
| Minimum value check           | ✅     |                            |
| Coupon type restriction       | ✅     | member_only, once_per_user |
| Discount calculation          | ✅     | Percentage and fixed       |
| Admin route protection        | ✅     |                            |
| One-time usage tracking       | ✅     | Requires DB seeding        |

### User Data (`user-data.mjs`) ✅

| Scenario                        | Status | Notes                       |
| ------------------------------- | ------ | --------------------------- |
| Auth required for all endpoints | ✅     | 6 endpoints tested          |
| Empty progress for new user     | ✅     |                             |
| Save and retrieve progress      | ✅     |                             |
| Invalid progress data rejection | ✅     | Non-object, negative points |
| Cart operations (CRUD)          | ✅     |                             |
| Rewards redemption              | ✅     |                             |
| Insufficient points rejection   | ✅     |                             |
| User data isolation             | ✅     | Cross-user data protection  |

### Helper Functions (`helpers.mjs`) ✅

| Function                          | Status | Notes                             |
| --------------------------------- | ------ | --------------------------------- |
| `generateOrderNumber()`           | ✅     | Format, uniqueness, date portion  |
| `calculateExpiryTime()`           | ✅     | 30min/2hr based on order type     |
| `calculatePoints()`               | ✅     | 1 pt / 10,000 IDR, floor division |
| Validators (email, phone, order#) | ✅     | Regex validation                  |

---

## Integration Test Flows ✅

### Complete User Journey

1. Register → Login → Access protected routes → Logout
2. Data persistence across session

### Order Flow Integration

1. Guest checkout flow
2. Logged-in user order with pending check
3. Order status tracking

### Booking Flow Integration

1. Create booking with promo code
2. Price calculation with member discount

### Security Patterns

1. Admin-only route protection
2. Privilege escalation prevention
3. Session management

---

## Known Limitations & Future Coverage

### Not Currently Covered (Require Additional Setup)

| Area                             | Reason                       | Recommendation                |
| -------------------------------- | ---------------------------- | ----------------------------- |
| Stock deduction on order         | Requires product seeding     | Add test with seeded products |
| Order completion flow            | Multi-step admin action      | Add admin flow test           |
| Points assignment on completion  | Depends on order lifecycle   | Mock order completion         |
| File upload (products, podcasts) | Requires multipart/form-data | Add multer tests              |
| Email notifications              | External service             | Mock email service            |
| YouTube transcript analysis      | External API                 | Mock Gemini API               |

### Test Data Dependencies

Some integration tests require seeded data:

- Valid coupon codes in `coupons` table
- Products in `products` table
- Services in `services` table
- Branches in `branches` table

Consider creating a `tests/seed.mjs` for consistent test data.

---

## Running Tests

### Unit Tests Only (Quick)

```bash
node --test tests/helpers.test.mjs tests/middleware.test.mjs
```

### Full Integration Tests

```bash
# Terminal 1: Start server
npm start

# Terminal 2: Run tests
node --test "tests/*.test.mjs"
```

### Individual Test File

```bash
node --test tests/auth.test.mjs
node --test tests/orders.test.mjs
```

### Watch Mode (development)

```bash
node --test --watch tests/helpers.test.mjs
```

---

## Test Architecture

```
tests/
├── setup.mjs              # Shared test utilities, mocks, helpers
├── helpers.test.mjs       # Pure unit tests (no I/O)
├── middleware.test.mjs    # Middleware unit tests (mocked req/res)
├── auth.test.mjs          # Auth API integration tests
├── bookings.test.mjs      # Bookings API tests
├── orders.test.mjs        # Orders API tests
├── coupons.test.mjs       # Coupons API tests
├── user-data.test.mjs     # User data sync API tests
├── integration.test.mjs   # Cross-module flow tests
└── smoke.test.mjs         # Basic API health checks
```

### Design Principles

1. **Each test documents WHY it exists** - Not just what, but why it matters
2. **Test actual behavior, not implementation** - Verify outputs, not internal state
3. **Isolation** - Unit tests don't depend on external services
4. **Meaningful assertions** - Check response structure, not just status codes
5. **Coverage of edge cases** - Invalid input, missing fields, edge conditions

---

## CI/CD Integration

Recommended `.github/workflows/test.yml`:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: node --test tests/helpers.test.mjs tests/middleware.test.mjs

  integration-tests:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: docterbee_units
        ports:
          - 3307:3306
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm start &
      - run: sleep 5
      - run: node --test "tests/*.test.mjs"
```

---

## Summary

| Metric                  | Count                                      |
| ----------------------- | ------------------------------------------ |
| Total test files        | 9                                          |
| Unit tests (no server)  | 31                                         |
| Integration test suites | 34+                                        |
| Modules covered         | 7                                          |
| Critical paths covered  | Auth, Orders, Bookings, Coupons, User Data |
