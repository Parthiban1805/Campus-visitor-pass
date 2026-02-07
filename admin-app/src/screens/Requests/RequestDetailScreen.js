// Placeholder screens for remaining Admin functionality
// These provide full UI structure with proper API integration hooks

// === RequestDetailScreen.js ===
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../../components/StatusBadge';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../styles/theme';

const RequestDetailScreen = ({ navigation, route }) => {
    const { request } = route.params;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Request Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.card}>
                    <StatusBadge status={request.status} />
                    <Text style={styles.visitorName}>{request.visitor?.name || 'Unknown'}</Text>
                    <Text style={styles.label}>Purpose</Text>
                    <Text style={styles.value}>{request.purpose}</Text>
                    <Text style={styles.label}>Department</Text>
                    <Text style={styles.value}>{request.department}</Text>
                    <Text style={styles.label}>Visit Date</Text>
                    <Text style={styles.value}>{new Date(request.visitDate).toLocaleDateString()}</Text>
                    <Text style={styles.label}>Time Slot</Text>
                    <Text style={styles.value}>{request.timeSlot}</Text>
                    {request.personToMeet && (
                        <>
                            <Text style={styles.label}>Meeting With</Text>
                            <Text style={styles.value}>{request.personToMeet.name}</Text>
                        </>
                    )}
                </View>
            </ScrollView>
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
    card: {
        backgroundColor: COLORS.white,
        margin: SPACING.lg,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        ...SHADOWS.medium,
    },
    visitorName: {
        fontSize: FONTS.h3,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginTop: SPACING.md,
        marginBottom: SPACING.lg,
    },
    label: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
    },
    value: {
        fontSize: FONTS.body,
        color: COLORS.textPrimary,
        marginTop: SPACING.xs,
    },
});


export default RequestDetailScreen;
