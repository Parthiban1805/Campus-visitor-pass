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
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import api, { endpoints } from '../../api/axiosConfig';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ICON_SIZES, DIMENSIONS } from '../../styles/theme';

const DashboardScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
    });
    const [recentRequests, setRecentRequests] = useState([]);

    const fetchDashboardData = async () => {
        try {
            const [profileRes, requestsRes] = await Promise.all([
                api.get(endpoints.getProfile),
                api.get(endpoints.getMyRequests + '?limit=5'),
            ]);

            if (profileRes.data.success) {
                setStats(profileRes.data.data.stats);
            }

            if (requestsRes.data.success) {
                setRecentRequests(requestsRes.data.data.requests);
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

            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.userName}>{user?.name}</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={ICON_SIZES.md} color={COLORS.error} />
                </TouchableOpacity>
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
                contentContainerStyle={styles.scrollContent}
            >
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <StatCard
                        icon="document-text"
                        label="Total Requests"
                        value={stats.totalRequests}
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
                        icon="checkmark-circle"
                        label="Approved"
                        value={stats.approvedRequests}
                        color={COLORS.success}
                        iconBg={COLORS.successAlpha10}
                    />
                    <StatCard
                        icon="close-circle"
                        label="Rejected"
                        value={stats.rejectedRequests}
                        color={COLORS.error}
                        iconBg={COLORS.errorAlpha10}
                    />
                </View>

                {/* Main Action */}
                <TouchableOpacity
                    style={[styles.createButtonContainer, SHADOWS.medium]}
                    onPress={() => navigation.navigate('CreateRequest')}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={[COLORS.primaryLight, COLORS.primary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.createButtonGradient}
                    >
                        <View style={styles.createContent}>
                            <View style={styles.createIconContainer}>
                                <Ionicons name="add" size={ICON_SIZES.xl || 32} color={COLORS.primary} />
                            </View>
                            <View style={styles.createTextContainer}>
                                <Text style={styles.createTitle}>New Visit Request</Text>
                                <Text style={styles.createSubtitle}>Schedule a new campus visit</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={ICON_SIZES.md} color={COLORS.white} />
                    </LinearGradient>
                </TouchableOpacity>

                {/* Recent Requests Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Requests</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Requests')}>
                            <Text style={styles.seeAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {recentRequests.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconContainer}>
                                <Ionicons name="documents-outline" size={48} color={COLORS.textTertiary} />
                            </View>
                            <Text style={styles.emptyTitle}>No requests yet</Text>
                            <Text style={styles.emptySubtitle}>Your recent visit requests will appear here</Text>
                        </View>
                    ) : (
                        recentRequests.map((request) => (
                            <RequestCard
                                key={request._id}
                                request={request}
                                onPress={() =>
                                    navigation.navigate('Requests', { selectedId: request._id })
                                }
                            />
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const StatCard = ({ icon, label, value, color, iconBg }) => (
    <View style={[styles.statCard, SHADOWS.card]}>
        <View style={[styles.statIconContainer, { backgroundColor: iconBg }]}>
            <Ionicons name={icon} size={ICON_SIZES.md} color={color} />
        </View>
        <Text style={styles.statValue}>{value || 0}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const RequestCard = ({ request, onPress }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <TouchableOpacity
            style={[styles.requestCard, SHADOWS.card]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.requestRow}>
                <View style={styles.requestInfo}>
                    <Text style={styles.requestPurpose}>{request.purpose}</Text>
                    <Text style={styles.requestDate}>{formatDate(request.visitDate)} • {request.department}</Text>
                </View>
                <StatusBadge status={request.status} />
            </View>
        </TouchableOpacity>
    );
};

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
        fontSize: FONTS.body,
        color: COLORS.textSecondary,
    },
    userName: {
        fontSize: FONTS.h2,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    logoutButton: {
        padding: SPACING.sm,
        backgroundColor: COLORS.errorAlpha10,
        borderRadius: BORDER_RADIUS.md,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -SPACING.xs,
        marginTop: SPACING.md,
        marginBottom: SPACING.lg,
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
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    statValue: {
        fontSize: FONTS.h2,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs - 2,
    },
    statLabel: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        fontWeight: FONTS.weight.medium,
    },
    createButtonContainer: {
        marginTop: SPACING.md,
        marginBottom: SPACING.xxl,
        borderRadius: 24,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
    createButtonGradient: {
        borderRadius: 24,
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    createContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    createIconContainer: {
        width: 60,
        height: 60,
        backgroundColor: COLORS.white,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    createTextContainer: {
        flex: 1,
    },
    createTitle: {
        fontSize: FONTS.h3,
        fontWeight: '800',
        color: COLORS.white,
        marginBottom: 4,
    },
    createSubtitle: {
        fontSize: FONTS.body,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '500',
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONTS.h4,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
    },
    seeAllText: {
        fontSize: FONTS.body,
        fontWeight: FONTS.weight.semibold,
        color: COLORS.primary,
    },
    requestCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    requestRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    requestInfo: {
        flex: 1,
        marginRight: SPACING.md,
    },
    requestPurpose: {
        fontSize: FONTS.body,
        fontWeight: FONTS.weight.semibold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    requestDate: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        fontWeight: FONTS.weight.medium,
    },
    emptyState: {
        alignItems: 'center',
        padding: SPACING.xl,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: COLORS.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    emptyTitle: {
        fontSize: FONTS.h5,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    emptySubtitle: {
        color: COLORS.textSecondary,
        fontSize: FONTS.caption,
        textAlign: 'center',
    },
});

export default DashboardScreen;
