import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS } from './src/styles/theme';

// Auth Screens
import AdminLoginScreen from './src/screens/Auth/AdminLoginScreen';

// Main Screens
import AdminDashboardScreen from './src/screens/Dashboard/AdminDashboardScreen';
import RequestsListScreen from './src/screens/Requests/RequestsListScreen';
import RequestDetailScreen from './src/screens/Requests/RequestDetailScreen';
import VisitorLogsScreen from './src/screens/Logs/VisitorLogsScreen';
import SecurityManagementScreen from './src/screens/Security/SecurityManagementScreen';
import SettingsScreen from './src/screens/Settings/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'Requests') {
                        iconName = focused ? 'document-text' : 'document-text-outline';
                    } else if (route.name === 'Logs') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#1976D2',
                tabBarInactiveTintColor: COLORS.textSecondary,
                tabBarStyle: {
                    paddingBottom: 5,
                    height: 60,
                },
                headerShown: false,
            })}
        >
            <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
            <Tab.Screen name="Requests" component={RequestsListScreen} />
            <Tab.Screen name="Logs" component={VisitorLogsScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
};

const AppNavigator = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return null;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    <Stack.Screen name="Login" component={AdminLoginScreen} />
                ) : (
                    <>
                        <Stack.Screen name="Main" component={MainTabs} />
                        <Stack.Screen name="RequestDetail" component={RequestDetailScreen} />
                        <Stack.Screen name="RequestsList" component={RequestsListScreen} />
                        <Stack.Screen name="VisitorLogs" component={VisitorLogsScreen} />
                        <Stack.Screen name="SecurityManagement" component={SecurityManagementScreen} />
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
