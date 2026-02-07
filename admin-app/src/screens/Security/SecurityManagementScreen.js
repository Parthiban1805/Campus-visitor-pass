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
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { COLORS, SPACING, FONTS, SHADOWS, BORDER_RADIUS } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import api, { endpoints } from '../../api/axiosConfig';

const SecurityManagementScreen = () => {
    const [guards, setGuards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Add Guard Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', gate: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchGuards = async () => {
        try {
            const response = await api.get(endpoints.getAllSecurity);
            if (response.data.success) {
                setGuards(response.data.data.security);
            }
        } catch (error) {
            console.error('Error fetching security guards:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchGuards();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchGuards();
    };

    const handleCreateGuard = async () => {
        if (!formData.name || !formData.email || !formData.password) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post(endpoints.createSecurity, formData);
            if (response.data.success) {
                Alert.alert('Success', 'Security guard added successfully');
                setModalVisible(false);
                setFormData({ name: '', email: '', password: '', gate: '' });
                fetchGuards();
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create security guard');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Security Management</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={guards}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <Ionicons name="shield-outline" size={60} color={COLORS.textHint} />
                            <Text style={styles.emptyText}>No security personnel found</Text>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <View style={styles.guardCard}>
                            <View style={styles.avatar}>
                                <Ionicons name="person" size={20} color={COLORS.primary} />
                            </View>
                            <View style={styles.guardInfo}>
                                <Text style={styles.guardName}>{item.name}</Text>
                                <Text style={styles.guardLocation}>Gate: {item.gate || 'Unassigned'}</Text>
                            </View>
                            <View style={[styles.statusBadge, {
                                backgroundColor: item.status === 'active' ? COLORS.success + '20' : COLORS.textSecondary + '20'
                            }]}>
                                <Text style={[styles.statusText, {
                                    color: item.status === 'active' ? COLORS.success : COLORS.textSecondary
                                }]}>
                                    {item.status || 'Active'}
                                </Text>
                            </View>
                        </View>
                    )}
                />
            )}

            {/* Add Guard Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalContainer}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Security Guard</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Officer Name"
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                            />

                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="officer@example.com"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Secure Password"
                                value={formData.password}
                                onChangeText={(text) => setFormData({ ...formData, password: text })}
                                secureTextEntry
                            />

                            <Text style={styles.label}>Gate Assignment (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., Main Gate"
                                value={formData.gate}
                                onChangeText={(text) => setFormData({ ...formData, gate: text })}
                            />

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleCreateGuard}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color={COLORS.white} />
                                ) : (
                                    <Text style={styles.submitButtonText}>Create Account</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.lg,
        backgroundColor: COLORS.white,
        ...SHADOWS.small,
    },
    headerTitle: {
        fontSize: FONTS.h4,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.xs,
        borderRadius: BORDER_RADIUS.round,
    },
    content: {
        padding: SPACING.md,
    },
    guardCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
        ...SHADOWS.small,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    guardInfo: {
        flex: 1,
    },
    guardName: {
        fontSize: FONTS.body,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    guardLocation: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    statusText: {
        fontSize: FONTS.small,
        fontWeight: '600',
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
    // Modal Styles
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    modalTitle: {
        fontSize: FONTS.h4,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    label: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
        marginTop: SPACING.md,
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        fontSize: FONTS.body,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        marginTop: SPACING.xl,
        marginBottom: SPACING.xl,
    },
    submitButtonText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: FONTS.body,
    }
});

export default SecurityManagementScreen;
