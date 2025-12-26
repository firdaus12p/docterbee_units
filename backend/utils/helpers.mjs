/**
 * Backend Shared Helpers
 * Extracted utilities to avoid code duplication across route files
 *
 * @module backend/utils/helpers
 */

import crypto from "crypto";

/**
 * Generate unique order number with date prefix
 * Format: ORD-YYYYMMDD-XXXXXX
 * @returns {string} Unique order number
 */
export function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `ORD-${year}${month}${day}-${random}`;
}

/**
 * Calculate expiry time based on order type
 * @param {string} orderType - 'dine_in' or 'take_away'
 * @returns {Date} Expiry timestamp
 */
export function calculateExpiryTime(orderType) {
  const now = new Date();
  if (orderType === "dine_in") {
    now.setMinutes(now.getMinutes() + 30);
  } else {
    now.setHours(now.getHours() + 2);
  }
  return now;
}

/**
 * Calculate points earned from order amount
 * 1 point per 10,000 IDR
 * @param {number} totalAmount - Total order amount in IDR
 * @returns {number} Points earned
 */
export function calculatePoints(totalAmount) {
  return Math.floor(totalAmount / 10000);
}
