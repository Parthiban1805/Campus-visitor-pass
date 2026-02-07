import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../styles/theme';

const SecurityDashboardScreen = ({ navigation }) => {
    const { user, logout } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Security Gate</Text>
                    <Text style={styles.userName}>{user?.name}</Text>
                    {user?.gate && (
                        <Text style={styles.gateText}>Gate: {user.gate}</Text>
                    )}
                </View>
                <TouchableOpacity onPress={logout} style={styles.iconButton}>
                    <Ionicons name="log-out-outline" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <TouchableOpacity
                    style={styles.scanCard}
                    onPress={() => navigation.navigate('Scanner')}
                    activeOpacity={0.9}
                >
                    <View style={styles.scanIconContainer}>
                        <Ionicons name="qr-code-outline" size={48} color={COLORS.white} />
                    </View>
                    <View style={styles.scanContent}>
                        <Text style={styles.scanTitle}>Scan QR Code</Text>
                        <Text style={styles.scanSubtitle}>Verify visitor entry/exit</Text>
                    </View>
                    <Ionicons name="camera" size={28} color={COLORS.white} style={{ opacity: 0.8 }} />
                </TouchableOpacity>

                <View style={styles.grid}>
                    <DashboardCard
                        icon="time-outline"
                        title="History"
                        subtitle="Recent scans"
                        color={COLORS.primary}
                        onPress={() => navigation.navigate('History')}
                    />
                    <DashboardCard
                        icon="people-outline"
                        title="Visitors"
                        subtitle="Active on campus"
                        color={COLORS.info}
                        onPress={() => navigation.navigate('ActiveVisitors')}
                    />
                </View>

                <View style={[styles.infoCard, SHADOWS.card]}>
                    <View style={styles.infoHeader}>
                        <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
                        <Text style={styles.infoTitle}>Quick Guide</Text>
                    </View>
                    <View style={styles.infoList}>
                        <InfoItem text="Tap 'Scan QR Code' to open camera" />
                        <InfoItem text="Align QR code within the frame" />
                        <InfoItem text="Confirm details before allowing entry" />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const DashboardCard = ({ icon, title, subtitle, color, onPress }) => (
    <TouchableOpacity
        style={[styles.card, SHADOWS.card]}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <View style={[styles.cardIcon, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={28} color={color} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
);

const InfoItem = ({ text }) => (
    <View style={styles.infoItem}>
        <View style={styles.bullet} />
        <Text style={styles.infoText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.background,
    },
    greeting: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    userName: {
        fontSize: FONTS.h2,
        fontWeight: '700',
        color: COLORS.textPrimary,
        includeFontPadding: false,
    },
    gateText: {
        fontSize: FONTS.body,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
    },
    iconButton: {
        padding: SPACING.sm,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.round,
        ...SHADOWS.light,
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
    },
    scanCard: {
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        ...SHADOWS.medium,
    },
    scanIconContainer: {
        width: 64,
        height: 64,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    scanContent: {
        flex: 1,
    },
    scanTitle: {
        fontSize: FONTS.h4,
        fontWeight: '700',
        color: COLORS.white,
    },
    scanSubtitle: {
        fontSize: FONTS.body,
        color: 'rgba(255,255,255,0.8)',
    },
    grid: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    card: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.surfaceVariant,
    },
    cardIcon: {
        width: 56,
        height: 56,
        borderRadius: BORDER_RADIUS.round,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
    },
    cardTitle: {
        fontSize: FONTS.h5,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    cardSubtitle: {
        fontSize: FONTS.small,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    infoCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.surfaceVariant,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    infoTitle: {
        fontSize: FONTS.h5,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginLeft: SPACING.sm,
    },
    infoList: {
        gap: SPACING.sm,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary,
        marginRight: SPACING.sm,
    },
    infoText: {
        fontSize: FONTS.body,
        color: COLORS.textSecondary,
    },
});

export default SecurityDashboardScreen;
