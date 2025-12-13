# Perbaikan Bug: Ketidaksesuaian Harga Booking

## Masalah yang Ditemukan

Harga yang ditampilkan di **Admin Dashboard Booking Monitor** tidak sesuai dengan **Total Bayar** yang dilihat user saat melakukan booking, baik dengan maupun tanpa kode promo.

## Penyebab Akar Masalah

### Alur Sebelumnya (Bermasalah):

1. **Frontend** (`booking.html` + `js/script.js`):
   - User memilih layanan → Frontend mengambil harga dari API `/api/bookings/prices/:serviceName`
   - User memasukkan kode promo → Frontend memanggil API `/api/coupons/validate`
   - Frontend menghitung: `finalPrice = price - discountAmount`
   - Frontend menampilkan di UI: "Total Bayar: Rp 135,000"
2. **Frontend saat Submit**:

   - ❌ **TIDAK mengirim** data `price`, `discountAmount`, `finalPrice` ke backend
   - Hanya mengirim: `serviceName`, `promoCode`, data customer, dll.

3. **Backend** (`backend/routes/bookings.mjs`):

   - Menerima request tanpa data harga
   - Backend **menghitung ulang** harga dari `SERVICE_PRICES` mapping
   - Backend **menghitung ulang** diskon dari kode promo
   - Backend menyimpan hasil perhitungan **yang bisa berbeda** dari frontend

4. **Admin Dashboard**:
   - Menampilkan `price` dan `final_price` dari database
   - Harga ini adalah hasil perhitungan backend, **BUKAN** yang dilihat user

### Mengapa Bisa Berbeda?

- **Race condition**: Frontend dan backend menghitung secara terpisah
- **Data source berbeda**: Frontend dari API `/api/bookings/prices`, Backend dari `SERVICE_PRICES` constant
- **Timing issue**: Jika service price berubah antara user lihat harga dan submit booking
- **Promo validation**: Jika frontend dan backend mendapat hasil validasi promo yang berbeda

## Solusi yang Diterapkan

### 1. Frontend Mengirim Data Harga (`js/script.js`)

**Perubahan pada fungsi `saveBookingToDatabase()`** (baris ~1169):

```javascript
body: JSON.stringify({
  serviceName: service,
  // ... data lainnya ...
  // ✅ TAMBAHAN BARU: Kirim harga yang sudah dihitung di frontend
  price: bookingState.price,
  discountAmount: bookingState.discountAmount,
  finalPrice: bookingState.finalPrice,
});
```

**Logging untuk debugging** (baris ~1195):

```javascript
console.log("💰 Harga yang dikirim:", {
  price: bookingState.price,
  discountAmount: bookingState.discountAmount,
  finalPrice: bookingState.finalPrice,
  promoCode: promoCode,
});
```

### 2. Backend Menerima dan Prioritaskan Harga dari Frontend (`backend/routes/bookings.mjs`)

**Perubahan pada POST `/api/bookings`** (baris ~95):

```javascript
const {
  serviceName,
  // ... parameter lainnya ...
  // ✅ TAMBAHAN BARU: Terima harga dari frontend
  price: frontendPrice,
  discountAmount: frontendDiscountAmount,
  finalPrice: frontendFinalPrice,
} = req.body;

// ✅ Prioritaskan harga dari frontend
let price = frontendPrice || getServicePrice(serviceName);
let discountAmount = frontendDiscountAmount || 0;
let finalPrice = frontendFinalPrice || price;

console.log("💾 Booking - Harga yang diterima:", {
  serviceName,
  frontendPrice,
  frontendDiscountAmount,
  frontendFinalPrice,
  calculatedPrice: getServicePrice(serviceName),
  finalPrice: price,
  finalDiscountAmount: discountAmount,
  finalFinalPrice: finalPrice,
  promoCode,
});
```

**Logic fallback**:

- Jika frontend mengirim harga → Gunakan harga dari frontend ✅
- Jika frontend TIDAK mengirim harga → Hitung ulang di backend (backward compatibility)
- Tetap increment `coupon.used_count` untuk tracking usage

## Keuntungan Solusi Ini

✅ **Single Source of Truth**: Harga yang dilihat user = harga yang disimpan  
✅ **Konsistensi**: Admin melihat harga yang sama dengan user  
✅ **Backward Compatible**: Masih bisa menerima booking dari source lain tanpa harga  
✅ **Debug-friendly**: Ada logging di frontend dan backend untuk troubleshooting  
✅ **Promo code tracking tetap akurat**: `used_count` tetap di-increment

## Testing Checklist

### Test Case 1: Booking Tanpa Promo

1. Buka `booking.html?service=Bekam%20Profesional`
2. Isi form lengkap tanpa kode promo
3. Perhatikan "Total Bayar" di UI (misal: Rp 150,000)
4. Submit booking
5. Cek console log: `💰 Harga yang dikirim`
6. Buka Admin Dashboard → Tab Bookings
7. **✅ Verifikasi**: "Total Bayar" di admin = "Total Bayar" yang user lihat

