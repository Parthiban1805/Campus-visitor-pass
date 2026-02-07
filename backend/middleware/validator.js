import { validationResult } from 'express-validator';
import { validationErrorResponse } from '../utils/responseHandler.js';

/**
 * Validate request and return errors if any
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return validationErrorResponse(res, errors);
    }

    next();
};

export default validate;
