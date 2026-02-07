import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const visitorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters long'],
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email address',
            ],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters long'],
            select: false, // Don't include password in queries by default
        },
        address: {
            type: String,
            trim: true,
        },
        identification: {
            type: {
                type: String,
                enum: ['Aadhaar', 'PAN', 'Driving License', 'Passport'],
            },
            number: String,
            documentUrl: String,
        },
        visitHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'VisitRequest',
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
visitorSchema.index({ email: 1 });
visitorSchema.index({ phone: 1 });

// Hash password before saving
visitorSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
visitorSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
visitorSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

const Visitor = mongoose.model('Visitor', visitorSchema);

export default Visitor;
