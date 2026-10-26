import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../validators/authValidators.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Sensitive authentication rate limiter: 30 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

// Public authentication routes
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);

// Protected routes
router.get('/me', protect, getMe);

// Dedicated role verification check for Admin operations (used in Phase 2 tests & Admin portal)
router.get('/admin-check', protect, authorize('ADMIN'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Administrator authorization verified',
    admin: req.user,
  });
});

export default router;
