/**
 * Migration: Seed default rewards
 * This migration adds the default reward options to the rewards table
 */

import { query } from "../db.mjs";

export async function up() {
  console.log("🌱 Seeding default rewards...");

  const defaultRewards = [
    {
      name: "Diskon 10%",
      description: "Dapatkan diskon 10% untuk pembelian selanjutnya",
      points_cost: 20,
      color_theme: "amber",
      sort_order: 1,
    },
    {
      name: "Konsultasi Gratis",
      description: "Sesi konsultasi kesehatan gratis 30 menit",
      points_cost: 50,
      color_theme: "emerald",
      sort_order: 2,
    },
    {
      name: "Free Product Kecil",
      description: "Pilih 1 produk kecil gratis dari store",
      points_cost: 80,
      color_theme: "purple",
      sort_order: 3,
    },
    {
      name: "Voucher Rp 50K",
      description: "Voucher belanja senilai Rp 50.000",
      points_cost: 100,
      color_theme: "sky",
      sort_order: 4,
    },
  ];

  for (const reward of defaultRewards) {
    try {
      // Check if reward already exists
      const existing = await query(
        "SELECT id FROM rewards WHERE name = ? LIMIT 1",
        [reward.name]
      );

      if (existing.length === 0) {
        await query(
          `INSERT INTO rewards (name, description, points_cost, color_theme, sort_order, is_active) 
           VALUES (?, ?, ?, ?, ?, 1)`,
          [
            reward.name,
            reward.description,
            reward.points_cost,
            reward.color_theme,
            reward.sort_order,
          ]
        );
        console.log(`  ✅ Added reward: ${reward.name}`);
      } else {
        console.log(`  ⏭️  Reward already exists: ${reward.name}`);
      }
    } catch (error) {
      console.error(`  ❌ Error adding reward ${reward.name}:`, error.message);
    }
  }

  console.log("✅ Default rewards seeding completed");
}

export async function down() {
  console.log("🔄 Rolling back default rewards...");

  const defaultRewardNames = [
    "Diskon 10%",
    "Konsultasi Gratis",
    "Free Product Kecil",
    "Voucher Rp 50K",
  ];

  for (const name of defaultRewardNames) {
    try {
      await query("DELETE FROM rewards WHERE name = ?", [name]);
      console.log(`  ✅ Removed reward: ${name}`);
    } catch (error) {
      console.error(`  ❌ Error removing reward ${name}:`, error.message);
    }
  }

  console.log("✅ Rollback completed");
}
