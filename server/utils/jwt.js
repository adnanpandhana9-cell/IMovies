import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const getSecret = () => process.env.JWT_SECRET || 'imovies_fallback_dev_secret_key_32chars';

/**
 * Generates a signed JSON Web Token (JWT) containing essential user claims.
 * @param {Object} user - Mongoose User document or plain object containing _id, email, and role.
 * @returns {string} Signed JWT string.
 */
export const generateToken = (user) => {
  const payload = {
    id: user._id ? user._id.toString() : user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, getSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

/**
 * Synchronously verifies a JWT token against JWT_SECRET.
 * Throws JsonWebTokenError or TokenExpiredError on failure.
 * @param {string} token - The raw JWT token string.
 * @returns {Object} Decoded payload.
 */
export const verifyToken = (token) => {
  return jwt.verify(token, getSecret());
};
