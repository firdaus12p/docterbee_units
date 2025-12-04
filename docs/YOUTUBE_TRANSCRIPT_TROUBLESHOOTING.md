# 🎬 YouTube Transcript Troubleshooting Guide

## Masalah Umum & Solusi

### ❌ Masalah: "Transcript tidak tersedia" padahal video memiliki subtitle

**Penyebab umum:**

1. **Parameter tracking di URL** (seperti `si=`, `feature=`) mengganggu parsing
2. **YouTube mengubah struktur HTML** mereka
3. **Subtitle dinonaktifkan oleh creator** meskipun tersedia
4. **Regional restrictions** atau age-gated content
5. **Library perlu retry** dengan berbagai strategi

**Contoh URL bermasalah:**

```
❌ https://youtu.be/BvveMLSpXRE?si=Sp1s1_eWj7NMNCPz
✅ https://www.youtube.com/watch?v=BvveMLSpXRE
```

### ✅ Solusi yang Diterapkan (Updated Dec 2025)

#### 1. **URL Cleaning Function**

```javascript
// Menghapus parameter tracking otomatis
function cleanYoutubeUrl(url) {
  // Removes: si=, feature=, list=, etc.
  // Returns: https://www.youtube.com/watch?v={videoId}
}
```

#### 2. **Retry Mechanism with Multiple Strategies**

```javascript
async function fetchTranscriptWithRetry(videoId) {
  // Strategy 1: Direct fetch
  // Strategy 2: Try Indonesian language (id)
  // Strategy 3: Try English language (en)
  // Returns first successful result
}
```

#### 3. **Enhanced Error Logging**

```javascript
// Server console akan menampilkan:
// 🔗 Original URL: [URL asli dari user]
// 🧹 Cleaned URL: [URL setelah dibersihkan]
// 🔄 Trying: Direct fetch (1/3)
// ✅ Success with Direct fetch!
```

## Cara Testing

### Test 1: Via API Endpoint (cURL/Postman)

```bash
# Test check transcript availability
curl -X POST http://localhost:3000/api/check-transcript \
  -H "Content-Type: application/json" \
  -d '{"youtubeUrl": "https://youtu.be/BvveMLSpXRE?si=Sp1s1_eWj7NMNCPz"}'

# Expected Success Response:
{
  "available": true,
  "segmentCount": 123,
  "characterCount": 5678,
  "message": "Video ini memiliki transcript..."
}

# Expected Error Response:
{
  "available": false,
  "error": "Could not find captions for video",
  "message": "Video tidak memiliki subtitle...",
  "suggestions": [...]
}
```

### Test 2: Via Media Page (Browser)

1. Buka `http://localhost:3000/media.html`
2. Paste URL: `https://youtu.be/BvveMLSpXRE?si=Sp1s1_eWj7NMNCPz`
3. Klik "Muat Video"
4. Cek console browser untuk log detail
5. Klik "Analisis AI"

**Expected Console Output:**

```
🔗 Original URL: https://youtu.be/BvveMLSpXRE?si=Sp1s1_eWj7NMNCPz
🧹 Cleaned URL: https://www.youtube.com/watch?v=BvveMLSpXRE
🔄 Trying: Direct fetch (1/3)
✅ Success with Direct fetch!
📊 Raw transcript data items: 123
✅ Transcript berhasil diambil: 5678 karakter dari 123 segmen
```

### Test 3: Via MCP Playwright (Automated Testing)

```javascript
// Test dengan browser automation
await page.goto("http://localhost:3000/media.html");
await page.fill(
  "#youtubeUrl",
  "https://youtu.be/BvveMLSpXRE?si=Sp1s1_eWj7NMNCPz"
);
await page.click('button:has-text("Muat Video")');

// Wait for video to load
await page.waitForSelector('iframe[src*="youtube.com"]');

// Click analyze button
await page.click('button:has-text("Analisis AI")');

// Check for success
const result = await page.textContent("#aiAnalysisResult");
console.log("Analysis result:", result);
```

## Jika Masih Gagal

### Alternatif 1: Update Library (Manual)

```bash
# Check current version
npm list youtube-transcript

# Try reinstalling
npm uninstall youtube-transcript
npm install youtube-transcript@latest

# Or try alternative library
npm install youtube-captions-scraper
```

### Alternatif 2: Fallback Manual Input

Jika transcript benar-benar tidak tersedia:

1. Tonton video secara manual
2. Tulis poin-poin penting di "Catatan/Poin Penting"
3. Klik "Analisis AI" tanpa URL YouTube
4. AI akan analisis catatan manual Anda

### Alternatif 3: Chrome Extension Workaround

1. Install extension: "YouTube Transcript"
2. Copy transcript dari extension
3. Paste ke "Catatan/Poin Penting"
4. Klik "Analisis AI"

## Kenapa Video Sebelumnya Berhasil, Sekarang Tidak?

**Beberapa kemungkinan:**

1. **YouTube API berubah** - mereka update struktur HTML setiap beberapa minggu
2. **Creator mengubah setting** - subtitle bisa dinonaktifkan sewaktu-waktu
3. **Rate limiting** - YouTube membatasi jumlah request per IP
4. **Network issue** - koneksi internet lambat atau bermasalah
5. **Cache issue** - browser/server cache perlu di-clear

**Solusi:**

```bash
# 1. Restart server
npm start

# 2. Clear browser cache
# Ctrl + Shift + Delete → Clear cache

# 3. Coba beberapa menit kemudian
# (YouTube rate limit biasanya reset dalam 1-5 menit)

# 4. Test dengan video lain untuk isolasi masalah
```

## Monitoring & Debugging

### Check Server Logs

```bash
# Jalankan server dengan verbose logging
npm start

# Perhatikan output:
# ✅ = Success
# ⚠️ = Warning (fallback digunakan)
# ❌ = Error (perlu action)
```

### Common Error Messages

| Error Message             | Penyebab                     | Solusi                            |
| ------------------------- | ---------------------------- | --------------------------------- |
| `Could not find captions` | Video tidak ada subtitle     | Tulis manual atau cari video lain |
| `Transcript is disabled`  | Creator nonaktifkan subtitle | Tulis manual                      |
| `Video unavailable`       | Video dihapus/private        | Cari video lain                   |
| `429 Too Many Requests`   | Rate limit YouTube           | Tunggu 5 menit                    |
| `Network error`           | Koneksi internet             | Cek koneksi                       |

## Best Practices

1. ✅ **Selalu gunakan URL bersih** - hindari parameter tracking
2. ✅ **Test di development** sebelum deploy
3. ✅ **Siapkan fallback** - catatan manual sebagai backup
4. ✅ **Monitor logs** - untuk detect pattern issues
5. ✅ **Update dependencies** - minimal sebulan sekali

## Update History

- **Dec 4, 2025**: Added URL cleaning + retry mechanism
- **Initial**: Basic youtube-transcript integration

## Video Testing URLs (untuk Development)

```javascript
// URLs dengan transcript yang biasanya available:
const TEST_URLS = [
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Rick Astley
  "https://www.youtube.com/watch?v=9bZkp7q19f0", // Gangnam Style
  "https://youtu.be/BvveMLSpXRE", // Your test URL (clean)
];

// Test semua URLs:
TEST_URLS.forEach((url) => {
  console.log("Testing:", url);
  // Paste ke media.html satu per satu
});
```

## Contact & Support

Jika masalah persist setelah semua solusi dicoba:

1. Check GitHub issues: `youtube-transcript` library
2. Consider alternative libraries: `youtube-captions-scraper`, `youtubei.js`
3. Document error pattern untuk future fix
