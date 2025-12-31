# 📋 PRD: Decoupling & Modularization Refactor
## DocterBee Units - Codebase Architecture Improvement

---

## 📌 Document Information

| Field | Value |
|-------|-------|
| **Document Version** | 1.0 |
| **Created Date** | 2025-12-31 |
| **Author** | Development Team |
| **Status** | Draft - Pending Approval |
| **Priority** | Medium-High |
| **Estimated Effort** | 8-12 hours |

---

## 1. Executive Summary

### 1.1 Problem Statement
Codebase saat ini memiliki **tight coupling** antara berbagai modul JavaScript, yang menyebabkan:
- Perubahan pada satu fitur berpotensi merusak fitur lain
- Duplikasi kode di beberapa file
- Kesulitan dalam maintenance dan debugging
- Risiko regression bugs saat development

### 1.2 Objective
Melakukan refactoring untuk **memisahkan dependencies** sehingga:
- Setiap modul dapat diubah secara independen
- Menghilangkan duplikasi kode
- Mempermudah testing dan maintenance
- Mengurangi risiko breaking changes

### 1.3 Success Criteria
- [ ] Tidak ada breaking changes setelah refactor
- [ ] Semua fungsi tetap bekerja seperti sebelumnya
- [ ] Tidak ada duplikasi konfigurasi
- [ ] Dependencies terdokumentasi dengan jelas
- [ ] Semua existing tests tetap pass (jika ada)

---

## 2. Current State Analysis

### 2.1 Identified Problems

#### Problem #1: `adminFetch()` dan `API_BASE` Coupling
**Severity:** 🔴 HIGH

| Current State | Impact |
|---------------|--------|
| Didefinisikan di `admin-dashboard.js` | 5 file lain bergantung padanya |
| Jika `admin-dashboard.js` error | Semua admin modules gagal |

**Files Affected:**
```
admin-dashboard.js (source)
├── users-manager.js
├── orders-manager.js
├── rewards-manager.js
├── journey-manager.js
└── podcasts-manager.js
```

---

#### Problem #2: Card Type Configuration Duplication
**Severity:** 🔴 HIGH

| Current State | Impact |
|---------------|--------|
| Konfigurasi sama di 2 file | Inkonsistensi saat update |
| Hardcoded paths | Mudah typo, sulit maintain |

**Files Affected:**
```
register-card-preview.js → cardTypeMapping
member-check.js → CARD_TYPE_CONFIG
```

**Duplicated Data Structure:**
```javascript
// Kedua file memiliki struktur ini:
{
  "Active-Worker": { front: "...", back: "...", label: "..." },
  "Family-Member": { front: "...", back: "...", label: "..." },
  "Healthy-Smart-Kids": { front: "...", back: "...", label: "..." },
  "Mums-Baby": { front: "...", back: "...", label: "..." },
  "New-Couple": { front: "...", back: "...", label: "..." },
  "Pregnant-Preparation": { front: "...", back: "...", label: "..." },
  "Senja-Ceria": { front: "...", back: "...", label: "..." }
}
```

---

#### Problem #3: `getCategoryColor()` Duplication
**Severity:** 🟠 MEDIUM

| Current State | Impact |
|---------------|--------|
| Fungsi identik di 2 file | Inkonsistensi warna |

**Files Affected:**
```
article-reader.js → getCategoryColor()
insight-articles.js → getCategoryColor()
```

---

#### Problem #4: `showDeleteModal()` Location
**Severity:** 🟠 MEDIUM

| Current State | Impact |
|---------------|--------|
| Di `admin-dashboard.js` | File lain bergantung |
| Seharusnya di modal utilities | Coupling tidak perlu |

**Files Affected:**
```
admin-dashboard.js (source)
└── journey-manager.js (consumer)
```

---

#### Problem #5: Direct Function Calls Between Modules
**Severity:** 🟡 LOW-MEDIUM

| Current State | Impact |
|---------------|--------|
| `store-cart.js` memanggil `window.addPoints()` | Tight coupling |
| `store-cart.js` memanggil `window.refreshNav()` | Hidden dependency |

