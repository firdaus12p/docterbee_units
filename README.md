# 🌟 Docterbee Units - Health Journey Tracker

Health journey tracking app combining Islamic teachings (Qur'an & Sunnah), modern science, and the NBSN framework (Neuron, Biomolekul, Sensorik, Nature).

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup XAMPP MySQL (port 3307)
# Create database: docterbee_units

# 3. Configure .env
cp .env.example .env
# Edit DB_PORT=3307

# 4. Start backend server
npm start

# 5. Open in browser
http://localhost:3000/index.html
```

📖 **[Dokumentasi Lengkap →](docs/QUICKSTART.md)**

## 📁 Struktur Proyek

```
docterbee_units/
├── docs/                   # 📚 Semua dokumentasi
│   ├── QUICKSTART.md      # Panduan cepat
│   ├── SETUP_GUIDE.md     # Setup lengkap
│   ├── DATABASE_SCHEMA.md # Schema database
│   └── ...                # Dokumentasi lainnya
│
├── css/                   # 🎨 Stylesheet
│   └── style.css         # Main CSS (Tailwind + custom)
│
├── js/                    # 💻 JavaScript Frontend
│   ├── script.js         # Logic untuk public pages
│   └── admin-dashboard.js # Logic untuk admin dashboard
│
├── backend/               # ⚙️ Backend API (Node.js + Express)
│   ├── server.mjs        # Main server
│   ├── db.mjs            # Database connection
│   └── routes/           # API routes
│       ├── bookings.mjs
│       ├── events.mjs
│       ├── insight.mjs
│       └── coupons.mjs
│
├── index.html             # 🏠 Journey tracking (6 units)
├── booking.html           # 📅 Appointment booking
├── events.html            # 🎤 Webinar & workshops
├── insight.html           # 📖 Educational articles
├── media.html             # 🎥 YouTube & podcast player
├── admin-dashboard.html   # 🔐 Admin dashboard
│
├── .env                   # 🔑 Configuration (gitignored)
├── .env.example           # 📝 Configuration template
└── package.json           # 📦 Dependencies
```

## 🎯 Fitur Utama

### Public Pages

- **Journey Tracking** - 6 unit harian dengan sistem poin
- **Booking Service** - Reservasi dengan praktisi + promo code
- **Events** - Daftar webinar & workshop
- **Insight** - Artikel edukatif dengan AI summary
- **Media** - YouTube player + podcast + AI content analysis

### Admin Dashboard

- **Monitor Booking** - Lihat & update status booking
- **Manage Events** - CRUD webinar & workshop
- **Manage Articles** - CRUD artikel insight
- **Manage Coupons** - CRUD kode promo dengan validasi

## 🛠️ Tech Stack

- **Frontend**: HTML5 + Tailwind CSS + Vanilla JavaScript
- **Backend**: Node.js + Express (ES Modules)
- **Database**: MySQL (via XAMPP)
- **AI Integration**: Google Gemini API
- **Authentication**: Simple session-based (admin dashboard)

## 📚 Dokumentasi

| Dokumen                                       | Deskripsi                    |
| --------------------------------------------- | ---------------------------- |
| [QUICKSTART.md](docs/QUICKSTART.md)           | Panduan cepat memulai        |
| [SETUP_GUIDE.md](docs/SETUP_GUIDE.md)         | Setup lengkap + API docs     |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Schema database + sample SQL |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Solusi masalah umum          |

## 🔐 Default Credentials

**Admin Dashboard**

- Username: `admin`
- Password: `docterbee2025`

⚠️ **Penting**: Ganti credentials di production!

## 🌐 API Endpoints

### Public Endpoints

- `POST /api/bookings` - Create booking
- `POST /api/coupons/validate` - Validate promo code
- `GET /api/events?mode=&topic=` - List events
- `GET /api/insight` - List articles
- `POST /api/summarize` - Gemini AI summary

### Admin Endpoints (Protected)

- `GET /api/bookings` - List all bookings
- `PATCH /api/bookings/:id` - Update booking
- `POST /api/events` - Create event
- `POST /api/insight` - Create article
- `POST /api/coupons` - Create coupon

📖 **[API Documentation Lengkap →](docs/SETUP_GUIDE.md#-api-documentation)**

## 🎨 Design System

- **Primary Color**: Amber (#FBB024)
- **Background**: Slate dark tones
- **Font**: Inter (Google Fonts)
- **Icons**: Lucide Icons CDN
- **Framework**: Tailwind CSS CDN

## 📝 Development Guidelines

1. **No inline styles** - Semua styling di `css/style.css`
2. **No inline onclick** - Event listeners via `addEventListener`
3. **Escape user input** - Gunakan `escapeHtml()` untuk XSS prevention
4. **ES Modules** - Backend menggunakan `import/export`
5. **Parameterized queries** - SQL injection prevention via mysql2

## 🐛 Common Issues

**MySQL connection failed?**

- Pastikan XAMPP MySQL running
- Check port di `.env` (default: 3307)
- Verify database `docterbee_units` exists

**npm start error?**

- Run `npm install` terlebih dahulu
- Check Node.js version (minimal v14+)

📖 **[Troubleshooting Lengkap →](docs/TROUBLESHOOTING.md)**

## 📄 License

Copyright © 2025 Docterbee Units. All rights reserved.

## 👥 Author

Developed with ❤️ by Firdaus12p

---

**Need help?** Check [docs folder](docs/) untuk dokumentasi lengkap.
