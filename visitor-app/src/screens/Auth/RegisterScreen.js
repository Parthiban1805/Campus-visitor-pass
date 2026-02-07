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
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../styles/theme';

const RegisterScreen = ({ navigation }) => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        address: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone must be exactly 10 digits';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        const { confirmPassword, ...registerData } = formData;
        const result = await register(registerData);
        setLoading(false);

        if (!result.success) {
            Alert.alert('Registration Failed', result.error || 'Please try again');
        }
    };

    const updateField = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: null });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="person-add-outline" size={32} color={COLORS.primary} />
                        </View>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join our campus visitor system</Text>
                    </View>

                    <View style={styles.form}>
                        <CustomInput
                            placeholder="Full Name"
                            value={formData.name}
                            onChangeText={(value) => updateField('name', value)}
                            icon="person-outline"
                            autoCapitalize="words"
                            error={errors.name}
                        />

                        <CustomInput
                            placeholder="Email Address"
                            value={formData.email}
                            onChangeText={(value) => updateField('email', value)}
                            keyboardType="email-address"
                            icon="mail-outline"
                            error={errors.email}
                        />

                        <CustomInput
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChangeText={(value) => updateField('phone', value)}
                            keyboardType="phone-pad"
                            icon="call-outline"
                            error={errors.phone}
                        />

                        <CustomInput
                            placeholder="Address (Optional)"
                            value={formData.address}
                            onChangeText={(value) => updateField('address', value)}
                            icon="location-outline"
                            autoCapitalize="words"
                        />

                        <CustomInput
                            placeholder="Password"
                            value={formData.password}
                            onChangeText={(value) => updateField('password', value)}
                            secureTextEntry
                            icon="lock-closed-outline"
                            error={errors.password}
                        />

                        <CustomInput
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChangeText={(value) => updateField('confirmPassword', value)}
                            secureTextEntry
                            icon="lock-closed-outline"
                            error={errors.confirmPassword}
                        />

                        <CustomButton
                            title="Register"
                            onPress={handleRegister}
                            loading={loading}
                            style={styles.registerButton}
                        />

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
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
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl,
    },
    header: {
        marginTop: SPACING.xl,
        marginBottom: SPACING.xl,
        alignItems: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: BORDER_RADIUS.xl,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.surfaceVariant,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    title: {
        fontSize: FONTS.h2,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONTS.body,
        color: COLORS.textSecondary,
    },
    form: {
        width: '100%',
    },
    registerButton: {
        marginTop: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    loginText: {
        fontSize: FONTS.body,
        color: COLORS.textSecondary,
    },
    loginLink: {
        fontSize: FONTS.body,
        color: COLORS.primary,
        fontWeight: '700',
    },
});

export default RegisterScreen;