---

## 3. Proposed Changes

### 3.1 Overview of Changes

| Phase | Task | Priority | Effort |
|-------|------|----------|--------|
| 1A | Create `js/admin-api.js` | HIGH | 1 hour |
| 1B | Create `js/card-config.js` | HIGH | 30 min |
| 1C | Move `getCategoryColor()` to `utils.js` | MEDIUM | 30 min |
| 2A | Move `showDeleteModal()` to `modal-utils.js` | MEDIUM | 30 min |
| 2B | Implement Event System for Points | LOW | 2 hours |
| 3 | Update all dependent files | HIGH | 3-4 hours |
| 4 | Testing & Validation | HIGH | 2-3 hours |

---

### 3.2 Phase 1A: Create `js/admin-api.js`

#### 3.2.1 New File to Create

**File Path:** `js/admin-api.js`

**Purpose:** Centralized API configuration and helper for admin operations.

**Content:**
```javascript
/**
 * Admin API Module
 * Centralized API configuration and fetch helper for admin dashboard
 * 
 * This file MUST be loaded before any admin manager files.
 * 
 * @module admin-api
 * @version 1.0.0
 */

(function () {
  "use strict";

  // ============================================
  // CONFIGURATION
  // ============================================
  
  /**
   * Base URL for all API endpoints
   * @constant {string}
   */
  const API_BASE = "/api";

  // ============================================
  // API HELPER FUNCTION
  // ============================================

  /**
   * Fetch wrapper for admin API requests
   * Automatically includes credentials (session cookie) for authentication
   * 
   * @param {string} url - API URL to fetch
   * @param {Object} options - Fetch options (method, headers, body, etc.)
   * @returns {Promise<Response>} Fetch response
   * 
   * @example
   * // GET request
   * const response = await adminFetch(`${API_BASE}/users`);
   * 
   * @example
   * // POST request
   * const response = await adminFetch(`${API_BASE}/users`, {
   *   method: "POST",
   *   body: JSON.stringify({ name: "John" })
   * });
   */
  async function adminFetch(url, options = {}) {
    const defaultOptions = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    return fetch(url, { ...defaultOptions, ...options });
  }

  // ============================================
  // EXPORT TO GLOBAL SCOPE
  // ============================================
  
  window.API_BASE = API_BASE;
  window.adminFetch = adminFetch;

  console.log("✅ Admin API Module Loaded");
  console.log("📍 API Base URL:", API_BASE);
})();
```

#### 3.2.2 Files to Modify

**File: `admin-dashboard.js`**

| Action | Before | After |
|--------|--------|-------|
| REMOVE | `var API_BASE = "/api";` | (deleted) |
| REMOVE | `async function adminFetch(url, options = {}) {...}` | (deleted) |
| REMOVE | `console.log("📍 API Base URL:", API_BASE);` | (deleted) |
| ADD | - | Comment: `// API_BASE and adminFetch are now in admin-api.js` |

**Line numbers to modify:** Lines 1-22

---

**Files: All Admin Managers**

No code changes needed, only update the comment at the top:

| File | Update Comment |
|------|----------------|
| `users-manager.js` | `// API_BASE and adminFetch are defined in admin-api.js` |
| `orders-manager.js` | `// API_BASE and adminFetch are defined in admin-api.js` |
| `rewards-manager.js` | `// API_BASE and adminFetch are defined in admin-api.js` |
| `journey-manager.js` | `// adminFetch is defined in admin-api.js` |
| `podcasts-manager.js` | `// adminFetch is defined in admin-api.js` |

---

**File: `admin-dashboard.html`**

| Action | Change |
|--------|--------|
| ADD | New script tag before `admin-dashboard.js` |

**Before:**
```html
<script src="/js/admin-dashboard.js"></script>
```

**After:**
```html
<script src="/js/admin-api.js"></script>
<script src="/js/admin-dashboard.js"></script>
```

---

### 3.3 Phase 1B: Create `js/card-config.js`

#### 3.3.1 New File to Create

**File Path:** `js/card-config.js`

**Purpose:** Single source of truth for membership card configurations.

