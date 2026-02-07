import express from 'express';
import { body } from 'express-validator';
import {
    scanQRCode,
    logEntry,
    logExit,
    getScanHistory,
    getActiveVisitors,
} from '../controllers/securityController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import validate from '../middleware/validator.js';

const router = express.Router();

// All security routes require authentication
router.use(authenticate);
router.use(authorizeRoles('security'));

/**
 * QR Scanning Routes
 */

// Scan and validate QR code
router.post(
    '/scan',
    [
        body('qrData').notEmpty().withMessage('QR data is required'),
        body('gate').notEmpty().withMessage('Gate is required'),
    ],
    validate,
    scanQRCode
);

/**
 * Entry/Exit Logging Routes
 */

// Log visitor entry
router.post(
    '/log-entry',
    [
        body('requestId').notEmpty().withMessage('Request ID is required'),
        body('gate').notEmpty().withMessage('Gate is required'),
    ],
    validate,
    logEntry
);

// Log visitor exit
router.post(
    '/log-exit',
    [
        body('requestId').notEmpty().withMessage('Request ID is required'),
        body('gate').notEmpty().withMessage('Gate is required'),
    ],
    validate,
    logExit
);

/**
 * History & Active Visitors Routes
 */

// Get scan history for logged-in security guard
router.get('/history', getScanHistory);

// Get currently active visitors (on campus)
router.get('/active-visitors', getActiveVisitors);

export default router;
