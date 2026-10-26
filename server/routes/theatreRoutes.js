import express from 'express';
import {
  getTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
} from '../controllers/theatreController.js';
import {
  validateTheatre,
  validateTheatreId,
} from '../validators/theatreValidators.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getTheatres);
router.get('/:id', validateTheatreId, getTheatreById);

router.post('/', protect, authorize('ADMIN'), validateTheatre, createTheatre);
router.put('/:id', protect, authorize('ADMIN'), validateTheatreId, validateTheatre, updateTheatre);
router.delete('/:id', protect, authorize('ADMIN'), validateTheatreId, deleteTheatre);

export default router;
