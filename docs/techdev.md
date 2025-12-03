## Docterbee Units – Tech & Dev Brief

File ini menjelaskan konteks teknis project dan menjadi "prompt" utama untuk semua pengembangan selanjutnya. Gunakan sebagai pegangan saat menambah fitur baru (dashboard, API, database, SEO, dll.).

### 1. Gambaran Project

- Project: Aplikasi web multi-halaman (bukan SPA full-JS).
- Bahasa utama konten: Bahasa Indonesia dengan istilah Islami (Qur'an, Sunnah, Subuh, dll.).
- Fokus: Tracking journey kesehatan, booking layanan, event/webinar, artikel insight, media + analisis AI (Gemini).
- Halaman publik utama:
  - `index.html` – Journey (6 unit pertanyaan harian, poin).
  - `services.html` – Katalog layanan & praktisi (entry point ke booking).
  - `booking.html` – Booking praktisi (form, slot waktu, ringkasan, kirim ke WhatsApp).
  - `events.html` – Daftar webinar & workshop.
  - `insight.html` – Artikel edukasi + ringkasan/NBSN.
  - `media.html` – YouTube, podcast, dan analisis AI (Gemini).

### 2. Frontend Stack

- Pure HTML statis per halaman (SEO-friendly).
- Styling dengan:
  - Tailwind CDN.
  - `style.css` custom (besar, sudah mengatur animasi, header, card, button, dsb.).
- Interaksi dengan:
  - `script.js` tunggal, berisi:
    - Data model: `UNITS`, `EVENTS_DATA`, `INSIGHT_DATA`, `PODCAST_DATA`.
    - State: localStorage (`db_units`, `db_points`).
    - Utility: `escapeHtml`, `animateCounter`, dll.
    - Journey logic: tab unit, jawab Ya/Tidak, hitung skor & poin.
    - Booking logic: `bookingState`, `generateSlots`, `selectSlot`, `updateBookingSummary`, `confirmBooking` (WhatsApp), `resetBookingForm`, `initBooking`.
    - Events, Insight, Media: fungsi render & init per halaman.
    - Mobile menu: `initMobileMenu()` dengan struktur standar:
      - Overlay: `<div id="mobileMenuOverlay" class="mobile-menu-overlay hidden">`.
      - Drawer: `<div id="mobileMenu" class="mobile-menu">` dengan header `closeMobileMenu`, nav `mobile-menu-nav`, link `mobile-nav-link`.

### 3. Backend & AI

- Backend: `server.mjs` (Express + ES Modules) berjalan terpisah dari HTML.
- Fungsi utama saat ini:
  - Endpoint `/api/summarize` memanggil Google Gemini (model `gemini-2.5-flash`).
  - Prompt dirancang untuk menganalisis CATATAN/TOPIK user (bukan lagi video) dan memberi output dengan konteks Islam + sains + NBSN.
- Integrasi frontend:
  - `media.html` → `script.js` fungsi `analyzeMedia()` memanggil backend `/api/summarize` dengan `fetch`, menampilkan hasil di card AI.

### 4. Navigasi & Alur Booking

- Navbar konsisten di semua halaman publik:
  - Link: Journey, Services, Events, Insight, Media.
  - **Tidak ada** link langsung ke `booking.html` di navbar.
- Alur booking yang benar:
  1.  User buka `services.html`.
  2.  Pilih layanan & klik "Booking Sekarang".
  3.  Link mengarah ke `booking.html?service=Nama%20Layanan`.
  4.  `initBooking()` membaca `service` dari URL, menyimpan ke `bookingState.serviceName`, dan menampilkan badge layanan terpilih.
  5.  User isi cabang, praktisi, tanggal, mode, dan jam.
  6.  Ringkasan menampilkan 6 item (3 kiri, 3 kanan): Layanan, Mode, Cabang, Tanggal, Praktisi, Jam.
  7.  `confirmBooking()` mengirim ringkasan ke WhatsApp + (kelak) menyimpan ke database.

### 5. Rencana Besar Dashboard & Database

- Database: gunakan MySQL via XAMPP.
- Backend: lanjutkan dengan **Node.js + Express (ESM)**, bukan PHP.
- Target utama dashboard admin (halaman baru, misalnya `admin-dashboard.html`):
  - Monitor dan kelola booking dari `booking.html` / `services.html`.
  - Kelola artikel untuk `insight.html` (CRUD artikel).
  - Kelola webinar & workshop untuk `events.html` (CRUD event).
  - Kelola kode promo yang bisa dipakai di flow booking.
- API Express yang direncanakan (semua prefix `/api/...`):
  - `/api/bookings` – list, detail, buat, update status.
  - `/api/events` – list events untuk `events.html` + endpoint admin CRUD.
  - `/api/insight` – list artikel untuk `insight.html` + endpoint admin CRUD.
  - `/api/coupons` – validasi dan CRUD kode promo.
- HTML publik **tetap statis** (untuk SEO) tetapi data seperti events dan artikel bisa di-load via `fetch` dari API.

### 6. Prinsip SEO

- Tetap gunakan halaman HTML statis dengan konten nyata (bukan full SPA).
- Setiap halaman publik harus punya:
  - `<title>` kuat & spesifik.
  - `<meta name="description" ...>` berbahasa Indonesia, mengandung kata kunci yang relevan (bekam sunnah, kesehatan islami, webinar kesehatan, dll.).
  - (Saat deploy) `<link rel="canonical" href="https://domain-anda.com/halaman.html">`.
  - (Opsional tapi dianjurkan) Open Graph (`og:title`, `og:description`, `og:image`) dan `twitter:card`.
- Jangan memindahkan UI utama ke framework SPA berat jika tidak terpaksa.

### 7. Aturan Coding Penting

- **Tidak** memakai inline `onclick` baru (kecuali pola khusus yang sudah ada di `insight.html`). Gunakan `addEventListener` dari `script.js`.
- Semua teks dinamis yang dimasukkan ke `innerHTML` harus melalui `escapeHtml()`.
- Di `UNITS` (index), jika menambah pertanyaan baru, ESCAPE tanda petik tunggal dengan `\'`.
- Jaga konsistensi struktur mobile menu (ID dan class harus cocok dengan yang digunakan `initMobileMenu()`).
- Perubahan komponen bersama (navbar, footer, style global) harus diterapkan ke **semua** halaman HTML.

### 8. Tujuan Utama Ke Depan

- Tambah **dashboard admin** dengan teknologi yang sama: HTML + Tailwind + JS + backend Express.
- Sambungkan booking, events, insight, dan kode promo ke **MySQL (XAMPP)**.
- Tetap menjaga performa & SEO (halaman statis, beban JS wajar, konten mudah di-crawl).

Gunakan dokumen ini sebagai referensi saat menulis prompt ke AI atau saat mengarahkan developer lain agar arsitektur dan gaya tetap konsisten dengan codebase yang ada sekarang.

---

