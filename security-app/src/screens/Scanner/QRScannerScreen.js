import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Vibration,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../components/CustomButton';
import api, { endpoints } from '../../api/axiosConfig';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, DIMENSIONS } from '../../styles/theme';

const QRScannerScreen = ({ navigation }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [scanMode, setScanMode] = useState('entry'); // 'entry' or 'exit'

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.permissionContainer}>
                <View style={styles.permissionContent}>
                    <View style={styles.permissionIcon}>
                        <Ionicons name="camera" size={64} color={COLORS.primary} />
                    </View>
                    <Text style={styles.permissionTitle}>Camera Access Required</Text>
                    <Text style={styles.permissionText}>
                        We need permission to access your camera to scan visitor QR passes.
                    </Text>
                    <CustomButton
                        title="Grant Permission"
                        onPress={requestPermission}
                        style={styles.permissionButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

    const handleBarCodeScanned = async ({ type, data }) => {
        if (scanned || processing) return;

        setScanned(true);
        setProcessing(true);
        Vibration.vibrate(100);

        try {
            const endpoint = scanMode === 'entry' ? endpoints.logEntry : endpoints.logExit;
            const response = await api.post(endpoint, { qrData: data });

            if (response.data.success) {
                const visitor = response.data.data.visitor;
                Vibration.vibrate([0, 50, 50, 50]); // Success pattern

                Alert.alert(
                    'Success',
                    `${scanMode === 'entry' ? 'Entry' : 'Exit'} Logged\n\n` +
                    `Visitor: ${visitor.name}\n` +
                    `Purpose: ${visitor.purpose || 'N/A'}`,
                    [
                        {
                            text: 'Scan Next',
                            onPress: () => {
                                setScanned(false);
                                setProcessing(false);
                            },
                        },
                        {
                            text: 'Done',
                            style: 'cancel',
                            onPress: () => navigation.goBack(),
                        }
                    ]
                );
            }
        } catch (error) {
            Vibration.vibrate([0, 500]); // Error pattern
            const message = error.response?.data?.message || 'Invalid QR Code or Scan Failed';

            Alert.alert(
                'Scan Failed',
                message,
                [
                    {
                        text: 'Try Again',
                        onPress: () => {
                            setScanned(false);
                            setProcessing(false);
                        },
                    },
                ]
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Header Overlay */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="close" size={28} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scan QR Code</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    facing="back"
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ['qr'],
                    }}
                >
                    <View style={styles.overlay}>
                        <View style={styles.scanFrame}>
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />

                            {processing && (
                                <View style={styles.processingContainer}>
                                    <ActivityIndicator size="large" color={COLORS.primary} />
                                </View>
                            )}
                        </View>

                        <Text style={styles.hintText}>
                            Align QR code within the frame to scan
                        </Text>
                    </View>
                </CameraView>
            </View>

            {/* Bottom Controls */}
            <View style={styles.footer}>
                <View style={styles.modeToggle}>
                    <TouchableOpacity
                        style={[
                            styles.modeButton,
                            scanMode === 'entry' && styles.modeButtonActive,
                        ]}
                        onPress={() => setScanMode('entry')}
                        activeOpacity={0.8}
                    >
                        <Text style={[
                            styles.modeText,
                            scanMode === 'entry' && styles.modeTextActive
                        ]}>ENTRY</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.modeButton,
                            scanMode === 'exit' && styles.modeButtonActive,
                            scanMode === 'exit' && { backgroundColor: COLORS.error }
                        ]}
                        onPress={() => setScanMode('exit')}
                        activeOpacity={0.8}
                    >
                        <Text style={[
                            styles.modeText,
                            scanMode === 'exit' && styles.modeTextActive
                        ]}>EXIT</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.modeDescription}>
                    Current Mode: <Text style={{ fontWeight: 'bold' }}>{scanMode.toUpperCase()}</Text>
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.textPrimary, // Dark background for scanner
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    permissionContent: {
        alignItems: 'center',
        padding: SPACING.xl,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        ...SHADOWS.md,
    },
    permissionIcon: {
        width: 80,
        height: 80,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: COLORS.primaryAlpha10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    permissionTitle: {
        fontSize: FONTS.h3,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    permissionText: {
        fontSize: FONTS.body,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.lg,
        lineHeight: 22,
    },
    permissionButton: {
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        position: 'absolute',
        top: 40, // Adjust for safe area if needed manual
        left: 0,
        right: 0,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: FONTS.h4,
        fontWeight: FONTS.weight.semibold,
        color: COLORS.white,
    },
    cameraContainer: {
        flex: 1,
        overflow: 'hidden',
        borderBottomLeftRadius: BORDER_RADIUS.xl,
        borderBottomRightRadius: BORDER_RADIUS.xl,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: {
        width: 260,
        height: 260,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: COLORS.primary,
        borderWidth: 4,
    },
    topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
    topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
    bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
    bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
    hintText: {
        color: COLORS.white,
        fontSize: FONTS.body,
        marginTop: SPACING.xl,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
    },
    footer: {
        backgroundColor: COLORS.surface,
        paddingVertical: SPACING.xl,
        paddingHorizontal: SPACING.xxl,
        alignItems: 'center',
    },
    modeToggle: {
        flexDirection: 'row',
        backgroundColor: COLORS.surfaceVariant,
        borderRadius: BORDER_RADIUS.pill,
        padding: SPACING.xs,
        width: '100%',
        marginBottom: SPACING.md,
    },
    modeButton: {
        flex: 1,
        paddingVertical: SPACING.md,
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.pill,
    },
    modeButtonActive: {
        backgroundColor: COLORS.primary,
        ...SHADOWS.sm,
    },
    modeText: {
        fontSize: FONTS.small,
        fontWeight: FONTS.weight.bold,
        color: COLORS.textSecondary,
        letterSpacing: 1,
    },
    modeTextActive: {
        color: COLORS.white,
    },
    modeDescription: {
        fontSize: FONTS.caption,
        color: COLORS.textSecondary,
    },
});

export default QRScannerScreen;
