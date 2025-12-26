/**
 * Authentication Middleware
 * Centralized middleware for admin authentication
 *
 * Usage in route files:
 * import { requireAdmin } from '../middleware/auth.mjs';
 * router.post('/', requireAdmin, async (req, res) => { ... });
 */

/**
 * Middleware to require admin authentication
 * Use this for routes that should only be accessible by logged-in admins
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({
      success: false,
      error: "Akses ditolak. Silakan login sebagai admin.",
    });
  }
}

/**
 * Middleware to require user authentication
 * Use this for routes that should only be accessible by logged-in users
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export function requireUser(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({
      success: false,
      error: "Akses ditolak. Silakan login terlebih dahulu.",
    });
  }
}
