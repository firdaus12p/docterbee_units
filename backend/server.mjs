import express from "express";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Innertube } from "youtubei.js";
import { YoutubeTranscript } from "youtube-transcript";
import { testConnection, initializeTables, query, queryOne } from "./db.mjs";
import authRouter from "./routes/auth.mjs";
import bookingsRouter from "./routes/bookings.mjs";
import eventsRouter from "./routes/events.mjs";
import insightRouter from "./routes/insight.mjs";
import couponsRouter from "./routes/coupons.mjs";
import servicesRouter from "./routes/services.mjs";
import productsRouter from "./routes/products.mjs";
import uploadRouter from "./routes/upload.mjs";
import articlesRouter from "./articles.mjs";
import ordersRouter from "./routes/orders.mjs";
import usersRouter from "./routes/users.mjs";
import userDataRouter from "./routes/user-data.mjs";
import rewardsRouter from "./routes/rewards.mjs";
import podcastsRouter from "./routes/podcasts.mjs";
import bcrypt from "bcryptjs";

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, "..", ".env") });

const app = express();
const PORT = process.env.PORT || 3000;

// Check if running in production
const isProduction = process.env.NODE_ENV === "production";

// Session middleware (MUST be before routes)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "docterbee-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to false for compatibility (even in production if not using HTTPS)
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax", // More permissive for cross-origin requests
    },
  })
);

// Allowed origins for CORS
const allowedOrigins = [
  "https://docterbee.com",
  "https://www.docterbee.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

// CORS middleware with restricted origins
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, same-origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // In development, allow all origins for easier testing
        if (!isProduction) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// ============================================
// REDIRECT .html to clean URLs (MUST be before static middleware)
// ============================================
const cleanUrlPages = [
  "login",
  "register",
  "journey",
  "services",
  "store",
  "events",
  "insight",
  "media",
  "booking",
  "article",
  "ai-advisor",
  "admin-dashboard",
  "profile",
  "youtube-ai",
  "podcast",
];

// Redirect .html URLs to clean URLs (SEO friendly)
cleanUrlPages.forEach((page) => {
  app.get(`/${page}.html`, (req, res) => {
    res.redirect(301, `/${page}`);
  });
});

// Redirect index.html to root
app.get("/index.html", (req, res) => {
  res.redirect(301, "/");
});

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
    console.error("⚠️  Server will continue but API routes may not work properly\n");
  }
})();

// ============================================
// API ROUTES (MUST BE BEFORE STATIC FILES)
// ============================================
// Mount API routers
app.use("/api/auth", authRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/insight", insightRouter);
app.use("/api/coupons", couponsRouter);
app.use("/api/services", servicesRouter);
app.use("/api/products", productsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/users", usersRouter);
app.use("/api/user-data", userDataRouter);
app.use("/api/rewards", rewardsRouter);
app.use("/api/podcasts", podcastsRouter);

// ============================================
// STATIC FILES & CLEAN URLs (MUST BE AFTER API ROUTES)
// ============================================
// Static files middleware
app.use(express.static(".")); // Serve static files from root directory
app.use("/uploads", express.static(join(__dirname, "..", "uploads"))); // Serve uploaded files

// CLEAN URLs - serve HTML files without extension
cleanUrlPages.forEach((page) => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(join(__dirname, "..", `${page}.html`));
  });
});


// ============================================
// ADMIN AUTHENTICATION (Database-based with bcrypt)
// ============================================

// POST /api/admin/login - Admin login with database authentication
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username dan password harus diisi",
      });
    }

    // Query admin from database
    const admin = await queryOne(
      "SELECT * FROM admins WHERE username = ? AND is_active = 1",
      [username]
    );

    if (!admin) {
      // Log failed attempt (admin not found) - use NULL for admin_id
      await query(
        `INSERT INTO admin_login_history (admin_id, username, ip_address, user_agent, login_status) 
         VALUES (NULL, ?, ?, ?, 'failed')`,
        [username, req.ip, req.get("user-agent")]
      );

      return res.status(401).json({
        success: false,
        error: "Username atau password salah",
      });
    }

    // Verify password with bcrypt
    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      // Log failed attempt (wrong password)
      await query(
        `INSERT INTO admin_login_history (admin_id, username, ip_address, user_agent, login_status) 
         VALUES (?, ?, ?, ?, 'failed')`,
        [admin.id, username, req.ip, req.get("user-agent")]
      );

      return res.status(401).json({
        success: false,
        error: "Username atau password salah",
      });
    }

    // Update last_login timestamp
    await query("UPDATE admins SET last_login = NOW() WHERE id = ?", [admin.id]);

    // Log successful login
    await query(
      `INSERT INTO admin_login_history (admin_id, username, ip_address, user_agent, login_status) 
       VALUES (?, ?, ?, ?, 'success')`,
      [admin.id, username, req.ip, req.get("user-agent")]
    );

    // Set admin session
    req.session.isAdmin = true;
    req.session.adminId = admin.id;
    req.session.adminUsername = admin.username;
    req.session.adminRole = admin.role;

    res.json({
      success: true,
      message: "Admin login berhasil",
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      error: "Terjadi kesalahan saat login",
    });
  }
});

