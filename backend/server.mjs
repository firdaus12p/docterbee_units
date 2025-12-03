import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { testConnection, initializeTables } from "./db.mjs";
import bookingsRouter from "./routes/bookings.mjs";
import eventsRouter from "./routes/events.mjs";
import insightRouter from "./routes/insight.mjs";
import couponsRouter from "./routes/coupons.mjs";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(".")); // Serve static files from root directory

// Initialize Google Generative AI
const apiKey = process.env.GEMINI_API_KEY?.trim();
console.log("🔑 API Key (first 10 chars):", apiKey?.substring(0, 10) + "...");

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY tidak ditemukan di .env file!");
  // Don't exit, API routes will work without Gemini
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Initialize database on startup
(async () => {
  try {
    console.log("🔌 Connecting to database...");
    await testConnection();
    await initializeTables();
    console.log("📦 Database ready\n");
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    console.error(
      "⚠️  Server will continue but API routes may not work properly\n"
    );
  }
})();

// Mount API routers
app.use("/api/bookings", bookingsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/insight", insightRouter);
app.use("/api/coupons", couponsRouter);

// POST /api/summarize endpoint (existing Gemini functionality)
app.post("/api/summarize", async (req, res) => {
  if (!genAI) {
    return res.status(500).json({
      error: "Gemini API tidak dikonfigurasi",
    });
  }

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
      });
    }

    res.status(500).json({
      error: "Gagal memproses video: " + error.message,
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Docterbee Backend Server Running",
    timestamp: new Date().toISOString(),
    services: {
      gemini: !!genAI,
      database: true, // Will be true if server started successfully
    },
  });
});

// API info endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "Docterbee API v1.0",
    endpoints: {
      bookings: {
        list: "GET /api/bookings",
        detail: "GET /api/bookings/:id",
        create: "POST /api/bookings",
        update: "PATCH /api/bookings/:id",
      },
      events: {
        list: "GET /api/events",
        detail: "GET /api/events/:id",
        create: "POST /api/events",
        update: "PATCH /api/events/:id",
        delete: "DELETE /api/events/:id",
      },
      insight: {
        list: "GET /api/insight",
        detail: "GET /api/insight/:slug",
        create: "POST /api/insight",
        update: "PATCH /api/insight/:id",
        delete: "DELETE /api/insight/:id",
      },
      coupons: {
        validate: "POST /api/coupons/validate",
        list: "GET /api/coupons",
        detail: "GET /api/coupons/:id",
        create: "POST /api/coupons",
        update: "PATCH /api/coupons/:id",
        delete: "DELETE /api/coupons/:id",
      },
      gemini: {
        summarize: "POST /api/summarize",
      },
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log("🚀 Docterbee Backend Server");
  console.log(`📡 Server berjalan di http://localhost:${PORT}`);
  console.log(
    `🔑 Gemini API: ${genAI ? "✅ Configured" : "⚠️  Not configured"}`
  );
  console.log("⏳ Menunggu request...\n");
});
