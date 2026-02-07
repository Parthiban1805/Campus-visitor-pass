import Visitor from '../models/Visitor.js';
import Admin from '../models/Admin.js';
import Security from '../models/Security.js';
import { generateToken } from '../middleware/auth.js';
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
} from '../utils/responseHandler.js';

/**
 * @route   POST /api/auth/visitor/register
 * @desc    Register a new visitor
 * @access  Public
 */
export const registerVisitor = async (req, res) => {
    try {
        const { name, email, phone, password, address, identification } = req.body;

        // Check if visitor already exists
        const existingVisitor = await Visitor.findOne({ $or: [{ email }, { phone }] });
        if (existingVisitor) {
            return errorResponse(res, 'Email or phone number already registered', 400);
        }

        // Create visitor
        const visitor = await Visitor.create({
            name,
            email,
            phone,
            password,
            address,
            identification,
        });

        // Generate token
        const token = generateToken(visitor._id, 'visitor');

        return successResponse(
            res,
            {
                user: visitor,
                token,
            },
            'Registration successful',
            201
        );
    } catch (error) {
        console.error('Visitor registration error:', error);
        return errorResponse(res, error.message || 'Registration failed', 500);
    }
};

/**
 * @route   POST /api/auth/visitor/login
 * @desc    Login visitor
 * @access  Public
 */
export const loginVisitor = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find visitor and include password
        const visitor = await Visitor.findOne({ email }).select('+password');

        if (!visitor) {
            return unauthorizedResponse(res, 'Invalid email or password');
        }

        if (!visitor.isActive) {
            return unauthorizedResponse(res, 'Account is inactive. Please contact admin.');
        }

        // Check password
        const isPasswordMatch = await visitor.comparePassword(password);
        if (!isPasswordMatch) {
            return unauthorizedResponse(res, 'Invalid email or password');
        }

        // Remove password from response
        visitor.password = undefined;

        // Generate token
        const token = generateToken(visitor._id, 'visitor');

        return successResponse(res, {
            user: visitor,
            token,
        });
    } catch (error) {
        console.error('Visitor login error:', error);
        return errorResponse(res, 'Login failed', 500);
    }
};

/**
 * @route   POST /api/auth/admin/login
 * @desc    Login admin
 * @access  Public
 */
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin and include password
        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin) {
            return unauthorizedResponse(res, 'Invalid credentials');
        }

        if (!admin.isActive) {
            return unauthorizedResponse(res, 'Account is inactive');
        }

        // Check password
        const isPasswordMatch = await admin.comparePassword(password);
        if (!isPasswordMatch) {
            return unauthorizedResponse(res, 'Invalid credentials');
        }

        // Remove password from response
        admin.password = undefined;

        // Generate token with admin role
        const token = generateToken(admin._id, admin.role);

        return successResponse(res, {
            user: admin,
            token,
        });
    } catch (error) {
        console.error('Admin login error:', error);
        return errorResponse(res, 'Login failed', 500);
    }
};

/**
 * @route   POST /api/auth/security/login
 * @desc    Login security guard
 * @access  Public
 */
export const loginSecurity = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find security guard and include password
        const security = await Security.findOne({ email }).select('+password');

        if (!security) {
            return unauthorizedResponse(res, 'Invalid credentials');
        }

        if (!security.isActive) {
            return unauthorizedResponse(res, 'Account is inactive');
        }

        // Check password
        const isPasswordMatch = await security.comparePassword(password);
        if (!isPasswordMatch) {
            return unauthorizedResponse(res, 'Invalid credentials');
        }

        // Update last login
        security.lastLogin = new Date();
        await security.save();

        // Remove password from response
        security.password = undefined;

        // Generate token
        const token = generateToken(security._id, 'security');

        return successResponse(res, {
            user: security,
            token,
        });
    } catch (error) {
        console.error('Security login error:', error);
        return errorResponse(res, 'Login failed', 500);
    }
};

export default {
    registerVisitor,
    loginVisitor,
    loginAdmin,
    loginSecurity,
};
