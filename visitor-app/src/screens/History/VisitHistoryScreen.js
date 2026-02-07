import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api, { endpoints } from '../../api/axiosConfig';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../styles/theme';

const VisitHistoryScreen = ({ navigation }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHistory = async () => {
        try {
            const response = await api.get(endpoints.getHistory);

            if (response.data.success) {
                setHistory(response.data.data.history);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const calculateDuration = (entry, exit) => {
        if (!entry || !exit) return null;
        const diff = new Date(exit) - new Date(entry);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const renderHistoryCard = ({ item }) => {
        const hasEntry = item.entry && item.entry.scannedAt;
        const hasExit = item.exit && item.exit.scannedAt;
        const duration = calculateDuration(item.entry?.scannedAt, item.exit?.scannedAt);

        return (
            <View style={[styles.historyCard, SHADOWS.small]}>
                <View style={styles.cardHeader}>
                    <View style={styles.dateContainer}>
                        <Ionicons name="calendar" size={18} color={COLORS.primary} />
                        <Text style={styles.dateText}>{formatDate(item.visitDate)}</Text>
                    </View>
                    <View
                        style={[
                            styles.statusDot,
                            { backgroundColor: hasExit ? COLORS.success : COLORS.warning },
                        ]}
                    />
                </View>

                <Text style={styles.purposeText} numberOfLines={2}>
                    {item.purpose}
                </Text>

                <View style={styles.detailsContainer}>
                    <View style={styles.detailItem}>
                        <Ionicons name="business-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.detailText}>{item.department}</Text>
                    </View>

                    {hasEntry && (
                        <View style={styles.logRow}>
                            <View style={styles.logItem}>
                                <Ionicons name="log-in" size={16} color={COLORS.success} />
                                <View style={styles.logInfo}>
                                    <Text style={styles.logLabel}>Entry</Text>
                                    <Text style={styles.logTime}>{formatTime(item.entry.scannedAt)}</Text>
                                    {item.entry.gate && (
                                        <Text style={styles.logGate}>{item.entry.gate}</Text>
                                    )}
                                </View>
                            </View>

                            {hasExit && (
                                <View style={styles.logItem}>
                                    <Ionicons name="log-out" size={16} color={COLORS.error} />
                                    <View style={styles.logInfo}>
                                        <Text style={styles.logLabel}>Exit</Text>
                                        <Text style={styles.logTime}>{formatTime(item.exit.scannedAt)}</Text>
                                        {item.exit.gate && (
                                            <Text style={styles.logGate}>{item.exit.gate}</Text>
                                        )}
                                    </View>
                                </View>
                            )}
                        </View>
                    )}

                    {duration && (
                        <View style={styles.durationContainer}>
                            <Ionicons name="time" size={14} color={COLORS.info} />
                            <Text style={styles.durationText}>Duration: {duration}</Text>
                        </View>
                    )}

                    {!hasEntry && (
                        <Text style={styles.noEntryText}>No entry recorded</Text>
                    )}
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={80} color={COLORS.textHint} />
            <Text style={styles.emptyTitle}>No Visit History</Text>
            <Text style={styles.emptySubtitle}>
                Your completed visits will appear here
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Visit History</Text>
                <Ionicons name="time" size={24} color={COLORS.primary} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={history}
                    renderItem={renderHistoryCard}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: SPACING.lg,
        flexGrow: 1,
    },
    historyCard: {
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
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: FONTS.caption,
        fontWeight: '600',
        color: COLORS.primary,
        marginLeft: SPACING.xs,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    purposeText: {
        fontSize: FONTS.h6,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    detailsContainer: {
        marginTop: SPACING.sm,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    detailText: {
        fontSize: FONTS.small,
        color: COLORS.textSecondary,
        marginLeft: SPACING.xs,
    },
    logRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SPACING.sm,
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    logItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
    },
    logInfo: {
        marginLeft: SPACING.xs,
    },
    logLabel: {
        fontSize: FONTS.small,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    logTime: {
        fontSize: FONTS.small,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs / 2,
    },
    logGate: {
        fontSize: FONTS.small,
        color: COLORS.textHint,
        marginTop: SPACING.xs / 2,
    },
    durationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${COLORS.info}10`,
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.sm,
        marginTop: SPACING.sm,
    },
    durationText: {
        fontSize: FONTS.small,
        color: COLORS.info,
        fontWeight: '600',
        marginLeft: SPACING.xs,
    },
    noEntryText: {
        fontSize: FONTS.small,
        color: COLORS.textHint,
        fontStyle: 'italic',
        marginTop: SPACING.sm,
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
    },
});

export default VisitHistoryScreen;
