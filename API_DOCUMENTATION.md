# API Documentation

## Base URL
```
Production: https://your-app.onrender.com/api
Development: http://localhost:5000/api
```

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [...] // Optional validation errors
}
```

## Authentication Endpoints

### Register Visitor
```http
POST /auth/visitor/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "address": "123 Main St",
  "identification": {
    "type": "Aadhaar",
    "number": "1234 5678 9012"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGc..."
  }
}
```

### Login Visitor
```http
POST /auth/visitor/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Login Admin
```http
POST /auth/admin/login
```

### Login Security
```http
POST /auth/security/login
```

## Visitor Endpoints

### Submit Visit Request
```http
POST /visitor/request
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "purpose": "Meeting with HOD",
  "department": "Computer Science",
  "personToMeet": {
    "name": "Dr. Kumar",
    "designation": "HOD",
    "contact": "9876501234"
  },
  "visitDate": "2024-03-15",
  "timeSlot": "Morning (9 AM - 12 PM)",
  "additionalNotes": "Regarding research collaboration"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Visit request submitted successfully",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1a",
    "visitor": {...},
    "purpose": "Meeting with HOD",
    "status": "pending",
    ...
  }
}
```

### Get My Requests
```http
GET /visitor/requests?status=pending&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): pending | approved | rejected
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 10

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [...],
    "totalPages": 5,
    "currentPage": 1,
    "total": 50
  }
}
```

### Get Request Details
```http
GET /visitor/request/:id
Authorization: Bearer <token>
```

### Get Visit History
```http
GET /visitor/history?page=1&limit=10
Authorization: Bearer <token>
```

### Get Profile
```http
GET /visitor/profile
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /visitor/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "9876543211",
  "address": "456 New Address"
}
```

## Admin Endpoints

### Get All Requests
```http
GET /admin/requests?status=pending&department=ComputerScience&page=1&limit=20
Authorization: Bearer <admin-token>
```

### Approve Request
```http
PUT /admin/request/:id/approve
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "validityHours": 24,
  "remarks": "Approved for guest lecture"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Request approved successfully",
  "data": {
    "status": "approved",
    "qrCode": {
      "data": "encrypted-qr-string",
      "dataURL": "data:image/png;base64,...",
      "generatedAt": "2024-03-14T10:30:00Z",
      "expiresAt": "2024-03-15T10:30:00Z"
    },
    ...
  }
}
```

### Reject Request
```http
PUT /admin/request/:id/reject
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "remarks": "Insufficient documentation"
}
```

### Get Analytics
```http
GET /admin/analytics?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalRequests": 500,
      "pendingRequests": 50,
      "approvedRequests": 400,
      "rejectedRequests": 50,
      "totalVisitors": 300,
      "activeVisitors": 25
    },
    "departmentStats": [
      { "_id": "Computer Science", "count": 150 },
      { "_id": "Administration", "count": 100 }
    ],
    "statusStats": [...],
    "dailyStats": [...]
  }
}
```

### Get Visitor Logs
```http
GET /admin/visitor-logs?action=entry&gate=MainGate&page=1&limit=20
Authorization: Bearer <admin-token>
```

### Security User Management

#### Create Security User
```http
POST /admin/security
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "name": "Guard Name",
  "employeeId": "SEC004",
  "email": "guard@campus.edu",
  "phone": "9876543213",
  "password": "security123",
  "shift": "Morning",
  "gateAssignment": "Main Gate"
}
```

####Get All Security Users
```http
GET /admin/security?shift=Morning&isActive=true&page=1&limit=20
Authorization: Bearer <admin-token>
```

#### Update Security User
```http
PUT /admin/security/:id
Authorization: Bearer <admin-token>
```

#### Delete Security User
```http
DELETE /admin/security/:id
Authorization: Bearer <admin-token>
```

### Settings

#### Get Settings
```http
GET /admin/settings
Authorization: Bearer <admin-token>
```

#### Update QR Validity
```http
PUT /admin/settings/qr-validity
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "validityHours": 48
}
```

## Security Endpoints

### Scan QR Code
```http
POST /security/scan
Authorization: Bearer <security-token>
```

**Request Body:**
```json
{
  "qrData": "encrypted-qr-data-string",
  "gate": "Main Gate"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "visitRequest": {
      "visitor": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "9876543210"
      },
      "purpose": "Meeting",
      "department": "Computer Science",
      "visitDate": "2024-03-15",
      ...
    },
    "validation": {
      "isValid": true,
      "message": "QR code is valid"
    },
    "canEnter": true,
    "canExit": false
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "QR code has expired"
}
```

### Log Entry
```http
POST /security/log-entry
Authorization: Bearer <security-token>
```

**Request Body:**
```json
{
  "requestId": "60d5ec49f1b2c72b8c8e4f1a",
  "gate": "Main Gate"
}
```

### Log Exit
```http
POST /security/log-exit
Authorization: Bearer <security-token>
```

### Get Scan History
```http
GET /security/history?action=entry&page=1&limit=20
Authorization: Bearer <security-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [...],
    "todayStats": {
      "totalScans": 50,
      "entries": 45,
      "exits": 42
    },
    ...
  }
}
```

### Get Active Visitors
```http
GET /security/active-visitors
Authorization: Bearer <security-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "activeVisitors": [
      {
        "visitor": {...},
        "entry": {
          "scannedAt": "2024-03-14T10:30:00Z",
          "gate": "Main Gate"
        },
        ...
      }
    ],
    "count": 25
  }
}
```

## Error Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## Rate Limiting

API requests are rate-limited to prevent abuse:
- 100 requests per 15 minutes per IP

## Notes

- All dates should be in ISO 8601 format
- Pagination starts from page 1
- Default page size is 10 (visitor app) or 20 (admin/security app)
- QR codes expire based on configured validity hours (default 24 hours)
- Email notifications are sent automatically for request status changes
