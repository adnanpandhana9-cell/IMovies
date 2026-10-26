import { body, param } from 'express-validator';
import { handleValidationErrors } from './authValidators.js';

export const validateTheatre = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Theatre name is required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  handleValidationErrors,
];

export const validateTheatreId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid theatre ID format'),
  handleValidationErrors,
];
