import { body, param, query } from 'express-validator';
import { handleValidationErrors } from './authValidators.js';

export const validateShow = [
  body('movie')
    .notEmpty()
    .withMessage('Movie reference is required')
    .isMongoId()
    .withMessage('Invalid movie ID format'),
  body('theatre')
    .notEmpty()
    .withMessage('Theatre reference is required')
    .isMongoId()
    .withMessage('Invalid theatre ID format'),
  body('screenName')
    .trim()
    .notEmpty()
    .withMessage('Screen name is required'),
  body('showDate')
    .notEmpty()
    .withMessage('Show date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Show date must be in YYYY-MM-DD format'),
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Start time must be in HH:MM 24-hour format'),
  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('End time must be in HH:MM 24-hour format'),
  body('ticketPrice')
    .notEmpty()
    .withMessage('Ticket price is required')
    .isFloat({ min: 0 })
    .withMessage('Ticket price must be a non-negative number'),
  handleValidationErrors,
];

export const validateShowId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid show ID format'),
  handleValidationErrors,
];
