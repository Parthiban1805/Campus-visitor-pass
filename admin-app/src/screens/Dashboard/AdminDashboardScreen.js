import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api, { endpoints } from '../../api/axiosConfig';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../styles/theme';

const AdminDashboardScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        totalVisitors: 0,
        activeVisitors: 0,
    });

    const fetchDashboardData = async () => {
        try {
            const response = await api.get(endpoints.getAnalytics);
            if (response.data.success) {
                setStats(response.data.data.stats);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Admin Portal</Text>
                    <Text style={styles.userName}>{user?.name}</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.iconButton}>
                    <Ionicons name="log-out-outline" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
                contentContainerStyle={{ paddingBottom: SPACING.xxl }}
            >
                {/* Stats Grid */}
                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.statsGrid}>
                    <StatCard
                        icon="people-outline"
                        label="Total Visitors"
                        value={stats.totalVisitors}
                        color={COLORS.primary}
                    />
                    <StatCard
                        icon="time-outline"
                        label="Pending"
                        value={stats.pendingRequests}
                        color={COLORS.warning}
                    />
                    <StatCard
                        icon="location-outline"
                        label="Active Now"
                        value={stats.activeVisitors}
                        color={COLORS.info}
                    />
                    <StatCard
                        icon="close-circle-outline"
                        label="Rejected"
                        value={stats.rejectedRequests}
                        color={COLORS.error}
                    />
                </View>

                {/* Quick Actions List */}
                <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>Management</Text>

                <ActionListItem
                    icon="document-text-outline"
                    title="Visit Requests"
                    subtitle={`${stats.pendingRequests} pending requests`}
                    color={COLORS.warning}
                    onPress={() => navigation.navigate('RequestsList')}
                />
                <ActionListItem
                    icon="list-outline"
                    title="Visitor Logs"
                    subtitle="View entry/exit records"
                    color={COLORS.info}
                    onPress={() => navigation.navigate('VisitorLogs')}
                />
                <ActionListItem
                    icon="shield-checkmark-outline"
                    title="Security Management"
                    subtitle="Manage security personnel"
                    color={COLORS.success}
                    onPress={() => navigation.navigate('SecurityManagement')}
                />
                <ActionListItem
                    icon="settings-outline"
                    title="System Settings"
                    subtitle="Configure application"
                    color={COLORS.secondary}
                    onPress={() => navigation.navigate('Settings')}
                />

            </ScrollView>
        </SafeAreaView>
    );
};

const StatCard = ({ icon, label, value, color }) => (
    <View style={[styles.statCard, SHADOWS.card]}>
        <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={22} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const ActionListItem = ({ icon, title, subtitle, color, onPress }) => (
    <TouchableOpacity style={[styles.actionItem, SHADOWS.card]} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.actionIconContainer, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{title}</Text>
            <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.background,
    },
    greeting: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    userName: {
        fontSize: FONTS.h2,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    iconButton: {
        padding: SPACING.sm,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.round,
        ...SHADOWS.light,
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
    },
    sectionTitle: {
        fontSize: FONTS.h4,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
        marginTop: SPACING.sm,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: SPACING.md,
    },
    statCard: {
        width: '48%',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.surfaceVariant,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    statValue: {
        fontSize: FONTS.h2,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    statLabel: {
        fontSize: FONTS.small,
        color: COLORS.textSecondary,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.surfaceVariant,
    },
    actionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: FONTS.body,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    actionSubtitle: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
    },
});

export default AdminDashboardScreen;