**Content:**
```javascript
/**
 * Card Type Configuration Module
 * Centralized configuration for all membership card types
 * 
 * Used by: register-card-preview.js, member-check.js
 * 
 * @module card-config
 * @version 1.0.0
 */

(function () {
  "use strict";

  /**
   * Membership card type configurations
   * @constant {Object}
   * 
   * @property {string} front - Path to front card image
   * @property {string} back - Path to back card image
   * @property {string} label - Display label for the card type
   * @property {boolean} smallName - Whether to use smaller font for name display
   */
  const CARD_TYPE_CONFIG = Object.freeze({
    "Active-Worker": {
      front: "/uploads/gambar_kartu/depan/Background-Active-Worker.png",
      back: "/uploads/gambar_kartu/belakang/Tampilan-Belakang-Active-Worker.png",
      label: "Active Worker",
      smallName: false,
    },
    "Family-Member": {
      front: "/uploads/gambar_kartu/depan/Background-Family-Member.png",
      back: "/uploads/gambar_kartu/belakang/Tampilan-Belakang-Family-Member.png",
      label: "Family Member",
      smallName: false,
    },
    "Healthy-Smart-Kids": {
      front: "/uploads/gambar_kartu/depan/Background-Healthy-&-Smart-Kids.png",
      back: "/uploads/gambar_kartu/belakang/Tampilan-Belakang-Healthy-&-Smart-Kids.png",
      label: "Healthy & Smart Kids",
      smallName: false,
    },
    "Mums-Baby": {
      front: "/uploads/gambar_kartu/depan/Background-Mums-&-Baby.png",
      back: "/uploads/gambar_kartu/belakang/Tampilan-Belakang-Mums-&-Baby.png",
      label: "Mums & Baby",
      smallName: true,
    },
    "New-Couple": {
      front: "/uploads/gambar_kartu/depan/Background-New-Couple.png",
      back: "/uploads/gambar_kartu/belakang/Tampilan-Belakang-New-Couple.png",
      label: "New Couple",
      smallName: true,
    },
    "Pregnant-Preparation": {
      front: "/uploads/gambar_kartu/depan/Background-Pregnant-Preparatiom.png",
      back: "/uploads/gambar_kartu/belakang/Tampilan-Belakang-Pregnant-Preparatiom.png",
      label: "Pregnant Preparation",
      smallName: true,
    },
    "Senja-Ceria": {
      front: "/uploads/gambar_kartu/depan/Background-Senja-Ceria.png",
      back: "/uploads/gambar_kartu/belakang/Tampilan-Belakang-Senja-Ceria.png",
      label: "Senja Ceria",
      smallName: false,
    },
  });

  /**
   * Get list of card types that require smaller name font
   * @returns {string[]} Array of card type keys
   */
  function getSmallNameCardTypes() {
    return Object.entries(CARD_TYPE_CONFIG)
      .filter(([, config]) => config.smallName)
      .map(([key]) => key);
  }

  /**
   * Get card configuration by type
   * @param {string} cardType - Card type key
   * @returns {Object|null} Card configuration or null if not found
   */
  function getCardConfig(cardType) {
    return CARD_TYPE_CONFIG[cardType] || null;
  }

  /**
   * Get all available card types
   * @returns {string[]} Array of card type keys
   */
  function getAllCardTypes() {
    return Object.keys(CARD_TYPE_CONFIG);
  }

  // ============================================
  // EXPORT TO GLOBAL SCOPE
  // ============================================
  
  window.CARD_TYPE_CONFIG = CARD_TYPE_CONFIG;
  window.getSmallNameCardTypes = getSmallNameCardTypes;
  window.getCardConfig = getCardConfig;
  window.getAllCardTypes = getAllCardTypes;

  console.log("✅ Card Config Module Loaded");
})();
```

#### 3.3.2 Files to Modify

**File: `register-card-preview.js`**

| Action | Lines | Change |
|--------|-------|--------|
| REMOVE | 9-45 | Delete `cardTypeMapping` object |
| UPDATE | - | Use `window.CARD_TYPE_CONFIG` instead |
| UPDATE | - | Use `getSmallNameCardTypes()` for small name check |

