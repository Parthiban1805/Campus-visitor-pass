import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export default api;

export const endpoints = {
    securityLogin: '/auth/security/login',
    scanQR: '/security/scan',
    logEntry: '/security/log-entry',
    logExit: '/security/log-exit',
    getHistory: '/security/history',
    getActiveVisitors: '/security/active-visitors',
};
