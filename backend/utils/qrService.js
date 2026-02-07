import crypto from 'crypto';
import QRCode from 'qrcode';

const ENCRYPTION_KEY = process.env.QR_ENCRYPTION_KEY || 'defaultkey-change-this-32chars';
const IV_LENGTH = 16;

/**
 * Encrypt QR code payload using AES-256-CBC
 */
export const encryptQRData = (data) => {
    try {
        // Ensure key is 32 bytes
        const key = crypto
            .createHash('sha256')
            .update(String(ENCRYPTION_KEY))
            .digest('base64')
            .substr(0, 32);

        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);

        let encrypted = cipher.update(JSON.stringify(data));
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        // Return IV + encrypted data as hex string
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error('QR Encryption Error:', error);
        throw new Error('Failed to encrypt QR data');
    }
};

/**
 * Decrypt QR code payload
 */
export const decryptQRData = (encryptedText) => {
    try {
        const key = crypto
            .createHash('sha256')
            .update(String(ENCRYPTION_KEY))
            .digest('base64')
            .substr(0, 32);

        const textParts = encryptedText.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedData = Buffer.from(textParts.join(':'), 'hex');

        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);

        let decrypted = decipher.update(encryptedData);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return JSON.parse(decrypted.toString());
    } catch (error) {
        console.error('QR Decryption Error:', error);
        throw new Error('Invalid or tampered QR code');
    }
};

/**
 * Generate QR code with encrypted data
 */
export const generateQRCode = async (visitRequest) => {
    try {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + (visitRequest.validityHours || 24));

        // QR payload
        const qrPayload = {
            requestId: visitRequest._id.toString(),
            visitorId: visitRequest.visitor.toString(),
            visitDate: visitRequest.visitDate,
            department: visitRequest.department,
            generatedAt: new Date().toISOString(),
            expiresAt: expiresAt.toISOString(),
            checksum: generateChecksum(visitRequest._id.toString()),
        };

        // Encrypt the payload
        const encryptedData = encryptQRData(qrPayload);

        // Generate QR code image as Data URL
        const qrCodeDataURL = await QRCode.toDataURL(encryptedData, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });

        return {
            data: encryptedData,
            dataURL: qrCodeDataURL,
            generatedAt: new Date(),
            expiresAt: expiresAt,
        };
    } catch (error) {
        console.error('QR Generation Error:', error);
        throw new Error('Failed to generate QR code');
    }
};

/**
 * Validate QR code
 */
export const validateQRCode = (encryptedQRData) => {
    try {
        // Decrypt the QR data
        const qrPayload = decryptQRData(encryptedQRData);

        // Check expiration
        const expiresAt = new Date(qrPayload.expiresAt);
        const now = new Date();

        if (now > expiresAt) {
            return {
                valid: false,
                reason: 'qr_expired',
                message: 'QR code has expired',
                data: null,
            };
        }

        // Verify checksum
        const expectedChecksum = generateChecksum(qrPayload.requestId);
        if (qrPayload.checksum !== expectedChecksum) {
            return {
                valid: false,
                reason: 'tampered_qr',
                message: 'QR code has been tampered with',
                data: null,
            };
        }

        return {
            valid: true,
            reason: null,
            message: 'QR code is valid',
            data: qrPayload,
        };
    } catch (error) {
        return {
            valid: false,
            reason: 'qr_invalid',
            message: error.message || 'Invalid QR code',
            data: null,
        };
    }
};

/**
 * Generate checksum for tamper detection
 */
const generateChecksum = (requestId) => {
    return crypto
        .createHash('sha256')
        .update(requestId + ENCRYPTION_KEY)
        .digest('hex')
        .substring(0, 16);
};

export default {
    encryptQRData,
    decryptQRData,
    generateQRCode,
    validateQRCode,
};
