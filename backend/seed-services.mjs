/**
 * Seed Services Data
 * Script untuk menambahkan contoh data services ke database
 */

import { query } from "./db.mjs";

const sampleServices = [
  {
    name: "Bekam Profesional",
    category: "manual",
    price: 150000,
    description:
      "Terapi hijamah sesuai SOP medis & hygiene. Berdasarkan hadis shahih.",
    branch: "Kolaka, Makassar",
    mode: "offline",
    practitioner: "Tim Bekam Docterbee",
    is_active: 1,
  },
  {
    name: "Pijat Refleksi",
    category: "manual",
    price: 100000,
    description:
      "Refleksi kaki & titik akupresur untuk relaksasi dan sirkulasi darah.",
    branch: "Kolaka, Makassar, Kendari",
    mode: "offline",
    practitioner: "Terapis Bersertifikat",
    is_active: 1,
  },
  {
    name: "Ahli Gizi – Praktisi Docterbee",
    category: "perawatan",
    price: 200000,
    description: "Rencana makan sesuai sunnah Nabi & prinsip biokimia nutrisi.",
    branch: "Kolaka, Makassar, Kendari",
    mode: "both",
    practitioner: "Nutritionist Docterbee",
    is_active: 1,
  },
  {
    name: "Konsultasi Kehamilan",
    category: "konsultasi",
    price: 250000,
    description: "Edukasi Quranic care untuk ibu hamil & gizi seimbang.",
    branch: "Kolaka, Makassar",
    mode: "both",
    practitioner: "Bidan & Konselor Kesehatan",
    is_active: 1,
  },
  {
    name: "Perawat – Home Care",
    category: "klinis",
    price: 300000,
    description: "Perawatan dasar di rumah, monitoring harian pasien.",
    branch: "Kolaka, Makassar",
    mode: "offline",
    practitioner: "Perawat Profesional",
    is_active: 1,
  },
  {
    name: "Psikolog – Praktisi Docterbee",
    category: "konsultasi",
    price: 350000,
    description: "Regulasi emosi, parenting Islami, dan produktivitas.",
    branch: "Kolaka, Makassar, Kendari",
    mode: "both",
    practitioner: "Psikolog Klinis",
    is_active: 1,
  },
  {
    name: "Dokter Umum",
    category: "klinis",
    price: 150000,
    description:
      "Konsultasi kesehatan umum terpadu dengan pendekatan holistik.",
    branch: "Kolaka, Makassar, Kendari",
    mode: "both",
    practitioner: "Dokter Umum Docterbee",
    is_active: 1,
  },
  {
    name: "Spesialis – Praktisi Docterbee",
    category: "klinis",
    price: 500000,
    description:
      "Kolaborasi dokter spesialis dengan Qur'anic lifestyle counseling.",
    branch: "Makassar, Kendari",
    mode: "both",
    practitioner: "Dokter Spesialis",
    is_active: 1,
  },
];

async function seedServices() {
  try {
    console.log("🌱 Seeding services data...");

    // Clear existing services (optional)
    // await query("DELETE FROM services");
    // console.log("🧹 Cleared existing services");

    // Insert sample services
    for (const service of sampleServices) {
      await query(
        `INSERT INTO services (name, category, price, description, branch, mode, practitioner, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          service.name,
          service.category,
          service.price,
          service.description,
          service.branch,
          service.mode,
          service.practitioner,
          service.is_active,
        ]
      );
      console.log(`✅ Added: ${service.name}`);
    }

    console.log(`\n🎉 Successfully seeded ${sampleServices.length} services!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding services:", error);
    process.exit(1);
  }
}

seedServices();
