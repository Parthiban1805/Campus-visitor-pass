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
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../components/CustomButton';
import api, { endpoints } from '../../api/axiosConfig';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../styles/theme';

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
            <View style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Ionicons name="camera-outline" size={80} color={COLORS.textHint} />
                    <Text style={styles.permissionTitle}>Camera Permission Required</Text>
                    <Text style={styles.permissionText}>
                        We need camera access to scan visitor QR codes
                    </Text>
                    <CustomButton
                        title="Grant Permission"
                        onPress={requestPermission}
                        style={styles.permissionButton}
                    />
                </View>
            </View>
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
                Vibration.vibrate([0, 100, 100, 100]);

                Alert.alert(
                    '✓ Success',
                    `${scanMode === 'entry' ? 'Entry' : 'Exit'} Logged\n\n` +
                    `Visitor: ${visitor.name}\n` +
                    `Purpose: ${visitor.purpose || 'N/A'}`,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                setScanned(false);
                                setProcessing(false);
                            },
                        },
                    ]
                );
            }
        } catch (error) {
            Vibration.vibrate([0, 500]);
            const message = error.response?.data?.message || 'QR scan failed';

            Alert.alert(
                '✗ Scan Failed',
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
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scan QR Code</Text>
                <View style={{ width: 40 }} />
            </View>

            <CameraView
                style={styles.camera}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
            >
                <View style={styles.overlay}>
                    <View style={styles.scanArea}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>

                    <Text style={styles.instructionText}>
                        {processing
                            ? 'Processing...'
                            : 'Position QR code within the frame'}
                    </Text>
                </View>
            </CameraView>

            <View style={styles.footer}>
                <View style={styles.modeSelector}>
                    <TouchableOpacity
                        style={[
                            styles.modeButton,
                            scanMode === 'entry' && styles.modeButtonActive,
                        ]}
                        onPress={() => setScanMode('entry')}
                        disabled={processing}
                    >
                        <Ionicons
                            name="log-in"
                            size={24}
                            color={scanMode === 'entry' ? COLORS.white : COLORS.textSecondary}
                        />
                        <Text
                            style={[
                                styles.modeText,
                                scanMode === 'entry' && styles.modeTextActive,
                            ]}
                        >
                            Entry
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.modeButton,
                            scanMode === 'exit' && styles.modeButtonActive,
                        ]}
                        onPress={() => setScanMode('exit')}
                        disabled={processing}
                    >
                        <Ionicons
                            name="log-out"
                            size={24}
                            color={scanMode === 'exit' ? COLORS.white : COLORS.textSecondary}
                        />
                        <Text
                            style={[
                                styles.modeText,
                                scanMode === 'exit' && styles.modeTextActive,
                            ]}
                        >
                            Exit
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.black,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.lg,
        backgroundColor: '#388E3C',
    },
    backButton: {
        padding: SPACING.sm,
    },
    headerTitle: {
        fontSize: FONTS.h4,
        fontWeight: '600',
        color: COLORS.white,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xxl,
        backgroundColor: COLORS.background,
    },
    permissionTitle: {
        fontSize: FONTS.h3,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginTop: SPACING.lg,
    },
    permissionText: {
        fontSize: FONTS.body,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: SPACING.md,
        marginBottom: SPACING.xl,
    },
    permissionButton: {
        minWidth: 200,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanArea: {
        width: 250,
        height: 250,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: COLORS.white,
        borderWidth: 4,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    topRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    instructionText: {
        fontSize: FONTS.body,
        color: COLORS.white,
        textAlign: 'center',
        marginTop: SPACING.xl,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
    },
    footer: {
        backgroundColor: COLORS.white,
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.lg,
    },
    modeSelector: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    modeButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginHorizontal: SPACING.xs,
        backgroundColor: COLORS.background,
    },
    modeButtonActive: {
        backgroundColor: '#388E3C',
    },
    modeText: {
        fontSize: FONTS.caption,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
    },
    modeTextActive: {
        color: COLORS.white,
    },
});

export default QRScannerScreen;
