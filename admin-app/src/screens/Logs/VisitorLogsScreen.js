import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { COLORS, SPACING, FONTS, SHADOWS, BORDER_RADIUS } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import api, { endpoints } from '../../api/axiosConfig';

const VisitorLogsScreen = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLogs = async () => {
        try {
            const response = await api.get(endpoints.getVisitorLogs);
            if (response.data.success) {
                setLogs(response.data.data.logs);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLogs();
    };

    const renderLogItem = ({ item }) => (
        <View style={styles.logCard}>
            <View style={[styles.iconContainer, {
                backgroundColor: item.action === 'Entry' ? COLORS.success : item.action === 'Exit' ? COLORS.warning : COLORS.error
            }]}>
                <Ionicons
                    name={item.action === 'Entry' ? 'log-in-outline' : item.action === 'Exit' ? 'log-out-outline' : 'alert-circle-outline'}
                    size={24}
                    color={COLORS.white}
                />
            </View>
            <View style={styles.logDetails}>
                <Text style={styles.visitorName}>{item.visitor?.name || 'Unknown Visitor'}</Text>
                <Text style={styles.logAction}>{item.action} - {item.gate || 'Main Gate'}</Text>
            </View>
            <View style={styles.timeContainer}>
                <Text style={styles.timeText}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={styles.dateText}>
                    {new Date(item.timestamp).toLocaleDateString()}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Visitor Logs</Text>
            </View>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={logs}
                    renderItem={renderLogItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <Ionicons name="list-outline" size={60} color={COLORS.textHint} />
                            <Text style={styles.emptyText}>No logs found</Text>
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
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        ...SHADOWS.small,
        marginBottom: SPACING.sm,
    },
    headerTitle: {
        fontSize: FONTS.h4,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    listContent: {
        padding: SPACING.md,
    },
    logCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
        ...SHADOWS.small,
    },
    iconContainer: {
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.round,
        marginRight: SPACING.md,
    },
    logDetails: {
        flex: 1,
    },
    visitorName: {
        fontSize: FONTS.body,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    logAction: {
        fontSize: FONTS.small,
        color: COLORS.textSecondary,
    },
    timeContainer: {
        alignItems: 'flex-end',
    },
    timeText: {
        fontSize: FONTS.small,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    dateText: {
        fontSize: FONTS.small,
        color: COLORS.textSecondary,
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

export default VisitorLogsScreen;
