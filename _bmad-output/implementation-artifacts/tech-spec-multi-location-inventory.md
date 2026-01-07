---
title: 'Multi-Location Inventory & Reporting'
slug: 'multi-location-inventory'
created: '2026-01-07'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['Express.js', 'MySQL (mysql2)', 'Vanilla JS (Frontend)']
files_to_modify: 
  - 'backend/db.mjs'
  - 'backend/routes/orders.mjs'
  - 'backend/routes/products.mjs'
  - 'backend/routes/locations.mjs'  # New file
  - 'backend/routes/rewards.mjs'
  - 'js/admin-dashboard.js'
  - 'js/products-manager.js'
  - 'js/reports-manager.js'        # New/Refactor
  - 'admin-dashboard.html'
code_patterns: ['Service functions for complex logic', 'Transaction-based stock updates', 'Global styling variables']
test_patterns: ['Manual API testing via Postman/Curl', 'Frontend flow validation']
---

# Technical Specification & Implementation Plan: Multi-Location Inventory & Reporting

## 1. Overview

### Problem Statement
The current system operates with hardcoded locations and global stock tracking. As the business expands, this limitation makes it impossible to track inventory accuracy per branch or analyze financial performance (sales/revenue) for specific locations.

### Proposed Solution
Transition from static ENUMs to a dynamic `locations` database table. Refactor inventory management to track stock at the location level (`product_stocks` table). Implement comprehensive reporting dashboards that aggregate sales, promo usage, and reward redemptions per location.

### Scope
#### In Scope
- **Database Architecture**:
  - New `locations` table for dynamic branch management.
  - New `product_stocks` table for per-location inventory (One Product -> Many Stocks).
  - Migration script to move from `products.stock` to `product_stocks` (Strategy: Reset to 0).
- **Admin Features**:
  - Location Management (CRUD).
  - Inventory Manager (View/Update stock per location).
  - Sales & Activity Reports (Filter by Location, Date Range).
- **Business Logic**:
  - Order processing: Deduct stock from the specific location selected at checkout/admin.
  - Reward Redemptions: Associate with the location of redemption for reporting.

#### Out of Scope
- Shift Management / Cashier Closing (Tutup Kasir) features.
- Stock Transfer between locations (for this iteration, simple adjustment is sufficient).

## 2. Context for Development
- **Migration Strategy**: "Opsi A" - New system starts with 0 stock at all locations. Stock Opname (physical count & entry) will be required.
- **Reporting Requirements**: Must include "Free Product" redemptions (Rewards) alongside monetary sales in the location reports.
- **UX**: Admin Panel needs easy switching between locations for viewing data.

## 3. Technical Decisions & Architecture (Party Mode Findings)
### Database Architecture
1.  **New Table: `locations`**
    *   Replaces hardcoded ENUMs in code.
    *   Columns: `id`, `name`, `address`, `type` (store/warehouse), `is_active`.
2.  **New Table: `product_stocks`**
    *   Decouples stock from `products` table.
    *   Columns: `id`, `product_id`, `location_id`, `quantity`, `updated_at`.
3.  **Modified Table: `reward_redemptions`**
    *   **Decision (Winston)**: Add `location_id` column to track where the redemption occurred physically.
    *   Enables accurate per-location inventory tracking even for free items.

### UX/UI Strategy (Sally)
*   **Global Location Switcher**: A persistent dropdown in the Admin Header.
*   **Contextual Data**: All dashboard widgets (Sales, Stock, Orders) will auto-filter based on the selected location.
*   **Unified Report**: A single view combining Sales (Revenue) and Rewards (Loyalty Cost), color-coded to distinguish financial vs. non-financial transactions.

## 4. Implementation Details
### Backend Changes
*   **`backend/db.mjs`**:
    *   Add `locations` and `product_stocks` table definitions.
    *   Add logical migration: If `products.stock` > 0, decide handling (likely archive or ignore as per "Reset to 0" strategy).
    *   Add `location_id` to `reward_redemptions`.
