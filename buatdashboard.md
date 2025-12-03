### Prompt Tugas Lengkap untuk AI – Dashboard + Backend
**Pahami semua prompt ini**, lalu buat kode lengkap sesuai instruksi. Pastikan tidak membuat eror, jika ada eror, periksa dan perbaiki.
**Jangan ubah nama file yang sudah ada**, kecuali yang memang diminta.

> **PROMPT UNTUK AI (COPY-PASTE APA ADANYA):**
>
> Kamu adalah AI coding assistant yang mengedit project web multi-halaman bernama **Docterbee Units**.
>
> **Konteks penting:**
>
> - Frontend sudah ada dan harus dipertahankan:
>   - Halaman publik: `index.html`, `services.html`, `booking.html`, `events.html`, `insight.html`, `media.html`.
>   - Styling: Tailwind CDN + `style.css` custom.
>   - Interaksi: `script.js` tunggal yang menangani journey, booking, events, insight, media, dan mobile menu.
> - Backend Gemini sudah ada di `server.mjs` (Express + ES Modules) dengan endpoint `/api/summarize`.
> - Database yang akan dipakai: **MySQL via XAMPP**.
>
> **Tugas utama kamu:**
>
> 1. **Backend & API (Node.js + Express + MySQL/XAMPP)**
>
>    - Buat folder `backend/` dengan struktur:
>      - `backend/server.mjs` → Express app utama (pakai ES Modules). Pindahkan/rapikan logic dari `server.mjs` lama jika perlu, termasuk endpoint Gemini `/api/summarize`.
>      - `backend/db.mjs` → modul koneksi MySQL menggunakan `mysql2` (bukan ORM berat). Konfigurasi via environment variable: `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`.
>      - `backend/routes/bookings.mjs` → router Express untuk CRUD booking:
>        - `GET /api/bookings` – list semua booking (bisa pakai query filter sederhana nanti).
>        - `POST /api/bookings` – simpan booking baru dari `booking.html` / `services.html`.
>        - `GET /api/bookings/:id` – detail 1 booking.
>        - `PATCH /api/bookings/:id` – update status atau catatan.
>      - `backend/routes/events.mjs` → router CRUD untuk event:
>        - `GET /api/events` – list events untuk `events.html`.
>        - Endpoint admin (POST/PATCH/DELETE) untuk kelola event dari dashboard.
>      - `backend/routes/insight.mjs` → router CRUD artikel insight:
>        - `GET /api/insight` – list artikel untuk `insight.html`.
>        - Endpoint admin (POST/PATCH/DELETE) untuk tambah/edit/hapus artikel.
>      - `backend/routes/coupons.mjs` → router CRUD & validasi kode promo:
>        - `POST /api/coupons/validate` – cek kode promo yang dimasukkan user saat booking.
>        - Endpoint admin (GET list, POST buat, PATCH update, DELETE hapus) untuk dashboard.
>    - Definisikan minimal skema tabel MySQL yang masuk akal untuk:
>      - `bookings` (id, service_name, branch, practitioner, date, time, mode, promo_code, status, created_at, updated_at, dll.).
>      - `events` (id, title, date, mode, topic, description, link, created_at, updated_at, dll.).
>      - `articles` (id, title, slug, content, tags, created_at, updated_at, dll.).
>      - `coupons` (id, code, description, discount_type, discount_value, is_active, expires_at, created_at, updated_at, dll.).
>    - Jangan menulis SQL yang menghapus atau merusak tabel lain; fokus pada tabel-tabel di atas.
>
> 2. **Dashboard Admin (HTML + Tailwind + Vanilla JS)**
>
>    - Buat file baru `admin-dashboard.html` yang:
>      - Menggunakan header/nav yang konsisten dengan halaman lain (Journey, Services, Events, Insight, Media) + satu tab/indikator jelas bahwa ini adalah halaman admin.
>      - Memiliki form login sederhana di atas atau sebagai overlay (username/password sementara boleh dibaca dari environment atau hardcoded dulu, misalnya `ADMIN_USER`, `ADMIN_PASS`).
>      - Setelah login, tampilkan layout dashboard dengan tab/section:
>        1. **Booking Monitor**: tabel booking (data dari `/api/bookings`), filter berdasarkan tanggal/status, dan tombol aksi (ubah status, lihat detail isi booking).
>        2. **Insight Manager**: list artikel (GET `/api/insight`), form tambah/edit artikel baru (POST/PATCH), dan hapus.
>        3. **Events Manager**: list events (GET `/api/events`), form tambah/edit/hapus event.
>        4. **Coupon Manager**: list kode promo (GET `/api/coupons`), form buat/update kode promo (aktif/nonaktif, tanggal kadaluarsa, jenis diskon).
>      - Semua interaksi dashboard ke backend menggunakan `fetch` (`JSON` in/out), **tanpa** framework frontend (tidak pakai React/Vue).
>
> 3. **Integrasi Halaman Publik yang Sudah Ada**
>
>    - `services.html` / `booking.html`:
>      - Di `booking.html`, saat user menekan tombol konfirmasi booking:
>        - Tetap kirim pesan ke WhatsApp seperti sekarang.
>        - Tambahkan request `POST /api/bookings` ke backend untuk menyimpan data booking ke MySQL.
>      - Tambahkan field opsional `promoCode` di form booking dan:
>        - Buat fungsi JS untuk memanggil `POST /api/coupons/validate` dan menampilkan hasil validasi (misal: kode valid/tidak, diskon berapa).
>    - `events.html`:
>      - Ubah sumber data event: ganti penggunaan konstanta `EVENTS_DATA` statis di `script.js` menjadi data dari `GET /api/events`.
>      - Pastikan tampilan kartu event dan filter tetap sama, hanya sumber datanya yang berubah menjadi dinamis.
>    - `insight.html`:
>      - Ubah `INSIGHT_DATA` statis menjadi data dari `GET /api/insight`.
>      - Pastikan tombol ringkasan/NBSN tetap bekerja dengan data baru dari API.
>
> 4. **SEO Booster (Jangan Dirusak)**
>
>    - Jangan mengubah arsitektur utama: halaman publik (`index.html`, `services.html`, `events.html`, `insight.html`, `media.html`) harus tetap berupa HTML statis yang bisa di-crawl langsung.
>    - Boleh menambahkan `<meta name="description">`, `<link rel="canonical">`, dan tag Open Graph/Twitter di setiap halaman, tetapi **jangan** memindahkan seluruh rendering UI ke frontend framework berat.
>    - Backend Express hanya untuk:
>      - Data (JSON API) untuk booking, events, insight, coupons.
>      - Halaman/admin dashboard.
>
> 5. **Gaya & Aturan Kode**
>
>    - Gunakan ES Modules (`import`/`export`) di Node (lihat cara penggunaan di `server.mjs` sekarang).
>    - Ikuti pola dan gaya yang sudah ada di `script.js` (naming, struktur fungsi, tidak membuat global baru sembarangan).
>    - Jangan menambah inline `onclick` di HTML; pakai `addEventListener` di JS.
>    - Selalu escape teks yang tampil ke HTML jika berasal dari input user.
>
> 6. **Output yang Diharapkan dari Kamu (AI)**
>    - Kode lengkap untuk file-file baru/diubah:
>      - `backend/server.mjs`, `backend/db.mjs`, dan semua file router di `backend/routes/`.
>      - Penyesuaian minimal di `script.js`, `booking.html`, `events.html`, `insight.html`, dan file baru `admin-dashboard.html`.
>    - Penjelasan singkat per bagian: apa yang ditambahkan, bagaimana menghubungkannya dengan XAMPP/MySQL, dan cara menjalankan backend + dashboard.
>    - Jangan menghapus atau merombak besar-besaran kode yang sudah ada kecuali sangat diperlukan; lakukan perubahan secara **surgical** dan terarah.
