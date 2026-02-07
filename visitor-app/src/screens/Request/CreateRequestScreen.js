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
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../styles/theme';

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

    // ... validation logic (keep same) ...
    const validateForm = () => {
        const newErrors = {};

        if (!formData.purpose.trim()) {
            newErrors.purpose = 'Purpose is required';
        }

        if (!formData.department) {
            newErrors.department = 'Department is required';
        }

        if (!formData.personToMeet.name.trim()) {
            newErrors.personName = 'Person to meet name is required';
        }

        if (!formData.visitDate.trim()) {
            newErrors.visitDate = 'Visit date is required (YYYY-MM-DD format)';
        } else {
            const date = new Date(formData.visitDate);
            if (isNaN(date.getTime())) {
                newErrors.visitDate = 'Invalid date format';
            } else if (date < new Date().setHours(0, 0, 0, 0)) {
                newErrors.visitDate = 'Visit date cannot be in the past';
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
                    'Success',
                    'Visit request submitted successfully! You will receive an email notification.',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('Requests'),
                        },
                    ]
                );
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to submit request';
            Alert.alert('Error', message);
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
        if (errors[`person${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
            setErrors({
                ...errors,
                [`person${field.charAt(0).toUpperCase() + field.slice(1)}`]: null,
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Visit Request</Text>
                <View style={{ width: 40 }} />
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
                    <View style={styles.form}>
                        <Text style={styles.sectionTitle}>Visit Details</Text>

                        <CustomInput
                            placeholder="Purpose of Visit"
                            value={formData.purpose}
                            onChangeText={(value) => updateField('purpose', value)}
                            multiline
                            numberOfLines={3}
                            icon="document-text-outline"
                            error={errors.purpose}
                        />

                        <TouchableOpacity
                            style={[styles.pickerButton, errors.department && styles.pickerError]}
                            onPress={() => setShowDepartmentPicker(!showDepartmentPicker)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.pickerIcon}>
                                <Ionicons name="business-outline" size={20} color={COLORS.primary} />
                            </View>
                            <Text
                                style={[
                                    styles.pickerText,
                                    !formData.department && styles.placeholderText,
                                ]}
                            >
                                {formData.department || 'Select Department'}
                            </Text>
                            <Ionicons
                                name={showDepartmentPicker ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color={COLORS.textSecondary}
                            />
                        </TouchableOpacity>

                        {showDepartmentPicker && (
                            <View style={styles.pickerOptions}>
                                {DEPARTMENTS.map((dept) => (
                                    <TouchableOpacity
                                        key={dept}
                                        style={styles.pickerOption}
                                        onPress={() => {
                                            updateField('department', dept);
                                            setShowDepartmentPicker(false);
                                        }}
                                    >
                                        <Text style={[styles.pickerOptionText, formData.department === dept && styles.selectedOptionText]}>{dept}</Text>
                                        {formData.department === dept && (
                                            <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                        {errors.department && (
                            <Text style={styles.errorText}>{errors.department}</Text>
                        )}


                        <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>
                            Person to Meet
                        </Text>

                        <CustomInput
                            placeholder="Name"
                            value={formData.personToMeet.name}
                            onChangeText={(value) => updatePersonField('name', value)}
                            icon="person-outline"
                            autoCapitalize="words"
                            error={errors.personName}
                        />

                        <CustomInput
                            placeholder="Designation (Optional)"
                            value={formData.personToMeet.designation}
                            onChangeText={(value) => updatePersonField('designation', value)}
                            icon="briefcase-outline"
                            autoCapitalize="words"
                        />

                        <CustomInput
                            placeholder="Contact Number (Optional)"
                            value={formData.personToMeet.contact}
                            onChangeText={(value) => updatePersonField('contact', value)}
                            icon="call-outline"
                            keyboardType="phone-pad"
                        />

                        <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>
                            Schedule
                        </Text>

                        <CustomInput
                            placeholder="Visit Date (YYYY-MM-DD)"
                            value={formData.visitDate}
                            onChangeText={(value) => updateField('visitDate', value)}
                            icon="calendar-outline"
                            error={errors.visitDate}
                        />

                        <TouchableOpacity
                            style={[styles.pickerButton, errors.timeSlot && styles.pickerError]}
                            onPress={() => setShowTimeSlotPicker(!showTimeSlotPicker)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.pickerIcon}>
                                <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                            </View>
                            <Text
                                style={[
                                    styles.pickerText,
                                    !formData.timeSlot && styles.placeholderText,
                                ]}
                            >
                                {formData.timeSlot || 'Select Time Slot'}
                            </Text>
                            <Ionicons
                                name={showTimeSlotPicker ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color={COLORS.textSecondary}
                            />
                        </TouchableOpacity>

                        {showTimeSlotPicker && (
                            <View style={styles.pickerOptions}>
                                {TIME_SLOTS.map((slot) => (
                                    <TouchableOpacity
                                        key={slot}
                                        style={styles.pickerOption}
                                        onPress={() => {
                                            updateField('timeSlot', slot);
                                            setShowTimeSlotPicker(false);
                                        }}
                                    >
                                        <Text style={[styles.pickerOptionText, formData.timeSlot === slot && styles.selectedOptionText]}>{slot}</Text>
                                        {formData.timeSlot === slot && (
                                            <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                        {errors.timeSlot && (
                            <Text style={styles.errorText}>{errors.timeSlot}</Text>
                        )}


                        <CustomInput
                            placeholder="Additional Notes (Optional)"
                            value={formData.additionalNotes}
                            onChangeText={(value) => updateField('additionalNotes', value)}
                            multiline
                            numberOfLines={3}
                            icon="chatbox-outline"
                            style={{ marginTop: SPACING.md }}
                        />

                        <CustomButton
                            title="Submit Request"
                            onPress={handleSubmit}
                            loading={loading}
                            style={styles.submitButton}
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
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: SPACING.sm,
        marginLeft: -SPACING.sm,
    },
    headerTitle: {
        fontSize: FONTS.h4,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: SPACING.xxl,
    },
    form: {
        padding: SPACING.lg,
    },
    sectionTitle: {
        fontSize: FONTS.h5,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: SPACING.md,
        minHeight: 56, // Match CustomInput height usually
        marginBottom: SPACING.md,
    },
    pickerIcon: {
        marginRight: SPACING.sm,
    },
    pickerError: {
        borderColor: COLORS.error,
    },
    pickerText: {
        flex: 1,
        fontSize: FONTS.body,
        color: COLORS.textPrimary,
    },
    placeholderText: {
        color: COLORS.textHint,
    },
    pickerOptions: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    pickerOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    pickerOptionText: {
        fontSize: FONTS.body,
        color: COLORS.textPrimary,
    },
    selectedOptionText: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    errorText: {
        color: COLORS.error,
        fontSize: FONTS.small,
        marginTop: -SPACING.sm,
        marginBottom: SPACING.md,
        marginLeft: SPACING.xs,
    },
    submitButton: {
        marginTop: SPACING.xl,
    },
});

export default CreateRequestScreen;