**Before (lines 9-45):**
```javascript
const cardTypeMapping = {
  "Active-Worker": { ... },
  // ...
};
```

**After:**
```javascript
// Card configuration is now in card-config.js
// Use window.CARD_TYPE_CONFIG, getCardConfig(), getSmallNameCardTypes()
```

---

**File: `member-check.js`**

| Action | Lines | Change |
|--------|-------|--------|
| REMOVE | 16-58 | Delete `CARD_TYPE_CONFIG` object |
| UPDATE | - | Use `window.CARD_TYPE_CONFIG` instead |

---

**Files: `register.html` and `member-check.html`**

| Action | Change |
|--------|--------|
| ADD | `<script src="/js/card-config.js"></script>` before the page-specific script |

---

### 3.4 Phase 1C: Move `getCategoryColor()` to `utils.js`

#### 3.4.1 File to Modify

**File: `js/utils.js`**

| Action | Location | Content |
|--------|----------|---------|
| ADD | After `copyToClipboard()` function | New function |
| ADD | Export section | Add to window exports |

**New Function to Add:**
```javascript
/**
 * Get Tailwind CSS classes for article category badge
 * @param {string} category - Category name
 * @returns {string} Tailwind CSS classes for badge styling
 */
function getCategoryColor(category) {
  const colors = {
    Nutrisi: "bg-green-100 text-green-700",
    Ibadah: "bg-blue-100 text-blue-700",
    Kebiasaan: "bg-purple-100 text-purple-700",
    Sains: "bg-orange-100 text-orange-700",
  };
  return colors[category] || "bg-gray-100 text-gray-700";
}
```

**Add to exports:**
```javascript
window.getCategoryColor = getCategoryColor;
```

#### 3.4.2 Files to Modify

**File: `article-reader.js`**

| Action | Lines | Change |
|--------|-------|--------|
| REMOVE | 220-232 | Delete `getCategoryColor()` function |
| UPDATE | Comment | Add note that function is in utils.js |

---

**File: `insight-articles.js`**

| Action | Lines | Change |
|--------|-------|--------|
| REMOVE | 5-17 | Delete `getCategoryColor()` function |
| UPDATE | Comment | Add note that function is in utils.js |

---

### 3.5 Phase 2A: Move `showDeleteModal()` to `modal-utils.js`

#### 3.5.1 File to Modify

**File: `js/modal-utils.js`**

| Action | Location | Content |
|--------|----------|---------|
| ADD | After `showInfo()` function | New function |
| ADD | Export section | Add to window exports |

**New Function to Add:**
```javascript
/**
 * Show delete confirmation modal
 * Wrapper around showConfirm with delete-specific styling
 * 
 * @param {string} message - Confirmation message
 * @param {function} onConfirm - Callback when user confirms deletion
 */
function showDeleteModal(message, onConfirm) {
  showConfirm(message, onConfirm, null, "Konfirmasi Hapus");
}
```

**Add to exports:**
```javascript
window.showDeleteModal = showDeleteModal;
```

#### 3.5.2 Files to Modify

**File: `admin-dashboard.js`**

| Action | Lines | Change |
|--------|-------|--------|
| REMOVE | 1422-1432 | Delete `showDeleteModal()` function |
| UPDATE | Comment | Add note that function is now in modal-utils.js |

---

**File: `journey-manager.js`**

| Action | Line 3 | Change |
|--------|--------|--------|
| UPDATE | Global comment | Add `showDeleteModal` to globals list |

**Before:**
```javascript
/* global adminFetch, escapeHtml, showDeleteModal, showSuccessModal, lucide */
```

**After:**
```javascript
/* global adminFetch, escapeHtml, showDeleteModal, lucide */
// Note: showDeleteModal is defined in modal-utils.js
```

---

### 3.6 Phase 2B: Implement Event System for Points (Optional)

#### 3.6.1 Overview

This phase implements an event-based communication pattern to decouple modules.

