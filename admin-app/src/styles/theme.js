export const COLORS = {
    // Primary Brand Colors (Deep Blue / Indigo)
    primary: '#1E3A8A', // Blue 900
    primaryDark: '#172554', // Blue 950
    primaryLight: '#3B82F6', // Blue 500

    // Secondary / Neutrals (Slate)
    secondary: '#64748B', // Slate 500
    secondaryDark: '#475569', // Slate 600
    secondaryLight: '#94A3B8', // Slate 400

    // Backgrounds & Surfaces
    background: '#F8FAFC', // Slate 50
    surface: '#FFFFFF',
    surfaceVariant: '#F1F5F9', // Slate 100
    border: '#E2E8F0', // Slate 200

    // Functional Status Colors
    success: '#10B981', // Emerald 500
    warning: '#F59E0B', // Amber 500
    error: '#EF4444', // Red 500
    info: '#3B82F6', // Blue 500

    // Status specific (mapping to functional colors for backward compatibility)
    pending: '#F59E0B',
    approved: '#10B981',
    rejected: '#EF4444',

    // Text Colors
    textPrimary: '#0F172A', // Slate 900
    textSecondary: '#475569', // Slate 600
    textTertiary: '#94A3B8', // Slate 400
    textInverse: '#FFFFFF',
    textHint: '#94A3B8', // Added for backward compatibility

    // Basic Colors (backward compatibility)
    white: '#FFFFFF',
    black: '#000000',

    // Gradients & Overlays
    gradientStart: '#1E3A8A',
    gradientEnd: '#3B82F6',
    overlay: 'rgba(15, 23, 42, 0.6)',
};

export const FONTS = {
    // Families
    regular: 'System',
    medium: 'System',
    bold: 'System',

    // Sizes
    h1: 32,
    h2: 24,
    h3: 20,
    h4: 18,
    body: 16,
    caption: 14,
    small: 12,
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    section: 64,
};

export const BORDER_RADIUS = {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
    round: 50,
    pill: 999,
};

export const SHADOWS = {
    light: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    card: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    // For backward compatibility
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
};

export default {
    COLORS,
    FONTS,
    SPACING,
    BORDER_RADIUS,
    SHADOWS,
};