*   **`backend/routes/orders.mjs`**:
    *   **CRITICAL**: Refactor `POST /` to accept `location_id` (derived from `store_location` or explicit ID).
    *   Update stock deduction logic to target `product_stocks` where `location_id = X` AND `product_id = Y`.
    *   Use transactions (`START TRANSACTION`) to ensure atomic updates.
*   **`backend/routes/products.mjs`**:
    *   Remove direct `stock` updates on product.
    *   Add endpoints for `GET /api/products/:id/stock` (fetch all location stocks).
    *   Add endpoints for `PATCH /api/products/:id/stock` (update stock for specific location).

### Frontend Changes
*   **`admin-dashboard.html`**: Insert Location Switcher in the Header.
*   **`js/admin-dashboard.js`**:
    *   Implement `currentLocation` state management.
    *   Update all `load*` functions (loadOrders, loadProducts) to accept/send `location_id` query param.

### Security (Murat)
*   **Validation**: Backend MUST verify `location_id` exists and is active before processing any stock change.
*   **Race Conditions**: Continue using `FOR UPDATE` or equivalent locking when deducting stock to prevent negative inventory during high traffic.

## 5. Implementation Plan

### Phase 1: Database & Backend Foundation

#### [ ] Task 1.1: Database Schema Migration
*   **File**: `backend/db.mjs`
*   **Action**:
    *   Define `createLocationsTable`: `id` (INT PK), `name` (VARCHAR), `address` (TEXT), `type` (ENUM: store, warehouse), `is_active` (BOOL).
    *   Define `createProductStocksTable`: `id` (INT PK), `product_id` (FK), `location_id` (FK), `quantity` (INT DEFAULT 0), `updated_at` (TIMESTAMP).
    *   Update `initializeTables` to include these new tables.
    *   Update `runMigrations` to:
        *   Add `location_id` column to `reward_redemptions` table.
        *   Add `location_id` column to `orders` table.
        *   (Optional) Seed initial locations (e.g., 'Kolaka', 'Makassar', 'Kendari') based on existing hardcoded values.

#### [ ] Task 1.2: Create Locations API
*   **File**: `backend/routes/locations.mjs` (New File)
*   **Action**:
    *   Implement GET `/` (List all active locations).
    *   Implement GET `/all` (Admin: List all including inactive).
    *   Implement POST `/` (Admin: Create location).
    *   Implement PATCH `/:id` (Admin: Update location).
    *   Register route in `backend/server.mjs`.

#### [ ] Task 1.3: Refactor Products API for Multi-Location Stock
*   **File**: `backend/routes/products.mjs`
*   **Action**:
    *   Modify GET `/` to accept `location_id` query param. Use a JOIN with `product_stocks` to return the correct `quantity` for that location.
    *   Implement GET `/:id/stock`: Return array of `{ location_id, name, quantity }`.
    *   Implement PATCH `/:id/stock`: Accept `{ location_id, quantity, operation }` (set, add, subtract).
    *   **Migration Logic**: For the initial version, if no record exists in `product_stocks`, return 0.

### Phase 2: Core Business Logic (Orders & Rewards)

#### [ ] Task 2.1: Update Order Placement Logic
*   **File**: `backend/routes/orders.mjs`
*   **Action**:
    *   Update `POST /`:
        *   Validate `location_id` is present in body (or derive from legacy `store_location` if needed for backward compatibility during rollout).
        *   **Stock Check & Deduction**:
            *   Change `SELECT ... FROM products` to `SELECT ... FROM products p JOIN product_stocks ps ON p.id = ps.product_id`.
            *   Ensure `WHERE ps.location_id = ?` is used.
            *   Use transaction to lock `product_stocks` row.
            *   Update `product_stocks` instead of `products.stock`.

