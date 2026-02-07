import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../styles/theme';

const CustomInput = ({
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
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <View style={[styles.container, style]}>
            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputContainerFocused,
                    error && styles.inputContainerError,
                ]}
            >
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={isFocused ? COLORS.primary : COLORS.textSecondary}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={[styles.input, multiline && styles.multilineInput]}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textHint}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                />
                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={styles.eyeIcon}
                    >
                        <Ionicons
                            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={COLORS.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color={COLORS.error} />
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: SPACING.md,
        minHeight: 50,
    },
    inputContainerFocused: {
        borderColor: COLORS.primary,
        borderWidth: 2,
    },
    inputContainerError: {
        borderColor: COLORS.error,
    },
    icon: {
        marginRight: SPACING.sm,
    },
    input: {
        flex: 1,
        fontSize: FONTS.body,
        color: COLORS.textPrimary,
        paddingVertical: SPACING.sm,
    },
    multilineInput: {
        minHeight: 100,
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
        fontSize: FONTS.small,
        marginLeft: SPACING.xs,
    },
});

export default CustomInput;
