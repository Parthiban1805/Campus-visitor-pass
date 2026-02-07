import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/theme';

const CustomButton = ({
    title,
    onPress,
    loading = false,
    disabled = false,
    variant = 'primary',  // primary, secondary, outline
    style,
    textStyle,
}) => {
    const getButtonStyle = () => {
        if (variant === 'outline') {
            return [styles.button, styles.outlineButton, style];
        }
        return [styles.button, style];
    };

    const getTextStyle = () => {
        if (variant === 'outline') {
            return [styles.buttonText, styles.outlineButtonText, textStyle];
        }
        return [styles.buttonText, textStyle];
    };

    const content = (
        <>
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.white} />
            ) : (
                <Text style={getTextStyle()}>{title}</Text>
            )}
        </>
    );

    if (variant === 'outline') {
        return (
            <TouchableOpacity
                style={getButtonStyle()}
                onPress={onPress}
                disabled={disabled || loading}
                activeOpacity={0.8}
            >
                {content}
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[style, styles.buttonContainer]}
        >
            <LinearGradient
                colors={
                    variant === 'secondary'
                        ? [COLORS.secondary, COLORS.secondaryDark]
                        : [COLORS.gradientStart, COLORS.gradientEnd]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.button, styles.gradient, disabled && styles.disabled]}
            >
                {content}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        borderRadius: BORDER_RADIUS.md,
        ...SHADOWS.small,
    },
    button: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    gradient: {
        borderRadius: BORDER_RADIUS.md,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: FONTS.body,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    outlineButtonText: {
        color: COLORS.primary,
    },
    disabled: {
        opacity: 0.6,
    },
});

export default CustomButton;