**Event List:**
| Event Name | Dispatched By | Handled By |
|------------|---------------|------------|
| `docterbee:pointsEarned` | `store-cart.js` | `script.js` |
| `docterbee:pointsUpdated` | `script.js` | Any interested module |
| `docterbee:cartUpdated` | `store-cart.js` | `user-data-sync.js` |

#### 3.6.2 Implementation Details

**File: `store-cart.js`**

**Change in `claimOrderPoints()` function:**

**Before:**
```javascript
if (typeof window.addPoints === "function") {
  window.addPoints(orderData.points_earned);
}
```

**After:**
```javascript
// Dispatch event instead of direct function call
window.dispatchEvent(new CustomEvent('docterbee:pointsEarned', {
  detail: { 
    points: orderData.points_earned,
    source: 'order',
    orderId: orderData.id
  }
}));
```

---

**File: `script.js`**

**Add event listener in initialization:**

```javascript
// Listen for points earned events from other modules
window.addEventListener('docterbee:pointsEarned', function(e) {
  const { points } = e.detail;
  if (points && points > 0) {
    addPoints(points);
  }
});
```

---

## 4. File Change Summary

### 4.1 New Files to Create

| File Path | Purpose | Size Est. |
|-----------|---------|-----------|
| `js/admin-api.js` | Centralized API helper | ~50 lines |
| `js/card-config.js` | Card type configuration | ~100 lines |

### 4.2 Files to Modify

| File | Changes |
|------|---------|
| `js/admin-dashboard.js` | Remove `adminFetch`, `API_BASE`, `showDeleteModal` |
| `js/users-manager.js` | Update comment only |
| `js/orders-manager.js` | Update comment only |
| `js/rewards-manager.js` | Update comment only |
| `js/journey-manager.js` | Update comment only |
| `js/podcasts-manager.js` | Update comment only |
| `js/register-card-preview.js` | Remove local card config, use global |
| `js/member-check.js` | Remove local card config, use global |
| `js/utils.js` | Add `getCategoryColor()` |
| `js/article-reader.js` | Remove `getCategoryColor()` |
| `js/insight-articles.js` | Remove `getCategoryColor()` |
| `js/modal-utils.js` | Add `showDeleteModal()` |
| `js/store-cart.js` | (Phase 2B) Add event dispatch |
| `js/script.js` | (Phase 2B) Add event listener |
| `admin-dashboard.html` | Add script tag for `admin-api.js` |
| `register.html` | Add script tag for `card-config.js` |
| `member-check.html` | Add script tag for `card-config.js` |

### 4.3 Files NOT Modified

| File | Reason |
|------|--------|
| `js/health-check.js` | Already self-contained |
| `js/app-navbar.js` | Already isolated |
| `js/landing-navbar.js` | Already isolated |
| `js/user-data-sync.js` | Already well-structured |
| All backend files | No changes needed |
| All CSS files | No changes needed |

---

## 5. Script Load Order

### 5.1 Admin Dashboard Page (`admin-dashboard.html`)

```html
<!-- Utility Scripts (Order Matters!) -->
<script src="/js/utils.js"></script>
<script src="/js/modal-utils.js"></script>
<script src="/js/admin-api.js"></script>

<!-- Admin Dashboard Core -->
<script src="/js/admin-dashboard.js"></script>

<!-- Admin Feature Managers (Can load in any order after core) -->
<script src="/js/users-manager.js"></script>
<script src="/js/orders-manager.js"></script>
<script src="/js/rewards-manager.js"></script>
<script src="/js/journey-manager.js"></script>
<script src="/js/podcasts-manager.js"></script>
```

### 5.2 Register Page (`register.html`)

```html
<script src="/js/utils.js"></script>
<script src="/js/card-config.js"></script>
<script src="/js/register-card-preview.js"></script>
```

### 5.3 Member Check Page (`member-check.html`)

```html
<script src="/js/card-config.js"></script>
<script src="/js/member-check.js"></script>
```

### 5.4 Article Pages (`article.html`, `insight.html`)

```html
<script src="/js/utils.js"></script>
<!-- getCategoryColor is now in utils.js -->
<script src="/js/article-reader.js"></script>
```