// POST /api/admin/logout - Admin logout
app.post("/api/admin/logout", (req, res) => {
  req.session.isAdmin = false;
  req.session.adminUsername = null;
  res.json({
    success: true,
    message: "Admin logout berhasil",
  });
});

// GET /api/admin/check - Check admin session
app.get("/api/admin/check", (req, res) => {
  res.json({
    success: true,
    isAdmin: !!req.session.isAdmin,
    username: req.session.adminUsername || null,
  });
});

// Middleware to require admin authentication
const requireAdmin = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({
      success: false,
      error: "Akses ditolak. Silakan login sebagai admin.",
    });
  }
};

// Export middleware for use in route files (if needed later)
app.set("requireAdmin", requireAdmin);

// DEBUG ENDPOINT - Untuk troubleshooting database
// Security: Di production, endpoint ini memerlukan login admin
// Di development, endpoint ini terbuka untuk kemudahan debugging
app.get("/api/debug", async (req, res) => {
  // Security check: In production, require admin login
  if (isProduction && !(req.session && req.session.isAdmin)) {
    return res.status(401).json({
      success: false,
      error: "Debug endpoint hanya tersedia untuk admin di production. Silakan login sebagai admin terlebih dahulu.",
    });
  }

  try {
    const { pool } = await import("./db.mjs");

    // Test database connection
    let dbStatus = "disconnected";
    let dbError = null;
    let tables = [];

    try {
      const connection = await pool.getConnection();
      dbStatus = "connected";

      // Get list of tables
      const [rows] = await connection.query("SHOW TABLES");
      tables = rows.map((row) => Object.values(row)[0]);

      connection.release();
    } catch (error) {
      dbError = error.message;
    }

    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV || "development",
        PORT: process.env.PORT || "3000",
        DB_HOST: process.env.DB_HOST || "not set",
        DB_PORT: process.env.DB_PORT || "not set",
        DB_USER: process.env.DB_USER || "not set",
        DB_NAME: process.env.DB_NAME || "not set",
        // Hide sensitive info in production
        DB_PASSWORD: isProduction ? "***HIDDEN***" : (process.env.DB_PASSWORD ? "***SET***" : "NOT SET"),
        GEMINI_API_KEY: isProduction ? "***HIDDEN***" : (process.env.GEMINI_API_KEY ? "***SET***" : "NOT SET"),
      },
      database: {
        status: dbStatus,
        error: dbError,
        tables: tables,
        tableCount: tables.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      error: error.message,
      stack: isProduction ? undefined : error.stack, // Hide stack trace in production
    });
  }
});

// Helper function to clean YouTube URL (remove tracking parameters)
function cleanYoutubeUrl(url) {
  if (!url) return null;

  try {
    // Remove tracking parameters like si=, feature=, etc
    const urlObj = new URL(url);
    const videoId = urlObj.searchParams.get("v") || url.split("/").pop().split("?")[0];

    // Return clean URL
    if (videoId && videoId.length === 11) {
      return `https://www.youtube.com/watch?v=${videoId}`;
    }

    return url; // Return original if can't clean
  } catch (_e) {
    return url; // Return original if parsing fails
  }
}

