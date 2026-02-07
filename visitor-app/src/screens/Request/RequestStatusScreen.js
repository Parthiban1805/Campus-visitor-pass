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
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../../components/StatusBadge';
import api, { endpoints } from '../../api/axiosConfig';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../styles/theme';

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
            style={[styles.requestCard, SHADOWS.small]}
            onPress={() => navigation.navigate('QRPass', { request: item })}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <StatusBadge status={item.status} />
                <Text style={styles.dateText}>{formatDate(item.visitDate)}</Text>
            </View>

            <Text style={styles.purposeText} numberOfLines={2}>
                {item.purpose}
            </Text>

            <View style={styles.detailRow}>
                <Ionicons name="business-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{item.department}</Text>
            </View>

            <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{item.timeSlot}</Text>
            </View>

            {item.status === 'approved' && (
                <View style={styles.qrButton}>
                    <Ionicons name="qr-code" size={18} color={COLORS.primary} />
                    <Text style={styles.qrButtonText}>View QR Pass</Text>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                </View>
            )}

            {item.status === 'rejected' && item.adminRemarks && (
                <View style={styles.remarksContainer}>
                    <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                    <Text style={styles.remarksText}>{item.adminRemarks}</Text>
                </View>
            )}

            {item.status === 'approved' && item.adminRemarks && (
                <View style={styles.approvalRemarks}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.approvalRemarksText}>{item.adminRemarks}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons
                name={
                    activeTab === 'pending'
                        ? 'time-outline'
                        : activeTab === 'approved'
                            ? 'checkmark-circle-outline'
                            : activeTab === 'rejected'
                                ? 'close-circle-outline'
                                : 'document-outline'
                }
                size={80}
                color={COLORS.textHint}
            />
            <Text style={styles.emptyTitle}>
                {activeTab === 'all'
                    ? 'No requests yet'
                    : `No ${activeTab} requests`}
            </Text>
            <Text style={styles.emptySubtitle}>
                {activeTab === 'all'
                    ? 'Create your first visit request to get started'
                    : `You don't have any ${activeTab} requests`}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Requests</Text>
                <TouchableOpacity onPress={() => navigation.navigate('CreateRequest')}>
                    <Ionicons name="add-circle" size={28} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Status Tabs */}
            <View style={styles.tabsContainer}>
                {STATUS_TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => changeTab(tab)}
                    >
                        <Text
                            style={[styles.tabText, activeTab === tab && styles.activeTabText]}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
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
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={renderEmptyState}
                />
            )}
        </View>
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
        paddingTop: 60,
        paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.lg,
        backgroundColor: COLORS.white,
        ...SHADOWS.small,
    },
    headerTitle: {
        fontSize: FONTS.h3,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        ...SHADOWS.small,
    },
    tab: {
        flex: 1,
        paddingVertical: SPACING.sm,
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.md,
        marginHorizontal: SPACING.xs,
    },
    activeTab: {
        backgroundColor: COLORS.primary,
    },
    tabText: {
        fontSize: FONTS.caption,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    activeTabText: {
        color: COLORS.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: SPACING.lg,
        flexGrow: 1,
    },
    requestCard: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
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
        fontWeight: '500',
    },
    purposeText: {
        fontSize: FONTS.h6,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    detailText: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        marginLeft: SPACING.xs,
    },
    qrButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${COLORS.primary}10`,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        marginTop: SPACING.md,
    },
    qrButtonText: {
        fontSize: FONTS.caption,
        color: COLORS.primary,
        fontWeight: '600',
        marginHorizontal: SPACING.xs,
    },
    remarksContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: `${COLORS.error}10`,
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.sm,
        marginTop: SPACING.md,
    },
    remarksText: {
        flex: 1,
        fontSize: FONTS.small,
        color: COLORS.error,
        marginLeft: SPACING.xs,
    },
    approvalRemarks: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: `${COLORS.success}10`,
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.sm,
        marginTop: SPACING.sm,
    },
    approvalRemarksText: {
        flex: 1,
        fontSize: FONTS.small,
        color: COLORS.success,
        marginLeft: SPACING.xs,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.xxl,
    },
    emptyTitle: {
        fontSize: FONTS.h4,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginTop: SPACING.lg,
    },
    emptySubtitle: {
        fontSize: FONTS.caption,
        color: COLORS.textHint,
        marginTop: SPACING.sm,
        textAlign: 'center',
        paddingHorizontal: SPACING.xxl,
    },
});

export default RequestStatusScreen;
