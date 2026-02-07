import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS } from './src/styles/theme';

// Screens
import SecurityLoginScreen from './src/screens/Auth/SecurityLoginScreen';
import SecurityDashboardScreen from './src/screens/Dashboard/SecurityDashboardScreen';
import QRScannerScreen from './src/screens/Scanner/QRScannerScreen';

import ScanHistoryScreen from './src/screens/History/ScanHistoryScreen';
import ActiveVisitorsScreen from './src/screens/Visitors/ActiveVisitorsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return null;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    <Stack.Screen name="Login" component={SecurityLoginScreen} />
                ) : (
                    <>
                        <Stack.Screen name="Dashboard" component={SecurityDashboardScreen} />
                        <Stack.Screen name="Scanner" component={QRScannerScreen} />
                        <Stack.Screen name="History" component={ScanHistoryScreen} />
                        <Stack.Screen name="ActiveVisitors" component={ActiveVisitorsScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <AppNavigator />
        </AuthProvider>
    );
}
