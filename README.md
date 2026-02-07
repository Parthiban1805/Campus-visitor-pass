# Campus Visitor QR Pass Management System

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
</p>

## 📋 Overview

A complete production-ready campus visitor management system that digitizes visitor entry using QR code-based passes with admin approval and security verification. The system consists of three mobile applications (Visitor, Admin, Security) connected to a centralized Node.js backend.

### ✨ Key Features

- **Visitor App**: Registration, visit request submission, QR pass display, visit history
- **Admin App**: Request approval/rejection, analytics dashboard, security user management
- **Security App**: QR scanning/validation, entry/exit logging, active visitor monitoring
- **Backend API**: RESTful API with JWT authentication, encrypted QR codes, email notifications

## 🏗️ System Architecture

```
├── backend/                    # Node.js Express API
│   ├── config/                # Database and email configuration
│   ├── models/                # MongoDB schemas
│   ├── controllers/           # Business logic
│   ├── routes/                # API endpoints
│   ├── middleware/            # Auth and validation
│   ├── utils/                 # QR service, response handlers
│   └── seeders/               # Sample data
│
├── visitor-app/               # React Native Expo app for visitors
│   ├── src/
│   │   ├── api/              # API configuration
│   │   ├── components/       # Reusable components
│   │   ├── context/          # Global state management
│   │   ├── screens/          # App screens
│   │   └── styles/           # Theme and styling
│   └── App.js
│
├── admin-app/                 # React Native Expo app for admins
│   └── (similar structure)
│
└── security-app/              # React Native Expo app for security
    └── (similar structure)
```

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB (Atlas)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **QR Generation**: qrcode (with AES-256 encryption)
- **Email**: Nodemailer (Gmail SMTP)
- **Validation**: express-validator
- **Deployment**: Render

### Mobile Apps
- **Framework**: React Native with Expo (Managed Workflow)
- **Navigation**: React Navigation v6
- **State Management**: Context API + AsyncStorage
- **HTTP Client**: Axios
- **QR Display**: react-native-qrcode-svg
- **QR Scanning**: expo-camera (Security app)
- **Icons**: @expo/vector-icons (Ionicons)
- **Gradients**: expo-linear-gradient

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- Expo CLI (`npm install -g expo-cli`)
- Gmail account with App Password (for email notifications)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables in .env
# - MONGODB_URI: Your MongoDB Atlas connection string
# - JWT_SECRET: Random secret key
# - QR_ENCRYPTION_KEY: 32-character encryption key
# - EMAIL_USER: Your Gmail address
# - EMAIL_PASSWORD: Gmail App Password

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

The backend server will run on `http://localhost:5000`

### Visitor App Setup

```bash
# Navigate to visitor app directory
cd visitor-app

# Install dependencies
npm install

# Update API URL in src/api/axiosConfig.js
# Replace 'http://192.168.1.x:5000/api' with your backend URL
# For local development, use your computer's IP address

# Start Expo development server
npm start

# Scan QR code with Expo Go app (Android/iOS)
```

### Admin App Setup

```bash
cd admin-app
npm install
# Update API URL similar to visitor app
npm start
```

### Security App Setup

```bash
cd security-app
npm install
# Update API URL similar to visitor app
npm start
```

## 🔐 Sample Credentials

After running the seed script, use these credentials:

### Admin Login
- **Email**: `admin@campus.edu`
- **Password**: `admin123`

### Security Login
- **Email**: `rajesh.security@campus.edu`
- **Password**: `security123`

### Visitor Login
- **Email**: `rahul@example.com`
- **Password**: `visitor123`

## 📱 Application Workflows

### Visitor Workflow
1. Register/Login to the app
2. Submit visit request (purpose, department, date, time slot)
3. Receive email notification
4. Check request status in app
5. Upon approval, view encrypted QR pass
6. Present QR at security gate
7. View visit history

### Admin Workflow
1. Login to admin app
2. View dashboard with analytics
3. Review pending visit requests
4. Approve/reject with remarks
5. On approval, QR code is auto-generated
6. Email sent to visitor
7. Manage security guard accounts
8. Configure QR validity duration

### Security Workflow
1. Login to security app
2. Scan visitor's QR code
3. View visitor details and validation status
4. Log entry with gate information
5. View currently on-campus visitors
6. Scan QR again to log exit

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/visitor/register` - Register visitor
- `POST /api/auth/visitor/login` - Visitor login
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/security/login` - Security login

### Visitor Operations
- `POST /api/visitor/request` - Submit visit request
- `GET /api/visitor/requests` - Get my requests
- `GET /api/visitor/request/:id` - Get request details
- `GET /api/visitor/history` - Get visit history
- `GET /api/visitor/profile` - Get profile
- `PUT /api/visitor/profile` - Update profile

