import VisitRequest from '../models/VisitRequest.js';
import Visitor from '../models/Visitor.js';
import { sendEmail, emailTemplates } from '../config/email.js';
import {
    successResponse,
    errorResponse,
    notFoundResponse,
} from '../utils/responseHandler.js';

/**
 * @route   POST /api/visitor/request
 * @desc    Submit a new visit request
 * @access  Private (Visitor)
 */
export const submitVisitRequest = async (req, res) => {
    try {
        const {
            purpose,
            department,
            personToMeet,
            visitDate,
            timeSlot,
            additionalNotes,
        } = req.body;

        // Create visit request
        const visitRequest = await VisitRequest.create({
            visitor: req.user.id,
            purpose,
            department,
            personToMeet,
            visitDate,
            timeSlot,
            additionalNotes,
            status: 'pending',
        });

        // Populate visitor details
        await visitRequest.populate('visitor', 'name email phone');

        // Update visitor's visit history
        await Visitor.findByIdAndUpdate(req.user.id, {
            $push: { visitHistory: visitRequest._id },
        });

        // Send email notification
        const visitor = await Visitor.findById(req.user.id);
        if (visitor && visitor.email) {
            const emailTemplate = emailTemplates.requestSubmitted(
                visitor.name,
                purpose,
                visitDate
            );
            await sendEmail(visitor.email, emailTemplate);
        }

        return successResponse(
            res,
            visitRequest,
            'Visit request submitted successfully',
            201
        );
    } catch (error) {
        console.error('Submit visit request error:', error);
        return errorResponse(res, error.message || 'Failed to submit request', 500);
    }
};

/**
 * @route   GET /api/visitor/requests
 * @desc    Get all visit requests for the logged-in visitor
 * @access  Private (Visitor)
 */
export const getMyRequests = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const query = { visitor: req.user.id };
        if (status) {
            query.status = status;
        }

        const requests = await VisitRequest.find(query)
            .populate('approvedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await VisitRequest.countDocuments(query);

        return successResponse(res, {
            requests,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            total,
        });
    } catch (error) {
        console.error('Get requests error:', error);
        return errorResponse(res, 'Failed to fetch requests', 500);
    }
};

/**
 * @route   GET /api/visitor/request/:id
 * @desc    Get a specific visit request details
 * @access  Private (Visitor)
 */
export const getRequestDetails = async (req, res) => {
    try {
        const visitRequest = await VisitRequest.findOne({
            _id: req.params.id,
            visitor: req.user.id,
        })
            .populate('visitor', 'name email phone')
            .populate('approvedBy', 'name email')
            .populate('entry.scannedBy', 'name employeeId')
            .populate('exit.scannedBy', 'name employeeId');

        if (!visitRequest) {
            return notFoundResponse(res, 'Visit request');
        }

        return successResponse(res, visitRequest);
    } catch (error) {
        console.error('Get request details error:', error);
        return errorResponse(res, 'Failed to fetch request details', 500);
    }
};

/**
 * @route   GET /api/visitor/history
 * @desc    Get visit history with entry/exit records
 * @access  Private (Visitor)
 */
export const getVisitHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const history = await VisitRequest.find({
            visitor: req.user.id,
            status: 'approved',
            'entry.scannedAt': { $exists: true },
        })
            .populate('entry.scannedBy', 'name')
            .populate('exit.scannedBy', 'name')
            .sort({ 'entry.scannedAt': -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await VisitRequest.countDocuments({
            visitor: req.user.id,
            status: 'approved',
            'entry.scannedAt': { $exists: true },
        });

        return successResponse(res, {
            history,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            total,
        });
    } catch (error) {
        console.error('Get visit history error:', error);
        return errorResponse(res, 'Failed to fetch visit history', 500);
    }
};

/**
 * @route   GET /api/visitor/profile
 * @desc    Get visitor profile
 * @access  Private (Visitor)
 */
export const getProfile = async (req, res) => {
    try {
        const visitor = await Visitor.findById(req.user.id)
            .select('-password')
            .populate('visitHistory');

        if (!visitor) {
            return notFoundResponse(res, 'Visitor');
        }

        // Get statistics
        const stats = {
            totalRequests: await VisitRequest.countDocuments({ visitor: req.user.id }),
            approvedRequests: await VisitRequest.countDocuments({
                visitor: req.user.id,
                status: 'approved',
            }),
            pendingRequests: await VisitRequest.countDocuments({
                visitor: req.user.id,
                status: 'pending',
            }),
            rejectedRequests: await VisitRequest.countDocuments({
                visitor: req.user.id,
                status: 'rejected',
            }),
        };

        return successResponse(res, {
            visitor,
            stats,
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return errorResponse(res, 'Failed to fetch profile', 500);
    }
};

/**
 * @route   PUT /api/visitor/profile
 * @desc    Update visitor profile
 * @access  Private (Visitor)
 */
export const updateProfile = async (req, res) => {
    try {
        const { name, phone, address, identification } = req.body;

        const visitor = await Visitor.findByIdAndUpdate(
            req.user.id,
            { name, phone, address, identification },
            { new: true, runValidators: true }
        ).select('-password');

        if (!visitor) {
            return notFoundResponse(res, 'Visitor');
        }

        return successResponse(res, visitor, 'Profile updated successfully');
    } catch (error) {
        console.error('Update profile error:', error);
        return errorResponse(res, error.message || 'Failed to update profile', 500);
    }
};



/**
 * @route   POST /api/visitor/upload-document
 * @desc    Upload identification document
 * @access  Private (Visitor)
 */
export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return errorResponse(res, 'No file uploaded', 400);
        }

        const documentUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        const visitor = await Visitor.findById(req.user.id);
        if (!visitor) {
            return notFoundResponse(res, 'Visitor');
        }

        // Initialize identification if not present
        if (!visitor.identification) {
            visitor.identification = {};
        }

        visitor.identification.documentUrl = documentUrl;
        await visitor.save();

        return successResponse(res, { documentUrl }, 'Document uploaded successfully');
    } catch (error) {
        console.error('Upload document error:', error);
        return errorResponse(res, 'Failed to upload document', 500);
    }
};

export default {
    submitVisitRequest,
    getMyRequests,
    getRequestDetails,
    getVisitHistory,
    getProfile,
    updateProfile,
    uploadDocument,
};
