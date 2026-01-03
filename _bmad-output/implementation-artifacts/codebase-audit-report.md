# 🔍 COMPREHENSIVE CODEBASE AUDIT REPORT
## DocterBee Units Project

**Audit Date:** 2026-01-03  
**Auditor:** BMad Master Code Review  
**Scope:** Full codebase audit for unused code, duplicate code, and security issues

**🔧 CLEANUP STATUS: COMPLETED**
- ✅ Duplicate `escapeHtml()` removed from `store-enhancements.js`
- ✅ Unused file `app-navbar.js` deleted

---

## 📊 EXECUTIVE SUMMARY

| Category | Issues Found | Severity |
|----------|--------------|----------|
| **Duplicate Code** | 4 instances | 🟡 Medium |
| **Potentially Unused Code** | 5 instances | 🟡 Medium |
| **Security Issues** | 3 observations | 🟢 Low-Medium |

---

## 🔴 SECTION 1: DUPLICATE CODE

### 1.1 `escapeHtml()` Function - DUPLICATE

**Status:** ⚠️ CONFIRMED DUPLICATE

**Locations:**
- `js/utils.js` (line 14) - **ORIGINAL**
- `js/store-enhancements.js` (line 807) - **DUPLICATE**

**Analysis:**
The `store-enhancements.js` file defines its own `escapeHtml()` function that does the same thing as the one in `utils.js`. Since `utils.js` exports to `window.escapeHtml`, the duplicate can be safely removed.

**Recommendation:**
```diff
- // In store-enhancements.js, REMOVE:
- function escapeHtml(unsafe) {
-   if (!unsafe) return '';
-   return unsafe
-     .replace(/&/g, "&amp;")
-     .replace(/</g, "&lt;")
-     .replace(/>/g, "&gt;")
-     .replace(/"/g, "&quot;")
-     .replace(/'/g, "&#039;");
- }

// Use window.escapeHtml from utils.js instead
```

---

### 1.2 `formatPrice()` Function - DUPLICATE

**Status:** ⚠️ CONFIRMED DUPLICATE

**Locations:**
- `js/store-enhancements.js` (line 820) - Defines own `formatPrice()`
- `js/script.js` (line 2737) - Defines own `formatPrice()`
- `js/admin-dashboard.js` (line 2238) - Defines `formatPriceInput()` (different purpose)

**Analysis:**
Both `store-enhancements.js` and `script.js` have their own `formatPrice()` function. However:
- `utils.js` has `formatCurrency()` which is more comprehensive but uses different format (Rp prefix vs no prefix)
- The duplicate functions use `toLocaleString('id-ID')` which is simpler

**Recommendation:**
- Keep ONE `formatPrice()` function in `utils.js`
- Export to window like other utils
- Update both files to use the global version

```javascript
// Add to utils.js:
function formatPrice(price) {
  if (!price && price !== 0) return '0';
  return Number(price).toLocaleString('id-ID');
}
window.formatPrice = formatPrice;
```

---

### 1.3 `initMobileMenu()` Function - DUPLICATE

**Status:** ⚠️ CONFIRMED DUPLICATE

**Locations:**
- `js/script.js` (line 684)
- `js/landing-navbar.js` (line 164)

**Analysis:**
Both files define `initMobileMenu()`. The one in `landing-navbar.js` is wrapped in an IIFE and more specific to the landing page navbar, while `script.js` has a more general version.

**Recommendation:**
- Verify which version is actually called in HTML files
- Remove the unused definition
- OR rename one to be more specific (e.g., `initLandingMobileMenu()`)

---

### 1.4 Similar Modal Functions

**Status:** ⚠️ POTENTIAL REDUNDANCY (Not critical)

**Observation:**
- `js/modal-utils.js` has `showSuccess()`, `showError()`, `showWarning()`
- `js/admin-dashboard.js` has `showSuccessModal()` (line 1492)

**Analysis:**
`showSuccessModal()` in admin-dashboard.js is specific to the admin dashboard and uses DOM-based modal (`successModal`), while `modal-utils.js` provides a more generic solution.

**Recommendation:**
- Review if admin-dashboard.js can use `modal-utils.js` functions instead
- Currently LOW priority as they serve different purposes

---

## 🟡 SECTION 2: POTENTIALLY UNUSED CODE

### 2.1 `app-navbar.js` - UNUSED FILE

**Status:** ❌ NOT USED IN ANY HTML

**Evidence:**
- File exists: `js/app-navbar.js`
- Grep search for "app-navbar" in HTML files: **0 results**

**Recommendation:**
```bash
# Verify first, then delete if confirmed unused:
rm js/app-navbar.js
```

---

### 2.2 `copyToClipboard()` - UNUSED FUNCTION

**Status:** ❓ ONLY IN DEFINITION

**Location:** `js/utils.js` (line 94)

**Evidence:**
- Grep search shows only 1 match: the definition in utils.js
- Not called anywhere else in codebase

**Recommendation:**
- Keep for future use OR remove if not planned
- It's a utility function that may be useful later

---

### 2.3 `formatDateTime()` - UNUSED FUNCTION

**Status:** ❓ ONLY IN DEFINITION

**Location:** `js/utils.js` (line 36)

**Evidence:**
- Grep search shows only 1 match: the definition in utils.js
- Not called anywhere else in codebase

**Recommendation:**
- Keep for future use OR remove if not planned
- Similar to `copyToClipboard()` - utility that may be useful

---

