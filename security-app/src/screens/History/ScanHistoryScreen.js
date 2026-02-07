import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api, { endpoints } from '../../api/axiosConfig';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../styles/theme';

const ScanHistoryScreen = ({ navigation }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHistory = async () => {
        try {
            const response = await api.get(endpoints.getHistory);
            if (response.data.success) {
                setLogs(response.data.data.logs);
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

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={[styles.iconContainer, {
                backgroundColor: item.action === 'entry' ? COLORS.success : COLORS.warning
            }]}>
                <Ionicons
                    name={item.action === 'entry' ? 'log-in' : 'log-out'}
                    size={24}
                    color={COLORS.white}
                />
            </View>
            <View style={styles.details}>
                <Text style={styles.visitorName}>{item.visitor?.name || 'Unknown Visitor'}</Text>
                <Text style={styles.actionText}>
                    {item.action === 'entry' ? 'Checked In' : 'Checked Out'}
                </Text>
                <Text style={styles.timeText}>
                    {new Date(item.timestamp).toLocaleString()}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scan History</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={logs}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <Ionicons name="time-outline" size={60} color={COLORS.textHint} />
                            <Text style={styles.emptyText}>No scan history found</Text>
                        </View>
                    )}
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
        backgroundColor: COLORS.primary,
        ...SHADOWS.small,
    },
    backButton: {
        padding: SPACING.sm,
    },
    headerTitle: {
        fontSize: FONTS.h4,
        fontWeight: '600',
        color: COLORS.white,
    },
    listContent: {
        padding: SPACING.md,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md,
        ...SHADOWS.small,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    details: {
        flex: 1,
    },
    visitorName: {
        fontSize: FONTS.h6,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    actionText: {
        fontSize: FONTS.body,
        color: COLORS.textSecondary,
        marginVertical: 2,
    },
    timeText: {
        fontSize: FONTS.small,
        color: COLORS.textHint,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: SPACING.xxl,
    },
    emptyText: {
        fontSize: FONTS.body,
        color: COLORS.textHint,
        marginTop: SPACING.md,
    },
});

export default ScanHistoryScreen;