### Admin Operations
- `GET /api/admin/requests` - Get all requests (with filters)
- `PUT /api/admin/request/:id/approve` - Approve request
- `PUT /api/admin/request/:id/reject` - Reject request
- `GET /api/admin/analytics` - Get dashboard analytics
- `GET /api/admin/visitor-logs` - Get security logs
- `POST /api/admin/security` - Create security user
- `GET /api/admin/security` - Get all security users
- `PUT /api/admin/security/:id` - Update security user
- `DELETE /api/admin/security/:id` - Delete security user

### Security Operations
- `POST /api/security/scan` - Validate QR code
- `POST /api/security/log-entry` - Log visitor entry
- `POST /api/security/log-exit` - Log visitor exit
- `GET /api/security/history` - Get scan history
- `GET /api/security/active-visitors` - Get active visitors

## 🔒 Security Features

- **JWT Authentication**: Stateless token-based auth
- **Role-Based Access Control**: Visitor, Admin, Security roles
- **Encrypted QR Codes**: AES-256-CBC encryption
- **Tamper Detection**: Checksum validation
- **QR Expiration**: Configurable validity period
- **Duplicate Scan Prevention**: Entry/exit logging
- **Password Hashing**: bcrypt with salt rounds
- **Request Validation**: express-validator middleware
- **CORS Protection**: Configured allowed origins

## 📧 Email Notifications

Automated email notifications are sent for:
- Visit request submission
- Request approval (with QR code information)
- Request rejection (with admin remarks)

## 🐳 Docker Deployment

```bash
# Start backend and MongoDB with Docker Compose
cd backend
docker-compose up -d

# Backend will be available at http://localhost:5000
```

## 📊 Database Schema

### Collections

- **visitors**: User accounts for visitors
- **admins**: Admin user accounts
- **securities**: Security guard accounts
- **visitrequests**: Visit requests with QR codes
- **securitylogs**: Entry/exit scan logs
- **settings**: System configuration

## 🎨 UI/UX Design

- **Material Design Components**: Modern, clean interface
- **Gradient Backgrounds**: Professional visual appeal
- **Status Color Coding**: Pending (Orange), Approved (Green), Rejected (Red)
- **Smooth Animations**: Loading states and transitions
- **Responsive Layouts**: Mobile-first design
- **Error Handling**: User-friendly error messages

## 📱 Building APKs

### Using Expo EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
cd visitor-app
eas build:configure

# Build Android APK
eas build --platform android --profile preview

# Download APK from Expo dashboard
```

Repeat for admin-app and security-app.

## 🧪 Testing

### Backend API Testing

```bash
cd backend
npm test
```

### Manual Testing Checklist

- [ ] Visitor registration and login
- [ ] Visit request submission
- [ ] Email notifications received
- [ ] Admin approval workflow
- [ ] QR code generation
- [ ] Security QR scanning
- [ ] Entry/exit logging
- [ ] Duplicate scan prevention
- [ ] Analytics dashboard
- [ ] Security user management

## 🌐 Environment Configuration

### MongoDB Atlas Setup

1. Create MongoDB Atlas account
2. Create new cluster
3. Add database user
4. Whitelist IP addresses (0.0.0.0/0 for testing)
5. Get connection string
6. Update MONGODB_URI in .env

### Gmail SMTP Setup

1. Enable 2-Factor Authentication on Gmail
2. Generate App Password
3. Use app password in EMAIL_PASSWORD

### Render Deployment

1. Create Render account
2. New Web Service
3. Connect GitHub repository
4. Set environment variables
5. Deploy

## 📚 Project Structure Details

### Backend Models

```javascript
// Key Mongoose schemas
- Visitor (authentication, profile)
- Admin (roles, permissions)
- Security (shifts, gate assignments)
- VisitRequest (approval workflow, QR data)
- SecurityLog (scan tracking)
```

### Mobile App Components

```javascript
// Reusable components created
- CustomButton (gradient, loading states)
- CustomInput (validation, icons)
- StatusBadge (color-coded status)
- RequestCard (visit request display)
- StatCard (dashboard metrics)
```

## 🤝 Contributing

This is a final-year project. Contributions should maintain:
- Clean code architecture
- Comprehensive error handling
- Professional UI/UX standards
- Security best practices

## 📄 License

This project is for educational purposes.

## 👥 Support

For issues or questions:
1. Check API documentation
2. Review sample data
3. Test with seed credentials
4. Verify environment variables

## 🎯 Future Enhancements

- Push notifications support
- Visitor photo capture
- Multi-language support
- Offline QR validation
- Visitor pre-registration portal
- Multi-campus support
- Advanced analytics dashboards
- Export reports functionality

---

**Built with ❤️ for Campus Security** | **Production-Ready** | **Scalable Architecture**
