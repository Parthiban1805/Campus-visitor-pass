import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/theme';

const InputModal = ({
    visible,
    onClose,
    onSubmit,
    title,
    placeholder,
    actionLabel = 'Submit',
    isDestructive = false,
    loading = false
}) => {
    const [value, setValue] = useState('');

    const handleSubmit = () => {
        onSubmit(value);
        setValue('');
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{title}</Text>

                    <TextInput
                        style={styles.input}
                        placeholder={placeholder}
                        value={value}
                        onChangeText={setValue}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                isDestructive ? styles.destructiveButton : styles.primaryButton,
                                loading && styles.disabledButton
                            ]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.white} size="small" />
                            ) : (
                                <Text style={styles.buttonText}>{actionLabel}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: SPACING.lg,
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        ...SHADOWS.large,
    },
    modalTitle: {
        fontSize: FONTS.h4,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        fontSize: FONTS.body,
        minHeight: 80,
        marginBottom: SPACING.lg,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: SPACING.md,
    },
    button: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        minWidth: 80,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: COLORS.background,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
    },
    destructiveButton: {
        backgroundColor: COLORS.error,
    },
    disabledButton: {
        opacity: 0.7,
    },
    cancelText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    buttonText: {
        color: COLORS.white,
        fontWeight: '600',
    },
});

export default InputModal;
