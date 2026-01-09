# Source Tree Analysis

## Project Structure

```
docterbee_units/
├── backend/                 # Backend API & Logic
│   ├── middleware/          # Express Middleware (auth, validation)
│   ├── migrations/          # Database seed scripts
│   ├── routes/              # API Route definitions
│   ├── scripts/             # Admin utility scripts
│   ├── utils/               # Helpers (mailer, rate-limiter, youtube)
│   ├── articles.mjs         # Article management logic
│   ├── db.mjs               # Database connection & schema init
│   └── server.mjs           # App Entry Point
├── css/                     # Frontend Styles
├── js/                      # Frontend Logic
├── assets/                  # Static Assets
├── uploads/                 # User Uploads (Dynamic)
├── node_modules/            # Dependencies
├── .env                     # Environment Config
├── package.json             # Project Manifest
├── *.html                   # Frontend Pages (Static served)
└── README.md                # (Missing?)
```

## Critical Directories

- **`backend/`**: Contains the core application logic. This is an Express.js server that handles API requests, database interactions, and serves the static frontend files.
- **`backend/routes/`**: Defines the API endpoints. Segregated by feature (auth, products, orders, etc.).
- **`backend/db.mjs`**: Critical file. Handles DB connection, AND contains the schema definition/migration logic. It's a "code-first" schema approach using raw SQL.
- **`js/`**: Client-side JavaScript. Interacts with the backend APIs to make the HTML pages dynamic.
- **`uploads/`**: Stores user-uploaded content. NOT committed to git.

## Key Files

- **`backend/server.mjs`**: The main entry point. Sets up Express, middleware, routes, and starts the server.
- **`backend/db.mjs`**: Manages MySQL connection pool and initializes tables.
- **`package.json`**: Defines dependencies and scripts (`start`, `dev`, `lint`).
- **`.env`**: Contains sensitive configuration (DB creds, API keys).

## Integration Points

- **Frontend-Backend**: The interaction happens via REST API calls from `js/*.js` files to `api/*` endpoints defined in `backend/routes/*.mjs`.
- **Database**: MySQL database connected via `mysql2` driver.
- **External APIs**: 
  - Google Gemini AI (via `@google/generative-ai`)
  - YouTube (via `youtubei.js`, `youtube-transcript`)
  - Email (via `resend`)
