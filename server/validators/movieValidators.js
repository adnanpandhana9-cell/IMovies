import { body, param, query } from 'express-validator';
import { handleValidationErrors } from './authValidators.js';

export const validateMovie = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Movie title is required')
    .isLength({ max: 120 })
    .withMessage('Title cannot exceed 120 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Movie description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('genre')
    .custom((val) => {
      if (Array.isArray(val) && val.length > 0) return true;
      if (typeof val === 'string' && val.trim().length > 0) return true;
      throw new Error('At least one genre is required');
    }),
  body('language')
    .trim()
    .notEmpty()
    .withMessage('Language is required'),
  body('duration')
    .notEmpty()
    .withMessage('Duration in minutes is required')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer in minutes'),
  body('releaseDate')
    .notEmpty()
    .withMessage('Release date is required')
    .isISO8601()
    .withMessage('Release date must be a valid date format (YYYY-MM-DD)'),
  body('posterUrl')
    .trim()
    .notEmpty()
    .withMessage('Poster image URL is required'),
  body('status')
    .optional()
    .isIn(['NOW_SHOWING', 'COMING_SOON', 'ARCHIVED'])
    .withMessage('Status must be NOW_SHOWING, COMING_SOON, or ARCHIVED'),
  handleValidationErrors,
];

export const validateMovieId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid movie ID format'),
  handleValidationErrors,
];
