import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, DIMENSIONS } from '../styles/theme';

const CustomButton = ({
    title,
    onPress,
    loading = false,
    disabled = false,
    variant = 'primary',  // primary, secondary, outline, ghost, danger
    size = 'default', // default, small, large
    style,
    textStyle,
    icon,
    iconPosition = 'left', // left, right
}) => {
    const getButtonStyle = () => {
        const baseStyle = [styles.button];

        // Size variants
        if (size === 'small') baseStyle.push(styles.buttonSmall);
        if (size === 'large') baseStyle.push(styles.buttonLarge);

        // Variant styles
        switch (variant) {
            case 'primary':
                baseStyle.push(styles.primaryButton);
                break;
            case 'secondary':
                baseStyle.push(styles.secondaryButton);
                break;
            case 'outline':
                baseStyle.push(styles.outlineButton);
                break;
            case 'ghost':
                baseStyle.push(styles.ghostButton);
                break;
            case 'danger':
                baseStyle.push(styles.dangerButton);
                break;
            default:
                baseStyle.push(styles.primaryButton);
        }

        // Disabled state
        if (disabled || loading) {
            baseStyle.push(styles.disabled);
        }

        // Custom styles
        if (style) baseStyle.push(style);

        return baseStyle;
    };

    const getTextStyle = () => {
        const baseStyle = [styles.buttonText];

        // Size variants
        if (size === 'small') baseStyle.push(styles.buttonTextSmall);
        if (size === 'large') baseStyle.push(styles.buttonTextLarge);

        // Variant text colors
        switch (variant) {
            case 'primary':
            case 'danger':
                baseStyle.push(styles.primaryButtonText);
                break;
            case 'secondary':
                baseStyle.push(styles.secondaryButtonText);
                break;
            case 'outline':
            case 'ghost':
                baseStyle.push(styles.outlineButtonText);
                break;
        }

        if (textStyle) baseStyle.push(textStyle);

        return baseStyle;
    };

    const getActivityIndicatorColor = () => {
        if (variant === 'outline' || variant === 'ghost') {
            return COLORS.primary;
        }
        return COLORS.white;
    };

    return (
        <TouchableOpacity
            style={getButtonStyle()}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.85}
        >
            {loading ? (
                <ActivityIndicator color={getActivityIndicatorColor()} size="small" />
            ) : (
                <View style={styles.content}>
                    {icon && iconPosition === 'left' && (
                        <View style={styles.iconLeft}>{icon}</View>
                    )}
                    <Text style={getTextStyle()}>{title}</Text>
                    {icon && iconPosition === 'right' && (
                        <View style={styles.iconRight}>{icon}</View>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        minHeight: DIMENSIONS.buttonHeight,
        paddingVertical: SPACING.md - 2,
        paddingHorizontal: SPACING.lg,
    },
    buttonSmall: {
        minHeight: 40,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
    },
    buttonLarge: {
        minHeight: 56,
        paddingVertical: SPACING.md + 2,
        paddingHorizontal: SPACING.xl,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconLeft: {
        marginRight: SPACING.sm,
    },
    iconRight: {
        marginLeft: SPACING.sm,
    },

    // Variant Styles
    primaryButton: {
        backgroundColor: COLORS.primary,
        ...SHADOWS.button,
    },
    secondaryButton: {
        backgroundColor: COLORS.secondary,
        ...SHADOWS.sm,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    ghostButton: {
        backgroundColor: COLORS.primaryAlpha10,
    },
    dangerButton: {
        backgroundColor: COLORS.error,
        ...SHADOWS.sm,
    },

    // Text Styles
    buttonText: {
        fontSize: FONTS.body,
        fontWeight: FONTS.weight.semibold,
        letterSpacing: 0.3,
    },
    buttonTextSmall: {
        fontSize: FONTS.caption,
    },
    buttonTextLarge: {
        fontSize: FONTS.h5,
    },
    primaryButtonText: {
        color: COLORS.white,
    },
    secondaryButtonText: {
        color: COLORS.white,
    },
    outlineButtonText: {
        color: COLORS.primary,
    },

    // State Styles
    disabled: {
        opacity: 0.5,
    },
});

export default CustomButton;

