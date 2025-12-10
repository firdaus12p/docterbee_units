# Docterbee Units - Project Instructions

## 📋 Project Overview
Healthcare booking and management system for Docterbee Units with 3 branches (Kolaka, Makassar, Kendari).

## 🛠️ Tech Stack
- **Backend**: Node.js (Express.js) + MySQL
- **Frontend**: HTML + Vanilla JavaScript + Tailwind CSS
- **Database**: MySQL (XAMPP on port 3307)
- **API**: RESTful API at `http://localhost:3000/api`

## 🎨 Design System
### Colors
- **Background**: `bg-slate-950` (dark theme)
- **Accent**: `bg-amber-400`, `text-amber-400`
- **Text**: `text-white` for dark backgrounds
- **Borders**: `border-slate-800`, `border-slate-700`

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: `font-bold`
- **Body**: `text-sm` or `text-base`

## 📁 Project Structure
```
docterbee_units/
├── backend/
│   ├── server.mjs          # Main server
│   ├── db.mjs              # Database connection pool
│   └── routes/             # API routes
├── js/
│   └── admin-dashboard.js  # Admin dashboard logic
├── css/
│   └── style.css           # Custom styles
├── admin-dashboard.html    # Admin interface
├── landing-page.html       # Public landing page
└── .env                    # Environment variables
```

## 🔧 Coding Standards

### JavaScript
- Use **ES6+ syntax** (const, let, arrow functions)
- **camelCase** for variables and functions
- **PascalCase** for classes
- Always use `async/await` for API calls
- Error handling with try-catch blocks

### HTML/CSS
- Use **Tailwind utility classes** (avoid inline styles)
- **kebab-case** for HTML classes and IDs
- Responsive design: mobile-first approach
- Dark theme by default

### Database
- Use **pool connection** from `backend/db.mjs`
- Always use **parameterized queries** (prevent SQL injection)
- Database name: `docterbee_units`
- Default user: `root` (no password for XAMPP)

### API Endpoints
- Base URL: `http://localhost:3000/api`
- RESTful conventions:
  - GET: Retrieve data
  - POST: Create new
  - PATCH: Update existing
  - DELETE: Remove (soft delete preferred)

## 🎯 Important Rules

### UI/UX
1. **Always use white text** (`text-white`) for data in dark-themed tables
2. **Badges should have colored backgrounds** with dark text for contrast
3. **Hover states** should use `hover:bg-slate-800` for dark themes
4. **Loading states** should show white text
5. **Error messages** should use `text-red-400` (not red-600)

### Code Quality
1. **No hardcoded values** - use environment variables
2. **Consistent naming** across frontend and backend
3. **Comments in Indonesian** for business logic
4. **English** for technical comments
5. **Always validate user input** on both client and server

### Database
1. **Use transactions** for multi-step operations
2. **Index frequently queried columns**
3. **Soft delete** by default (use `is_active` flag)
4. **Created/updated timestamps** on all tables

## 🚀 Development Workflow
1. Start XAMPP (MySQL on port 3307)
2. Run `npm run dev` to start server with hot reload
3. Access admin dashboard at `http://localhost:3000/admin-dashboard.html`
4. Check console for errors

## 🔐 Environment Variables
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=docterbee_units
DB_PORT=3307
GEMINI_API_KEY=<your-key>
ADMIN_USER=admin
ADMIN_PASS=docterbee2025
```

## 📝 Common Tasks

### Adding a new service
1. Update `backend/routes/services.js`
2. Update `js/admin-dashboard.js` (loadServices function)
3. Ensure white text for data display

### Fixing color issues
- Data text: `text-white`
- Headers: `text-white` on `bg-slate-800`
- Borders: `border-slate-700` or `border-slate-800`
- Hover: `hover:bg-slate-800`

### Database connection issues
- Check XAMPP is running
- Verify port 3307 is correct
- Ensure `DB_PASSWORD` is empty string for XAMPP
- Check `backend/db.mjs` for connection config

## 🐛 Known Issues & Solutions
1. **Database connection fails**: Check `.env` file, ensure no duplicate `DB_PASSWORD`
2. **Text not visible**: Use `text-white` instead of `text-slate-900`
3. **API not responding**: Restart server with `npm run dev`

## 📚 Additional Resources
- Tailwind CSS: https://tailwindcss.com/docs
- MySQL2 Docs: https://github.com/sidorares/node-mysql2
- Express.js: https://expressjs.com/

---

**Last Updated**: 2025-12-10
**Maintained by**: Firdaus (firdaus12p)
