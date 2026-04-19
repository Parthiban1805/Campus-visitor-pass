import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ICON_SIZES } from '../../styles/theme';

const SecurityDashboardScreen = ({ navigation }) => {
    const { user, logout } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>WELCOME BACK</Text>
                    <Text style={styles.userName}>{user?.name || 'Security Officer'}</Text>
                    <View style={styles.gateBadge}>
                        <Ionicons name="location-sharp" size={12} color={COLORS.primary} />
                        <Text style={styles.gateText}>{user?.gate || 'Main Gate'}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={ICON_SIZES.md} color={COLORS.error} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Main Action - Scan */}
                <TouchableOpacity
                    style={[styles.scanCard, SHADOWS.lg]}
                    onPress={() => navigation.navigate('Scanner')}
                    activeOpacity={0.9}
                >
                    <View style={styles.scanContent}>
                        <View style={styles.scanTag}>
                            <Text style={styles.scanTagText}>QUICK ACTION</Text>
                        </View>
                        <Text style={styles.scanTitle}>Scan Entry Pass</Text>
                        <Text style={styles.scanSubtitle}>
                            Verify visitor QR codes for check-in/out
                        </Text>
                    </View>
                    <View style={styles.scanIconWrapper}>
                        <Ionicons name="qr-code" size={48} color={COLORS.primary} />
                    </View>
                </TouchableOpacity>

                {/* Quick Stats / Navigation Grid */}
                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.grid}>
                    <DashboardCard
                        icon="people"
                        title="Active Visitors"
                        subtitle="Currently on campus"
                        color={COLORS.info}
                        onPress={() => navigation.navigate('ActiveVisitors')}
                    />
                    <DashboardCard
                        icon="time"
                        title="Visit History"
                        subtitle="Past entry logs"
                        color={COLORS.secondary}
                        onPress={() => navigation.navigate('History')}
                    />
                </View>

                {/* Instructions / Status */}
                <View style={[styles.infoCard, SHADOWS.card]}>
                    <View style={styles.infoHeader}>
                        <Ionicons name="shield-checkmark" size={ICON_SIZES.md} color={COLORS.success} />
                        <Text style={styles.infoTitle}>System Status: Online</Text>
                    </View>
                    <Text style={styles.infoDesc}>
                        Syncing with central server. All access control lists are up to date.
                    </Text>
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
        <View style={[styles.cardIcon, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={ICON_SIZES.lg} color={color} />
        </View>
        <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.cardArrow}>
            <Ionicons name="chevron-forward" size={ICON_SIZES.sm} color={COLORS.textTertiary} />
        </View>
    </TouchableOpacity>
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
        paddingTop: SPACING.md,
        paddingBottom: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    greeting: {
        fontSize: FONTS.tiny,
        color: COLORS.textSecondary,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 2,
    },
    userName: {
        fontSize: FONTS.h4,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
    },
    gateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryAlpha10,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.pill,
        alignSelf: 'flex-start',
        marginTop: SPACING.xs,
    },
    gateText: {
        fontSize: FONTS.small,
        color: COLORS.primary,
        fontWeight: '600',
        marginLeft: 4,
    },
    logoutButton: {
        padding: SPACING.sm,
        backgroundColor: COLORS.errorAlpha10,
        borderRadius: BORDER_RADIUS.round,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    // Scan Card
    scanCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.primaryAlpha20,
        overflow: 'hidden',
    },
    scanContent: {
        flex: 1,
        marginRight: SPACING.md,
    },
    scanTag: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
        alignSelf: 'flex-start',
        marginBottom: SPACING.sm,
    },
    scanTagText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    scanTitle: {
        fontSize: FONTS.h3,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    scanSubtitle: {
        fontSize: FONTS.body,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    scanIconWrapper: {
        width: 80,
        height: 80,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: COLORS.primaryAlpha10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Grid
    sectionTitle: {
        fontSize: FONTS.h5,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    grid: {
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardIcon: {
        width: 50,
        height: 50,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    cardTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: FONTS.h6,
        fontWeight: FONTS.weight.semibold,
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
    },
    cardArrow: {
        marginLeft: SPACING.sm,
    },
    // Info Card
    infoCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.successAlpha10,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    infoTitle: {
        fontSize: FONTS.body,
        fontWeight: FONTS.weight.semibold,
        color: COLORS.success,
        marginLeft: SPACING.sm,
    },
    infoDesc: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
});

export default SecurityDashboardScreen;
