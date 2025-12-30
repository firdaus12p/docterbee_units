/**
 * Member Check Routes
 * Allows users to check their membership using phone number
 *
 * Security features:
 * - Dedicated rate limiter (separate from login)
 * - Phone number validation and sanitization
 * - Partial phone number masking in response
 * - No sensitive data exposure (no password, no email)
 *
 * This module is independent and does not depend on other features
 */

import express from "express";
import { queryOne } from "../db.mjs";
import { RateLimiter } from "../utils/rate-limiter.mjs";

const router = express.Router();

// Create dedicated rate limiter for member check
// More restrictive than login: 5 attempts, 3 minute cooldown
const memberCheckRateLimiter = new RateLimiter({
  maxAttempts: 5,
  cooldownMs: 3 * 60 * 1000, // 3 minutes
});

/**
 * Validate Indonesian phone number format
 * Supports: 08xx, +628xx, 628xx formats
 * @param {string} phone - Phone number to validate
 * @returns {string|null} Normalized phone number or null if invalid
 */
function validateAndNormalizePhone(phone) {
  if (!phone || typeof phone !== "string") {
    return null;
  }

  // Remove all non-digit characters except leading +
  let cleaned = phone.trim().replace(/[^\d+]/g, "");

  // Normalize different formats to 08xx format
  if (cleaned.startsWith("+62")) {
    cleaned = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("62") && cleaned.length > 10) {
    cleaned = "0" + cleaned.slice(2);
  }

  // Must start with 08 and be between 10-15 digits (Indonesian mobile)
  const phoneRegex = /^08[1-9][0-9]{7,11}$/;
  if (!phoneRegex.test(cleaned)) {
    return null;
  }

  return cleaned;
}

/**
 * Mask phone number for privacy (show only last 4 digits)
 * @param {string} phone - Phone number to mask
 * @returns {string} Masked phone number
 */
function maskPhoneNumber(phone) {
  if (!phone || phone.length < 4) return "****";
  const visiblePart = phone.slice(-4);
  const maskedPart = "*".repeat(phone.length - 4);
  return maskedPart + visiblePart;
}

/**
 * Format date to Indonesian locale
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDateIndonesia(date) {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * POST /api/member-check
 * Check member by phone number
 *
 * Request body: { phone: string }
 * Response: { success: true, member: { name, phone (masked), card_type, member_since } }
 */
router.post("/", memberCheckRateLimiter.middleware(), async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate phone number format
    const normalizedPhone = validateAndNormalizePhone(phone);
    if (!normalizedPhone) {
      // Record failed attempt for rate limiting
      req.rateLimiter.recordFailure();
      return res.status(400).json({
        success: false,
        error: "Format nomor HP tidak valid. Gunakan format 08xxxxxxxxxx",
      });
    }

    // Query database for member (only select non-sensitive fields)
    const member = await queryOne(
      `SELECT id, name, phone, card_type, created_at 
       FROM users 
       WHERE phone = ? AND is_active = 1`,
      [normalizedPhone]
    );

    if (!member) {
      // Record failed attempt but don't reveal if phone exists or not
      req.rateLimiter.recordFailure();
      return res.status(404).json({
        success: false,
        error: "Nomor HP tidak terdaftar sebagai member aktif",
      });
    }

    // Success - reset rate limiter for this IP
    req.rateLimiter.reset();

    // Return member data with masked phone for display
    res.json({
      success: true,
      member: {
        name: member.name,
        phone: maskPhoneNumber(member.phone),
        card_type: member.card_type || "Active-Worker",
        member_since: formatDateIndonesia(member.created_at),
        member_id: `DB-${String(member.id).padStart(6, "0")}`,
      },
    });
  } catch (error) {
    console.error("[member-check] Error checking member:", error);
    res.status(500).json({
      success: false,
      error: "Terjadi kesalahan sistem. Silakan coba lagi nanti.",
    });
  }
});

/**
 * GET /api/member-check/card-types
 * Get available card types for display
 * No rate limiting needed - public static data
 */
router.get("/card-types", async (req, res) => {
  try {
    // Static card type data (independent from other modules)
    const cardTypes = [
      {
        value: "Active-Worker",
        label: "Active Worker",
        front: "/uploads/gambar_kartu/depan/Background-Active-Worker.png",
        back: "/uploads/gambar_kartu/belakang/Tampilan-Belakang-Active-Worker.png",
      },
      {
        value: "Family-Member",
        label: "Family Member",
        front: "/uploads/gambar_kartu/depan/Background-Family-Member.png",
        back: "/uploads/gambar_kartu/belakang/Tampilan-Belakang-Family-Member.png",
      },
      {
        value: "Healthy-Smart-Kids",
        label: "Healthy & Smart Kids",
        front: "/uploads/gambar_kartu/depan/Background-Healthy-&-Smart-Kids.png",
        back: "/uploads/gambar_kartu/belakang/Tampilan-Belakang-Healthy-&-Smart-Kids.png",
      },
      {
        value: "Mums-Baby",
        label: "Mums & Baby",
        front: "/uploads/gambar_kartu/depan/Background-Mums-&-Baby.png",
        back: "/uploads/gambar_kartu/belakang/Tampilan-Belakang-Mums-&-Baby.png",
      },
      {
        value: "New-Couple",
        label: "New Couple",
        front: "/uploads/gambar_kartu/depan/Background-New-Couple.png",
        back: "/uploads/gambar_kartu/belakang/Tampilan-Belakang-New-Couple.png",
      },
      {
        value: "Pregnant-Preparation",
        label: "Pregnant Preparation",
        front: "/uploads/gambar_kartu/depan/Background-Pregnant-Preparatiom.png",
        back: "/uploads/gambar_kartu/belakang/Tampilan-Belakang-Pregnant-Preparatiom.png",
      },
      {
        value: "Senja-Ceria",
        label: "Senja Ceria",
        front: "/uploads/gambar_kartu/depan/Background-Senja-Ceria.png",
        back: "/uploads/gambar_kartu/belakang/Tampilan-Belakang-Senja-Ceria.png",
      },
    ];

    res.json({
      success: true,
      data: cardTypes,
    });
  } catch (error) {
    console.error("[member-check] Error getting card types:", error);
    res.status(500).json({
      success: false,
      error: "Gagal memuat data jenis kartu",
    });
  }
});

export default router;
