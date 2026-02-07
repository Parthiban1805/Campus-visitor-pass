import jwt from 'jsonwebtoken';
import Visitor from '../models/Visitor.js';
import Admin from '../models/Admin.js';
import Security from '../models/Security.js';
import { unauthorizedResponse, forbiddenResponse } from '../utils/responseHandler.js';

/**
 * Authenticate user with JWT token
 */
export const authenticate = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return unauthorizedResponse(res, 'No authentication token provided');
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request
        req.user = {
            id: decoded.id,
            role: decoded.role,
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return unauthorizedResponse(res, 'Invalid token');
        }
        if (error.name === 'TokenExpiredError') {
            return unauthorizedResponse(res, 'Token has expired');
        }
        return unauthorizedResponse(res, 'Authentication failed');
    }
};

/**
 * Authorize specific roles
 */
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return forbiddenResponse(
                res,
                `Access denied. Required role(s): ${roles.join(', ')}`
            );
        }
        next();
    };
};

/**
 * Get current user details based on role
 */
export const getCurrentUser = async (req, res, next) => {
    try {
        let user;

        switch (req.user.role) {
            case 'visitor':
                user = await Visitor.findById(req.user.id).select('-password');
                break;
            case 'admin':
            case 'superadmin':
                user = await Admin.findById(req.user.id).select('-password');
                break;
            case 'security':
                user = await Security.findById(req.user.id).select('-password');
                break;
            default:
                return unauthorizedResponse(res, 'Invalid user role');
        }

        if (!user || !user.isActive) {
            return unauthorizedResponse(res, 'User not found or inactive');
        }

        req.currentUser = user;
        next();
    } catch (error) {
        return unauthorizedResponse(res, 'Failed to fetch user details');
    }
};

/**
 * Generate JWT token
 */
export const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

export default {
    authenticate,
    authorizeRoles,
    getCurrentUser,
    generateToken,
};
