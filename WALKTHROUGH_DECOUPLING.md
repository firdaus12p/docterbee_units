# Decoupling Refactor Walkthrough

This document provides a comprehensive walkthrough of the decoupling and modularization changes made to the DocterBee codebase.

## Summary

The refactoring effort addressed **tight coupling** between JavaScript modules, which was causing:
- Regressive bugs when modifying features
- Code duplication
- Maintenance and debugging difficulties

## Changes Made

### Phase 1A: Created `admin-api.js`

**Problem**: `API_BASE` and `adminFetch()` were defined in `admin-dashboard.js` but used by 5 other admin manager files.

**Solution**: Created a centralized `js/admin-api.js` module.

**Files Changed**:
- ✅ Created `js/admin-api.js` - Contains `API_BASE` and `adminFetch()`
- ✅ Modified `js/admin-dashboard.js` - Removed duplicate code
- ✅ Modified `admin-dashboard.html` - Added script tag for `admin-api.js`

**Script Load Order** (admin-dashboard.html):
```html
<script src="js/modal-utils.js"></script>
<script src="js/utils.js"></script>
<script src="js/admin-api.js"></script>  <!-- NEW -->
<script src="js/admin-dashboard.js"></script>
```

---

### Phase 1B: Created `card-config.js`

**Problem**: Card type configuration was duplicated in both `register-card-preview.js` and `member-check.js`.

**Solution**: Created a single source of truth in `js/card-config.js`.

**Files Changed**:
- ✅ Created `js/card-config.js` - Contains `CARD_TYPE_CONFIG` and helper functions
- ✅ Modified `js/register-card-preview.js` - Uses global config
- ✅ Modified `js/member-check.js` - Uses global config
- ✅ Modified `register.html` - Added script tag
- ✅ Modified `member-check.html` - Added script tag

**Available Functions**:
- `window.CARD_TYPE_CONFIG` - Card type configuration object
- `window.getSmallNameCardTypes()` - Get card types that require smaller font
- `window.getCardConfig(cardType)` - Get configuration for specific card type
- `window.getAllCardTypes()` - Get list of all card types

---

### Phase 1C: Moved `getCategoryColor()` to `utils.js`

**Problem**: Identical `getCategoryColor()` function existed in both `article-reader.js` and `insight-articles.js`.

**Solution**: Moved the function to `js/utils.js` as a shared utility.

**Files Changed**:
- ✅ Modified `js/utils.js` - Added `getCategoryColor()` function
- ✅ Modified `js/article-reader.js` - Removed duplicate function
- ✅ Modified `js/insight-articles.js` - Removed duplicate function

**Usage**:
```javascript
const badgeClasses = getCategoryColor("Nutrisi");
// Returns: "bg-green-100 text-green-700"
```

---

### Phase 2A: Moved `showDeleteModal()` to `modal-utils.js`

**Problem**: `showDeleteModal()` was defined in `admin-dashboard.js` but used by other admin manager files like `journey-manager.js`.

**Solution**: Moved the delete modal functions to `js/modal-utils.js`.

**Files Changed**:
- ✅ Modified `js/modal-utils.js` - Added `showDeleteModal()`, `closeDeleteModal()`, `executeDeleteCallback()`
- ✅ Modified `js/admin-dashboard.js` - Removed duplicate, updated event handlers
- ✅ Modified `js/journey-manager.js` - Updated comments

**Available Functions**:
- `window.showDeleteModal(message, onConfirm)` - Show delete confirmation modal
- `window.closeDeleteModal()` - Close delete modal
- `window.executeDeleteCallback()` - Execute the delete callback and close modal

---

### Phase 2B: Implemented Event System for Points

**Problem**: `store-cart.js` directly called `window.addPoints()`, creating tight coupling with `script.js`.

**Solution**: Implemented custom event dispatch for decoupled communication.

**Files Changed**:
- ✅ Modified `js/store-cart.js` - Dispatches `docterbee:pointsEarned` event
- ✅ Modified `js/script.js` - Listens for the event

**Event Pattern**:
```javascript
// store-cart.js dispatches:
document.dispatchEvent(
  new CustomEvent("docterbee:pointsEarned", {
    detail: { points: orderData.points_earned }
  })
);

// script.js listens:
document.addEventListener("docterbee:pointsEarned", (e) => {
  addPoints(e.detail.points);
});
```

---

## Testing Results

All tests passed successfully:

| Page | Test | Result |
|------|------|--------|
| Admin Dashboard | Module loading, function availability | ✅ Pass |
| Register | Card preview, config loading | ✅ Pass |
| Member Check | Module loading | ✅ Pass |
| Insight Articles | Category colors | ✅ Pass |
| Article Reader | Category badge styling | ✅ Pass |

**Console Logs Verified**:
- `✅ Admin API Module Loaded`
- `✅ Card Config Module Loaded`
- No JavaScript errors related to undefined functions

---

## Benefits Achieved

1. **Single Source of Truth**: Each configuration/function is defined in one place
2. **Reduced Coupling**: Modules communicate via events instead of direct calls
3. **Easier Maintenance**: Changes to shared code only need to be made once
4. **Better Organization**: Clear separation of concerns
5. **Backward Compatibility**: `window.addPoints` still works for other code

---

## New File Structure

```
js/
├── admin-api.js         # NEW: Admin API configuration
├── admin-dashboard.js   # MODIFIED: Uses admin-api.js
├── card-config.js       # NEW: Card type configuration
├── member-check.js      # MODIFIED: Uses card-config.js
├── modal-utils.js       # MODIFIED: Added showDeleteModal
├── register-card-preview.js  # MODIFIED: Uses card-config.js
├── script.js            # MODIFIED: Event listener for points
├── store-cart.js        # MODIFIED: Event dispatch for points
├── utils.js             # MODIFIED: Added getCategoryColor
├── article-reader.js    # MODIFIED: Uses utils.js getCategoryColor
├── insight-articles.js  # MODIFIED: Uses utils.js getCategoryColor
└── journey-manager.js   # MODIFIED: Updated comments
```

---

## How to Verify

1. **Admin Dashboard**: Visit `/admin-dashboard` and check console for module loaded messages
2. **Register Page**: Visit `/register`, select a card type, verify preview works
3. **Member Check**: Visit `/member-check`, check console for no errors
4. **Articles**: Visit `/insight` and click an article, verify category badges are styled correctly
