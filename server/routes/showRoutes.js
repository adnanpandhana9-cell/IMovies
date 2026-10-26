import express from 'express';
import {
  getShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
} from '../controllers/showController.js';
import {
  validateShow,
  validateShowId,
} from '../validators/showValidators.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getShows);
router.get('/:id', validateShowId, getShowById);

// Admin-only management routes
router.post('/', protect, authorize('ADMIN'), validateShow, createShow);
router.put('/:id', protect, authorize('ADMIN'), validateShowId, updateShow);
router.delete('/:id', protect, authorize('ADMIN'), validateShowId, deleteShow);

export default router;
