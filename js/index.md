# Directory Index - /js

JavaScript frontend modules for the Docterbee web platform.

## Core Utilities

- **[utils.js](./utils.js)** - Shared utility functions (escapeHtml, formatCurrency, formatDate, debounce)
- **[modal-utils.js](./modal-utils.js)** - Themed modal dialogs replacing alert/confirm (showSuccess, showError, showWarning)
- **[admin-api.js](./admin-api.js)** - Centralized API configuration and fetch helper for admin dashboard

## Main Application

- **[script.js](./script.js)** - Main app logic for Journey (Gamification) flow, authentication, scoring
- **[landing-navbar.js](./landing-navbar.js)** - Landing page navigation bar logic with mobile menu

## Admin Dashboard

- **[admin-dashboard.js](./admin-dashboard.js)** - Complete admin panel: Bookings, Articles, Events, Coupons, Products, Users

## Store & E-Commerce

- **[store-cart.js](./store-cart.js)** - Shopping cart management, coupon validation, QR order submission
- **[store-enhancements.js](./store-enhancements.js)** - Enhanced store UX: floating cart, product detail modal, checkout flow
- **[store-location-manager.js](./store-location-manager.js)** - Multi-location stock management for store
- **[orders-manager.js](./orders-manager.js)** - Order list and management functions

## Content Management

- **[article-reader.js](./article-reader.js)** - Article reading view with points-based access
- **[insight-articles.js](./insight-articles.js)** - Insight (articles) listing and filtering
- **[podcasts-manager.js](./podcasts-manager.js)** - Podcast content management

## Health & Wellness

- **[health-check.js](./health-check.js)** - AI-powered health check form with Gemini integration
- **[journey-manager.js](./journey-manager.js)** - Journey (gamified health challenge) management

## Events & Bookings

- **[event-tickets.js](./event-tickets.js)** - Event registration and ticket management

## User Management

- **[users-manager.js](./users-manager.js)** - User listing and profile management for admin
- **[user-data-sync.js](./user-data-sync.js)** - Sync user data across browser sessions
- **[member-check.js](./member-check.js)** - Member status verification

## Rewards & Gamification

- **[rewards-manager.js](./rewards-manager.js)** - Loyalty rewards redemption management

## Media & Gallery

- **[gallery-manager.js](./gallery-manager.js)** - Image gallery CRUD for landing page

## Other

- **[card-config.js](./card-config.js)** - Membership card type configuration
- **[email-verification.js](./email-verification.js)** - Email verification token handling
- **[location-state.js](./location-state.js)** - Location picker state management
- **[register-card-preview.js](./register-card-preview.js)** - Registration card preview component
- **[reports-manager.js](./reports-manager.js)** - Business reports and analytics dashboard
