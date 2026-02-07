import express from 'express';
import { body } from 'express-validator';
import {
    getAllRequests,
    approveRequest,
    rejectRequest,
    getAnalytics,
    getVisitorLogs,
    createSecurityUser,
    getAllSecurity,
    updateSecurityUser,
    deleteSecurityUser,
    updateQRValidity,
    getSettings,
} from '../controllers/adminController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import validate from '../middleware/validator.js';

const router = express.Router();

// All admin routes require authentication
router.use(authenticate);
router.use(authorizeRoles('admin', 'superadmin'));

/**
 * Visit Request Management Routes
 */

// Get all visit requests with filters
router.get('/requests', getAllRequests);

// Approve visit request
router.put(
    '/request/:id/approve',
    [
        body('validityHours')
            .optional()
            .isInt({ min: 1, max: 168 })
            .withMessage('Validity hours must be between 1 and 168'),
        body('remarks').optional().trim(),
    ],
    validate,
    approveRequest
);

// Reject visit request
router.put(
    '/request/:id/reject',
    [body('remarks').optional().trim()],
    validate,
    rejectRequest
);

/**
 * Analytics & Logs Routes
 */

// Get dashboard analytics
router.get('/analytics', getAnalytics);

// Get visitor logs (entry/exit records)
router.get('/visitor-logs', getVisitorLogs);

/**
 * Security User Management Routes
 */

// Create security user
router.post(
    '/security',
    [
        body('name').notEmpty().trim().withMessage('Name is required'),
        body('employeeId').notEmpty().trim().withMessage('Employee ID is required'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('phone')
            .matches(/^[0-9]{10}$/)
            .withMessage('Valid 10-digit phone number is required'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
        body('shift').optional().isIn(['Morning', 'Afternoon', 'Evening', 'Night']),
        body('gateAssignment').optional(),
    ],
    validate,
    createSecurityUser
);

// Get all security users
router.get('/security', getAllSecurity);

// Update security user
router.put(
    '/security/:id',
    [
        body('name').optional().notEmpty().trim(),
        body('phone')
            .optional()
            .matches(/^[0-9]{10}$/)
            .withMessage('Valid 10-digit phone number is required'),
        body('shift').optional().isIn(['Morning', 'Afternoon', 'Evening', 'Night']),
        body('isActive').optional().isBoolean(),
    ],
    validate,
    updateSecurityUser
);

// Delete security user
router.delete('/security/:id', deleteSecurityUser);

/**
 * Settings Routes
 */

// Get settings
router.get('/settings', getSettings);

// Update QR validity configuration
router.put(
    '/settings/qr-validity',
    [
        body('validityHours')
            .isInt({ min: 1, max: 168 })
            .withMessage('Validity hours must be between 1 and 168'),
    ],
    validate,
    updateQRValidity
);

export default router;
