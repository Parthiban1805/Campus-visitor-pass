import mongoose from 'mongoose';

const securityLogSchema = new mongoose.Schema(
    {
        visitRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'VisitRequest',
            required: true,
        },
        scannedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Security',
            required: true,
        },
        action: {
            type: String,
            enum: ['entry', 'exit', 'scan_attempt'],
            required: true,
        },
        scanTime: {
            type: Date,
            default: Date.now,
            required: true,
        },
        gate: {
            type: String,
            enum: ['Main Gate', 'East Gate', 'West Gate', 'North Gate', 'South Gate'],
            required: true,
        },
        status: {
            type: String,
            enum: ['success', 'failed'],
            default: 'success',
        },
        failureReason: {
            type: String,
            enum: [
                'qr_expired',
                'qr_invalid',
                'already_entered',
                'already_exited',
                'not_approved',
                'tampered_qr',
                'other',
            ],
        },
        deviceInfo: {
            platform: String,
            version: String,
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient querying
securityLogSchema.index({ visitRequest: 1, scanTime: -1 });
securityLogSchema.index({ scannedBy: 1, scanTime: -1 });
securityLogSchema.index({ scanTime: -1 });
securityLogSchema.index({ gate: 1, scanTime: -1 });
securityLogSchema.index({ action: 1, status: 1 });

const SecurityLog = mongoose.model('SecurityLog', securityLogSchema);

export default SecurityLog;
