# ⚡ Gemini API Quota Limits - Quick Guide

## 🆓 Free Tier Limits (Your Current Plan)

| Metric                        | Limit     | Reset Time       |
| ----------------------------- | --------- | ---------------- |
| **Requests per Minute (RPM)** | 15        | Every 60 seconds |
| **Requests per Day (RPD)**    | 1,500     | Every 24 hours   |
| **Tokens per Minute (TPM)**   | 1 million | Every 60 seconds |

## ⚠️ Error 429: "Too Many Requests"

### Penyebab:

Anda sudah melakukan **15+ requests dalam 1 menit**

### Solusi Cepat:

1. **Tunggu 60 detik** ⏱️
2. **Refresh halaman**
3. **Coba analisis lagi**

### Cara Menghindari:

- ❌ Jangan spam tombol "Analisis AI"
- ❌ Jangan test model berulang kali
- ✅ Tunggu response sebelum request baru
- ✅ Gunakan 1 model saja (gemini-2.5-flash)

## 📊 Monitoring Quota

### Check Usage:

```powershell
# Via browser
https://aistudio.google.com/app/usage

# Via API (lihat total requests)
```

### Server akan otomatis:

- ✅ Gunakan 1 model (gemini-2.5-flash)
- ✅ Tidak test model lagi (hemat quota)
- ✅ Return error informatif jika quota habis

## 💰 Upgrade Options

### Free Tier (Current):

- ✅ 15 RPM
- ✅ 1,500 RPD
- ✅ Cukup untuk testing

### Pay-as-you-go:

- 🚀 1,000 RPM
- 🚀 50,000 RPD
- 💵 ~$0.0001 per request

### Info Pricing:

https://ai.google.dev/pricing

## 🔧 Server Configuration

### Current Setup:

```javascript
// server.mjs (UPDATED)
const modelName = "gemini-2.5-flash"; // Single model only
// No more testing loop = Save quota
```

### Previous (Quota Hungry):

```javascript
// OLD - Used 6+ requests just to find working model
for (const model of modelsToTry) {
  test(model); // Each test = 1 request
}
```

## ✅ Best Practices

1. **One Model Only**

   - Server now uses `gemini-2.5-flash` directly
   - No testing = No wasted quota

2. **Rate Limiting**

   - Frontend: Disable button saat processing
   - Backend: Return 429 jika quota exceeded

3. **Error Handling**

   - User-friendly message: "Tunggu 60 detik"
   - Auto-retry bisa ditambahkan (optional)

4. **Monitor Usage**
   - Check dashboard regularly
   - Set alerts untuk quota tinggi

## 🎯 Current Status

✅ **Server optimized** - 1 model only  
✅ **Quota friendly** - No testing loop  
✅ **Error handling** - 429 dengan retry info  
✅ **Frontend UX** - Amber warning untuk quota

**Next request akan berhasil setelah 60 detik dari error terakhir!** ⏱️

---

**Pro Tip**: Jika sering hit quota limit, pertimbangkan:

- Implement client-side rate limiting
- Cache results untuk URL yang sama
- Upgrade ke paid plan ($$$)
