# Asset Inventory

## Overview

Total Assets: ~9 items (excluding dynamically uploaded content)
Primary Directories: `assets/`, `images/`, `public/` (implied)

## Categorization

### Images
- Directory: `assets/images/` (inferred)
- Content: User profile placeholders, product images, banners
- Formats: JPG, PNG, WEBP (inferred)

### Styles
- Directory: `css/`
- Files:
  - `style.css` (Main stylesheet, 62KB)
  - `landing-page.css` (29KB)
  - `store-enhancements.css` (40KB)
  - `health-check.css` (14KB)
  - `card-preview.css` (4KB)
  - `member-check.css` (5KB)

### Scripts
- Directory: `js/`
- Files: Frontend logic (User interaction, API calls, UI updates)

### Uploads
- Directory: `uploads/`
- Content: Dynamic content (User avatars, Payment proofs, etc.)
- Note: Not tracked in git, managed by runtime

## Storage Strategy
- Static assets: Served directly from `assets` or `css`/`js` folders via static middleware in Express.
- Dynamic assets: Stored in `{project-root}/uploads/` and served via static route.
