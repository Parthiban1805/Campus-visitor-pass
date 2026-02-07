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
import StatusBadge from '../../components/StatusBadge';
import api, { endpoints } from '../../api/axiosConfig';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../styles/theme';

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
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back,</Text>
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
                <View style={styles.statsGrid}>
                    <StatCard
                        icon="document-text-outline"
                        label="Total Requests"
                        value={stats.totalRequests}
                        color={COLORS.primary}
                    />
                    <StatCard
                        icon="time-outline"
                        label="Pending"
                        value={stats.pendingRequests}
                        color={COLORS.warning}
                    />
                    <StatCard
                        icon="checkmark-circle-outline"
                        label="Approved"
                        value={stats.approvedRequests}
                        color={COLORS.success}
                    />
                    <StatCard
                        icon="close-circle-outline"
                        label="Rejected"
                        value={stats.rejectedRequests}
                        color={COLORS.error}
                    />
                </View>

                {/* Main Action */}
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => navigation.navigate('CreateRequest')}
                    activeOpacity={0.9}
                >
                    <View style={styles.createIcon}>
                        <Ionicons name="add" size={32} color={COLORS.white} />
                    </View>
                    <View>
                        <Text style={styles.createTitle}>New Visit Request</Text>
                        <Text style={styles.createSubtitle}>Schedule a new campus visit</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={COLORS.white} style={{ marginLeft: 'auto' }} />
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
                            <Ionicons name="documents-outline" size={48} color={COLORS.textTertiary} />
                            <Text style={styles.emptyText}>No requests found</Text>
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

const StatCard = ({ icon, label, value, color }) => (
    <View style={[styles.statCard, SHADOWS.card]}>
        <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
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
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: SPACING.md,
        marginBottom: SPACING.lg,
    },
    statCard: {
        width: '48%',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: COLORS.surfaceVariant,
    },
    statIcon: {
        padding: SPACING.xs,
        borderRadius: BORDER_RADIUS.md,
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
        marginTop: SPACING.xs,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        marginTop: SPACING.sm,
        marginBottom: SPACING.xl,
        ...SHADOWS.medium,
    },
    createIcon: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: BORDER_RADIUS.round,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    createTitle: {
        fontSize: FONTS.h4,
        fontWeight: '700',
        color: COLORS.white,
    },
    createSubtitle: {
        fontSize: FONTS.caption,
        color: 'rgba(255,255,255,0.8)',
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
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    seeAllText: {
        fontSize: FONTS.body,
        fontWeight: '600',
        color: COLORS.primary,
    },
    requestCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.surfaceVariant,
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
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    requestDate: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
    },
    emptyState: {
        alignItems: 'center',
        padding: SPACING.xl,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        borderRadius: BORDER_RADIUS.lg,
    },
    emptyText: {
        color: COLORS.textTertiary,
        marginTop: SPACING.sm,
        fontWeight: '500',
    },
});

export default DashboardScreen;
