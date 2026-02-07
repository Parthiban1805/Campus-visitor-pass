import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import visitorRoutes from './routes/visitorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import securityRoutes from './routes/securityRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: [
        process.env.VISITOR_APP_URL,
        process.env.ADMIN_APP_URL,
        process.env.SECURITY_APP_URL,
        'http://localhost:19000',
        'http://localhost:19001',
        'http://localhost:19002',
        'http://localhost:8080',
        'http://localhost:8081',
        'http://localhost:8082',
    ],
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Health check route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Campus Visitor QR Pass Management System API',
        version: '1.0.0',
        status: 'Active',
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/visitor', visitorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/security', securityRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

export default app;
