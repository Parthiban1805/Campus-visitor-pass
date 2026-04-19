import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, ICON_SIZES } from '../styles/theme';

const StatusBadge = ({ status, size = 'default' }) => {
    const getStatusConfig = () => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return {
                    color: COLORS.warning,
                    backgroundColor: COLORS.warningAlpha10,
                    icon: 'time-outline',
                    label: 'Pending',
                };
            case 'approved':
                return {
                    color: COLORS.success,
                    backgroundColor: COLORS.successAlpha10,
                    icon: 'checkmark-circle',
                    label: 'Approved',
                };
            case 'rejected':
                return {
                    color: COLORS.error,
                    backgroundColor: COLORS.errorAlpha10,
                    icon: 'close-circle',
                    label: 'Rejected',
                };
            case 'active':
                return {
                    color: COLORS.info,
                    backgroundColor: COLORS.infoAlpha10,
                    icon: 'radio-button-on',
                    label: 'Active',
                };
            default:
                return {
                    color: COLORS.textSecondary,
                    backgroundColor: COLORS.surfaceVariant,
                    icon: 'help-circle-outline',
                    label: status || 'Unknown',
                };
        }
    };

    const config = getStatusConfig();
    const isSmall = size === 'small';

    return (
        <View style={[
            styles.container,
            { backgroundColor: config.backgroundColor },
            isSmall && styles.containerSmall
        ]}>
            <Ionicons
                name={config.icon}
                size={isSmall ? ICON_SIZES.xs : ICON_SIZES.sm}
                color={config.color}
            />
            <Text style={[
                styles.text,
                { color: config.color },
                isSmall && styles.textSmall
            ]}>
                {config.label}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs + 2,
        borderRadius: BORDER_RADIUS.pill,
        alignSelf: 'flex-start',
    },
    containerSmall: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
    },
    text: {
        fontSize: FONTS.caption,
        fontWeight: FONTS.weight.medium,
        marginLeft: SPACING.xs,
        letterSpacing: 0.2,
    },
    textSmall: {
        fontSize: FONTS.small,
    },
});

export default StatusBadge;
