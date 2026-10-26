import express from 'express';
import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from '../controllers/movieController.js';
import {
  validateMovie,
  validateMovieId,
} from '../validators/movieValidators.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getMovies);
router.get('/:id', validateMovieId, getMovieById);

// Admin-only protected CRUD routes
router.post('/', protect, authorize('ADMIN'), validateMovie, createMovie);
router.put('/:id', protect, authorize('ADMIN'), validateMovieId, validateMovie, updateMovie);
router.delete('/:id', protect, authorize('ADMIN'), validateMovieId, deleteMovie);

export default router;
