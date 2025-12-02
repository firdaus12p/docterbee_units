# Gemini AI Integration - Setup & Usage

## 📋 Ringkasan

Fitur **Analisis AI** di halaman `media.html` kini menggunakan **Google Gemini API** (Gemini Pro) untuk analisis konten media secara real-time berdasarkan ajaran Qur'an, Sunnah, dan framework NBSN.

> **⚠️ CATATAN PENTING - Model Selection:**  
> Proyek ini menggunakan **`gemini-pro`** karena paling stabil dan kompatibel dengan semua API key.  
> Model versi 1.5 (`gemini-1.5-flash-latest`, `gemini-1.5-pro-latest`) **tidak tersedia** untuk semua API key dan akan menghasilkan error **404 Not Found**.  
> Jika Anda ingin upgrade ke model 1.5, pastikan API key Anda sudah mendukung model tersebut di [Google AI Studio](https://aistudio.google.com/).

## 🏗️ Arsitektur

```
Frontend (media.html)
    ↓ User input (YouTube URL + catatan)
    ↓ analyzeMedia() → fetch POST
    ↓
Backend (server.mjs - Express)
    ↓ API endpoint: /api/summarize
    ↓ Google Generative AI SDK
    ↓ Model: gemini-pro
    ↓
Gemini API (Google AI Studio)
    ↓ Prompt engineering dengan konteks Docterbee
    ↓ Response: Analisis terstruktur
    ↓
Backend → Frontend
    ↓ formatAISummary() → Styled HTML
    ↓
Display di #aiResult
```

## 🚀 Setup Awal

### 1. Install Dependencies

```powershell
npm install
```

Dependencies yang diinstall:

- `express@4.21.2` - Web server framework
- `cors@2.8.5` - Cross-origin resource sharing
- `dotenv@16.4.5` - Environment variables
- `@google/generative-ai@0.21.0` - Gemini API SDK

### 2. Konfigurasi Environment

File `.env` sudah berisi API key Gemini:

```env
GEMINI_API_KEY=AIzaSyDWyrKdPiRMS-P4_Yq1M_otRue_P_kSuIk
PORT=3000
```

⚠️ **PENTING**: Jangan commit file `.env` ke repository public! Tambahkan ke `.gitignore`:

```gitignore
.env
node_modules/
```

### 3. Start Server

```powershell
npm start
```

Atau gunakan mode development dengan auto-reload:

```powershell
npm run dev
```

Server akan berjalan di: **http://localhost:3000**

Output yang diharapkan:

```
🚀 Docterbee Media AI Server
📡 Server berjalan di http://localhost:3000
🔑 API Key loaded: ✅ Yes
⏳ Menunggu request...
```

## 🎯 Cara Menggunakan

### Di Browser

1. **Start server** terlebih dahulu (lihat Setup Awal #3)
2. **Buka** `media.html` di browser (double-click atau via live server)
3. **Masukkan** URL YouTube (opsional)
4. **Tulis catatan** konten yang ingin dianalisis
5. **Klik** tombol **"Analisis AI"**
6. **Tunggu** 3-10 detik untuk response dari Gemini API
7. **Lihat hasil** analisis dengan 3 kategori:
   - ✅ **Selaras Qur'an & Sunnah**
   - ⚠️ **Perlu Dikoreksi**
   - 🧪 **Catatan Sains & NBSN**

### Reward Points

- Setiap analisis sukses: **+3 points** otomatis

## 📡 API Endpoints

### POST `/api/summarize`

Endpoint untuk analisis konten media.

**Request Body:**

```json
{
  "youtubeUrl": "https://youtube.com/watch?v=...",
  "notes": "Catatan tentang konten yang ditonton"
}
```

**Response (Success):**

```json
{
  "summary": "**Selaras dengan Qur'an & Sunnah**\n- Madu sebagai syifa' (QS An-Nahl: 69)\n..."
}
```

**Response (Error):**

```json
{
  "error": "Pesan error",
  "details": "Detail teknis error"
}
```

### GET `/health`

Health check endpoint untuk monitoring.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "apiKeyConfigured": true
}
```

## 🧠 Prompt Engineering

Gemini API menerima prompt yang mencakup:

1. **Konteks Docterbee**: Health journey tracking app berbasis Islam
2. **Framework NBSN**: Neuron, Biomolekul, Sensorik, Nature
3. **Referensi**: Qur'an & Sunnah
4. **Input user**: YouTube URL + catatan konten
5. **Format output**: 3 kategori terstruktur (Selaras, Koreksi, Sains)

## 🔧 Troubleshooting

### ❌ Error: "Failed to fetch"

**Penyebab**: Server backend tidak berjalan.

**Solusi**:

```powershell
npm start
```

### ❌ Error: "API key not configured"

**Penyebab**: File `.env` tidak ditemukan atau kosong.

**Solusi**:

1. Pastikan file `.env` ada di root project
2. Isi dengan:
   ```env
   GEMINI_API_KEY=AIzaSyDWyrKdPiRMS-P4_Yq1M_otRue_P_kSuIk
   PORT=3000
   ```

### ❌ Error: "Resource exhausted" atau "429 quota"

**Penyebab**: Kuota API Gemini habis atau rate limit tercapai.

**Solusi**:

1. Tunggu beberapa menit
2. Cek quota di [Google AI Studio](https://aistudio.google.com/)
3. Generate API key baru jika diperlukan

### ❌ Error: "CORS blocked"

**Penyebab**: Server tidak mengizinkan request dari origin browser.

**Solusi**: CORS sudah dikonfigurasi di `server.mjs`, pastikan server restart setelah perubahan.

### ❌ Error: "[404 Not Found] models/gemini-xxx is not found"

**Penyebab**: Model tidak tersedia untuk API version v1beta atau API key Anda.

**Solusi**: Gunakan model `gemini-pro` yang paling stabil di `server.mjs`:

```javascript
const model = genAI.getGenerativeModel({
  model: "gemini-pro", // ✅ BENAR - Stabil untuk semua API key
});
```

**Model yang tersedia tergantung API key:**

| Model                     | Status             | Keterangan                           |
| ------------------------- | ------------------ | ------------------------------------ |
| `gemini-pro`              | ✅ **Recommended** | Stabil, tersedia untuk semua API key |
| `gemini-1.5-flash`        | ⚠️ Deprecated      | Gunakan `-latest` suffix             |
| `gemini-1.5-flash-latest` | ❌ Tidak semua key | Butuh API key versi terbaru          |
| `gemini-1.5-pro-latest`   | ❌ Tidak semua key | Butuh API key premium                |

**Jika masih error 404**: Pastikan API key Anda di Google AI Studio masih valid dan aktif.

### ❌ Server tidak start: "Cannot find module"

**Penyebab**: Dependencies belum diinstall.

**Solusi**:

```powershell
rm -r node_modules
npm install
```

## 📊 Monitoring & Logs

Server menampilkan logs untuk setiap request:

```
📥 POST /api/summarize
   └─ YouTube: https://youtube.com/watch?v=abc123
   └─ Notes: 165 karakter

✅ Berhasil (4.2s)
   └─ Response: 823 karakter
```

Error logs:

```
❌ Error API:
   └─ [429] RESOURCE_EXHAUSTED: Quota exceeded
```

## 🔐 Security Best Practices

1. ✅ API key disimpan di `.env` (tidak di frontend)
2. ✅ `.env` tidak di-commit ke Git
3. ✅ CORS dikonfigurasi untuk development (`http://localhost`)
4. ⚠️ **Production**: Ganti CORS origin dengan domain production
5. ⚠️ **Production**: Gunakan HTTPS, bukan HTTP
6. ⚠️ **Production**: Tambahkan rate limiting (express-rate-limit)

## 📂 File Structure

```
docterbee_units/
├── .env                    # Environment variables (API key)
├── .gitignore              # Ignore .env dan node_modules
├── package.json            # Node dependencies & scripts
├── server.mjs              # Express backend + Gemini integration
├── media.html              # Frontend UI (YouTube + Podcast + AI)
├── script.js               # Frontend logic (analyzeMedia, formatAISummary)
├── style.css               # Styling (ai-analysis-card classes)
└── README-GEMINI-API.md    # Dokumentasi ini
```

## 🎨 Frontend Changes

### script.js

**Fungsi baru/diubah:**

1. **`analyzeMedia()`** - Sekarang async function:

   - Validasi input (URL & catatan)
   - Loading state dengan spinner
   - `fetch()` POST ke `http://localhost:3000/api/summarize`
   - Error handling dengan troubleshooting UI
   - Reward +3 points saat sukses

2. **`formatAISummary(text)`** - Helper function baru:
   - Parse response Gemini (markdown-style)
   - Deteksi section headers (`**text**`)
   - Deteksi lists (numbered & bullets)
   - Generate styled HTML dengan icons Lucide
   - XSS prevention dengan `escapeHtml()`

### media.html

Tidak ada perubahan di HTML! Frontend tetap sama, hanya logika JavaScript yang berubah.

## 🧪 Testing

### Manual Testing

1. **Test dengan catatan sederhana**:

   ```
   Catatan: "Minum madu setiap pagi sebelum subuh"
   Expected: Selaras dengan QS An-Nahl: 69
   ```

2. **Test dengan catatan kompleks**:

   ```
   Catatan: "Puasa senin-kamis, makan 3x sehari dengan porsi besar, minum air putih 2 liter"
   Expected: Selaras (puasa, air putih) + Koreksi (makan berlebihan)
   ```

3. **Test error handling**:
   - Matikan server → "Failed to fetch"
   - Kosongkan `.env` → "API key not configured"
   - Input catatan kosong → Alert "Tuliskan catatan terlebih dahulu"

### API Testing dengan curl

```powershell
# Test summarize endpoint
curl -X POST http://localhost:3000/api/summarize `
  -H "Content-Type: application/json" `
  -d '{\"youtubeUrl\":\"https://youtube.com/watch?v=test\",\"notes\":\"Minum madu setiap pagi\"}'

# Test health endpoint
curl http://localhost:3000/health
```

## 📈 Future Improvements

- [ ] Add caching untuk mengurangi API calls
- [ ] Implementasi rate limiting di backend
- [ ] Simpan history analisis di localStorage
- [ ] Export analisis ke PDF
- [ ] Integrasi dengan Unit Journey (auto-add recommendations)
- [ ] Analisis audio podcast dengan Whisper API
- [ ] Multi-language support (English, Arabic)

## 📞 Support

Jika ada masalah:

1. Cek console browser (F12 → Console)
2. Cek terminal server untuk error logs
3. Pastikan `.env` file ada dan valid
4. Test endpoint `/health` di browser: http://localhost:3000/health

---

**Last Updated**: 27 Januari 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
