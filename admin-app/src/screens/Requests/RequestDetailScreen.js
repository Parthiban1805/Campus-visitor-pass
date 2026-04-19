import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../../components/StatusBadge';
import CustomButton from '../../components/CustomButton';
import InputModal from '../../components/InputModal';
import api, { endpoints } from '../../api/axiosConfig';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ICON_SIZES } from '../../styles/theme';

const RequestDetailScreen = ({ navigation, route }) => {
    const { request: initialRequest } = route.params;
    const [request, setRequest] = useState(initialRequest);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        placeholder: '',
        actionLabel: '',
        isDestructive: false,
        onSubmit: () => { },
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCall = (phoneNumber) => {
        if (!phoneNumber) return;
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const handleEmail = (email) => {
        if (!email) return;
        Linking.openURL(`mailto:${email}`);
    };

    const handleApprovePress = () => {
        setModalConfig({
            title: 'Approve Request',
            placeholder: 'Enter remarks (optional)',
            actionLabel: 'Approve',
            isDestructive: false,
            onSubmit: (remarks) => processApproval(remarks)
        });
        setModalVisible(true);
    };

    const handleRejectPress = () => {
        setModalConfig({
            title: 'Reject Request',
            placeholder: 'Enter reason for rejection',
            actionLabel: 'Reject',
            isDestructive: true,
            onSubmit: (remarks) => processReject(remarks)
        });
        setModalVisible(true);
    };

    const processApproval = async (remarks) => {
        setIsSubmitting(true);
        try {
            await api.put(endpoints.approveRequest(request._id), {
                validityHours: 24,
                remarks: remarks || 'Approved',
            });
            // Go back to refresh list
            navigation.goBack();
        } catch (error) {
            console.error('Failed to approve', error);
        } finally {
            setIsSubmitting(false);
            setModalVisible(false);
        }
    };

    const processReject = async (remarks) => {
        if (!remarks) {
            return; // Add alert if needed, but keeping simple for now
        }
        setIsSubmitting(true);
        try {
            await api.put(endpoints.rejectRequest(request._id), { remarks });
            navigation.goBack();
        } catch (error) {
            console.error('Failed to reject', error);
        } finally {
            setIsSubmitting(false);
            setModalVisible(false);
        }
    };

    const InfoRow = ({ icon, label, value, isLink, onPress }) => (
        <TouchableOpacity
            style={styles.infoRow}
            disabled={!isLink}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={ICON_SIZES.sm} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={[styles.infoValue, isLink && styles.linkValue]}>{value || 'N/A'}</Text>
            </View>
            {isLink && (
                <Ionicons name="chevron-forward" size={ICON_SIZES.sm} color={COLORS.textTertiary} />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={ICON_SIZES.md} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Request Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Status Section */}
                <View style={styles.statusSection}>
                    <View style={styles.visitorInfo}>
                        <Text style={styles.visitorName}>{request.visitor?.name}</Text>
                        <Text style={styles.requestTime}>Applied on {new Date(request.createdAt || Date.now()).toLocaleDateString()}</Text>
                    </View>
                    <StatusBadge status={request.status} />
                </View>

                {/* Visit Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Visit Information</Text>
                    <View style={[styles.card, SHADOWS.card]}>
                        <InfoRow
                            icon="document-text-outline"
                            label="Purpose"
                            value={request.purpose}
                        />
                        <InfoRow
                            icon="business-outline"
                            label="Department"
                            value={request.department}
                        />
                        <InfoRow
                            icon="calendar-outline"
                            label="Visit Date"
                            value={new Date(request.visitDate).toLocaleDateString(undefined, {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        />
                        <InfoRow
                            icon="time-outline"
                            label="Time Slot"
                            value={request.timeSlot}
                        />
                    </View>
                </View>

                {/* Host Details */}
                {(request.personToMeet?.name || request.personToMeet?.designation) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Meeting With</Text>
                        <View style={[styles.card, SHADOWS.card]}>
                            {request.personToMeet?.name && <InfoRow
                                icon="person-outline"
                                label="Host Name"
                                value={request.personToMeet?.name}
                            />}
                            {request.personToMeet?.designation && <InfoRow
                                icon="briefcase-outline"
                                label="Designation"
                                value={request.personToMeet?.designation}
                            />}
                            {request.personToMeet?.contact && <InfoRow
                                icon="call-outline"
                                label="Contact"
                                value={request.personToMeet?.contact}
                                isLink={true}
                                onPress={() => handleCall(request.personToMeet?.contact)}
                            />}
                        </View>
                    </View>
                )}

                {/* Visitor Contact Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Visitor Contact</Text>
                    <View style={[styles.card, SHADOWS.card]}>
                        <InfoRow
                            icon="mail-outline"
                            label="Email"
                            value={request.visitor?.email}
                            isLink
                            onPress={() => handleEmail(request.visitor?.email)}
                        />
                        <InfoRow
                            icon="call-outline"
                            label="Phone"
                            value={request.visitor?.phone}
                            isLink
                            onPress={() => handleCall(request.visitor?.phone)}
                        />
                    </View>
                </View>

                {/* Action Buttons */}
                {request.status === 'pending' && (
                    <View style={styles.actionContainer}>
                        <View style={{ flex: 1 }}>
                            <CustomButton
                                title="Reject"
                                onPress={handleRejectPress}
                                variant="outline"
                                style={{ borderColor: COLORS.error }}
                                textStyle={{ color: COLORS.error }}
                            />
                        </View>
                        <View style={{ flex: 2 }}>
                            <CustomButton
                                title="Approve"
                                onPress={handleApprovePress}
                            />
                        </View>
                    </View>
                )}
            </ScrollView>

            <InputModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                loading={isSubmitting}
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
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xxl * 2,
    },
    statusSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.xl,
        backgroundColor: COLORS.surface,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.card,
    },
    visitorInfo: {
        flex: 1,
        marginRight: SPACING.md,
    },
    visitorName: {
        fontSize: FONTS.h4,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    requestTime: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: FONTS.h5,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
        marginLeft: SPACING.xs,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.primaryAlpha10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: FONTS.body,
        color: COLORS.textPrimary,
        fontWeight: FONTS.weight.medium,
    },
    linkValue: {
        color: COLORS.primary,
        fontWeight: FONTS.weight.bold,
    },
    actionContainer: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginTop: SPACING.md,
    },
});

export default RequestDetailScreen;
