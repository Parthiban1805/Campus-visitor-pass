/**
 * Standardized API response handlers
 */

export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

export const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};

export const validationErrorResponse = (res, errors) => {
    return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array ? errors.array() : errors,
    });
};

export const notFoundResponse = (res, resource = 'Resource') => {
    return res.status(404).json({
        success: false,
        message: `${resource} not found`,
    });
};

export const unauthorizedResponse = (res, message = 'Unauthorized access') => {
    return res.status(401).json({
        success: false,
        message,
    });
};

export const forbiddenResponse = (res, message = 'Access forbidden') => {
    return res.status(403).json({
        success: false,
        message,
    });
};

export default {
    successResponse,
    errorResponse,
    validationErrorResponse,
    notFoundResponse,
    unauthorizedResponse,
    forbiddenResponse,
};
