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
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../styles/theme';
import * as DocumentPicker from 'expo-document-picker';

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
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity
                    onPress={isEditing ? cancelEdit : () => setIsEditing(true)}
                >
                    <Ionicons
                        name={isEditing ? 'close' : 'create-outline'}
                        size={24}
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
                        <Ionicons name="person" size={50} color={COLORS.white} />
                    </View>
                    <Text style={styles.userName}>{user?.name}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </View>

                {/* Profile Form */}
                <View style={[styles.card, SHADOWS.medium]}>
                    <Text style={styles.cardTitle}>Personal Information</Text>

                    <CustomInput
                        placeholder="Full Name"
                        value={formData.name}
                        onChangeText={(value) => setFormData({ ...formData, name: value })}
                        icon="person-outline"
                        autoCapitalize="words"
                        style={styles.input}
                        editable={isEditing}
                    />

                    <CustomInput
                        placeholder="Email Address"
                        value={formData.email}
                        icon="mail-outline"
                        style={styles.input}
                        editable={false}
                    />

                    <CustomInput
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChangeText={(value) => setFormData({ ...formData, phone: value })}
                        keyboardType="phone-pad"
                        icon="call-outline"
                        style={styles.input}
                        editable={isEditing}
                    />

                    <CustomInput
                        placeholder="Address"
                        value={formData.address}
                        onChangeText={(value) => setFormData({ ...formData, address: value })}
                        icon="location-outline"
                        autoCapitalize="words"
                        multiline
                        numberOfLines={2}
                        style={styles.input}
                        editable={isEditing}
                    />

                    {isEditing && (
                        <CustomButton
                            title="Upload ID Proof"
                            onPress={handleUploadDocument}
                            variant="secondary"
                            loading={loading}
                            style={{ marginTop: SPACING.md }}
                        />
                    )}

                    {isEditing && (
                        <CustomButton
                            title="Save Changes"
                            onPress={handleUpdate}
                            loading={loading}
                            style={styles.saveButton}
                        />
                    )}
                </View>

                {/* Statistics Card */}
                {!isEditing && user?.stats && (
                    <View style={[styles.card, SHADOWS.medium]}>
                        <Text style={styles.cardTitle}>Visit Statistics</Text>

                        <View style={styles.statsGrid}>
                            <StatItem
                                icon="document-text"
                                label="Total Requests"
                                value={user.stats.totalRequests || 0}
                                color={COLORS.primary}
                            />
                            <StatItem
                                icon="time"
                                label="Pending"
                                value={user.stats.pendingRequests || 0}
                                color={COLORS.warning}
                            />
                            <StatItem
                                icon="checkmark-circle"
                                label="Approved"
                                value={user.stats.approvedRequests || 0}
                                color={COLORS.success}
                            />
                            <StatItem
                                icon="close-circle"
                                label="Rejected"
                                value={user.stats.rejectedRequests || 0}
                                color={COLORS.error}
                            />
                        </View>
                    </View>
                )}

                {/* Settings Options */}
                {!isEditing && (
                    <View style={[styles.card, SHADOWS.medium]}>
                        <Text style={styles.cardTitle}>Settings</Text>

                        <TouchableOpacity style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <Ionicons name="notifications-outline" size={22} color={COLORS.textSecondary} />
                                <Text style={styles.settingText}>Notifications</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.textHint} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <Ionicons name="lock-closed-outline" size={22} color={COLORS.textSecondary} />
                                <Text style={styles.settingText}>Change Password</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.textHint} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <Ionicons name="help-circle-outline" size={22} color={COLORS.textSecondary} />
                                <Text style={styles.settingText}>Help & Support</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.textHint} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <Ionicons name="information-circle-outline" size={22} color={COLORS.textSecondary} />
                                <Text style={styles.settingText}>About</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.textHint} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Logout Button */}
                {!isEditing && (
                    <CustomButton
                        title="Logout"
                        onPress={handleLogout}
                        variant="outline"
                        style={styles.logoutButton}
                    />
                )}
            </ScrollView>
        </View>
    );
};

const StatItem = ({ icon, label, value, color }) => (
    <View style={styles.statItem}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
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
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: SPACING.xxl,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        backgroundColor: COLORS.white,
        marginBottom: SPACING.lg,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    userName: {
        fontSize: FONTS.h3,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    userEmail: {
        fontSize: FONTS.body,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
    },
    cardTitle: {
        fontSize: FONTS.h5,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    input: {
        marginBottom: SPACING.sm,
    },
    saveButton: {
        marginTop: SPACING.md,
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
    statValue: {
        fontSize: FONTS.h3,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginTop: SPACING.xs,
    },
    statLabel: {
        fontSize: FONTS.small,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
        textAlign: 'center',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
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
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.md,
    },
});

export default ProfileScreen;
