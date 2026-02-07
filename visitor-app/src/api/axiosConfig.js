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
            // Server responded with error
            const { status } = error.response;

            if (status === 401) {
                // Unauthorized - clear token and redirect to login
                await AsyncStorage.removeItem('authToken');
                await AsyncStorage.removeItem('user');
            }
        } else if (error.request) {
            // Request was made but no response
            console.error('Network error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default api;

// API Endpoints
export const endpoints = {
    // Auth
    visitorRegister: '/auth/visitor/register',
    visitorLogin: '/auth/visitor/login',

    // Visitor
    submitRequest: '/visitor/request',
    getMyRequests: '/visitor/requests',
    getRequestDetails: (id) => `/visitor/request/${id}`,
    getHistory: '/visitor/history',
    getProfile: '/visitor/profile',
    updateProfile: '/visitor/profile',
    uploadDocument: '/visitor/upload-document',
};
