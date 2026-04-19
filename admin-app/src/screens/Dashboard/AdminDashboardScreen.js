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
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ICON_SIZES } from '../../styles/theme';

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
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>Campus Admin</Text>
                        <Text style={styles.userName}>{user?.name || 'Administrator'}</Text>
                    </View>
                    <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                        <Ionicons name="log-out-outline" size={ICON_SIZES.md} color={COLORS.error} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                        colors={[COLORS.primary]}
                    />
                }
                contentContainerStyle={{ paddingBottom: SPACING.xxl }}
            >
                {/* Stats Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Overview</Text>
                    <Text style={styles.sectionSubtitle}>Real-time campus visitor statistics</Text>

                    <View style={styles.statsGrid}>
                        <StatCard
                            icon="people"
                            label="Total Visitors"
                            value={stats.totalVisitors}
                            color={COLORS.primary}
                            iconBg={COLORS.primaryAlpha10}
                        />
                        <StatCard
                            icon="hourglass"
                            label="Pending"
                            value={stats.pendingRequests}
                            color={COLORS.warning}
                            iconBg={COLORS.warningAlpha10}
                        />
                        <StatCard
                            icon="location"
                            label="Active Now"
                            value={stats.activeVisitors}
                            color={COLORS.info}
                            iconBg={COLORS.infoAlpha10}
                        />
                        <StatCard
                            icon="close-circle"
                            label="Rejected"
                            value={stats.rejectedRequests}
                            color={COLORS.error}
                            iconBg={COLORS.errorAlpha10}
                        />
                    </View>
                </View>

                {/* Management Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Management</Text>
                    <Text style={styles.sectionSubtitle}>Quick access to admin functions</Text>

                    <View style={styles.actionsContainer}>
                        <ActionCard
                            icon="document-text"
                            title="Visit Requests"
                            subtitle={`${stats.pendingRequests} pending approval`}
                            color={COLORS.warning}
                            onPress={() => navigation.navigate('RequestsList')}
                        />
                        <ActionCard
                            icon="list"
                            title="Visitor Logs"
                            subtitle="View entry and exit records"
                            color={COLORS.info}
                            onPress={() => navigation.navigate('VisitorLogs')}
                        />
                        <ActionCard
                            icon="shield-checkmark"
                            title="Security Management"
                            subtitle="Manage security personnel"
                            color={COLORS.success}
                            onPress={() => navigation.navigate('SecurityManagement')}
                        />
                        <ActionCard
                            icon="settings"
                            title="System Settings"
                            subtitle="Configure application"
                            color={COLORS.secondary}
                            onPress={() => navigation.navigate('Settings')}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// StatCard Component - Redesigned
const StatCard = ({ icon, label, value, color, iconBg }) => (
    <View style={[styles.statCard, SHADOWS.card]}>
        <View style={[styles.statIconContainer, { backgroundColor: iconBg }]}>
            <Ionicons name={icon} size={ICON_SIZES.lg} color={color} />
        </View>
        <Text style={styles.statValue}>{value || 0}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

// ActionCard Component - Redesigned
const ActionCard = ({ icon, title, subtitle, color, onPress }) => (
    <TouchableOpacity
        style={[styles.actionCard, SHADOWS.card]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={[styles.actionIconContainer, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={ICON_SIZES.md} color={color} />
        </View>
        <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{title}</Text>
            <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={ICON_SIZES.sm} color={COLORS.textTertiary} />
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

    // Header Styles
    header: {
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md + 4,
    },
    greeting: {
        fontSize: FONTS.small,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        fontWeight: FONTS.weight.medium,
        marginBottom: SPACING.xs - 2,
    },
    userName: {
        fontSize: FONTS.h3,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
        letterSpacing: -0.5,
    },
    logoutButton: {
        padding: SPACING.sm,
        backgroundColor: COLORS.errorAlpha10,
        borderRadius: BORDER_RADIUS.md,
    },

    // Content Styles
    content: {
        flex: 1,
    },

    // Section Styles
    section: {
        paddingTop: SPACING.lg,
        paddingHorizontal: SPACING.lg,
    },
    sectionTitle: {
        fontSize: FONTS.h4,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
        letterSpacing: -0.3,
    },
    sectionSubtitle: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md + 4,
    },

    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -SPACING.xs,
    },
    statCard: {
        width: '48%',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md + 4,
        marginHorizontal: '1%',
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statIconContainer: {
        width: 56,
        height: 56,
        borderRadius: BORDER_RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    statValue: {
        fontSize: FONTS.h1,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs - 2,
        letterSpacing: -1,
    },
    statLabel: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        fontWeight: FONTS.weight.medium,
        letterSpacing: 0.2,
    },

    // Actions Container
    actionsContainer: {
        gap: SPACING.md,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.md + 2,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
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
        fontWeight: FONTS.weight.semibold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs - 2,
        letterSpacing: -0.2,
    },
    actionSubtitle: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        lineHeight: FONTS.caption * 1.4,
    },
});

export default AdminDashboardScreen;
