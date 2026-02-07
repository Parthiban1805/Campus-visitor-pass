import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
    {
        qrValidityHours: {
            type: Number,
            default: 24,
            min: [1, 'QR validity must be at least 1 hour'],
            max: [168, 'QR validity cannot exceed 7 days (168 hours)'],
        },
        autoApproval: {
            enabled: {
                type: Boolean,
                default: false,
            },
            departments: [String],
        },
        notifications: {
            emailEnabled: {
                type: Boolean,
                default: true,
            },
            adminEmail: String,
        },
        campusInfo: {
            name: {
                type: String,
                default: 'Campus Visitor Management System',
            },
            address: String,
            contact: String,
            workingHours: {
                start: {
                    type: String,
                    default: '09:00',
                },
                end: {
                    type: String,
                    default: '18:00',
                },
            },
        },
    },
    {
        timestamps: true,
    }
);

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
