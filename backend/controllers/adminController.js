import VisitRequest from '../models/VisitRequest.js';
import Security from '../models/Security.js';
import SecurityLog from '../models/SecurityLog.js';
import Visitor from '../models/Visitor.js';
import Settings from '../models/Settings.js';
import { generateQRCode } from '../utils/qrService.js';
import { sendEmail, emailTemplates } from '../config/email.js';
import {
    successResponse,
    errorResponse,
    notFoundResponse,
} from '../utils/responseHandler.js';

/**
 * @route   GET /api/admin/requests
 * @desc    Get all visit requests with filters
 * @access  Private (Admin)
 */
export const getAllRequests = async (req, res) => {
    try {
        const { status, department, date, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) query.status = status;
        if (department) query.department = department;
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.visitDate = { $gte: startDate, $lte: endDate };
        }

        const requests = await VisitRequest.find(query)
            .populate('visitor', 'name email phone')
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
        console.error('Get all requests error:', error);
        return errorResponse(res, 'Failed to fetch requests', 500);
    }
};

/**
 * @route   PUT /api/admin/request/:id/approve
 * @desc    Approve a visit request and generate QR code
 * @access  Private (Admin)
 */
export const approveRequest = async (req, res) => {
    try {
        const { validityHours, remarks } = req.body;

        const visitRequest = await VisitRequest.findById(req.params.id).populate(
            'visitor',
            'name email'
        );

        if (!visitRequest) {
            return notFoundResponse(res, 'Visit request');
        }

        if (visitRequest.status !== 'pending') {
            return errorResponse(res, 'Only pending requests can be approved', 400);
        }

        // Get default validity from settings or use provided value
        const settings = await Settings.findOne();
        const qrValidity = validityHours || settings?.qrValidityHours || 24;

        visitRequest.validityHours = qrValidity;

        // Generate QR code
        const qrData = await generateQRCode(visitRequest);

        // Update request
        visitRequest.status = 'approved';
        visitRequest.qrCode = qrData;
        visitRequest.approvedBy = req.user.id;
        visitRequest.approvedAt = new Date();
        if (remarks) visitRequest.adminRemarks = remarks;

        await visitRequest.save();

        // Send approval email
        if (visitRequest.visitor && visitRequest.visitor.email) {
            const emailTemplate = emailTemplates.requestApproved(
                visitRequest.visitor.name,
                visitRequest.purpose,
                visitRequest.visitDate,
                qrData.dataURL
            );
            await sendEmail(visitRequest.visitor.email, emailTemplate);
        }

        await visitRequest.populate('approvedBy', 'name email');

        return successResponse(res, visitRequest, 'Request approved successfully');
    } catch (error) {
        console.error('Approve request error:', error);
        return errorResponse(res, error.message || 'Failed to approve request', 500);
    }
};

/**
 * @route   PUT /api/admin/request/:id/reject
 * @desc    Reject a visit request
 * @access  Private (Admin)
 */
export const rejectRequest = async (req, res) => {
    try {
        const { remarks } = req.body;

        const visitRequest = await VisitRequest.findById(req.params.id).populate(
            'visitor',
            'name email'
        );

        if (!visitRequest) {
            return notFoundResponse(res, 'Visit request');
        }

        if (visitRequest.status !== 'pending') {
            return errorResponse(res, 'Only pending requests can be rejected', 400);
        }

        visitRequest.status = 'rejected';
        visitRequest.rejectedAt = new Date();
        visitRequest.adminRemarks = remarks || 'Request rejected';

        await visitRequest.save();

        // Send rejection email
        if (visitRequest.visitor && visitRequest.visitor.email) {
            const emailTemplate = emailTemplates.requestRejected(
                visitRequest.visitor.name,
                visitRequest.purpose,
                visitRequest.visitDate,
                remarks
            );
            await sendEmail(visitRequest.visitor.email, emailTemplate);
        }

        return successResponse(res, visitRequest, 'Request rejected successfully');
    } catch (error) {
        console.error('Reject request error:', error);
        return errorResponse(res, error.message || 'Failed to reject request', 500);
    }
};

/**
 * @route   GET /api/admin/analytics
 * @desc    Get dashboard analytics
 * @access  Private (Admin)
 */
