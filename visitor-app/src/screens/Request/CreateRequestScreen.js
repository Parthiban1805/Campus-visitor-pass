import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import api, { endpoints } from '../../api/axiosConfig';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, DIMENSIONS, ICON_SIZES } from '../../styles/theme';

const DEPARTMENTS = [
    'Computer Science',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Administration',
    'Library',
    'Placement Cell',
    'Other',
];

const TIME_SLOTS = [
    'Morning (9 AM - 12 PM)',
    'Afternoon (12 PM - 3 PM)',
    'Evening (3 PM - 6 PM)',
];

const CreateRequestScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        purpose: '',
        department: '',
        personToMeet: {
            name: '',
            designation: '',
            contact: '',
        },
        visitDate: '',
        timeSlot: '',
        additionalNotes: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);
    const [showTimeSlotPicker, setShowTimeSlotPicker] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.purpose.trim()) {
            newErrors.purpose = 'Purpose is required';
        }

        if (!formData.department) {
            newErrors.department = 'Department is required';
        }

        if (!formData.personToMeet.name.trim()) {
            newErrors.personName = 'Person name is required';
        }

        if (!formData.visitDate.trim()) {
            newErrors.visitDate = 'Date is required (YYYY-MM-DD)';
        } else {
            const date = new Date(formData.visitDate);
            if (isNaN(date.getTime())) {
                newErrors.visitDate = 'Invalid date format';
            } else if (date < new Date().setHours(0, 0, 0, 0)) {
                newErrors.visitDate = 'Date cannot be in the past';
            }
        }

        if (!formData.timeSlot) {
            newErrors.timeSlot = 'Time slot is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await api.post(endpoints.submitRequest, formData);

            if (response.data.success) {
                Alert.alert(
                    'Request Submitted',
                    'Your visit request has been submitted successfully. You will be notified once it is approved.',
                    [
                        {
                            text: 'Back to Home',
                            onPress: () => navigation.navigate('Home'),
                        },
                    ]
                );
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to submit request';
            Alert.alert('Submission Error', message);
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: null });
        }
    };

    const updatePersonField = (field, value) => {
        setFormData({
            ...formData,
            personToMeet: { ...formData.personToMeet, [field]: value },
        });
        const errorKey = `person${field.charAt(0).toUpperCase() + field.slice(1)}`;
        if (errors[errorKey]) {
            setErrors({ ...errors, [errorKey]: null });
        }
    };

    // Helper component for stylized pickers
    const PickerInput = ({ label, value, placeholder, isOpen, onToggle, options, onSelect, icon, error }) => (
        <View style={styles.pickerContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TouchableOpacity
                style={[
                    styles.pickerButton,
                    isOpen && styles.pickerButtonActive,
                    error && styles.pickerButtonError,
                ]}
                onPress={onToggle}
                activeOpacity={0.7}
            >
                <View style={styles.pickerContent}>
                    <Ionicons
                        name={icon}
                        size={ICON_SIZES.sm}
                        color={value ? COLORS.textPrimary : COLORS.textTertiary}
                        style={styles.pickerIcon}
                    />
                    <Text style={[
                        styles.pickerValue,
                        !value && styles.pickerPlaceholder
                    ]}>
                        {value || placeholder}
                    </Text>
                </View>
                <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={ICON_SIZES.sm}
                    color={COLORS.textSecondary}
                />
            </TouchableOpacity>

            {isOpen && (
                <View style={[styles.dropdownContainer, SHADOWS.md]}>
                    {options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.dropdownItem,
                                value === option && styles.dropdownItemSelected,
                                index === options.length - 1 && styles.dropdownItemLast
                            ]}
                            onPress={() => onSelect(option)}
                        >
                            <Text style={[
                                styles.dropdownItemText,
                                value === option && styles.dropdownItemTextSelected
                            ]}>
                                {option}
                            </Text>
                            {value === option && (
                                <Ionicons name="checkmark" size={ICON_SIZES.sm} color={COLORS.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={ICON_SIZES.xs} color={COLORS.error} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={ICON_SIZES.md} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Visit Request</Text>
                <View style={styles.headerPlaceholder} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={[styles.section, { zIndex: 3 }]}>
                        <Text style={styles.sectionHeader}>Visit Details</Text>
                        <CustomInput
                            label="Purpose of Visit"
                            placeholder="e.g., Guest Lecture, Meeting, Interview"
                            value={formData.purpose}
                            onChangeText={(value) => updateField('purpose', value)}
                            icon="document-text-outline"
                            error={errors.purpose}
                        />

                        <PickerInput
                            label="Department"
                            value={formData.department}
                            placeholder="Select Department"
                            isOpen={showDepartmentPicker}
                            onToggle={() => {
                                setShowDepartmentPicker(!showDepartmentPicker);
                                setShowTimeSlotPicker(false);
                            }}
                            options={DEPARTMENTS}
                            onSelect={(value) => {
                                updateField('department', value);
                                setShowDepartmentPicker(false);
                            }}
                            icon="business-outline"
                            error={errors.department}
                        />

                        <CustomInput
                            label="Additional Notes (Optional)"
                            placeholder="Any special requirements..."
                            value={formData.additionalNotes}
                            onChangeText={(value) => updateField('additionalNotes', value)}
                            multiline
                            numberOfLines={3}
                            icon="chatbox-outline"
                        />
                    </View>

                    <View style={[styles.section, { zIndex: 2 }]}>
                        <Text style={styles.sectionHeader}>Person to Meet</Text>
                        <CustomInput
                            label="Name"
                            placeholder="Full Name"
                            value={formData.personToMeet.name}
                            onChangeText={(value) => updatePersonField('name', value)}
                            icon="person-outline"
                            autoCapitalize="words"
                            error={errors.personName}
                        />

                        <CustomInput
                            label="Designation (Optional)"
                            placeholder="e.g., HOD, Professor"
                            value={formData.personToMeet.designation}
                            onChangeText={(value) => updatePersonField('designation', value)}
                            icon="briefcase-outline"
                            autoCapitalize="words"
                        />

                        <CustomInput
                            label="Contact Number (Optional)"
                            placeholder="Mobile Number"
                            value={formData.personToMeet.contact}
                            onChangeText={(value) => updatePersonField('contact', value)}
                            icon="call-outline"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={[styles.section, { zIndex: 1 }]}>
                        <Text style={styles.sectionHeader}>Schedule</Text>
                        <CustomInput
                            label="Date of Visit"
                            placeholder="YYYY-MM-DD"
                            value={formData.visitDate}
                            onChangeText={(value) => updateField('visitDate', value)}
                            icon="calendar-outline"
                            error={errors.visitDate}
                        />

                        <PickerInput
                            label="Time Slot"
                            value={formData.timeSlot}
                            placeholder="Select Time Slot"
                            isOpen={showTimeSlotPicker}
                            onToggle={() => {
                                setShowTimeSlotPicker(!showTimeSlotPicker);
                                setShowDepartmentPicker(false);
                            }}
                            options={TIME_SLOTS}
                            onSelect={(value) => {
                                updateField('timeSlot', value);
                                setShowTimeSlotPicker(false);
                            }}
                            icon="time-outline"
                            error={errors.timeSlot}
                        />
                    </View>

                    <View style={styles.footer}>
                        <CustomButton
                            title="Submit Request"
                            onPress={handleSubmit}
                            loading={loading}
                            size="large"
                            icon={<Ionicons name="send" size={ICON_SIZES.sm} color={COLORS.white} />}
                            iconPosition="right"
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
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
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: SPACING.xs,
        marginLeft: -SPACING.xs,
        borderRadius: BORDER_RADIUS.round,
    },
    headerTitle: {
        fontSize: FONTS.h4,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
        letterSpacing: -0.2,
    },
    headerPlaceholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xxl * 2,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionHeader: {
        fontSize: FONTS.h5,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
        marginLeft: SPACING.xs,
    },
    footer: {
        marginTop: SPACING.sm,
    },

    // Picker Styles
    pickerContainer: {
        marginBottom: SPACING.md,
        zIndex: 10, // Ensure dropdowns appear above other elements
    },
    inputLabel: {
        fontSize: FONTS.caption,
        fontWeight: FONTS.weight.medium,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
        marginLeft: SPACING.xs,
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: SPACING.md,
        height: DIMENSIONS.inputHeight,
    },
    pickerButtonActive: {
        borderColor: COLORS.primary,
        borderWidth: 1.5,
    },
    pickerButtonError: {
        borderColor: COLORS.error,
        backgroundColor: COLORS.errorAlpha10,
    },
    pickerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pickerIcon: {
        marginRight: SPACING.sm,
    },
    pickerValue: {
        fontSize: FONTS.body,
        color: COLORS.textPrimary,
    },
    pickerPlaceholder: {
        color: COLORS.textTertiary,
    },
    dropdownContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: 4,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        zIndex: 1000,
        elevation: 5,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    dropdownItemLast: {
        borderBottomWidth: 0,
    },
    dropdownItemSelected: {
        backgroundColor: COLORS.primaryAlpha10,
    },
    dropdownItemText: {
        fontSize: FONTS.body,
        color: COLORS.textPrimary,
    },
    dropdownItemTextSelected: {
        color: COLORS.primary,
        fontWeight: FONTS.weight.semibold,
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

export default CreateRequestScreen;
