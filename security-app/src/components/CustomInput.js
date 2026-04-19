import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, DIMENSIONS, ICON_SIZES } from '../styles/theme';

const CustomInput = ({
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'none',
    error,
    icon,
    multiline = false,
    numberOfLines = 1,
    style,
    editable = true,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputContainerFocused,
                    error && styles.inputContainerError,
                    !editable && styles.inputContainerDisabled,
                ]}
            >
                {icon && (
                    <Ionicons
                        name={icon}
                        size={ICON_SIZES.sm}
                        color={isFocused ? COLORS.primary : COLORS.textTertiary}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={[styles.input, multiline && styles.multilineInput]}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textTertiary}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    editable={editable}
                />
                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={styles.eyeIcon}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                            size={ICON_SIZES.sm}
                            color={COLORS.textTertiary}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={ICON_SIZES.xs} color={COLORS.error} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: FONTS.caption,
        fontWeight: FONTS.weight.medium,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
        marginLeft: SPACING.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: SPACING.md,
        minHeight: DIMENSIONS.inputHeight,
    },
    inputContainerFocused: {
        borderColor: COLORS.primary,
        borderWidth: 1.5,
        backgroundColor: COLORS.surface,
    },
    inputContainerError: {
        borderColor: COLORS.error,
        backgroundColor: COLORS.errorAlpha10,
    },
    inputContainerDisabled: {
        backgroundColor: COLORS.surfaceVariant,
        borderColor: COLORS.border,
    },
    icon: {
        marginRight: SPACING.sm,
    },
    input: {
        flex: 1,
        fontSize: FONTS.body,
        color: COLORS.textPrimary,
        height: '100%',
        paddingVertical: SPACING.sm, // Ensure text isn't cut off
    },
    multilineInput: {
        minHeight: 120,
        textAlignVertical: 'top',
        paddingTop: SPACING.md,
    },
    eyeIcon: {
        padding: SPACING.sm,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.xs,
        paddingLeft: SPACING.xs,
    },
    errorText: {
        color: COLORS.error,
        fontSize: FONTS.caption,
        marginLeft: SPACING.xs,
    },
});

export default CustomInput;