### Test Case 2: Booking Dengan Promo Persentase (10%)

1. Buka `booking.html?service=Bekam%20Profesional`
2. Isi form, masukkan kode promo: `SEHAT10` (diskon 10%)
3. Klik "Validasi Kode Promo"
4. Perhatikan:
   - Harga Layanan: Rp 150,000
   - Diskon: -Rp 15,000
   - Total Bayar: Rp 135,000
5. Submit booking
6. Cek backend log: `💾 Booking - Harga yang diterima`
7. Buka Admin Dashboard
8. **✅ Verifikasi**:
   - Price: Rp 150,000
   - Diskon: -Rp 15,000 (merah)
   - Total Bayar: Rp 135,000 (bold amber)

### Test Case 3: Booking Dengan Promo Fixed Amount

1. Buka `booking.html?service=Psikolog` (Rp 350,000)
2. Isi form, masukkan kode promo dengan diskon fixed Rp 50,000
3. Validasi promo
4. Perhatikan:
   - Harga Layanan: Rp 350,000
   - Diskon: -Rp 50,000
   - Total Bayar: Rp 300,000
5. Submit booking
6. **✅ Verifikasi** di Admin Dashboard

### Test Case 4: Backward Compatibility (Manual API Call)

Test bahwa booking masih bisa dibuat tanpa mengirim harga:

```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/bookings" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{
    serviceName = "Dokter Umum"
    branch = "Jakarta"
    practitioner = "Dr. Test"
    date = "2025-01-25"
    time = "10:00"
    mode = "online"
    customerName = "Test User"
    customerPhone = "08123456789"
    customerAge = 30
    customerGender = "Laki-laki"
    customerAddress = "Test Address"
  } | ConvertTo-Json)
```

**✅ Expected**: Booking berhasil dengan harga Rp 150,000 (dari `SERVICE_PRICES`)

## Monitoring & Debugging

### Console Logs yang Ditambahkan

**Frontend** (`js/script.js`):

```
💰 Harga yang dikirim: {
  price: 150000,
  discountAmount: 15000,
  finalPrice: 135000,
  promoCode: "SEHAT10"
}
```

**Backend** (`backend/routes/bookings.mjs`):

```
💾 Booking - Harga yang diterima: {
  serviceName: "Bekam Profesional",
  frontendPrice: 150000,
  frontendDiscountAmount: 15000,
  frontendFinalPrice: 135000,
  calculatedPrice: 150000,
  finalPrice: 150000,
  finalDiscountAmount: 15000,
  finalFinalPrice: 135000,
  promoCode: "SEHAT10"
}
```

### Troubleshooting Guide

**Jika harga masih tidak sesuai:**

1. Buka DevTools Console (F12)
2. Cek log `💰 Harga yang dikirim` saat submit booking
3. Cek backend terminal log `💾 Booking - Harga yang diterima`
4. Bandingkan `frontendFinalPrice` dengan `final_price` di database
5. Jika berbeda, cek apakah `bookingState` ter-update saat validasi promo

**Jika `bookingState` masih 0:**

- Pastikan `loadServicePrice()` dipanggil saat page load
- Cek Network tab → API `/api/bookings/prices/:serviceName` berhasil
- Cek `updatePriceDisplay()` ter-trigger setelah validasi promo

## Files Modified

1. **js/script.js** (3 changes):

   - Line ~1169: Menambah `price`, `discountAmount`, `finalPrice` ke request body
   - Line ~1195: Menambah console log untuk debugging

2. **backend/routes/bookings.mjs** (2 changes):
   - Line ~95: Destructure `frontendPrice`, `frontendDiscountAmount`, `frontendFinalPrice` dari request
   - Line ~145: Logic untuk prioritaskan harga frontend + logging

## Catatan Penting

⚠️ **Jangan hapus `SERVICE_PRICES` mapping di backend**  
Masih dibutuhkan untuk:

- Backward compatibility (API calls tanpa harga)
- Fallback jika frontend tidak mengirim harga
- Direct database inserts dari admin atau script

⚠️ **Harga di database bersifat immutable**  
Setelah booking dibuat, harga tidak berubah meskipun service price di-update. Ini adalah behavior yang benar untuk mencegah retroactive price changes.

## Future Improvements (Optional)

1. **Tambah validasi di backend**: Cek apakah `frontendFinalPrice = frontendPrice - frontendDiscountAmount`
2. **Audit log**: Simpan log jika ada perbedaan antara frontend price vs backend calculated price
3. **API versioning**: Buat `/api/v2/bookings` yang **require** harga dari frontend
4. **Database migration**: Tambah kolom `price_source` (enum: 'frontend', 'backend', 'manual')

## Changelog

**2025-01-19**

- ✅ Fixed: Harga booking di admin dashboard sekarang sesuai dengan yang dilihat user
- ✅ Added: Logging untuk debugging price calculation
- ✅ Improved: Backend sekarang prioritaskan harga dari frontend
- ✅ Maintained: Backward compatibility untuk API calls tanpa harga
