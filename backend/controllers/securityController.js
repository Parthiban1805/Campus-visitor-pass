import VisitRequest from '../models/VisitRequest.js';
import SecurityLog from '../models/SecurityLog.js';
import { validateQRCode } from '../utils/qrService.js';
import {
    successResponse,
    errorResponse,
    notFoundResponse,
} from '../utils/responseHandler.js';

/**
 * @route   POST /api/security/scan
 * @desc    Scan and validate QR code
 * @access  Private (Security)
 */
export const scanQRCode = async (req, res) => {
    try {
        const { qrData, gate } = req.body;

        // Validate QR code
        const validation = validateQRCode(qrData);

        if (!validation.valid) {
            // Log failed scan attempt
            await SecurityLog.create({
                visitRequest: null,
                scannedBy: req.user.id,
                action: 'scan_attempt',
                scanTime: new Date(),
                gate,
                status: 'failed',
                failureReason: validation.reason,
            });

            return errorResponse(res, validation.message, 400);
        }

        // Get visit request details
        const visitRequest = await VisitRequest.findById(
            validation.data.requestId
        ).populate('visitor', 'name email phone identification');

        if (!visitRequest) {
            return notFoundResponse(res, 'Visit request');
        }

        // Check if request is approved
        if (visitRequest.status !== 'approved') {
            await SecurityLog.create({
                visitRequest: visitRequest._id,
                scannedBy: req.user.id,
                action: 'scan_attempt',
                scanTime: new Date(),
                gate,
                status: 'failed',
                failureReason: 'not_approved',
            });

            return errorResponse(res, 'Visit request is not approved', 400);
        }

        // Check if QR has expired
        if (!visitRequest.isQRValid) {
            await SecurityLog.create({
                visitRequest: visitRequest._id,
                scannedBy: req.user.id,
                action: 'scan_attempt',
                scanTime: new Date(),
                gate,
                status: 'failed',
                failureReason: 'qr_expired',
            });

            return errorResponse(res, 'QR code has expired', 400);
        }

        // Check if visitor has already entered (for entry scan)
        if (visitRequest.entry.scannedAt && !visitRequest.exit.scannedAt) {
            return errorResponse(
                res,
                'Visitor has already entered. Use exit scan to log exit.',
                400
            );
        }

        // Return scan result with visitor details
        return successResponse(res, {
            visitRequest,
            validation: {
                isValid: true,
                message: 'QR code is valid',
            },
            canEnter: !visitRequest.entry.scannedAt,
            canExit: visitRequest.entry.scannedAt && !visitRequest.exit.scannedAt,
        });
    } catch (error) {
        console.error('Scan QR code error:', error);
        return errorResponse(res, error.message || 'Failed to scan QR code', 500);
    }
};

/**
 * @route   POST /api/security/log-entry
 * @desc    Log visitor entry
 * @access  Private (Security)
 */
export const logEntry = async (req, res) => {
    try {
        const { requestId, gate } = req.body;

        const visitRequest = await VisitRequest.findById(requestId).populate(
            'visitor',
            'name email phone'
        );

        if (!visitRequest) {
            return notFoundResponse(res, 'Visit request');
        }

        // Check if already entered
        if (visitRequest.entry.scannedAt) {
            return errorResponse(res, 'Entry already logged for this visitor', 400);
        }

        // Update entry details
        visitRequest.entry = {
            scannedBy: req.user.id,
            scannedAt: new Date(),
            gate,
        };

        await visitRequest.save();

        // Create security log
        await SecurityLog.create({
            visitRequest: visitRequest._id,
            scannedBy: req.user.id,
            action: 'entry',
            scanTime: new Date(),
            gate,
            status: 'success',
        });

        await visitRequest.populate('entry.scannedBy', 'name employeeId');

        return successResponse(res, visitRequest, 'Entry logged successfully');
    } catch (error) {
        console.error('Log entry error:', error);
        return errorResponse(res, error.message || 'Failed to log entry', 500);
    }
};

/**
 * @route   POST /api/security/log-exit
 * @desc    Log visitor exit
 * @access  Private (Security)
 */
export const logExit = async (req, res) => {
    try {
        const { requestId, gate } = req.body;

        const visitRequest = await VisitRequest.findById(requestId).populate(
            'visitor',
            'name email phone'
        );

        if (!visitRequest) {
            return notFoundResponse(res, 'Visit request');
        }

        // Check if entry was logged
        if (!visitRequest.entry.scannedAt) {
            return errorResponse(res, 'No entry record found. Cannot log exit.', 400);
        }

        // Check if already exited
        if (visitRequest.exit.scannedAt) {
            return errorResponse(res, 'Exit already logged for this visitor', 400);
        }

        // Update exit details
        visitRequest.exit = {
            scannedBy: req.user.id,
            scannedAt: new Date(),
            gate,
        };

        await visitRequest.save();

        // Create security log
        await SecurityLog.create({
            visitRequest: visitRequest._id,
            scannedBy: req.user.id,
            action: 'exit',
            scanTime: new Date(),
            gate,
            status: 'success',
        });

        await visitRequest.populate('exit.scannedBy', 'name employeeId');

        return successResponse(res, visitRequest, 'Exit logged successfully');
    } catch (error) {
        console.error('Log exit error:', error);
        return errorResponse(res, error.message || 'Failed to log exit', 500);
    }
};

/**
 * @route   GET /api/security/history
 * @desc    Get scan history for the logged-in security guard
 * @access  Private (Security)
 */
export const getScanHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20, action, date } = req.query;

        const query = { scannedBy: req.user.id };
        if (action) query.action = action;
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
            .sort({ scanTime: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await SecurityLog.countDocuments(query);

        // Get today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStats = {
            totalScans: await SecurityLog.countDocuments({
                scannedBy: req.user.id,
                scanTime: { $gte: today },
            }),
            entries: await SecurityLog.countDocuments({
                scannedBy: req.user.id,
                action: 'entry',
                scanTime: { $gte: today },
            }),
            exits: await SecurityLog.countDocuments({
                scannedBy: req.user.id,
                action: 'exit',
                scanTime: { $gte: today },
            }),
        };

        return successResponse(res, {
            logs,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            total,
            todayStats,
        });
    } catch (error) {
        console.error('Get scan history error:', error);
        return errorResponse(res, 'Failed to fetch scan history', 500);
    }
};

/**
 * @route   GET /api/security/active-visitors
 * @desc    Get currently on-campus visitors (entered but not exited)
 * @access  Private (Security)
 */
export const getActiveVisitors = async (req, res) => {
    try {
        const activeVisitors = await VisitRequest.find({
            status: 'approved',
            'entry.scannedAt': { $exists: true },
            'exit.scannedAt': { $exists: false },
        })
            .populate('visitor', 'name email phone')
            .populate('entry.scannedBy', 'name employeeId')
            .sort({ 'entry.scannedAt': -1 });

        return successResponse(res, {
            activeVisitors,
            count: activeVisitors.length,
        });
    } catch (error) {
        console.error('Get active visitors error:', error);
        return errorResponse(res, 'Failed to fetch active visitors', 500);
    }
};

export default {
    scanQRCode,
    logEntry,
    logExit,
    getScanHistory,
    getActiveVisitors,
};
