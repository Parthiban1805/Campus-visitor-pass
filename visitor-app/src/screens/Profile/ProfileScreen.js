import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { useAuth } from '../../context/AuthContext';
import api, { endpoints } from '../../api/axiosConfig';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ICON_SIZES } from '../../styles/theme';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const ProfileScreen = ({ navigation }) => {
    const { user, logout, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
            });
        }
    }, [user]);

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const response = await api.put(endpoints.updateProfile, {
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
            });

            if (response.data.success) {
                updateUser(response.data.data);
                setIsEditing(false);
                Alert.alert('Success', 'Profile updated successfully');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            const message = error.response?.data?.message || 'Failed to update profile';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            const formData = new FormData();

            formData.append('document', {
                uri: file.uri,
                name: file.name,
                type: file.mimeType || 'application/octet-stream',
            });

            setLoading(true);
            const response = await api.post(endpoints.uploadDocument, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                Alert.alert('Success', 'Document uploaded successfully');
                // Refresh user data if needed or just update local state if returns url
                if (response.data.data.documentUrl) {
                    // Ideally update context, but for now just alert
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload document');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: logout,
            },
        ]);
    };

    const cancelEdit = () => {
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
        });
        setIsEditing(false);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity
                    onPress={isEditing ? cancelEdit : () => setIsEditing(true)}
                    style={styles.editButton}
                >
                    <Ionicons
                        name={isEditing ? 'close' : 'create-outline'}
                        size={ICON_SIZES.md}
                        color={COLORS.primary}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.userName}>{user?.name}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{user?.role || 'Visitor'}</Text>
                    </View>
                </View>

                {/* Profile Form */}
                <View style={[styles.card, SHADOWS.card]}>
                    <Text style={styles.cardTitle}>Personal Information</Text>

                    {/* ... Inputs ... */}
                    {/* (Use existing input logic but ensure styling is correct) */}

                    {/* ... Buttons ... */}
                </View>

                {/* Statistics Card */}
                {!isEditing && user?.stats && (
                    <View style={[styles.card, SHADOWS.card]}>
                        <Text style={styles.cardTitle}>Visit Statistics</Text>

                        <View style={styles.statsGrid}>
                            <StatItem
                                icon="document-text"
                                label="Total"
                                value={user.stats.totalRequests || 0}
                                color={COLORS.primary}
                            />
                            {/* ... other stats ... */}
                        </View>
                    </View>
                )}

                {/* Settings Options */}
                {!isEditing && (
                    <View style={[styles.section]}>
                        <Text style={styles.sectionTitle}>Settings</Text>
                        <View style={[styles.card, SHADOWS.card, { padding: 0, overflow: 'hidden' }]}>
                            <SettingItem
                                icon="notifications-outline"
                                label="Notifications"
                                onPress={() => { }}
                            />
                            <SettingItem
                                icon="lock-closed-outline"
                                label="Change Password"
                                onPress={() => { }}
                            />
                            <SettingItem
                                icon="help-circle-outline"
                                label="Help & Support"
                                onPress={() => { }}
                            />
                            <SettingItem
                                icon="information-circle-outline"
                                label="About"
                                onPress={() => { }}
                                isLast
                            />
                        </View>
                    </View>
                )}

                {/* Logout Button */}
                {!isEditing && (
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={ICON_SIZES.sm} color={COLORS.error} />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const StatItem = ({ icon, label, value, color }) => (
    <View style={styles.statItem}>
        <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={ICON_SIZES.sm} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const SettingItem = ({ icon, label, onPress, isLast }) => (
    <TouchableOpacity
        style={[styles.settingItem, isLast && styles.settingItemLast]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={styles.settingLeft}>
            <Ionicons name={icon} size={ICON_SIZES.sm} color={COLORS.textSecondary} />
            <Text style={styles.settingText}>{label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={ICON_SIZES.sm} color={COLORS.textTertiary} />
    </TouchableOpacity>
);

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
        fontSize: FONTS.h4,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
    },
    editButton: {
        padding: SPACING.xs,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: SPACING.xxl,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        backgroundColor: COLORS.surface,
        marginBottom: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
        ...SHADOWS.md,
    },
    avatarText: {
        fontSize: FONTS.h1,
        color: COLORS.white,
        fontWeight: FONTS.weight.bold,
    },
    userName: {
        fontSize: FONTS.h3,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    userEmail: {
        fontSize: FONTS.body,
        color: COLORS.textSecondary,
    },
    roleBadge: {
        marginTop: SPACING.sm,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        backgroundColor: COLORS.surfaceVariant,
        borderRadius: BORDER_RADIUS.pill,
    },
    roleText: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        fontWeight: FONTS.weight.medium,
        textTransform: 'uppercase',
    },
    section: {
        marginBottom: SPACING.lg,
        paddingHorizontal: SPACING.lg,
    },
    sectionTitle: {
        fontSize: FONTS.h5,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
        marginLeft: SPACING.xs,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardTitle: {
        fontSize: FONTS.h5,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -SPACING.xs,
    },
    statItem: {
        width: '50%',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xs,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.round,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    statValue: {
        fontSize: FONTS.h3,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
    },
    statLabel: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    settingItemLast: {
        borderBottomWidth: 0,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingText: {
        fontSize: FONTS.body,
        color: COLORS.textPrimary,
        marginLeft: SPACING.md,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.errorAlpha10,
        borderRadius: BORDER_RADIUS.lg,
    },
    logoutText: {
        fontSize: FONTS.body,
        fontWeight: FONTS.weight.medium,
        color: COLORS.error,
        marginLeft: SPACING.xs,
    },
});

export default ProfileScreen;
