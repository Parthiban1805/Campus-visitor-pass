import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { endpoints } from '../api/axiosConfig';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Load user data from storage on app start
    useEffect(() => {
        loadUserFromStorage();
    }, []);

    const loadUserFromStorage = async () => {
        try {
            const [storedToken, storedUser] = await Promise.all([
                AsyncStorage.getItem('authToken'),
                AsyncStorage.getItem('user'),
            ]);

            if (storedToken && storedUser) {
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Error loading user from storage:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post(endpoints.visitorLogin, { email, password });

            const { user: userData, token } = response.data.data;

            // Save to storage
            await AsyncStorage.setItem('authToken', token);
            await AsyncStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            setIsAuthenticated(true);

            return { success: true, user: userData };
        } catch (error) {
            console.error('Login error:', error);
            const message = error.response?.data?.message || 'Login failed';
            return { success: false, error: message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post(endpoints.visitorRegister, userData);

            const { user: newUser, token } = response.data.data;

            // Save to storage
            await AsyncStorage.setItem('authToken', token);
            await AsyncStorage.setItem('user', JSON.stringify(newUser));

            setUser(newUser);
            setIsAuthenticated(true);

            return { success: true, user: newUser };
        } catch (error) {
            console.error('Registration error:', error);
            const message = error.response?.data?.message || 'Registration failed';
            return { success: false, error: message };
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const updateUser = async (updatedData) => {
        try {
            const updatedUser = { ...user, ...updatedData };
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (error) {
            console.error('Update user error:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                loading,
                login,
                register,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
