import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect middleware:
 * Extracts Bearer token from Authorization header, verifies signature and expiry,
 * retrieves the active user from the database, and attaches it to req.user.
 */
export const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: No authentication token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'imovies_fallback_dev_secret_key_32chars');

    // Retrieve user from database to ensure account still exists and is active
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: User account no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Token has expired, please log in again',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed: Invalid or malformed token',
    });
  }
};

/**
 * Role-Based Access Control (RBAC) middleware:
 * Restricts access to users having one of the authorized roles.
 * Must be used AFTER protect middleware.
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires ${roles.join(' or ')} privileges`,
      });
    }

    next();
  };
};
