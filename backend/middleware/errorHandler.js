import { errorResponse } from '../utils/responseHandler.js';

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        return errorResponse(res, 'Invalid resource ID format', 400);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return errorResponse(res, `${field} already exists`, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((e) => e.message);
        return errorResponse(res, 'Validation Error', 400, errors);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return errorResponse(res, 'Invalid token', 401);
    }

    if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token expired', 401);
    }

    // Default error
    return errorResponse(
        res,
        err.message || 'Internal Server Error',
        err.statusCode || 500
    );
};

export default errorHandler;