export const getAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = {};

        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        // Basic stats
        const stats = {
            totalRequests: await VisitRequest.countDocuments(dateFilter),
            pendingRequests: await VisitRequest.countDocuments({
                ...dateFilter,
                status: 'pending',
            }),
            approvedRequests: await VisitRequest.countDocuments({
                ...dateFilter,
                status: 'approved',
            }),
            rejectedRequests: await VisitRequest.countDocuments({
                ...dateFilter,
                status: 'rejected',
            }),
            totalVisitors: await Visitor.countDocuments(),
            activeVisitors: await VisitRequest.countDocuments({
                status: 'approved',
                'entry.scannedAt': { $exists: true },
                'exit.scannedAt': { $exists: false },
            }),
        };

        // Department-wise requests
        const departmentStats = await VisitRequest.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        // Status-wise requests
        const statusStats = await VisitRequest.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        // Daily requests (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyStats = await VisitRequest.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        return successResponse(res, {
            stats,
            departmentStats,
            statusStats,
            dailyStats,
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        return errorResponse(res, 'Failed to fetch analytics', 500);
    }
};

/**
 * @route   GET /api/admin/visitor-logs
 * @desc    Get security logs with visitor entry/exit details
 * @access  Private (Admin)
 */
export const getVisitorLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, action, gate, date } = req.query;

        const query = {};
        if (action) query.action = action;
        if (gate) query.gate = gate;
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.scanTime = { $gte: startDate, $lte: endDate };
        }

        const logs = await SecurityLog.find(query)
            .populate({
                path: 'visitRequest',
                populate: { path: 'visitor', select: 'name email phone' },
            })
            .populate('scannedBy', 'name employeeId')
            .sort({ scanTime: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await SecurityLog.countDocuments(query);

        return successResponse(res, {
            logs,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            total,
        });
    } catch (error) {
        console.error('Get visitor logs error:', error);
        return errorResponse(res, 'Failed to fetch visitor logs', 500);
    }
};

/**
 * @route   POST /api/admin/security
 * @desc    Create a new security guard
 * @access  Private (Admin)
 */
export const createSecurityUser = async (req, res) => {
    try {
        const { name, employeeId, email, phone, password, shift, gateAssignment } = req.body;

        const security = await Security.create({
            name,
            employeeId,
            email,
            phone,
            password,
            shift,
            gateAssignment,
        });

        return successResponse(res, security, 'Security user created successfully', 201);
    } catch (error) {
        console.error('Create security user error:', error);
        return errorResponse(res, error.message || 'Failed to create security user', 500);
    }
};

/**
 * @route   GET /api/admin/security
 * @desc    Get all security guards
 * @access  Private (Admin)
 */
export const getAllSecurity = async (req, res) => {
    try {
        const { isActive, shift, page = 1, limit = 20 } = req.query;

        const query = {};
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (shift) query.shift = shift;

        const securityUsers = await Security.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Security.countDocuments(query);

        return successResponse(res, {
            securityUsers,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            total,
        });
    } catch (error) {
        console.error('Get security users error:', error);
        return errorResponse(res, 'Failed to fetch security users', 500);
    }
};

/**
 * @route   PUT /api/admin/security/:id
 * @desc    Update security guard details
 * @access  Private (Admin)
 */
export const updateSecurityUser = async (req, res) => {
    try {
        const { name, phone, shift, gateAssignment, isActive } = req.body;

        const security = await Security.findByIdAndUpdate(
            req.params.id,
            { name, phone, shift, gateAssignment, isActive },
            { new: true, runValidators: true }
        ).select('-password');

        if (!security) {
            return notFoundResponse(res, 'Security user');
        }

        return successResponse(res, security, 'Security user updated successfully');
    } catch (error) {
        console.error('Update security user error:', error);
        return errorResponse(res, error.message || 'Failed to update security user', 500);
    }
};

/**
 * @route   DELETE /api/admin/security/:id
 * @desc    Delete security guard
 * @access  Private (Admin/Superadmin)
 */
export const deleteSecurityUser = async (req, res) => {
    try {
        const security = await Security.findByIdAndDelete(req.params.id);

        if (!security) {
            return notFoundResponse(res, 'Security user');
        }

        return successResponse(res, null, 'Security user deleted successfully');
    } catch (error) {
        console.error('Delete security user error:', error);
        return errorResponse(res, 'Failed to delete security user', 500);
    }
};

/**
 * @route   PUT /api/admin/settings/qr-validity
 * @desc    Configure QR validity duration
 * @access  Private (Admin)
 */
export const updateQRValidity = async (req, res) => {
    try {
        const { validityHours } = req.body;

        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create({ qrValidityHours: validityHours });
        } else {
            settings.qrValidityHours = validityHours;
            await settings.save();
        }

        return successResponse(res, settings, 'QR validity updated successfully');
    } catch (error) {
        console.error('Update QR validity error:', error);
        return errorResponse(res, error.message || 'Failed to update QR validity', 500);
    }
};

/**
 * @route   GET /api/admin/settings
 * @desc    Get system settings
 * @access  Private (Admin)
 */
export const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create({});
        }

        return successResponse(res, settings);
    } catch (error) {
        console.error('Get settings error:', error);
        return errorResponse(res, 'Failed to fetch settings', 500);
    }
};

export default {
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
};
