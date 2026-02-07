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
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../../components/StatusBadge';
import CustomButton from '../../components/CustomButton';
import InputModal from '../../components/InputModal';
import api, { endpoints } from '../../api/axiosConfig';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../styles/theme';

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

    // ... existing onRefresh ...

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
        <View style={[styles.requestCard, SHADOWS.small]}>
            <View style={styles.cardHeader}>
                <StatusBadge status={item.status} />
                <Text style={styles.dateText}>
                    {new Date(item.visitDate).toLocaleDateString()}
                </Text>
            </View>

            <Text style={styles.visitorName}>{item.visitor?.name}</Text>
            <Text style={styles.purposeText} numberOfLines={2}>
                {item.purpose}
            </Text>

            <View style={styles.detailRow}>
                <Ionicons name="business-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{item.department}</Text>
            </View>

            <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{item.timeSlot}</Text>
            </View>

            {item.status === 'pending' && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={() => handleApprovePress(item._id)}
                    >
                        <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.success} />
                        <Text style={[styles.actionText, { color: COLORS.success }]}>
                            Approve
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => handleRejectPress(item._id)}
                    >
                        <Ionicons name="close-circle-outline" size={20} color={COLORS.error} />
                        <Text style={[styles.actionText, { color: COLORS.error }]}>Reject</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity
                style={styles.viewDetailsBtn}
                onPress={() => navigation.navigate('RequestDetail', { request: item })}
            >
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Visitor Requests</Text>
            </View>

            <View style={styles.tabsContainer}>
                {STATUS_TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => {
                            setActiveTab(tab);
                            setLoading(true);
                        }}
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
                    <ActivityIndicator size="large" color="#1976D2" />
                </View>
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderRequestCard}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <Ionicons name="document-outline" size={80} color={COLORS.textHint} />
                            <Text style={styles.emptyText}>No {activeTab} requests</Text>
                        </View>
                    )}
                />
            )}

            <InputModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                {...modalConfig}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
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
        backgroundColor: '#1976D2',
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
    },
    visitorName: {
        fontSize: FONTS.h6,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    purposeText: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
        marginBottom: SPACING.sm,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    detailText: {
        fontSize: FONTS.small,
        color: COLORS.textSecondary,
        marginLeft: SPACING.xs,
    },
    actions: {
        flexDirection: 'row',
        marginTop: SPACING.md,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        marginHorizontal: SPACING.xs,
        borderWidth: 1.5,
    },
    approveBtn: {
        borderColor: COLORS.success,
        backgroundColor: `${COLORS.success}10`,
    },
    rejectBtn: {
        borderColor: COLORS.error,
        backgroundColor: `${COLORS.error}10`,
    },
    actionText: {
        fontSize: FONTS.caption,
        fontWeight: '600',
        marginLeft: SPACING.xs,
    },
    viewDetailsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.sm,
    },
    viewDetailsText: {
        fontSize: FONTS.caption,
        color: COLORS.primary,
        fontWeight: '600',
        marginRight: SPACING.xs,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.xxl,
    },
    emptyText: {
        fontSize: FONTS.h5,
        color: COLORS.textSecondary,
        marginTop: SPACING.lg,
    },
});

export default RequestsListScreen;
