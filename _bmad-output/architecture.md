# Architecture Documentation - Docterbee Media & AI Server

## Executive Summary
This project is a monolithic web application serving as the core platform for "Docterbee units". It combines an Express.js backend API with a static HTML/JS frontend, powered by a MySQL database. Key features include user authentication, product/service management, event booking, loyalty rewards, and AI-powered content generation using Google Gemini.

## Technology Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Backend Framework** | Express.js | Core web server and API routing |
| **Runtime** | Node.js (ES Modules) | Server-side execution environment |
| **Database** | MySQL2 | Relational data store with raw SQL queries |
| **AI Integration** | Google Generative AI | Content generation and intelligent features |
| **Media** | YouTubei.js & Transcript | Video data processing and extraction |
| **Communication** | Resend | Email delivery service |
| **Frontend** | Vanilla HTML/CSS/JS | Lightweight, static-served client interface |

## Architecture Pattern
**Layered Monolith**:
- **Presentation Layer**: Static HTML/CSS/JS files served by Express.
- **API Layer**: `backend/routes/` defining RESTful endpoints.
- **Service/Logic Layer**: Embedded within route handlers and `backend/utils/`.
- **Data Access Layer**: Direct SQL queries in `backend/db.mjs` and route handlers.

## Data Architecture
The data model is relational, centered around `users`. Key domains include:
- **Identity**: `users`, `admins`
- **Commerce**: `products`, `orders`, `product_stocks`, `locations`
- **Services**: `bookings`, `services`
- **Engagement**: `events`, `event_registrations`, `journeys`
- **Loyalty**: `rewards`, `reward_redemptions`, `coupons`
- **Content**: `articles`, `podcasts`

*See [Data Models](./data-models-root.md) for detailed schema.*

## API Design
RESTful API following standard conventions:
- Resource-based URLs (`/api/products`, `/api/auth`)
- HTTP Verbs (GET, POST, PATCH, DELETE)
- JSON response format `{ success: boolean, data: any, error?: string }`
- Session-based authentication (`express-session`)

*See [API Contracts](./api-contracts-root.md) for endpoint details.*

## Security
- **Authentication**: Session-based with `bcrypt` for password hashing.
- **Validation**: Input validation using `express-validator` middleware.
- **Rate Limiting**: Custom implementation in `backend/utils/rate-limiter.mjs`.
- **Role-Based Access**: `requireAdmin` middleware for protected routes.

## Deployment Architecture
- **Server**: Single Node.js process.
- **Static Assets**: Served via `express.static`.
- **Database**: External MySQL instance (configured via ENV).
- **Environment**: Configuration via `.env` files.
