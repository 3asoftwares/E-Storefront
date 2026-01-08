// Color palette matching the web storefront
export const Colors = {
  light: {
    // Primary colors (Indigo)
    primary: '#4F46E5',
    primaryLight: '#818CF8',
    primaryDark: '#3730A3',

    // Secondary colors
    secondary: '#EC4899',
    secondaryLight: '#F472B6',
    secondaryDark: '#BE185D',

    // Backgrounds
    background: '#F9FAFB',
    surface: '#FFFFFF',
    card: '#FFFFFF',

    // Text colors
    text: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    textInverse: '#FFFFFF',

    // Border colors
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    borderDark: '#D1D5DB',

    // Status colors
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',

    // Gradients (as arrays for LinearGradient)
    gradientPrimary: ['#4F46E5', '#7C3AED'],
    gradientSecondary: ['#EC4899', '#F472B6'],
    gradientSuccess: ['#10B981', '#34D399'],
  },
  dark: {
    // Primary colors
    primary: '#818CF8',
    primaryLight: '#A5B4FC',
    primaryDark: '#4F46E5',

    // Secondary colors
    secondary: '#F472B6',
    secondaryLight: '#F9A8D4',
    secondaryDark: '#EC4899',

    // Backgrounds
    background: '#111827',
    surface: '#1F2937',
    card: '#374151',

    // Text colors
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    textInverse: '#111827',

    // Border colors
    border: '#374151',
    borderLight: '#4B5563',
    borderDark: '#1F2937',

    // Status colors
    success: '#34D399',
    successLight: '#064E3B',
    warning: '#FBBF24',
    warningLight: '#78350F',
    error: '#F87171',
    errorLight: '#7F1D1D',
    info: '#60A5FA',
    infoLight: '#1E3A8A',

    // Gradients
    gradientPrimary: ['#818CF8', '#A78BFA'],
    gradientSecondary: ['#F472B6', '#F9A8D4'],
    gradientSuccess: ['#34D399', '#6EE7B7'],
  },
};

export type ColorScheme = keyof typeof Colors;
export type ColorPalette = typeof Colors.light;
