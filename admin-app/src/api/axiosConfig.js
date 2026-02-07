import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - Update this with your backend URL
const API_BASE_URL = 'http://localhost:5000/api'; // Replace with actual IP/URL

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response) {
            const { status } = error.response;

            if (status === 401) {
                await AsyncStorage.removeItem('authToken');
                await AsyncStorage.removeItem('user');
            }
        } else if (error.request) {
            console.error('Network error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default api;

// API Endpoints
export const endpoints = {
    // Auth
    adminLogin: '/auth/admin/login',

    // Admin - Request Management
    getAllRequests: '/admin/requests',
    approveRequest: (id) => `/admin/request/${id}/approve`,
    rejectRequest: (id) => `/admin/request/${id}/reject`,

    // Admin - Analytics
    getAnalytics: '/admin/analytics',
    getVisitorLogs: '/admin/visitor-logs',

    // Admin - Security Management
    createSecurity: '/admin/security',
    getAllSecurity: '/admin/security',
    updateSecurity: (id) => `/admin/security/${id}`,
    deleteSecurity: (id) => `/admin/security/${id}`,

    // Admin - Settings
    getSettings: '/admin/settings',
    updateQRValidity: '/admin/settings/qr-validity',
};
