import express from 'express';
import { body } from 'express-validator';
import {
    submitVisitRequest,
    getMyRequests,
    getRequestDetails,
    getVisitHistory,
    getProfile,
    updateProfile,
    uploadDocument,
} from '../controllers/visitorController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import validate from '../middleware/validator.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All visitor routes require authentication
router.use(authenticate);
router.use(authorizeRoles('visitor'));

/**
 * Visit Request Routes
 */

// Submit new visit request
router.post(
    '/request',
    [
        body('purpose').notEmpty().trim().withMessage('Purpose is required'),
        body('department').notEmpty().withMessage('Department is required'),
        body('visitDate').isISO8601().withMessage('Valid visit date is required'),
        body('timeSlot').notEmpty().withMessage('Time slot is required'),
    ],
    validate,
    submitVisitRequest
);

// Get all my requests
router.get('/requests', getMyRequests);

// Get specific request details
router.get('/request/:id', getRequestDetails);

/**
 * Visit History Routes
 */

// Get visit history (with entry/exit records)
router.get('/history', getVisitHistory);

/**
 * Profile Routes
 */

// Get visitor profile
router.get('/profile', getProfile);

// Update visitor profile
router.put(
    '/profile',
    [
        body('name').optional().notEmpty().trim().withMessage('Name cannot be empty'),
        body('phone')
            .optional()
            .matches(/^[0-9]{10}$/)
            .withMessage('Valid 10-digit phone number is required'),
    ],
    validate,
    updateProfile
);

// Upload identification document
router.post(
    '/upload-document',
    upload.single('document'),
    uploadDocument
);

export default router;