// Helper function to extract YouTube video ID
function extractVideoId(url) {
  if (!url) return null;

  // Clean URL first (remove tracking params like si=)
  const cleanUrl = cleanYoutubeUrl(url);

  // Patterns for YouTube URLs
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// Helper function to fetch transcript using multiple methods for better success rate
async function fetchTranscriptWithRetry(videoId) {
  console.log(`🎯 Fetching transcript for video: ${videoId}`);

  // Method 0: Raw HTML parsing to extract captions from YouTube page
  // This bypasses library dependencies and directly parses the page
  try {
    console.log(`🔄 Method 0: Trying raw HTML parsing...`);
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    const pageResponse = await fetch(videoUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });
    
    if (!pageResponse.ok) {
      throw new Error(`Page fetch failed: ${pageResponse.status}`);
    }
    
    const html = await pageResponse.text();
    console.log(`📄 Page fetched: ${html.length} bytes`);
    
    // Extract captionTracks from the page JSON
    const captionMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
    if (captionMatch) {
      const tracks = JSON.parse(captionMatch[1]);
      console.log(`📋 Found ${tracks.length} caption tracks in page`);
      
      // Prefer Indonesian, then English, then first available
      const preferredTrack = 
        tracks.find(t => t.languageCode === "id") ||
        tracks.find(t => t.languageCode === "en" && !t.kind) || // manual English
        tracks.find(t => t.languageCode === "en") || // auto-generated English
        tracks[0];
      
      if (preferredTrack && preferredTrack.baseUrl) {
        console.log(`🎯 Using track: ${preferredTrack.languageCode} (${preferredTrack.name?.simpleText || "untitled"})`);
        
        // Fetch caption with proper format (srv3 returns XML with text segments)
        const captionUrl = preferredTrack.baseUrl + "&fmt=srv3";
        const captionResponse = await fetch(captionUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.youtube.com/",
          }
        });
        
        const captionText = await captionResponse.text();
        console.log(`📥 Caption response: ${captionText.length} bytes`);
        
        if (captionText.length > 0) {
          // Parse the XML/JSON transcript
          const textMatches = captionText.matchAll(/<text[^>]*start="([^"]*)"[^>]*dur="([^"]*)"[^>]*>([^<]*)<\/text>/g);
          const transcript = [];
          
          for (const match of textMatches) {
            const text = match[3]
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/\n/g, " ")
              .trim();
            
            if (text) {
              transcript.push({
                text,
                offset: Math.round(parseFloat(match[1]) * 1000),
                duration: Math.round(parseFloat(match[2]) * 1000),
              });
            }
          }
          
          if (transcript.length > 0) {
            console.log(`✅ SUCCESS! Raw parsing returned ${transcript.length} segments`);
            console.log(`📊 First segment: "${transcript[0].text.substring(0, 50)}..."`);
            return transcript;
          }
        }
        console.log(`⚠️ Caption URL returned empty or unparseable content`);
      }
    } else {
      console.log(`⚠️ No captionTracks found in page HTML`);
    }
  } catch (rawParseError) {
    console.log(`⚠️ Method 0 (raw parsing) failed: ${rawParseError.message}`);
  }

  // Method 1: Try youtube-transcript library as fallback
  try {
    console.log(`🔄 Method 1: Trying youtube-transcript library...`);
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

    if (transcriptItems && transcriptItems.length > 0) {
      console.log(`✅ SUCCESS! youtube-transcript returned ${transcriptItems.length} segments`);
      return transcriptItems.map((item) => ({
        text: item.text || "",
        offset: item.offset || 0,
        duration: item.duration || 0,
      }));
    }
    console.log(`⚠️ youtube-transcript returned no usable data`);
  } catch (youtubeTranscriptError) {
    console.log(`⚠️ Method 1 (youtube-transcript) failed: ${youtubeTranscriptError.message}`);
  }

  // Method 2 & 3: Try youtubei.js (existing implementation)
  try {
    console.log(`🔄 Method 1: Trying youtubei.js...`);
    const youtube = await Innertube.create();
    const info = await youtube.getInfo(videoId);

    console.log(`📹 Video info: "${info.basic_info.title}"`);
    console.log(`📝 Has captions: ${info.captions ? "Yes" : "No"}`);

    if (info.captions && info.captions.caption_tracks) {
      const tracks = info.captions.caption_tracks;
      console.log(`📋 Available caption tracks: ${tracks.length}`);

      // Try to find Indonesian or first available track
      const selectedTrack =
        tracks.find(
          (t) =>
            t.language_code === "id" ||
            t.language_code === "in" ||
            t.name.text?.toLowerCase().includes("indonesian")
        ) || tracks[0];

      if (selectedTrack) {
        console.log(
          `✅ Using caption track: ${selectedTrack.name.text} (${selectedTrack.language_code})`
        );
        console.log(`   Is auto-generated: ${selectedTrack.kind === "asr" ? "Yes" : "No"}`);
        console.log(`   Base URL: ${selectedTrack.base_url ? "Available" : "Missing"}`);

        // Method 1: Try using getTranscript() if available
        try {
          console.log(`🔄 Method 1: Trying info.getTranscript()...`);
          const transcriptData = await info.getTranscript();

          if (transcriptData && transcriptData.transcript) {
            const segments = transcriptData.transcript.content?.body?.initial_segments;

            if (segments && segments.length > 0) {
              console.log(`✅ Got ${segments.length} segments via getTranscript()`);

              const transcript = segments
                .map((seg) => ({
                  text: seg.snippet?.text || "",
                  offset: seg.start_ms || 0,
                  duration: seg.end_ms ? seg.end_ms - seg.start_ms : 0,
                }))
                .filter((t) => t.text.trim());

              if (transcript.length > 0) {
                console.log(`✅ SUCCESS! Formatted ${transcript.length} segments`);
                console.log(`📊 First: "${transcript[0].text.substring(0, 50)}..."`);
                return transcript;
              }
            }
          }
          console.log(`⚠️  getTranscript() returned no usable data`);
        } catch (getTranscriptError) {
          console.log(`❌ getTranscript() failed: ${getTranscriptError.message}`);
        }

        // Method 2: Fetch and parse caption XML directly
        if (selectedTrack.base_url) {
          try {
            console.log(`🔄 Method 2: Downloading caption XML from base_url...`);
            console.log(`   URL: ${selectedTrack.base_url.substring(0, 80)}...`);

            // Add headers to mimic browser request
            const captionResponse = await fetch(selectedTrack.base_url, {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                Accept: "text/xml,application/xml",
                "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
              },
            });

            if (!captionResponse.ok) {
              throw new Error(`HTTP ${captionResponse.status}: ${captionResponse.statusText}`);
            }

            const captionXML = await captionResponse.text();

            console.log(`📥 Downloaded caption XML (${captionXML.length} bytes)`);

            // Check if XML is actually empty or invalid
            if (!captionXML || captionXML.length === 0) {
              throw new Error("Caption XML is empty (0 bytes received)");
            }

            // Parse XML to extract text segments
            // Format: <text start="0.0" dur="2.5">Text here</text>
            const textMatches = captionXML.matchAll(
              /<text[^>]*start="([^"]*)"[^>]*dur="([^"]*)"[^>]*>([^<]*)<\/text>/g
            );
            const transcript = [];

            for (const match of textMatches) {
              const start = parseFloat(match[1]);
              const duration = parseFloat(match[2]);
              const text = match[3]
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .trim();

              if (text) {
                transcript.push({
                  text: text,
                  offset: Math.round(start * 1000), // Convert to milliseconds
                  duration: Math.round(duration * 1000),
                });
              }
            }

            if (transcript.length > 0) {
              console.log(
                `✅ SUCCESS! Parsed ${transcript.length} transcript segments from youtubei.js`
              );
              console.log(`📊 First segment: "${transcript[0].text.substring(0, 50)}..."`);
              return transcript;
            } else {
              console.log(`⚠️  Parsed XML but found no text segments`);
            }
          } catch (parseError) {
            console.log(`❌ Error parsing caption XML: ${parseError.message}`);
          }
        } else {
          console.log(`⚠️  Caption track has no base_url`);
        }
      }
    }

    throw new Error(`Video tidak memiliki captions yang dapat diambil`);
  } catch (youtubeIError) {
    console.log(`❌ youtubei.js failed: ${youtubeIError.message}`);
    throw new Error(
      `Transcript tidak tersedia. Video mungkin: (1) Tidak memiliki subtitle sama sekali, (2) Subtitle dinonaktifkan oleh creator, atau (3) Memiliki batasan akses regional. Error: ${youtubeIError.message}`
    );
  }
}

