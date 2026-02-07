import mongoose from 'mongoose';

const visitRequestSchema = new mongoose.Schema(
    {
        visitor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Visitor',
            required: true,
        },
        purpose: {
            type: String,
            required: [true, 'Purpose of visit is required'],
            trim: true,
            maxlength: [500, 'Purpose cannot exceed 500 characters'],
        },
        department: {
            type: String,
            required: [true, 'Department is required'],
            enum: [
                'Administration',
                'Computer Science',
                'Electronics',
                'Mechanical',
                'Civil',
                'Library',
                'Hostel',
                'Sports',
                'Other',
            ],
        },
        personToMeet: {
            name: String,
            designation: String,
            contact: String,
        },
        visitDate: {
            type: Date,
            required: [true, 'Visit date is required'],
        },
        timeSlot: {
            type: String,
            required: [true, 'Time slot is required'],
            enum: ['Morning (9 AM - 12 PM)', 'Afternoon (12 PM - 3 PM)', 'Evening (3 PM - 6 PM)'],
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        qrCode: {
            data: String, // Encrypted QR data
            generatedAt: Date,
            expiresAt: Date,
        },
        validityHours: {
            type: Number,
            default: 24, // Default 24 hours validity
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
        },
        approvedAt: {
            type: Date,
        },
        rejectedAt: {
            type: Date,
        },
        adminRemarks: {
            type: String,
            trim: true,
            maxlength: [500, 'Remarks cannot exceed 500 characters'],
        },
        entry: {
            scannedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Security',
            },
            scannedAt: Date,
            gate: String,
        },
        exit: {
            scannedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Security',
            },
            scannedAt: Date,
            gate: String,
        },
        additionalNotes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
visitRequestSchema.index({ visitor: 1, createdAt: -1 });
visitRequestSchema.index({ status: 1 });
visitRequestSchema.index({ visitDate: 1 });
visitRequestSchema.index({ 'qrCode.expiresAt': 1 });

// Virtual for checking if QR is valid
visitRequestSchema.virtual('isQRValid').get(function () {
    if (!this.qrCode || !this.qrCode.expiresAt) {
        return false;
    }
    return new Date() < this.qrCode.expiresAt;
});

// Virtual for checking if visitor is currently on campus
visitRequestSchema.virtual('isOnCampus').get(function () {
    return this.entry.scannedAt && !this.exit.scannedAt;
});

// Ensure virtuals are included in JSON
visitRequestSchema.set('toJSON', { virtuals: true });
visitRequestSchema.set('toObject', { virtuals: true });

const VisitRequest = mongoose.model('VisitRequest', visitRequestSchema);

export default VisitRequest;
