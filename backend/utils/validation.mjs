/**
 * Backend Validation Helpers
 * Centralized validation logic to avoid duplication across routes
 * 
 * @module backend/utils/validation
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum length (default 6)
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validatePassword(password, minLength = 6) {
  if (!password) {
    return { valid: false, error: "Password harus diisi" };
  }
  if (password.length < minLength) {
    return { valid: false, error: `Password minimal ${minLength} karakter` };
  }
  return { valid: true };
}

/**
 * Validate required fields in request body
 * @param {object} body - Request body
 * @param {string[]} requiredFields - Array of required field names
 * @returns {{valid: boolean, missing?: string[]}} Validation result
 */
export function validateRequired(body, requiredFields) {
  const missing = requiredFields.filter(
    (field) => body[field] === undefined || body[field] === null || body[field] === ""
  );
  
  if (missing.length > 0) {
    return { valid: false, missing };
  }
  return { valid: true };
}

/**
 * Validate value is in allowed list
 * @param {string} value - Value to check
 * @param {string[]} allowedValues - List of allowed values
 * @returns {boolean} True if value is allowed
 */
export function isAllowedValue(value, allowedValues) {
  return allowedValues.includes(value);
}

/**
 * Validate Indonesian phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid format
 */
export function isValidPhone(phone) {
  // Accept: 08xxx, +628xxx, 628xxx formats
  const phoneRegex = /^(\+?62|0)8[1-9][0-9]{7,11}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ""));
}
