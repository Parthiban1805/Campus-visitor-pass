import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../styles/theme';

const StatusBadge = ({ status }) => {
    const getStatusConfig = () => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return {
                    color: COLORS.warning,
                    icon: 'time-outline',
                    label: 'Pending',
                };
            case 'approved':
                return {
                    color: COLORS.success,
                    icon: 'checkmark-circle',
                    label: 'Approved',
                };
            case 'rejected':
                return {
                    color: COLORS.error,
                    icon: 'close-circle',
                    label: 'Rejected',
                };
            default:
                return {
                    color: COLORS.textSecondary,
                    icon: 'help-circle',
                    label: status || 'Unknown',
                };
        }
    };

    const config = getStatusConfig();

    return (
        <View style={[styles.container, { backgroundColor: `${config.color}15` }]}>
            <Ionicons name={config.icon} size={16} color={config.color} />
            <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.pill,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: FONTS.caption,
        fontWeight: '600',
        marginLeft: SPACING.xs,
        textTransform: 'capitalize',
    },
});

export default StatusBadge;
