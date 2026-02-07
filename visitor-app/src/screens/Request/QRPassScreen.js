import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../../components/StatusBadge';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../styles/theme';

const QRPassScreen = ({ navigation, route }) => {
    const { request } = route.params;
    const [timeRemaining, setTimeRemaining] = useState('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (request.qrCode && request.qrCode.expiresAt) {
            const interval = setInterval(() => {
                const now = new Date();
                const expiry = new Date(request.qrCode.expiresAt);
                const diff = expiry - now;

                if (diff <= 0) {
                    setIsExpired(true);
                    setTimeRemaining('Expired');
                    clearInterval(interval);
                } else {
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    setTimeRemaining(`${hours}h ${minutes}m`);
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [request]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            weekday: 'long',
            month: 'long',
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

    if (!request.qrCode || request.status !== 'approved') {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>QR Pass</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.noQRContainer}>
                    <Ionicons name="qr-code-outline" size={100} color={COLORS.textHint} />
                    <Text style={styles.noQRTitle}>No QR Code Available</Text>
                    <Text style={styles.noQRText}>
                        {request.status === 'pending'
                            ? 'Your request is pending approval'
                            : request.status === 'rejected'
                                ? 'Your request was rejected'
                                : 'QR code not generated yet'}
                    </Text>
                    <StatusBadge status={request.status} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>QR Pass</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Status Banner */}
                <View
                    style={[
                        styles.statusBanner,
                        isExpired && styles.expiredBanner,
                        { backgroundColor: isExpired ? `${COLORS.error}15` : `${COLORS.success}15` },
                    ]}
                >
                    <Ionicons
                        name={isExpired ? 'alert-circle' : 'checkmark-circle'}
                        size={24}
                        color={isExpired ? COLORS.error : COLORS.success}
                    />
                    <View style={styles.statusInfo}>
                        <Text
                            style={[
                                styles.statusText,
                                { color: isExpired ? COLORS.error : COLORS.success },
                            ]}
                        >
                            {isExpired ? 'QR Pass Expired' : 'QR Pass Active'}
                        </Text>
                        {!isExpired && (
                            <Text style={styles.expiryText}>
                                Valid for: {timeRemaining}
                            </Text>
                        )}
                    </View>
                </View>

                {/* QR Code Display */}
                <View style={[styles.qrContainer, SHADOWS.large]}>
                    <View style={styles.qrWrapper}>
                        {isExpired ? (
                            <View style={styles.expiredOverlay}>
                                <Ionicons name="close-circle" size={80} color={COLORS.error} />
                                <Text style={styles.expiredText}>EXPIRED</Text>
                            </View>
                        ) : (
                            <QRCode
                                value={request.qrCode.data}
                                size={250}
                                backgroundColor={COLORS.white}
                                color={COLORS.textPrimary}
                            />
                        )}
                    </View>
                    <Text style={styles.qrHint}>
                        {isExpired
                            ? 'This QR code has expired'
                            : 'Present this QR code at the security gate'}
                    </Text>
                </View>

                {/* Visitor Details */}
                <View style={[styles.detailsCard, SHADOWS.medium]}>
                    <Text style={styles.cardTitle}>Visit Details</Text>

                    <DetailRow
                        icon="calendar"
                        label="Date"
                        value={formatDate(request.visitDate)}
                    />
                    <DetailRow icon="time" label="Time Slot" value={request.timeSlot} />
                    <DetailRow icon="business" label="Department" value={request.department} />
                    <DetailRow
                        icon="person"
                        label="Meeting With"
                        value={request.personToMeet.name}
                    />
                    {request.personToMeet.designation && (
                        <DetailRow
                            icon="briefcase"
                            label="Designation"
                            value={request.personToMeet.designation}
                        />
                    )}
                    <DetailRow
                        icon="document-text"
                        label="Purpose"
                        value={request.purpose}
                    />
                </View>

                {/* QR Info */}
                <View style={[styles.detailsCard, SHADOWS.medium]}>
                    <Text style={styles.cardTitle}>QR Code Information</Text>

                    <DetailRow
                        icon="shield-checkmark"
                        label="Generated"
                        value={formatTime(request.qrCode.generatedAt)}
                    />
                    <DetailRow
                        icon="time"
                        label="Expires"
                        value={formatTime(request.qrCode.expiresAt)}
                    />
                    <DetailRow
                        icon="lock-closed"
                        label="Security"
                        value="Encrypted & Tamper-Proof"
                    />
                </View>

                {/* Instructions */}
                <View style={styles.instructionsCard}>
                    <Text style={styles.instructionsTitle}>
                        <Ionicons name="information-circle" size={18} color={COLORS.primary} />{' '}
                        Instructions
                    </Text>
                    <Text style={styles.instructionText}>
                        • Present this QR code to security personnel at the gate
                    </Text>
                    <Text style={styles.instructionText}>
                        • Ensure your QR code is clearly visible
                    </Text>
                    <Text style={styles.instructionText}>
                        • Carry a valid ID proof with you
                    </Text>
                    <Text style={styles.instructionText}>
                        • The QR code will be scanned at entry and exit
                    </Text>
                    <Text style={styles.instructionText}>
                        • Do not share your QR code with anyone
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const DetailRow = ({ icon, label, value }) => (
    <View style={styles.detailRow}>
        <View style={styles.detailLabel}>
            <Ionicons name={icon} size={18} color={COLORS.textSecondary} />
            <Text style={styles.labelText}>{label}</Text>
        </View>
        <Text style={styles.valueText}>{value}</Text>
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
    backButton: {
        padding: SPACING.sm,
    },
    headerTitle: {
        fontSize: FONTS.h4,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
    noQRContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xxl,
    },
    noQRTitle: {
        fontSize: FONTS.h4,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginTop: SPACING.lg,
    },
    noQRText: {
        fontSize: FONTS.body,
        color: COLORS.textSecondary,
        marginTop: SPACING.sm,
        marginBottom: SPACING.lg,
        textAlign: 'center',
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.lg,
    },
    expiredBanner: {
        backgroundColor: `${COLORS.error}15`,
    },
    statusInfo: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    statusText: {
        fontSize: FONTS.h6,
        fontWeight: '600',
    },
    expiryText: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
    },
    qrContainer: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    qrWrapper: {
        padding: SPACING.lg,
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        position: 'relative',
    },
    expiredOverlay: {
        width: 250,
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    expiredText: {
        fontSize: FONTS.h3,
        fontWeight: '700',
        color: COLORS.error,
        marginTop: SPACING.md,
    },
    qrHint: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: SPACING.md,
    },
    detailsCard: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
    },
    cardTitle: {
        fontSize: FONTS.h5,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        marginBottom: SPACING.sm,
    },
    detailLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    labelText: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        marginLeft: SPACING.xs,
    },
    valueText: {
        fontSize: FONTS.caption,
        color: COLORS.textPrimary,
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    instructionsCard: {
        backgroundColor: `${COLORS.info}10`,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        marginTop: SPACING.md,
    },
    instructionsTitle: {
        fontSize: FONTS.h6,
        fontWeight: '600',
        color: COLORS.primary,
        marginBottom: SPACING.md,
    },
    instructionText: {
        fontSize: FONTS.caption,
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
        lineHeight: 20,
    },
});

export default QRPassScreen;
