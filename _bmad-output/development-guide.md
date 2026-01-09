# Development Guide

## Prerequisites

- **Node.js**: Version 18+ (Required for `node:test` and native `fetch` support implied by usage)
- **MySQL**: Version 8.0+ (Required for JSON column support and modern syntax)
- **npm**: Comes with Node.js

## Environment Setup

1. Copy `.env.example` to `.env` (if exists, otherwise create it)
2. Configure environment variables:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=docterbee_units
   DB_PORT=3307  # Note: Project uses port 3307 by default in db.mjs
   
   # API Keys
   GEMINI_API_KEY=your_google_ai_key
   RESEND_API_KEY=your_resend_email_key
   
   # Session Secret
   SESSION_SECRET=your_secure_random_string
   ```

## Installation

```bash
npm install
```

## Database Setup

The project uses auto-migrations on startup, but you should run the setup script for initial data.

```bash
# Seed default rewards and create admin
npm run setup
```

Or manually:
```bash
# Create default admin user
npm run create-admin

# Seed default rewards
npm run migrate:seed-rewards
```

## Running the Application

### Development Mode
Runs with `--watch` flag for auto-restart on changes.
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Code Quality & Testing

### Linting
The project uses ESLint.
```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

### Testing
The project uses Node.js native test runner.
```bash
npm test
```
*Tests are located in `tests/` directory.*

## Project Structure Notes

- **Backend**: Uses ES Modules (`.mjs`). Imports must have extensions.
- **Frontend**: Standard HTML/CSS/JS served statically by Express.
- **Uploads**: Ensure `uploads/` directory exists and is writable.