### 2.4 `showInfo()` - UNUSED FUNCTION

**Status:** ❓ ONLY IN DEFINITION

**Location:** `js/modal-utils.js` (line 307)

**Evidence:**
- Defined and exported but not called anywhere

**Recommendation:**
- Keep for API completeness with other show* functions
- Low priority

---

### 2.5 `getAllCardTypes()` - UNUSED FUNCTION

**Status:** ❓ ONLY IN DEFINITION

**Location:** `js/card-config.js` (line 94)

**Evidence:**
- Defined and exported but not called anywhere
- Only `CARD_TYPE_CONFIG` and `getCardConfig()` appear to be used

**Recommendation:**
- Verify actual usage
- Keep for potential future use (API completeness)

---

## 🟢 SECTION 3: SECURITY AUDIT

### 3.1 innerHTML Usage - XSS CONSIDERATION

**Status:** 🟡 MEDIUM CONCERN (well-mitigated)

**Observation:**
- 100+ uses of `.innerHTML` across frontend JS files
- Many properly escape user content using `escapeHtml()`

**Files with innerHTML usage:**
- `js/admin-dashboard.js` - 50+ uses
- `js/script.js` - 40+ uses
- `js/store-enhancements.js` - 10+ uses
- `js/orders-manager.js` - 15+ uses
- Other files...

**Risk Assessment:**
Most innerHTML usage constructs HTML from:
1. Static strings ✅ SAFE
2. Data from API (server-controlled) ✅ Generally SAFE
3. User input via `escapeHtml()` ✅ SAFE

**Specific Concerns:**
```javascript
// article-reader.js line 85 - VERIFY THIS:
document.getElementById("articleContent").innerHTML = article.content;
```
This inserts `article.content` directly. If articles can contain user HTML (rich text editor), ensure backend sanitizes before storage.

**Recommendation:**
- Continue using `escapeHtml()` for all user-sourced text
- Consider using `textContent` where HTML is not needed
- Backend should sanitize HTML content before storage

---

### 3.2 SQL Injection - WELL PROTECTED ✅

**Status:** 🟢 EXCELLENT

**Evidence:**
- All SQL queries use parameterized queries (`?` placeholders)
- mysql2 library properly handles escaping
- No string concatenation in SQL queries

**Examples of good practice found:**
```javascript
// From routes/users.mjs
await query("SELECT id, email FROM users WHERE id = ?", [id]);
await query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, id]);
```

**No action required** - security practices are solid.

---

### 3.3 Environment Variables - PROPERLY HANDLED ✅

**Status:** 🟢 EXCELLENT

**Evidence:**
- All sensitive data in `.env` file
- `process.env` used for: DB credentials, SESSION_SECRET, GEMINI_API_KEY
- `.env` is gitignored
- No hardcoded secrets found

**Observations:**
- `db.mjs` has fallback to `root` with empty password for development
- This is acceptable for local development but ensure `.env` is always used in production

---

### 3.4 No eval() Usage ✅

**Status:** 🟢 EXCELLENT

**Evidence:**
- Grep search for `eval(` returned 0 results
- No dynamic code execution risks

---

### 3.5 Rate Limiting - IMPLEMENTED ✅

**Status:** 🟢 GOOD

**Evidence:**
- `backend/utils/rate-limiter.mjs` exists
- Rate limiting applied to sensitive routes (auth, admin)

---

## 📋 ACTION ITEMS SUMMARY

### HIGH PRIORITY (Do Now)

| # | Action | File | Impact |
|---|--------|------|--------|
| 1 | Remove duplicate `escapeHtml()` | `store-enhancements.js` | Reduce code, prevent confusion |
| 2 | Consolidate `formatPrice()` to utils.js | `store-enhancements.js`, `script.js` | DRY principle |

### MEDIUM PRIORITY (Do Soon)

| # | Action | File | Impact |
|---|--------|------|--------|
| 3 | Resolve `initMobileMenu()` duplication | `script.js`, `landing-navbar.js` | Clarity |
| 4 | Verify & remove `app-navbar.js` | `js/app-navbar.js` | Clean codebase |
| 5 | Review `article.content` innerHTML | `article-reader.js:85` | XSS prevention |

### LOW PRIORITY (Cleanup)

| # | Action | File | Impact |
|---|--------|------|--------|
| 6 | Consider removing unused: `copyToClipboard`, `formatDateTime`, `showInfo` | Various | Leaner codebase |
| 7 | Review admin-dashboard for modal-utils usage | `admin-dashboard.js` | Consistency |

---

## ✅ POSITIVE FINDINGS

1. **SQL Security:** Excellent use of parameterized queries
2. **Password Hashing:** bcryptjs properly used
3. **Environment Variables:** Secrets properly protected in .env
4. **No eval():** No dynamic code execution risks
5. **Rate Limiting:** Implemented for sensitive routes
6. **XSS Prevention:** escapeHtml() widely used
7. **Modular Structure:** Code is well-organized

---

## 📊 CODEBASE HEALTH SCORE

| Metric | Score | Notes |
|--------|-------|-------|
| Security | 8.5/10 | Excellent fundamentals, minor innerHTML concerns |
| Code Duplication | 6/10 | Several duplicates need cleanup |
| Unused Code | 7/10 | Some dead code exists |
| Overall | **7.5/10** | Healthy codebase with room for cleanup |

---

**Report Generated By:** BMad Master  
**Next Review Recommended:** After implementing HIGH priority fixes
