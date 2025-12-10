# Panduan Lengkap Hosting Docterbee Units di Plesk

Panduan ini dibuat khusus untuk Anda agar dapat menghosting proyek ini di Plesk Node.js. Ikuti langkah-langkah ini dengan teliti.

## 1. Persiapan File
Saya telah membersihkan file yang tidak diperlukan agar proyek lebih ringan dan aman.
- **Dihapus**: `server.mjs` (yang ada di luar folder backend, karena itu versi lama).
- **Dihapus**: `backend/seed-services.mjs` (tidak diperlukan untuk produksi).
- **Siap**: File konfigurasi `PLESK_ENV.txt` sudah dibuat berisi password dan username database Anda.

## 2. Struktur File Backend (Penjelasan Penting)
Anda meminta penjelasan tentang file backend. Berikut adalah struktur yang **BENAR** dan harus ada:

### ✅ File yang WAJIB Ada di Server:
1.  **`package.json`**: Ini "jantung" aplikasi, memberi tahu Plesk cara menjalankan server.
    *   *Pastikan isinya:* `"main": "backend/server.mjs"`
2.  **`backend/server.mjs`**: File utama server aplikasi Anda (API, AI Gemini, dll).
3.  **`backend/db.mjs`**: File untuk koneksi ke database MariaDB.
4.  **`backend/routes/`**: Folder berisi logika booking, events, artikel, dll.
5.  **`.env`**: File rahasia berisi password database (Anda harus membuatnya di Plesk).
6.  **Folder `node_modules`**: Akan dibuat otomatis oleh Plesk saat klik "NPM Install".

### ❌ File yang TIDAK BOLEH Ada / Sudah Dihapus:
*   `server.mjs` (yang di luar folder backend): Sudah saya hapus karena bikin bingung sistem.
*   `backend/seed-services.mjs`: Sudah saya hapus karena hanya untuk testing lokal.

### ⚠️ File yang Tidak Perlu Diupload (Opsional):
*   `.env.example`: Hanya template, tidak perlu diupload ke server produksi.
*   `node_modules/`: Jangan upload! Plesk akan membuat sendiri saat NPM Install.
*   Folder `.git/`, `.github/`: Tidak perlu untuk produksi.


---

## 3. Langkah-Langkah Hosting di Plesk

### Langkah 1: Upload File
1.  Buka **File Manager** di Plesk.
2.  Masuk ke folder `httpdocs` (atau folder domain Anda).
3.  Upload **semua file dan folder** dari komputer Anda (kecuali `node_modules`).
    *   *Tips:* Lebih cepat jika Anda zip dulu folder proyeknya, upload zip, lalu "Extract Files" di Plesk.

### Langkah 2: Setup Database
1.  Di Plesk, buka menu **Databases**.
2.  Pastikan database `unitdocterbee` sudah dibuat.
3.  Pastikan user `zona_english_admin` sudah dibuat dan memiliki akses ke database tersebut.
4.  Buka **phpMyAdmin** (atau fitur Import Dump di Plesk) dan import file SQL jika Anda punya backup database lokal (jika belum ada tabel sama sekali).
    *   *Catatan:* Aplikasi ini pintar, dia akan mencoba membuat tabel otomatis (`initializeTables`) saat server berjalan pertama kali. Jadi Anda mungkin tidak perlu import manual jika database kosong.

### Langkah 3: Setup Node.js (PENTING!)
1.  Di Dashboard Plesk, klik menu **Node.js**.
2.  Klik **Enable Node.js** jika belum aktif.
3.  Isi konfigurasi berikut:
    *   **Node.js Version**: Pilih versi terbaru yang stabil (misal: 18, 20, atau 22).
    *   **Document Root**: Arahkan ke folder tempat Anda upload file (biasanya `/httpdocs`).
    *   **Application Mode**: Ubah ke `Production`.
    *   **Application Startup File**: Ketik `backend/server.mjs`
        *   *(Jangan biarkan default `app.js` atau `index.js`, harus `backend/server.mjs`)*.
4.  Klik tombol **NPM Install**. Tunggu sampai selesai (ini akan menginstall library yang dibutuhkan).

### Langkah 4: Konfigurasi Environment (.env)
1.  Di halaman Node.js Plesk, cari tombol **Environment variables** (atau via File Manager buat file bernama `.env`).
2.  Buka file `PLESK_ENV.txt` yang saya buat di proyek Anda.
3.  Salin semua isinya.
4.  Masukkan ke konfigurasi Environment Variables di Plesk atau paste ke dalam file `.env` baru di File Manager.
    *   *Pastikan formatnya:* `NAMA_VARIABLE=nilai` (tanpa spasi di sekitar sama dengan).

### Langkah 5: Jalankan Server
1.  Klik tombol **Restart App** di halaman Node.js.
2.  Tunggu statusnya menjadi "Running" atau hijau.
3.  Buka website Anda.
4.  Coba akses halaman admin atau fitur AI untuk memastikan backend berjalan.

## 4. Troubleshooting (Jika Error)
*   **502 Bad Gateway / Website Error**:
    *   Cek **Log** di Plesk untuk melihat errornya.
    *   Pastikan **Application Startup File** sudah benar: `backend/server.mjs`.
    *   Pastikan password database di `.env` sudah benar sesuai yang Anda berikan.
*   **Database Error**:
    *   Pastikan user `zona_english_admin` punya hak akses penuh (All Privileges) ke database `unitdocterbee`.

Selamat mencoba! Hubungi saya lagi jika ada error spesifik.
