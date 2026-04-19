// ========================================
// 🎨 CAMPUS VISITOR MANAGEMENT - DESIGN SYSTEM
// Light Theme Only - Modern SaaS UI
// ========================================

export const COLORS = {
    // Primary Brand Colors - Professional Blue
    primary: '#2563EB', // Blue 600 - Modern, trustworthy, professional
    primaryDark: '#1E40AF', // Blue 700 - Hover/pressed states
    primaryLight: '#3B82F6', // Blue 500 - Light accents
    primaryAlpha10: 'rgba(37, 99, 235, 0.10)',
    primaryAlpha20: 'rgba(37, 99, 235, 0.20)',

    // Secondary / Neutrals (Slate) - Clean, minimal
    secondary: '#64748B', // Slate 500
    secondaryDark: '#475569', // Slate 600
    secondaryLight: '#94A3B8', // Slate 400

    // Backgrounds & Surfaces - Light, airy feel
    background: '#F8FAFC', // Slate 50 - Main background
    surface: '#FFFFFF', // Pure white cards/surfaces
    surfaceVariant: '#F1F5F9', // Slate 100 - Subtle backgrounds
    surfaceHover: '#F8FAFC', // Hover state for interactive surfaces
    border: '#E2E8F0', // Slate 200 - Subtle borders
    borderLight: '#F1F5F9', // Even lighter borders
    divider: '#E2E8F0',

    // Functional Status Colors - Clear visual feedback
    success: '#10B981', // Emerald 500 - Approved
    successLight: '#D1FAE5', // Emerald 100 - Success backgrounds
    successAlpha10: 'rgba(16, 185, 129, 0.10)',

    warning: '#F59E0B', // Amber 500 - Pending
    warningLight: '#FEF3C7', // Amber 100 - Warning backgrounds
    warningAlpha10: 'rgba(245, 158, 11, 0.10)',

    error: '#EF4444', // Red 500 - Rejected/errors
    errorLight: '#FEE2E2', // Red 100 - Error backgrounds
    errorAlpha10: 'rgba(239, 68, 68, 0.10)',

    info: '#3B82F6', // Blue 500 - Info/active
    infoLight: '#DBEAFE', // Blue 100 - Info backgrounds
    infoAlpha10: 'rgba(59, 130, 246, 0.10)',

    // Status specific (backward compatibility + consistency)
    pending: '#F59E0B',
    approved: '#10B981',
    rejected: '#EF4444',

    // Text Colors - Clear hierarchy
    textPrimary: '#0F172A', // Slate 900 - Main text
    textSecondary: '#475569', // Slate 600 - Secondary text
    textTertiary: '#94A3B8', // Slate 400 - Tertiary text/hints
    textDisabled: '#CBD5E1', // Slate 300 - Disabled state
    textInverse: '#FFFFFF', // White text on dark backgrounds
    textHint: '#94A3B8', // Placeholder text

    // Basic Colors (backward compatibility)
    white: '#FFFFFF',
    black: '#000000',

    // Accent & Highlights
    accent: '#2563EB', // Matches primary for consistency
    highlight: '#EFF6FF', // Blue 50 - Very light blue for highlights

    // Overlays & Modals
    overlay: 'rgba(15, 23, 42, 0.50)', // Modal backdrop
    overlayLight: 'rgba(15, 23, 42, 0.25)', // Lighter overlay
    scrim: 'rgba(0, 0, 0, 0.05)', // Very subtle overlay
};

export const FONTS = {
    // Font Families (System fonts for consistency)
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',

    // Font Sizes - Clear typographic scale
    h1: 32, // Page titles
    h2: 28, // Section headers
    h3: 24, // Card titles
    h4: 20, // Subsection headers
    h5: 18, // Small headers
    h6: 16, // Smallest header
    body: 16, // Body text
    bodySmall: 15, // Slightly smaller body
    caption: 14, // Captions, labels
    small: 12, // Fine print
    tiny: 11, // Very small text

    // Font Weights
    weight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
    },
};

export const SPACING = {
    xs: 4,   // Minimal spacing
    sm: 8,   // Small spacing
    md: 16,  // Medium spacing (most common)
    lg: 24,  // Large spacing
    xl: 32,  // Extra large
    xxl: 48, // Double extra large
    section: 64, // Section spacing
};

export const BORDER_RADIUS = {
    xs: 4,   // Minimal radius
    sm: 6,   // Small radius
    md: 10,  // Medium radius (inputs, small cards)
    lg: 16,  // Large radius (cards, modals)
    xl: 24,  // Extra large radius
    xxl: 32, // Very large radius
    round: 50, // Circular (icons, avatars)
    pill: 999, // Pill shape (badges, tags)
};

export const SHADOWS = {
    // Subtle shadows for light theme
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    xs: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    sm: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    lg: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.10,
        shadowRadius: 16,
        elevation: 4,
    },
    xl: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 6,
    },

    // Semantic shadows
    card: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    button: {
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    modal: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 8,
    },

    // Backward compatibility
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

// Animation Timing - Professional, subtle animations (200-300ms)
export const ANIMATION = {
    duration: {
        fast: 150,      // Quick interactions
        normal: 250,    // Standard animations
        slow: 350,      // Slower, more noticeable
    },
    easing: {
        default: 'ease-in-out',
        spring: 'spring',
        linear: 'linear',
    },
};

// Icon Sizes - Consistent icon sizing
export const ICON_SIZES = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
    xxl: 48,
};

// Common Component Dimensions
export const DIMENSIONS = {
    buttonHeight: 48,
    inputHeight: 52,
    tabBarHeight: 60,
    headerHeight: 56,
    iconButtonSize: 40,
    avatarSize: {
        sm: 32,
        md: 48,
        lg: 64,
        xl: 96,
    },
};

export default {
    COLORS,
    FONTS,
    SPACING,
    BORDER_RADIUS,
    SHADOWS,
};
