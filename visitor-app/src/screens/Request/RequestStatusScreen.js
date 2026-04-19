import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../../components/StatusBadge';
import api, { endpoints } from '../../api/axiosConfig';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ICON_SIZES } from '../../styles/theme';

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected'];

const RequestStatusScreen = ({ navigation, route }) => {
    const [activeTab, setActiveTab] = useState('all');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRequests = async (status = activeTab) => {
        try {
            const url =
                status === 'all'
                    ? endpoints.getMyRequests
                    : `${endpoints.getMyRequests}?status=${status}`;

            const response = await api.get(url);

            if (response.data.success) {
                setRequests(response.data.data.requests);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [activeTab]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchRequests();
    };

    const changeTab = (tab) => {
        setActiveTab(tab);
        setLoading(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const renderRequestCard = ({ item }) => (
        <TouchableOpacity
            style={[styles.requestCard, SHADOWS.card]}
            onPress={() => navigation.navigate('QRPass', { request: item })}
            activeOpacity={0.8}
            disabled={item.status !== 'approved'}
        >
            <View style={styles.cardHeader}>
                <StatusBadge status={item.status} size="small" />
                <Text style={styles.dateText}>{formatDate(item.visitDate)}</Text>
            </View>

            <Text style={styles.purposeText} numberOfLines={2}>
                {item.purpose}
            </Text>

            <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                    <Ionicons name="business-outline" size={ICON_SIZES.xs} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>{item.department}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={ICON_SIZES.xs} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>{item.timeSlot}</Text>
                </View>
            </View>

            {item.status === 'approved' && (
                <View style={[styles.actionButton, styles.qrButton]}>
                    <View style={styles.qrContent}>
                        <Ionicons name="qr-code-outline" size={ICON_SIZES.sm} color={COLORS.primary} />
                        <Text style={styles.qrButtonText}>View QR Pass</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={ICON_SIZES.xs} color={COLORS.primary} />
                </View>
            )}

            {item.status === 'rejected' && item.adminRemarks && (
                <View style={[styles.infoBox, styles.errorBox]}>
                    <Ionicons name="alert-circle" size={ICON_SIZES.xs} color={COLORS.error} />
                    <Text style={[styles.infoText, { color: COLORS.error }]}>{item.adminRemarks}</Text>
                </View>
            )}

            {item.status === 'approved' && item.adminRemarks && (
                <View style={[styles.infoBox, styles.successBox]}>
                    <Ionicons name="information-circle" size={ICON_SIZES.xs} color={COLORS.success} />
                    <Text style={[styles.infoText, { color: COLORS.success }]}>{item.adminRemarks}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
                <Ionicons
                    name={
                        activeTab === 'pending'
                            ? 'time-outline'
                            : activeTab === 'approved'
                                ? 'checkmark-circle-outline'
                                : activeTab === 'rejected'
                                    ? 'close-circle-outline'
                                    : 'documents-outline'
                    }
                    size={48}
                    color={COLORS.textTertiary}
                />
            </View>
            <Text style={styles.emptyTitle}>
                {activeTab === 'all'
                    ? 'No requests found'
                    : `No ${activeTab} requests`}
            </Text>
            <Text style={styles.emptySubtitle}>
                {activeTab === 'all'
                    ? 'Start by creating a new visit request'
                    : `You don't have any ${activeTab} requests at the moment.`}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Requests</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('CreateRequest')}
                    style={styles.addButton}
                >
                    <Ionicons name="add" size={ICON_SIZES.md} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            {/* Status Tabs */}
            <View style={styles.tabsContainer}>
                <View style={styles.tabsWrapper}>
                    {STATUS_TABS.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => changeTab(tab)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[styles.tabText, activeTab === tab && styles.activeTabText]}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderRequestCard}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={COLORS.primary}
                            colors={[COLORS.primary]}
                        />
                    }
                    ListEmptyComponent={renderEmptyState}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        fontSize: FONTS.h3,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
        letterSpacing: -0.3,
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.md,
    },
    tabsContainer: {
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    tabsWrapper: {
        flexDirection: 'row',
        backgroundColor: COLORS.surfaceVariant,
        borderRadius: BORDER_RADIUS.pill,
        padding: SPACING.xs,
    },
    tab: {
        flex: 1,
        paddingVertical: SPACING.sm,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BORDER_RADIUS.pill,
    },
    activeTab: {
        backgroundColor: COLORS.surface,
        ...SHADOWS.xs,
    },
    tabText: {
        fontSize: FONTS.caption,
        fontWeight: FONTS.weight.medium,
        color: COLORS.textSecondary,
    },
    activeTabText: {
        color: COLORS.primary,
        fontWeight: FONTS.weight.semibold,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xxl * 2,
    },
    requestCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md + 2,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    dateText: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        fontWeight: FONTS.weight.medium,
    },
    purposeText: {
        fontSize: FONTS.h6,
        fontWeight: FONTS.weight.semibold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
        lineHeight: 22,
    },
    detailsContainer: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.md,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        marginLeft: SPACING.xs,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginTop: SPACING.xs,
    },
    qrButton: {
        backgroundColor: COLORS.primaryAlpha10,
    },
    qrContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    qrButtonText: {
        fontSize: FONTS.small,
        color: COLORS.primary,
        fontWeight: FONTS.weight.bold,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        marginTop: SPACING.sm,
    },
    errorBox: {
        backgroundColor: COLORS.errorAlpha10,
    },
    successBox: {
        backgroundColor: COLORS.successAlpha10,
    },
    infoText: {
        flex: 1,
        fontSize: FONTS.caption,
        marginLeft: SPACING.xs,
        lineHeight: 18,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: SPACING.section,
        paddingHorizontal: SPACING.xl,
        marginTop: SPACING.lg,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: COLORS.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    emptyTitle: {
        fontSize: FONTS.h5,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    emptySubtitle: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default RequestStatusScreen;
