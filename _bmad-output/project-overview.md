# Project Overview - Docterbee Media & AI Server

## Introduction
Docterbee Media & AI Server is a comprehensive web platform designed to support health and wellness journeys with an Islamic perspective ("Zona Sunnah", "Journey Hidup Sehat"). It provides a robust backend for managing products, events, services, and educational content, augmented by AI capabilities for personalized experiences.

## Executive Summary
The system integrates e-commerce functionality (store, orders, coupons) with community engagement features (events, articles, podcasts) and specialized health services (bookings, progress tracking). It leverages Google's Gemini AI to enhance content reach and provides a static, fast-loading frontend experience backed by a secure Node.js API.

## Repository Structure
**Type:** Monolith (Web Application)

The project is structured as a single repository containing both the backend API server (`backend/`) and the frontend static assets (`*.html`, `js/`, `css/`). This simplifies deployment and development for the current scale.

## Technology Stack Summary
- **Language:** JavaScript (Node.js ES Modules)
- **Framework:** Express.js
- **Database:** MySQL (mysql2 driver)
- **AI/ML:** Google Gemini, YouTubei.js
- **Frontend:** Vanilla HTML5/CSS3/JavaScript

## Documentation Links
- [Architecture Guide](./architecture.md)
- [API Contracts](./api-contracts-root.md)
- [Data Models](./data-models-root.md)
- [Development Guide](./development-guide.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Asset Inventory](./asset-inventory-root.md)

## Key Features
1. **User Management**: Auth, profiles, and role-based access (User/Admin).
2. **E-Commerce**: Product catalog, multi-location stock, cart, and orders.
3. **Engagement**: Event booking system and educational journeys.
4. **Content**: CMS for articles and podcasts.
5. **AI Integration**: Intelligent processing of media content.
