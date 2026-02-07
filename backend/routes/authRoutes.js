import express from 'express';
import { body } from 'express-validator';
import {
    registerVisitor,
    loginVisitor,
    loginAdmin,
    loginSecurity,
} from '../controllers/authController.js';
import validate from '../middleware/validator.js';

const router = express.Router();

/**
 * Visitor Authentication Routes
 */

// Register visitor
router.post(
    '/visitor/register',
    [
        body('name').notEmpty().trim().withMessage('Name is required'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('phone')
            .matches(/^[0-9]{10}$/)
            .withMessage('Valid 10-digit phone number is required'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
    ],
    validate,
    registerVisitor
);

// Login visitor
router.post(
    '/visitor/login',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    validate,
    loginVisitor
);

/**
 * Admin Authentication Routes
 */

// Login admin
router.post(
    '/admin/login',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    validate,
    loginAdmin
);

/**
 * Security Authentication Routes
 */

// Login security
router.post(
    '/security/login',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    validate,
    loginSecurity
);

export default router;