#### [ ] Task 2.2: Update Reward Redemption Logic
*   **File**: `backend/routes/rewards.mjs`
*   **Action**:
    *   Update Redemption endpoint to accept `location_id`.
    *   Store `location_id` in `reward_redemptions` table.

### Phase 3: Frontend Implementation

#### [ ] Task 3.1: Global Location Switcher & State
*   **File**: `admin-dashboard.html`
*   **Action**: Add select dropdown `#globalLocationSelect` in the top header.
*   **File**: `js/admin-dashboard.js`
*   **Action**:
    *   Initialize `currentLocationId` state (load from localStorage or default to first available).
    *   Fetch locations from API on load to populate dropdown.
    *   Add event listener: On change, update state and trigger `document.dispatchEvent(new CustomEvent('locationChanged'))`.

#### [ ] Task 3.2: Update Products Manager (Stock Management)
*   **File**: `js/products-manager.js`
*   **Action**:
    *   Listen for `locationChanged` to reload products list with correct stock context.
    *   Update "Edit Product" modal to allow managing stock *per location* (or limit editing to the currently selected global location).

#### [ ] Task 3.3: Update Orders Manager
*   **File**: `js/orders-manager.js`
*   **Action**:
    *   Update `loadOrders` to send `location_id` param to API.
    *   Show visual indicator of which location's orders are being viewed.

### Phase 4: Reporting & Analytics

#### [ ] Task 4.1: Unified Location Report
*   **File**: `js/reports-manager.js` (or `insight-manager.js`)
*   **Action**:
    *   Create new Report View: "Laporan Harian per Lokasi".
    *   Fetch aggregated data:
        *   Total Sales (from `orders` where `location_id = X`).
        *   Total Rewards (from `reward_redemptions` where `location_id = X`).
    *   Display side-by-side or stacked: "Revenue (Rp)" vs "Loyalty Cost (Points/Items)".

## 6. Acceptance Criteria

### AC 1: Location Management
*   [ ] Admin can add a new location (e.g., "Surabaya Branch").
*   [ ] New location appears in the Global Switcher immediately (or after refresh).
*   [ ] Admin can deactivate a location (soft delete).

### AC 2: Multi-Location Inventory
*   [ ] **Given** Product "Madu Hutan" exists, **When** viewed in Location A, **Then** stock shows 0 (initially).
*   [ ] **Given** Admin sets stock of "Madu Hutan" to 50 in Location A, **When** viewed in Location B, **Then** stock for Location B remains 0.
*   [ ] **Given** Admin sets stock of "Madu Hutan" to 50 in Location A, **When** viewed in Location A, **Then** stock shows 50.

### AC 3: Order Processing
*   [ ] **Given** Location A has 10 items, **When** user places order for 2 items at Location A, **Then** Location A stock becomes 8.
*   [ ] **Given** Location A has 10 items, Location B has 5 items. **When** user places order for 2 items at Location A, **Then** Location B stock remains 5.
*   [ ] **Given** Location A has 0 items, **When** user tries to order at Location A, **Then** order is rejected (Out of Stock).

### AC 4: Reporting
*   [ ] **Given** Sales of 1M IDR and Rewards of 500pts at Location A, **When** Report is generated for Location A, **Then** both metrics are visible and clearly distinguished.
*   [ ] **Given** I select "All Locations", **Then** I see an aggregated summary (optional, nice to have) or a list of performance per branch.

## 7. Dependencies & Risks
*   **Dependency**: `mysql2` driver (already installed).
*   **Risk**: Migration of existing orders. *Mitigation*: We are adding a nullable `location_id` to `orders`. Old orders will have `NULL`, new orders will have ID. Reports will need to handle NULLs (perhaps group them under "Legacy/Unknown" or map them based on the old `store_location` string if possible).
*   **Risk**: Race conditions on stock. *Mitigation*: Verified use of database transactions.

---