// POST /api/ai-advisor endpoint (AI Advisor Qur'ani)
app.post("/api/ai-advisor", async (req, res) => {
  if (!genAI) {
    return res.status(500).json({
      error: "Gemini API tidak dikonfigurasi",
    });
  }

  try {
    const { question } = req.body;

    // Validation
    if (!question || question.trim() === "") {
      return res.status(400).json({
        error: "Pertanyaan diperlukan untuk analisis",
      });
    }

    console.log("🧠 AI Advisor - Pertanyaan user:", question.substring(0, 100) + "...");

    const modelName = "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    // Prompt engineering untuk output JSON terstruktur
    const prompt = `Kamu adalah AI Advisor untuk aplikasi kesehatan Islami "Docterbee" yang menggabungkan ajaran Qur'an & Sunnah shahih, sains modern, dan framework NBSN (Neuron, Biomolekul, Sensorik, Nature).

PERTANYAAN/PERILAKU PENGGUNA:
${question}

TUGAS:
Analisis perilaku atau pertanyaan di atas dan berikan jawaban dalam format JSON yang VALID dengan struktur berikut:

{
  "verdict": {
    "status": "Benar" atau "Salah" atau "Hati-hati",
    "score": angka dari -10 sampai 10,
    "explanation": "Penjelasan singkat 1-2 kalimat tentang verdict"
  },
  "recommendations": {
    "steps": [
      "Langkah praktis 1 yang bisa dilakukan 7 hari ke depan",
      "Langkah praktis 2 yang bisa dilakukan 7 hari ke depan",
      "Langkah praktis 3 yang bisa dilakukan 7 hari ke depan",
      "Langkah praktis 4 yang bisa dilakukan 7 hari ke depan",
      "Langkah praktis 5 (jika keluhan berat konsultasi praktisi)"
    ],
    "dalil": [
      {
        "type": "Al-Qur'an" atau "Hadis",
        "ref": "QS atau HR dengan nomor ayat/referensi",
        "text": "Teks ayat atau hadis yang relevan",
        "relevance": "Penjelasan singkat mengapa dalil ini relevan"
      },
      {
        "type": "Al-Qur'an" atau "Hadis",
        "ref": "QS atau HR dengan nomor ayat/referensi",
        "text": "Teks ayat atau hadis yang relevan",
        "relevance": "Penjelasan singkat mengapa dalil ini relevan"
      }
    ]
  },
  "nbsnAnalysis": {
    "neuron": "Analisis aspek mental, spiritual, dan kesehatan otak (2-3 kalimat)",
    "biomolekul": "Analisis nutrisi, suplemen, atau zat yang dibutuhkan tubuh (2-3 kalimat)",
    "sensorik": "Analisis aktivitas fisik, latihan, atau stimulasi panca indera (2-3 kalimat)",
    "nature": "Analisis kebiasaan alami, pola hidup sehat, dan hubungan dengan alam (2-3 kalimat)"
  }
}

KRITERIA VERDICT:
- "Benar" (score 5-10): Perilaku sesuai syariat dan sains, bermanfaat untuk kesehatan
- "Hati-hati" (score -2 sampai 4): Perilaku netral atau perlu penyesuaian
- "Salah" (score -10 sampai -3): Perilaku bertentangan dengan syariat atau berbahaya bagi kesehatan

PENTING:
- Output HARUS valid JSON tanpa markdown code block atau teks tambahan
- Dalil harus shahih (Qur'an atau Hadis Bukhari/Muslim/Tirmidzi/Abu Dawud/Ahmad)
- Langkah rekomendasi harus praktis dan bisa dilakukan dalam 7 hari
- Analisis NBSN harus spesifik dan berdasarkan sains modern
- Jika ada yang bertentangan dengan Islam atau sains, berikan koreksi dengan sopan
- Gunakan Bahasa Indonesia yang jelas dan profesional`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    console.log("✅ AI Advisor analisis selesai, panjang:", text.length, "karakter");

    // Clean up response (remove markdown code blocks if any)
    text = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    // Parse JSON response
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(text);
    } catch (parseError) {
      console.error("❌ JSON parsing error:", parseError.message);
      console.log("📄 Raw response:", text.substring(0, 200));

      // Fallback to text response
      return res.json({
        success: true,
        fallbackMode: true,
        rawText: text,
        error: "Response tidak dalam format JSON, menggunakan fallback",
      });
    }

    // Validate structure
    if (!jsonResponse.verdict || !jsonResponse.recommendations || !jsonResponse.nbsnAnalysis) {
      return res.json({
        success: true,
        fallbackMode: true,
        rawText: text,
        error: "Struktur JSON tidak lengkap",
      });
    }

    // Return structured response
    res.json({
      success: true,
      data: jsonResponse,
      modelUsed: modelName,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ AI Advisor Error:", error.message);

    // Handle specific errors
    if (error.message.includes("API key")) {
      return res.status(500).json({
        error: "Konfigurasi API key tidak valid",
      });
    }

    if (error.message.includes("quota") || error.message.includes("429")) {
      const isPerMinute = error.message.includes("per minute") || error.message.includes("RPM");

      return res.status(429).json({
        error: isPerMinute ? "Per-minute quota (15 RPM) tercapai" : "Daily quota tercapai",
        details: isPerMinute
          ? "Tunggu 60 detik lalu coba lagi"
          : "Quota harian habis, coba besok atau upgrade",
        waitTime: isPerMinute ? "60 detik" : "24 jam",
        retryAfter: isPerMinute ? 60 : 86400,
      });
    }

    res.status(500).json({
      error: "Gagal memproses analisis: " + error.message,
    });
  }
});

// POST /api/check-transcript - Check if transcript is available
app.post("/api/check-transcript", async (req, res) => {
  try {
    const { youtubeUrl } = req.body;

    if (!youtubeUrl) {
      return res.status(400).json({
        available: false,
        error: "URL YouTube tidak diberikan",
      });
    }

    const videoId = extractVideoId(youtubeUrl);

    if (!videoId) {
      return res.status(400).json({
        available: false,
        error: "URL YouTube tidak valid",
      });
    }

    console.log("🔍 Checking video accessibility untuk:", videoId);
    console.log("🔗 Original URL:", youtubeUrl);
    console.log("🧹 Cleaned URL:", cleanYoutubeUrl(youtubeUrl));

    // === NEW: Try Gemini direct video access first ===
    // This is more reliable than transcript extraction
    if (genAI) {
      try {
        console.log("🎬 Mencoba akses video langsung dengan Gemini...");
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        // Quick check if Gemini can access the video
        const result = await model.generateContent([
          "Berikan judul video ini dalam satu baris singkat (maksimal 10 kata). Jika tidak bisa mengakses video, katakan 'TIDAK DAPAT MENGAKSES'.",
          {
            fileData: {
              fileUri: cleanYoutubeUrl(youtubeUrl),
            },
          },
        ]);
        
        const response = await result.response;
        const text = response.text();
        
        if (!text.includes("TIDAK DAPAT MENGAKSES")) {
          console.log("✅ Video dapat diakses oleh Gemini:", text.substring(0, 50));
          return res.json({
            available: true,
            segmentCount: 0,
            characterCount: 0,
            source: "gemini-direct",
            message: `Video dapat dianalisis langsung oleh AI! Anda bisa langsung klik "Analisis AI" tanpa perlu menulis catatan manual.\n\n📌 ${text.trim()}`,
          });
        }
        console.log("⚠️ Gemini tidak dapat mengakses video langsung");
      } catch (geminiError) {
        console.log("⚠️ Gemini direct access failed:", geminiError.message);
        // Fall back to transcript extraction
      }
    }
    // === END NEW ===

    // Fallback: Try traditional transcript extraction
    console.log("🔄 Mencoba transcript extraction sebagai fallback...");
    
    try {
      const transcriptData = await fetchTranscriptWithRetry(videoId);

      if (transcriptData && transcriptData.length > 0) {
        const transcript = transcriptData.map((t) => t.text).join(" ");
        const charCount = transcript.trim().length;

        if (charCount > 0) {
          console.log("✅ Transcript tersedia:", charCount, "karakter");
          return res.json({
            available: true,
            segmentCount: transcriptData.length,
            characterCount: charCount,
            source: "transcript",
            message: `Video ini memiliki transcript dengan ${transcriptData.length} segmen (${charCount} karakter). Anda bisa langsung klik "Analisis AI" tanpa perlu menulis catatan manual.`,
          });
        } else {
          console.log("⚠️ Transcript kosong");
          return res.json({
            available: false,
            error: "Transcript kosong",
            message: "Video memiliki subtitle, tapi isinya kosong. Mohon tulis catatan manual.",
          });
        }
      } else {
        console.log("⚠️ Tidak ada transcript data");
        return res.json({
          available: false,
          error: "Tidak ada data transcript",
          message: "Video tidak mengembalikan data subtitle. Mohon tulis catatan manual.",
        });
      }
    } catch (error) {
      const errorMsg = error.message || String(error);
      let userMessage = "";

      if (errorMsg.includes("Could not find captions")) {
        userMessage =
          "❌ Video tidak memiliki subtitle/CC yang dapat diakses.\n\nKemungkinan penyebab:\n• Video tidak memiliki CC\n• CC dinonaktifkan oleh creator\n• CC memiliki batasan regional\n\nSolusi: Tulis ringkasan manual setelah menonton video.";
      } else if (errorMsg.includes("Transcript is disabled")) {
        userMessage =
          "❌ Transcript dinonaktifkan untuk video ini oleh creator.\n\nSolusi: Tulis ringkasan manual.";
      } else {
        userMessage = `❌ Error: ${errorMsg}\n\nSolusi: Tulis ringkasan manual.`;
      }

      console.log("❌ Error checking transcript:", errorMsg);
      return res.json({
        available: false,
        error: errorMsg,
        message: userMessage,
      });
    }
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({
      available: false,
      error: "Server error: " + error.message,
    });
  }
});

// POST /api/summarize endpoint (Media & AI - Hybrid Mode)
app.post("/api/summarize", async (req, res) => {
  if (!genAI) {
    return res.status(500).json({
      error: "Gemini API tidak dikonfigurasi",
    });
  }

  try {
    const { youtubeUrl, notes } = req.body;

    let transcript = "";
    let hasTranscript = false;
    let videoId = null;
    let transcriptError = null;

    // Extract video ID if URL provided
    if (youtubeUrl) {
      videoId = extractVideoId(youtubeUrl);
    }

    // Use Gemini API
    const modelName = "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    // === PRIORITY 1: Try Gemini Direct Video Analysis ===
    // This is the primary method - Gemini can analyze YouTube videos directly!
    if (youtubeUrl && videoId && (!notes || notes.trim() === "")) {
      try {
        console.log("🎬 PRIORITY 1: Mencoba analisis YouTube langsung dengan Gemini...");
        console.log("🔗 Video URL:", cleanYoutubeUrl(youtubeUrl));
        
        const directAnalysisPrompt = `Kamu adalah asisten AI untuk aplikasi kesehatan Islami "Docterbee" yang menggabungkan ajaran Qur'an & Sunnah SHAHIH, sains modern, dan framework NBSN (Neuron, Biomolekul, Sensorik, Nature).

TUGAS:
Analisis video YouTube di atas dari perspektif kesehatan Islami dan berikan penjelasan dalam Bahasa Indonesia yang mencakup:

1. **Ringkasan Utama** (3-5 poin inti dari video)
2. **Kesesuaian dengan Qur'an & Hadis Shahih:**
   - Sebutkan ayat Al-Qur'an atau Hadis Shahih (Bukhari/Muslim/Tirmidzi/Abu Dawud) yang relevan
   - Jelaskan kesesuaiannya dengan konten video
   - WAJIB: Hanya gunakan dalil yang SHAHIH, bukan dhaif atau maudhu'

3. **Koreksi & Klarifikasi:**
   - Jika ada informasi yang SALAH atau BERTENTANGAN dengan Islam, koreksi dengan sopan
   - Jika ada klaim kesehatan yang tidak didukung sains, berikan klarifikasi
   - Sebutkan mana yang perlu dihindari dan mana yang boleh diamalkan

4. **Rekomendasi Praktis (NBSN Framework):**
   - **Neuron**: Aspek mental, spiritual, dan kesehatan otak yang bisa diamalkan
   - **Biomolekul**: Nutrisi, suplemen, atau zat yang disebutkan (evaluasi keamanannya)
   - **Sensorik**: Aktivitas fisik atau latihan yang direkomendasikan
   - **Nature**: Kebiasaan alami dan pola hidup sehat yang bisa diterapkan 7 hari ke depan

5. **Kesimpulan & Rekomendasi:**
   - Apakah konten video ini direkomendasikan untuk diamalkan?
   - Apa yang harus diambil dan apa yang harus dihindari?
   - Saran praktis untuk implementasi

PENTING:
- Prioritaskan validasi syariat (Qur'an & Hadis Shahih) terlebih dahulu
- Berikan koreksi dengan bahasa yang sopan dan edukatif
- Fokus pada hal yang praktis dan bisa diamalkan
- Jika ragu, lebih baik menyarankan konsultasi dengan ustadz/praktisi
- Format output dalam poin-poin yang jelas, terstruktur, dan mudah dibaca`;

        // Use YouTube URL directly with Gemini multimodal
        const result = await model.generateContent([
          directAnalysisPrompt,
          {
            fileData: {
              fileUri: cleanYoutubeUrl(youtubeUrl),
            },
          },
        ]);
        
        const response = await result.response;
        const text = response.text();

        console.log("✅ Gemini Direct berhasil! Panjang:", text.length, "karakter");

        return res.json({
          success: true,
          summary: text,
          youtubeUrl: youtubeUrl,
          videoId: videoId,
          hasTranscript: true,
          transcriptLength: 0,
          source: "gemini-direct-video",
          modelUsed: modelName,
        });
      } catch (directError) {
        console.log("⚠️ Gemini Direct gagal:", directError.message);
        console.log("🔄 Fallback ke transcript extraction...");
        // Continue to transcript extraction below
      }
    }

    // === PRIORITY 2: Try transcript extraction (fallback) ===
    if (youtubeUrl && videoId) {
      console.log("📝 PRIORITY 2: Mencoba transcript extraction...");
      try {
        const transcriptData = await fetchTranscriptWithRetry(videoId);

        if (transcriptData && transcriptData.length > 0) {
          transcript = transcriptData.map((t) => t.text).join(" ");

          if (transcript && transcript.trim().length > 0) {
            hasTranscript = true;
            console.log("✅ Transcript berhasil:", transcript.length, "karakter");
          }
        }
      } catch (error) {
        const errorMsg = error.message || String(error);
        transcriptError = `Error mengambil transcript: ${errorMsg}`;
        console.log("⚠️ Transcript extraction gagal:", errorMsg);
      }
    }

    // Validation: need either transcript or notes
    if (!hasTranscript && (!notes || notes.trim() === "")) {
      return res.status(400).json({
        error: "Transcript tidak tersedia. Mohon tulis catatan/ringkasan video secara manual.",
        transcriptError,
      });
    }

    // Log what we're analyzing
    if (hasTranscript) {
      console.log("📝 Menganalisis: AUTO TRANSCRIPT (" + transcript.length + " karakter)");
    } else {
      console.log("📝 Menganalisis: USER NOTES (" + notes.length + " karakter)");
    }

    // Use existing model variable from above

    // Fallback: Use transcript or user notes for analysis
    const contentSource = hasTranscript
      ? "transcript otomatis dari YouTube"
      : "catatan/ringkasan yang ditulis user";
    const contentToAnalyze = hasTranscript ? transcript : notes;

    const prompt = `Kamu adalah asisten AI untuk aplikasi kesehatan Islami "Docterbee" yang menggabungkan ajaran Qur'an & Sunnah SHAHIH, sains modern, dan framework NBSN (Neuron, Biomolekul, Sensorik, Nature).

KONTEN YANG HARUS DIANALISIS (Sumber: ${contentSource}):
---BEGIN KONTEN---
${contentToAnalyze}
---END KONTEN---

${youtubeUrl ? `\n📹 Video YouTube: ${youtubeUrl}\n${videoId ? `Video ID: ${videoId}` : ""}` : ""}

TUGAS:
Analisis KONTEN DI ATAS (yang ada di antara ---BEGIN KONTEN--- dan ---END KONTEN---) dari perspektif kesehatan Islami dan berikan penjelasan dalam Bahasa Indonesia yang mencakup:

1. **Ringkasan Utama** (3-5 poin inti dari video/media)
2. **Kesesuaian dengan Qur'an & Hadis Shahih:**
   - Sebutkan ayat Al-Qur'an atau Hadis Shahih (Bukhari/Muslim/Tirmidzi/Abu Dawud) yang relevan
   - Jelaskan kesesuaiannya dengan konten video
   - WAJIB: Hanya gunakan dalil yang SHAHIH, bukan dhaif atau maudhu'

3. **Koreksi & Klarifikasi:**
   - Jika ada informasi yang SALAH atau BERTENTANGAN dengan Islam, koreksi dengan sopan
   - Jika ada klaim kesehatan yang tidak didukung sains, berikan klarifikasi
   - Sebutkan mana yang perlu dihindari dan mana yang boleh diamalkan

4. **Rekomendasi Praktis (NBSN Framework):**
   - **Neuron**: Aspek mental, spiritual, dan kesehatan otak yang bisa diamalkan
   - **Biomolekul**: Nutrisi, suplemen, atau zat yang disebutkan (evaluasi keamanannya)
   - **Sensorik**: Aktivitas fisik atau latihan yang direkomendasikan
   - **Nature**: Kebiasaan alami dan pola hidup sehat yang bisa diterapkan 7 hari ke depan

5. **Kesimpulan & Rekomendasi:**
   - Apakah konten video ini direkomendasikan untuk diamalkan?
   - Apa yang harus diambil dan apa yang harus dihindari?
   - Saran praktis untuk implementasi

PENTING:
- Prioritaskan validasi syariat (Qur'an & Hadis Shahih) terlebih dahulu
- Berikan koreksi dengan bahasa yang sopan dan edukatif
- Fokus pada hal yang praktis dan bisa diamalkan
- Jika ragu, lebih baik menyarankan konsultasi dengan ustadz/praktisi
- Format output dalam poin-poin yang jelas, terstruktur, dan mudah dibaca`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ Analisis selesai, panjang:", text.length, "karakter");

    // Return response with metadata
    res.json({
      success: true,
      summary: text,
      youtubeUrl: youtubeUrl,
      videoId: videoId,
      hasTranscript: hasTranscript,
      transcriptLength: hasTranscript ? transcript.length : 0,
      source: hasTranscript ? "auto-transcript" : "user-notes",
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
      const isPerMinute = error.message.includes("per minute") || error.message.includes("RPM");
      const isDaily = error.message.includes("per day") || error.message.includes("RPD");

      let quotaType = "API quota";
      let waitTime = "beberapa menit";
      let details = "Tunggu dan coba lagi";

      if (isPerMinute) {
        quotaType = "Per-minute quota (15 RPM)";
        waitTime = "60 detik";
        details = "Free tier: 15 requests per menit. Tunggu 1 menit lalu coba lagi.";
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
        aiAdvisor: "POST /api/ai-advisor",
      },
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log("🚀 Docterbee Backend Server");
  console.log(`📡 Server berjalan di http://localhost:${PORT}`);
  console.log(`🔑 Gemini API: ${genAI ? "✅ Configured" : "⚠️  Not configured"}`);
  console.log("⏳ Menunggu request...\n");
});
