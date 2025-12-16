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

/**
 * Send standardized success response
 * @param {object} res - Express response object
 * @param {object} data - Response data
 * @param {string} message - Optional success message
 * @param {number} status - HTTP status code (default 200)
 */
export function sendSuccess(res, data, message = null, status = 200) {
  const response = { success: true };
  if (data !== undefined) response.data = data;
  if (message) response.message = message;
  res.status(status).json(response);
}

/**
 * Send standardized error response
 * @param {object} res - Express response object
 * @param {string} error - Error message
 * @param {number} status - HTTP status code (default 500)
 */
export function sendError(res, error, status = 500) {
  res.status(status).json({ success: false, error });
}
