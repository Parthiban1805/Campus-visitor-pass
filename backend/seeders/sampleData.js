import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Visitor from '../models/Visitor.js';
import Admin from '../models/Admin.js';
import Security from '../models/Security.js';
import VisitRequest from '../models/VisitRequest.js';
import Settings from '../models/Settings.js';
import connectDB from '../config/db.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const seedData = async () => {
    try {
        console.log('🌱 Starting data seeding...\n');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Visitor.deleteMany({});
        await Admin.deleteMany({});
        await Security.deleteMany({});
        await VisitRequest.deleteMany({});
        await Settings.deleteMany({});
        console.log('✅ Existing data cleared\n');

        // Create Admin Users
        console.log('👤 Creating admin users...');
        const admins = await Admin.create([
            {
                name: 'Super Admin',
                email: 'superadmin@campus.edu',
                password: 'admin123',
                role: 'superadmin',
                department: 'Administration',
                permissions: {
                    canApproveRequests: true,
                    canManageSecurity: true,
                    canViewAnalytics: true,
                    canConfigureSettings: true,
                },
            },
            {
                name: 'John Admin',
                email: 'admin@campus.edu',
                password: 'admin123',
                role: 'admin',
                department: 'Security',
            },
        ]);
        console.log(`✅ Created ${admins.length} admin users`);

        // Create Security Guards
        console.log('👮 Creating security guards...');
        const securities = await Security.create([
            {
                name: 'Rajesh Kumar',
                employeeId: 'SEC001',
                email: 'rajesh.security@campus.edu',
                phone: '9876543210',
                password: 'security123',
                shift: 'Morning',
                gateAssignment: 'Main Gate',
            },
            {
                name: 'Priya Sharma',
                employeeId: 'SEC002',
                email: 'priya.security@campus.edu',
                phone: '9876543211',
                password: 'security123',
                shift: 'Afternoon',
                gateAssignment: 'Main Gate',
            },
            {
                name: 'Amit Patel',
                employeeId: 'SEC003',
                email: 'amit.security@campus.edu',
                phone: '9876543212',
                password: 'security123',
                shift: 'Evening',
                gateAssignment: 'East Gate',
            },
        ]);
        console.log(`✅ Created ${securities.length} security guards`);

        // Create Visitors
        console.log('📧 Creating test visitors...');
        const visitors = await Visitor.create([
            {
                name: 'Rahul Verma',
                email: 'rahul@example.com',
                phone: '9123456780',
                password: 'visitor123',
                address: '123, MG Road, Bangalore',
                identification: {
                    type: 'Aadhaar',
                    number: '1234 5678 9012',
                },
            },
            {
                name: 'Sneha Reddy',
                email: 'sneha@example.com',
                phone: '9123456781',
                password: 'visitor123',
                address: '456, Park Street, Bangalore',
                identification: {
                    type: 'Driving License',
                    number: 'KA01 20220012345',
                },
            },
            {
                name: 'Vikram Singh',
                email: 'vikram@example.com',
                phone: '9123456782',
                password: 'visitor123',
                address: '789, Brigade Road, Bangalore',
            },
            {
                name: 'Anita Desai',
                email: 'anita@example.com',
                phone: '9123456783',
                password: 'visitor123',
                address: '321, Indiranagar, Bangalore',
            },
            {
                name: 'Karthik Menon',
                email: 'karthik@example.com',
                phone: '9123456784',
                password: 'visitor123',
                address: '654, Koramangala, Bangalore',
            },
        ]);
        console.log(`✅ Created ${visitors.length} visitors`);

        // Create Visit Requests
        console.log('📋 Creating visit requests...');
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(today);
        dayAfter.setDate(dayAfter.getDate() + 2);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const visitRequests = await VisitRequest.create([
            // Pending requests
            {
                visitor: visitors[0]._id,
                purpose: 'Meeting with Computer Science Department Head',
                department: 'Computer Science',
                personToMeet: {
                    name: 'Dr. Kumar',
                    designation: 'HOD',
                    contact: '9876501234',
                },
                visitDate: tomorrow,
                timeSlot: 'Morning (9 AM - 12 PM)',
                status: 'pending',
                additionalNotes: 'Regarding research collaboration',
            },
            {
                visitor: visitors[1]._id,
                purpose: 'Library resource consultation',
                department: 'Library',
                visitDate: dayAfter,
                timeSlot: 'Afternoon (12 PM - 3 PM)',
                status: 'pending',
            },
            {
                visitor: visitors[2]._id,
                purpose: 'Campus tour for prospective admission',
                department: 'Administration',
                visitDate: tomorrow,
                timeSlot: 'Morning (9 AM - 12 PM)',
                status: 'pending',
            },

            // Approved requests
            {
                visitor: visitors[3]._id,
                purpose: 'Guest lecture on AI and ML',
                department: 'Computer Science',
                personToMeet: {
                    name: 'Prof. Sharma',
                    designation: 'Professor',
                    contact: '9876501235',
                },
                visitDate: today,
                timeSlot: 'Afternoon (12 PM - 3 PM)',
                status: 'approved',
                approvedBy: admins[1]._id,
                approvedAt: new Date(yesterday),
                adminRemarks: 'Approved for guest lecture',
            },
            {
                visitor: visitors[4]._id,
                purpose: 'Sports facility inspection',
                department: 'Sports',
                visitDate: tomorrow,
                timeSlot: 'Evening (3 PM - 6 PM)',
                status: 'approved',
                approvedBy: admins[0]._id,
                approvedAt: new Date(),
                adminRemarks: 'Vendor inspection approved',
            },

            // Rejected request
            {
                visitor: visitors[0]._id,
                purpose: 'Unauthorized campus entry',
                department: 'Other',
                visitDate: yesterday,
                timeSlot: 'Evening (3 PM - 6 PM)',
                status: 'rejected',
                rejectedAt: new Date(yesterday),
                adminRemarks: 'Insufficient documentation provided',
            },
        ]);

        // Update visitor visit history
        for (const request of visitRequests) {
            await Visitor.findByIdAndUpdate(request.visitor, {
                $push: { visitHistory: request._id },
            });
        }

        console.log(`✅ Created ${visitRequests.length} visit requests`);

        // Create Settings
        console.log('⚙️  Creating system settings...');
        const settings = await Settings.create({
            qrValidityHours: 24,
            notifications: {
                emailEnabled: true,
            },
            campusInfo: {
                name: 'Sample University Campus',
                address: '123, University Road, Bangalore, India',
                contact: '+91 80 1234 5678',
                workingHours: {
                    start: '09:00',
                    end: '18:00',
                },
            },
        });
        console.log('✅ System settings created');

        console.log('\n✅ Data seeding completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   - Admins: ${admins.length}`);
        console.log(`   - Security Guards: ${securities.length}`);
        console.log(`   - Visitors: ${visitors.length}`);
        console.log(`   - Visit Requests: ${visitRequests.length}\n`);

        console.log('🔐 Login Credentials:\n');
        console.log('Super Admin:');
        console.log('  Email: superadmin@campus.edu');
        console.log('  Password: admin123\n');
        console.log('Admin:');
        console.log('  Email: admin@campus.edu');
        console.log('  Password: admin123\n');
        console.log('Security (any):');
        console.log('  Email: rajesh.security@campus.edu');
        console.log('  Password: security123\n');
        console.log('Visitor (any):');
        console.log('  Email: rahul@example.com');
        console.log('  Password: visitor123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
