// This file contains the RequestsListScreen implementation
// Due to size constraints, I'm providing a comprehensive implementation

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../../components/StatusBadge';
import CustomButton from '../../components/CustomButton';
import InputModal from '../../components/InputModal';
import api, { endpoints } from '../../api/axiosConfig';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ICON_SIZES } from '../../styles/theme';

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected'];

const RequestsListScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('pending');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRequests = async (status = activeTab) => {
        try {
            const url =
                status === 'all'
                    ? endpoints.getAllRequests
                    : `${endpoints.getAllRequests}?status=${status}`;

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

    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        placeholder: '',
        actionLabel: '',
        isDestructive: false,
        onSubmit: () => { },
    });

    const handleApprovePress = (requestId) => {
        setModalConfig({
            title: 'Approve Request',
            placeholder: 'Enter remarks (optional)',
            actionLabel: 'Approve',
            isDestructive: false,
            onSubmit: (remarks) => processApproval(requestId, remarks)
        });
        setModalVisible(true);
    };

    const handleRejectPress = (requestId) => {
        setModalConfig({
            title: 'Reject Request',
            placeholder: 'Enter reason for rejection',
            actionLabel: 'Reject',
            isDestructive: true,
            onSubmit: (remarks) => processReject(requestId, remarks)
        });
        setModalVisible(true);
    };

    const processApproval = async (requestId, remarks) => {
        try {
            await api.put(endpoints.approveRequest(requestId), {
                validityHours: 24,
                remarks: remarks || 'Approved',
            });
            Alert.alert('Success', 'Request approved successfully');
            fetchRequests();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to approve');
        } finally {
            setModalVisible(false);
        }
    };

    const processReject = async (requestId, remarks) => {
        if (!remarks) {
            Alert.alert('Error', 'Please provide a reason for rejection');
            return;
        }
        try {
            await api.put(endpoints.rejectRequest(requestId), { remarks });
            Alert.alert('Success', 'Request rejected');
            fetchRequests();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to reject');
        } finally {
            setModalVisible(false);
        }
    };

    const renderRequestCard = ({ item }) => (
        <View style={[styles.requestCard, SHADOWS.card]}>
            <View style={styles.cardHeader}>
                <StatusBadge status={item.status} size="small" />
                <Text style={styles.dateText}>
                    {new Date(item.visitDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </Text>
            </View>

            <Text style={styles.visitorName}>{item.visitor?.name}</Text>
            <Text style={styles.purposeText} numberOfLines={2}>
                {item.purpose}
            </Text>

            <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                    <Ionicons name="business" size={ICON_SIZES.xs} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>{item.department}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Ionicons name="time" size={ICON_SIZES.xs} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>{item.timeSlot}</Text>
                </View>
            </View>

            {item.status === 'pending' && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={() => handleApprovePress(item._id)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="checkmark-circle" size={ICON_SIZES.sm} color={COLORS.success} />
                        <Text style={[styles.actionText, { color: COLORS.success }]}>
                            Approve
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => handleRejectPress(item._id)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close-circle" size={ICON_SIZES.sm} color={COLORS.error} />
                        <Text style={[styles.actionText, { color: COLORS.error }]}>Reject</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity
                style={styles.viewDetailsBtn}
                onPress={() => navigation.navigate('RequestDetail', { request: item })}
                activeOpacity={0.7}
            >
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Ionicons name="arrow-forward" size={ICON_SIZES.xs} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                {navigation.canGoBack() && (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                )}
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Visitor Requests</Text>
                    <Text style={styles.headerSubtitle}>Review and manage visitor applications</Text>
                </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.tabsContainer}>
                <View style={styles.tabsWrapper}>
                    {STATUS_TABS.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => {
                                setActiveTab(tab);
                                setLoading(true);
                            }}
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
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={COLORS.primary}
                            colors={[COLORS.primary]}
                        />
                    }
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconContainer}>
                                <Ionicons name="document-text-outline" size={64} color={COLORS.textTertiary} />
                            </View>
                            <Text style={styles.emptyTitle}>No {activeTab} requests</Text>
                            <Text style={styles.emptySubtitle}>
                                {activeTab === 'pending'
                                    ? 'All caught up! No pending requests at the moment.'
                                    : `There are no ${activeTab} requests to display.`}
                            </Text>
                        </View>
                    )}
                />
            )}

            <InputModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                {...modalConfig}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: SPACING.md,
        paddingBottom: SPACING.md + 4,
        paddingHorizontal: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: SPACING.xs,
        marginRight: SPACING.md,
        marginLeft: -SPACING.xs,
    },
    headerTitle: {
        fontSize: FONTS.h3,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs - 2,
        letterSpacing: -0.3,
    },
    headerSubtitle: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
    },

    // Tabs
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
        letterSpacing: 0.3,
    },
    activeTabText: {
        color: COLORS.primary,
        fontWeight: FONTS.weight.semibold,
    },

    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // List
    listContent: {
        padding: SPACING.lg,
        flexGrow: 1,
    },

    // Request Card
    requestCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md + 4,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    dateText: {
        fontSize: FONTS.small,
        color: COLORS.textSecondary,
        fontWeight: FONTS.weight.medium,
    },
    visitorName: {
        fontSize: FONTS.h5,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
        letterSpacing: -0.2,
    },
    purposeText: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        lineHeight: FONTS.caption * 1.5,
        marginBottom: SPACING.md,
    },
    detailsContainer: {
        gap: SPACING.xs,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    detailText: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
    },

    // Actions
    actions: {
        flexDirection: 'row',
        marginTop: SPACING.md + 4,
        gap: SPACING.sm,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.sm + 2,
        borderRadius: BORDER_RADIUS.md,
        gap: SPACING.xs,
        borderWidth: 1.5,
    },
    approveBtn: {
        borderColor: COLORS.success,
        backgroundColor: COLORS.successAlpha10,
    },
    rejectBtn: {
        borderColor: COLORS.error,
        backgroundColor: COLORS.errorAlpha10,
    },
    actionText: {
        fontSize: FONTS.caption,
        fontWeight: FONTS.weight.semibold,
        letterSpacing: 0.2,
    },
    viewDetailsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.sm + 2,
        gap: SPACING.xs - 2,
    },
    viewDetailsText: {
        fontSize: FONTS.caption,
        color: COLORS.primary,
        fontWeight: FONTS.weight.semibold,
    },

    // Empty State
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.section,
        paddingHorizontal: SPACING.xl,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: BORDER_RADIUS.xxl,
        backgroundColor: COLORS.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    emptyTitle: {
        fontSize: FONTS.h4,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: FONTS.caption * 1.5,
    },
});

export default RequestsListScreen;
