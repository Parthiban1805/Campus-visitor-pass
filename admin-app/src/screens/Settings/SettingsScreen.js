import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, FONTS, SHADOWS, BORDER_RADIUS } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const SettingsScreen = () => {
    const { logout } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);

    // Change Password State
    const [passModalVisible, setPassModalVisible] = useState(false);
    const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
    const [passLoading, setPassLoading] = useState(false);

    const handleDarkModeToggle = (value) => {
        setDarkModeEnabled(value);
        // In a real app, this would update a ThemeContext
        Alert.alert('Theme Update', value ? 'Dark mode enabled (Preview)' : 'Light mode enabled');
    };

    const handleChangePassword = async () => {
        if (!passForm.current || !passForm.new || !passForm.confirm) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (passForm.new !== passForm.confirm) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        setPassLoading(true);
        // Simulate API call
        setTimeout(() => {
            setPassLoading(false);
            setPassModalVisible(false);
            setPassForm({ current: '', new: '', confirm: '' });
            Alert.alert('Success', 'Password changed successfully');
        }, 1500);
    };

    const SettingsItem = ({ icon, title, showSwitch, value, onValueChange, onPress, destructive }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={onPress}
            disabled={showSwitch}
        >
            <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: destructive ? COLORS.error + '20' : COLORS.primary + '20' }]}>
                    <Ionicons name={icon} size={20} color={destructive ? COLORS.error : COLORS.primary} />
                </View>
                <Text style={[styles.itemTitle, destructive && { color: COLORS.error }]}>{title}</Text>
            </View>
            {showSwitch ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: COLORS.textHint, true: COLORS.primaryLight }}
                    thumbColor={value ? COLORS.primary : COLORS.white}
                />
            ) : (
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>
            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Preferences</Text>
                    <SettingsItem
                        icon="notifications-outline"
                        title="Notifications"
                        showSwitch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                    />
                    <SettingsItem
                        icon="moon-outline"
                        title="Dark Mode"
                        showSwitch
                        value={darkModeEnabled}
                        onValueChange={handleDarkModeToggle}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Account</Text>
                    <SettingsItem
                        icon="person-outline"
                        title="Edit Profile"
                        onPress={() => Alert.alert('Info', 'Profile editing coming soon')}
                    />
                    <SettingsItem
                        icon="lock-closed-outline"
                        title="Change Password"
                        onPress={() => setPassModalVisible(true)}
                    />
                </View>

                <View style={styles.section}>
                    <SettingsItem
                        icon="log-out-outline"
                        title="Logout"
                        destructive
                        onPress={logout}
                    />
                </View>
            </ScrollView>

            {/* Change Password Modal */}
            <Modal
                transparent
                visible={passModalVisible}
                animationType="slide"
                onRequestClose={() => setPassModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Change Password</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Current Password"
                            secureTextEntry
                            value={passForm.current}
                            onChangeText={t => setPassForm({ ...passForm, current: t })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="New Password"
                            secureTextEntry
                            value={passForm.new}
                            onChangeText={t => setPassForm({ ...passForm, new: t })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm New Password"
                            secureTextEntry
                            value={passForm.confirm}
                            onChangeText={t => setPassForm({ ...passForm, confirm: t })}
                        />

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setPassModalVisible(false)}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.primaryButton]}
                                onPress={handleChangePassword}
                                disabled={passLoading}
                            >
                                {passLoading ? (
                                    <ActivityIndicator color={COLORS.white} size="small" />
                                ) : (
                                    <Text style={styles.buttonText}>Update</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
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
    content: {
        padding: SPACING.md,
    },
    section: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
        marginBottom: SPACING.md,
        ...SHADOWS.small,
    },
    sectionHeader: {
        fontSize: FONTS.small,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        marginLeft: SPACING.sm,
        marginTop: SPACING.sm,
        marginBottom: SPACING.xs,
        textTransform: 'uppercase',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        padding: 8,
        borderRadius: BORDER_RADIUS.md,
        marginRight: SPACING.md,
    },
    itemTitle: {
        fontSize: FONTS.body,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        minHeight: 400,
    },
    modalTitle: {
        fontSize: FONTS.h4,
        fontWeight: 'bold',
        marginBottom: SPACING.lg,
        textAlign: 'center',
    },
    input: {
        backgroundColor: COLORS.background,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginTop: SPACING.md,
    },
    button: {
        flex: 1,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
    },
    cancelText: {
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    buttonText: {
        fontWeight: '600',
        color: COLORS.white,
    },
});

export default SettingsScreen;
