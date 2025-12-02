import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Google Generative AI
const apiKey = process.env.GEMINI_API_KEY?.trim();
console.log("🔑 API Key (first 10 chars):", apiKey?.substring(0, 10) + "...");
console.log("🔑 API Key length:", apiKey?.length);

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY tidak ditemukan di .env file!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// POST /api/summarize endpoint
app.post("/api/summarize", async (req, res) => {
  try {
    const { youtubeUrl, notes } = req.body;

    // Validation
    if (!notes || notes.trim() === "") {
      return res.status(400).json({
        error: "Catatan atau topik diperlukan untuk analisis",
      });
    }

    console.log("📝 Topik/Catatan user:", notes || "(kosong)");
    if (youtubeUrl) {
      console.log("📹 YouTube URL:", youtubeUrl, "(informasi tambahan)");
    }

    // Use Gemini API directly
    const modelName = "gemini-2.5-flash";
    console.log(`🤖 Menggunakan model: ${modelName}`);

    const model = genAI.getGenerativeModel({ model: modelName });

    // Construct prompt with Islamic health context
    const prompt = `Kamu adalah asisten AI untuk aplikasi kesehatan Islami "Docterbee" yang menggabungkan ajaran Qur'an & Sunnah, sains modern, dan framework NBSN (Neuron, Biomolekul, Sensorik, Nature).

CATATAN/TOPIK PENGGUNA:
${notes || "Tidak ada catatan"}

TUGAS:
Analisis topik atau catatan di atas dan berikan penjelasan dalam Bahasa Indonesia yang mencakup:

1. **Penjelasan Topik** (3-5 poin utama yang relevan dengan catatan pengguna)
2. **Kesesuaian dengan Qur'an & Sunnah** (ayat, dalil, atau hadis yang relevan)
3. **Perspektif Sains Modern** (penelitian, fakta ilmiah, atau data medis yang mendukung atau perlu dikoreksi)
4. **Rekomendasi NBSN:**
   - **Neuron**: Aspek mental, spiritual, dan kesehatan otak
   - **Biomolekul**: Nutrisi, suplemen, atau zat yang dibutuhkan tubuh
   - **Sensorik**: Aktivitas fisik, latihan, atau stimulasi panca indera
   - **Nature**: Kebiasaan alami, pola hidup sehat, dan hubungan dengan alam

PENTING:
- Fokus pada apa yang ditanyakan atau ditulis pengguna
- Berikan jawaban yang praktis dan actionable
- Jika ada yang bertentangan dengan ajaran Islam atau sains, berikan koreksi dengan sopan
- Format output dalam poin-poin yang jelas dan mudah dibaca`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ Analisis selesai, panjang:", text.length, "karakter");
    console.log("📊 Model digunakan:", modelName);

    // Return response
    res.json({
      success: true,
      summary: text,
      youtubeUrl: youtubeUrl,
      modelUsed: modelName,
    });
  } catch (error) {
    console.error("❌ Error:", error.message);

    // Handle specific errors
    if (error.message.includes("API key")) {
      return res.status(500).json({
        error: "Konfigurasi API key tidak valid",
      });
    }

    if (error.message.includes("quota") || error.message.includes("429")) {
      // Check if it's per-minute or daily quota
      const isPerMinute =
        error.message.includes("per minute") || error.message.includes("RPM");
      const isDaily =
        error.message.includes("per day") || error.message.includes("RPD");

      let quotaType = "API quota";
      let waitTime = "beberapa menit";
      let details = "Tunggu dan coba lagi";

      if (isPerMinute) {
        quotaType = "Per-minute quota (15 RPM)";
        waitTime = "60 detik";
        details =
          "Free tier: 15 requests per menit. Tunggu 1 menit lalu coba lagi.";
      } else if (isDaily) {
        quotaType = "Daily quota (1,500 RPD)";
        waitTime = "24 jam";
        details =
          "Free tier: 1,500 requests per hari. Quota akan reset besok atau upgrade ke paid plan.";
      }

      return res.status(429).json({
        error: `${quotaType} tercapai`,
        details: details,
        waitTime: waitTime,
        retryAfter: isPerMinute ? 60 : 86400,
        checkUsage: "https://aistudio.google.com/app/usage",
        upgradeUrl: "https://ai.google.dev/pricing",
        suggestion: isDaily
          ? "⚠️ Kemungkinan API key sudah habis quota harian. Generate key baru atau upgrade."
          : "Tunggu 60 detik lalu refresh halaman.",
      });
    }

    res.status(500).json({
      error: "Gagal memproses video: " + error.message,
    });
  }
});

// Verify API key is valid
app.get("/api/verify-key", async (req, res) => {
  try {
    const apiKeyToTest = process.env.GEMINI_API_KEY?.trim();

    if (!apiKeyToTest) {
      return res.status(500).json({
        valid: false,
        error: "API key tidak ditemukan di .env",
      });
    }

    // Test dengan URL langsung ke Google API
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKeyToTest}`;

    const response = await fetch(testUrl);
    const data = await response.json();

    if (response.ok && data.models) {
      const availableModels = data.models.map((m) => m.name);

      return res.json({
        valid: true,
        apiKeyLength: apiKeyToTest.length,
        apiKeyPrefix: apiKeyToTest.substring(0, 15) + "...",
        totalModels: data.models.length,
        availableModels: availableModels,
        message:
          "✅ API key valid dan memiliki akses ke " +
          data.models.length +
          " model",
      });
    } else {
      return res.status(403).json({
        valid: false,
        error:
          data.error?.message ||
          "API key tidak valid atau tidak memiliki akses",
        statusCode: response.status,
        suggestion:
          "Generate API key baru di https://aistudio.google.com/app/apikey",
      });
    }
  } catch (error) {
    res.status(500).json({
      valid: false,
      error: error.message,
      suggestion: "Periksa koneksi internet dan API key Anda",
    });
  }
});

// Test which models work with your API key
app.get("/api/test-models", async (req, res) => {
  const modelsToTest = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash-exp",
    "models/gemini-2.5-flash",
    "models/gemini-2.0-flash",
  ];

  const results = [];

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Test");
      await result.response;

      results.push({
        model: modelName,
        status: "✅ Available",
        working: true,
      });
    } catch (error) {
      results.push({
        model: modelName,
        status: "❌ Not Available",
        working: false,
        error: error.message.substring(0, 80),
      });
    }
  }

  const workingModels = results.filter((r) => r.working);

  res.json({
    apiKeyConfigured: !!process.env.GEMINI_API_KEY,
    totalTested: modelsToTest.length,
    workingCount: workingModels.length,
    recommendedModel: workingModels[0]?.model || "❌ None available",
    allResults: results,
    message:
      workingModels.length === 0
        ? "❌ Tidak ada model tersedia. Periksa API key di https://aistudio.google.com/"
        : `✅ ${workingModels.length} model tersedia`,
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Docterbee Media AI Server Running",
    timestamp: new Date().toISOString(),
    model: "gemini-pro",
  });
});

// Start server
app.listen(PORT, () => {
  console.log("🚀 Docterbee Media AI Server");
  console.log(`📡 Server berjalan di http://localhost:${PORT}`);
  console.log(
    `🔑 API Key loaded: ${process.env.GEMINI_API_KEY ? "✅ Yes" : "❌ No"}`
  );
  console.log("⏳ Menunggu request...\n");
});