---

## 6. Testing Plan

### 6.1 Smoke Tests

After each phase, verify:

| Test | How to Verify |
|------|---------------|
| Admin login works | Login to admin dashboard |
| Admin CRUD operations work | Create/edit/delete for each section |
| Card preview on register works | Select card type, see preview |
| Member check works | Enter phone number, see card |
| Article pages load | Open insight and article pages |

### 6.2 Regression Tests

| Feature | Test Steps | Expected Result |
|---------|------------|-----------------|
| Admin - Users | Load users list, reset password | No errors, actions work |
| Admin - Orders | Load orders, complete an order | No errors, status updates |
| Admin - Rewards | Create/edit/delete reward | CRUD operations work |
| Admin - Journey | Add/edit/delete journey/unit/item | CRUD operations work |
| Admin - Podcasts | Add/edit/delete podcast | CRUD operations work |
| Register | Fill form, see card preview | Card updates correctly |
| Member Check | Enter valid phone | Card displays correctly |
| Articles | Open article page | Category colors correct |
| Points System | Complete order, claim points | Points added correctly |

### 6.3 Console Error Check

For each page, open DevTools and verify:
- [ ] No `ReferenceError` for missing functions
- [ ] No `TypeError` for undefined variables
- [ ] All network requests return 200/success

---

## 7. Rollback Plan

If issues occur after deployment:

### 7.1 Quick Rollback
```bash
# Revert to previous commit
git revert HEAD
```

### 7.2 Partial Rollback
If only specific phase fails:
1. Identify which new file causes the issue
2. Remove the script tag from HTML
3. Restore the original code in affected files
4. Deploy the partial fix

### 7.3 Post-Rollback Actions
1. Document what went wrong
2. Create unit tests for the failing scenario
3. Fix and re-test before next deployment attempt

---

## 8. Documentation Updates

After implementation, update:

| Document | Updates Needed |
|----------|----------------|
| `AGENTS.md` | Add new file descriptions |
| Code comments | Ensure all dependencies documented |
| This PRD | Mark as "Implemented" |

---

## 9. Appendix

### 9.1 Dependency Graph (After Refactor)

```
┌─────────────────────────────────────────────────────────────────┐
│                    SHARED UTILITIES LAYER                        │
│                    (Load FIRST on all pages)                     │
├─────────────────────────────────────────────────────────────────┤
│  utils.js           │ escapeHtml, formatDate, getCategoryColor  │
│  modal-utils.js     │ showSuccess, showError, showDeleteModal   │
│  card-config.js     │ CARD_TYPE_CONFIG, getCardConfig           │
│  admin-api.js       │ adminFetch, API_BASE (admin pages only)   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FEATURE MODULES LAYER                         │
│                    (Load AFTER utilities)                        │
├─────────────────────────────────────────────────────────────────┤
│  ADMIN              │  USER                │  STANDALONE         │
│  ─────              │  ────                │  ──────────         │
│  admin-dashboard.js │  script.js           │  health-check.js    │
│  users-manager.js   │  store-cart.js       │  member-check.js    │
│  orders-manager.js  │  user-data-sync.js   │                     │
│  rewards-manager.js │  article-reader.js   │                     │
│  journey-manager.js │  insight-articles.js │                     │
│  podcasts-manager.js│                      │                     │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Checklist for Developers

Before starting:
- [ ] Read this entire PRD
- [ ] Create a new git branch: `refactor/decoupling-v1`
- [ ] Ensure local dev environment is working

During implementation:
- [ ] Follow the exact order of phases
- [ ] Test after each phase before proceeding
- [ ] Commit after each successful phase

After completion:
- [ ] Run full regression test
- [ ] Check browser console for errors
- [ ] Create pull request with this PRD referenced

---

## 10. Sign-Off

| Role | Name | Status | Date |
|------|------|--------|------|
| Author | AI Assistant | ✅ Complete | 2025-12-31 |
| Reviewer | - | ⏳ Pending | - |
| Approver | - | ⏳ Pending | - |

---

*End of Document*
