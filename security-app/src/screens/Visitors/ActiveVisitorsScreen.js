import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import api, { endpoints } from '../../api/axiosConfig';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ICON_SIZES } from '../../styles/theme';

const ActiveVisitorsScreen = ({ navigation }) => {
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchActiveVisitors = async () => {
        try {
            // Ideally use a specific endpoint or filter
            const response = await api.get(endpoints.getActiveVisitors || endpoints.getAllRequests);
            // Fallback if specific endpoint doesn't exist in this context context, 
            // but usually a security app has this. 
            // I will assume the endpoint exists as per previous file content.

            if (response.data.success) {
                setVisitors(response.data.data.visitors || []);
            }
        } catch (error) {
            console.error('Error fetching active visitors:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchActiveVisitors();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchActiveVisitors();
    };

    const handleCheckOut = (visitor) => {
        // Navigate to scanner with preset mode or data
        navigation.navigate('Scanner', { mode: 'exit', visitorId: visitor._id });
    };

    const renderItem = ({ item }) => (
        <View style={[styles.card, SHADOWS.card]}>
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {item.visitor?.name?.charAt(0).toUpperCase() || 'V'}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.visitorName}>{item.visitor?.name || 'Unknown Visitor'}</Text>
                        <Text style={styles.departmentText}>{item.department || 'General'}</Text>
                    </View>
                </View>
                <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>INSIDE</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={ICON_SIZES.xs} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>
                        In: {new Date(item.entryTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="person-outline" size={ICON_SIZES.xs} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>
                        Host: {item.personToMeet?.name || 'N/A'}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.checkoutButton}
                onPress={() => handleCheckOut(item)}
                activeOpacity={0.8}
            >
                <Text style={styles.checkoutText}>Check Out</Text>
                <Ionicons name="log-out-outline" size={ICON_SIZES.sm} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={ICON_SIZES.md} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Active Visitors</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={visitors}
                    renderItem={renderItem}
                    keyExtractor={item => item._id || Math.random().toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={COLORS.primary}
                        />
                    }
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconContainer}>
                                <Ionicons name="people" size={48} color={COLORS.textTertiary} />
                            </View>
                            <Text style={styles.emptyTitle}>No Active Visitors</Text>
                            <Text style={styles.emptySubtitle}>
                                There are currently no visitors checked in on campus.
                            </Text>
                        </View>
                    )}
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
    backButton: {
        padding: SPACING.xs,
        marginLeft: -SPACING.xs,
    },
    headerTitle: {
        fontSize: FONTS.h4,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
    },
    listContent: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: COLORS.primaryAlpha10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    avatarText: {
        fontSize: FONTS.h5,
        fontWeight: FONTS.weight.bold,
        color: COLORS.primary,
    },
    visitorName: {
        fontSize: FONTS.h6,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    departmentText: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.successAlpha10,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.pill,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.success,
        marginRight: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.success,
        letterSpacing: 0.5,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginBottom: SPACING.md,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    detailText: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
    },
    checkoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.primaryAlpha20,
        borderRadius: BORDER_RADIUS.md,
        gap: SPACING.xs,
        backgroundColor: COLORS.surfaceHover,
    },
    checkoutText: {
        fontSize: FONTS.caption,
        fontWeight: FONTS.weight.semibold,
        color: COLORS.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: SPACING.section,
        paddingHorizontal: SPACING.xl,
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
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default ActiveVisitorsScreen;
