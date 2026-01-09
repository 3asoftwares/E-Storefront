// Theme constants for the mobile app
export const Colors = {
  light: {
    // Primary
    primary: '#3B82F6',
    primaryLight: '#60A5FA',
    primaryDark: '#2563EB',

    // Secondary
    secondary: '#8B5CF6',
    secondaryLight: '#A78BFA',
    secondaryDark: '#7C3AED',

    // Success
    success: '#10B981',
    successLight: '#34D399',
    successDark: '#059669',

    // Warning
    warning: '#F59E0B',
    warningLight: '#FBBF24',
    warningDark: '#D97706',

    // Error / Danger
    error: '#EF4444',
    errorLight: '#F87171',
    errorDark: '#DC2626',

    // Info
    info: '#06B6D4',
    infoLight: '#22D3EE',
    infoDark: '#0891B2',

    // Neutrals
    background: '#FFFFFF',
    backgroundSecondary: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F9',

    // Text
    text: '#1E293B',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    textInverse: '#FFFFFF',

    // Borders
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    borderDark: '#CBD5E1',

    // Misc
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#3B82F6',
  },
  dark: {
    // Primary
    primary: '#60A5FA',
    primaryLight: '#93C5FD',
    primaryDark: '#3B82F6',

    // Secondary
    secondary: '#A78BFA',
    secondaryLight: '#C4B5FD',
    secondaryDark: '#8B5CF6',

    // Success
    success: '#34D399',
    successLight: '#6EE7B7',
    successDark: '#10B981',

    // Warning
    warning: '#FBBF24',
    warningLight: '#FCD34D',
    warningDark: '#F59E0B',

    // Error / Danger
    error: '#F87171',
    errorLight: '#FCA5A5',
    errorDark: '#EF4444',

    // Info
    info: '#22D3EE',
    infoLight: '#67E8F9',
    infoDark: '#06B6D4',

    // Neutrals
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    surface: '#1E293B',
    surfaceSecondary: '#334155',

    // Text
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    textInverse: '#0F172A',

    // Borders
    border: '#334155',
    borderLight: '#475569',
    borderDark: '#1E293B',

    // Misc
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    tabIconDefault: '#64748B',
    tabIconSelected: '#60A5FA',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const FontSizes = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const FontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const BorderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const ZIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modal: 30,
  popover: 40,
  tooltip: 50,
};

// Order status colors
export const OrderStatusColors = {
  pending: Colors.light.warning,
  confirmed: Colors.light.info,
  processing: Colors.light.primary,
  shipped: Colors.light.secondary,
  delivered: Colors.light.success,
  cancelled: Colors.light.error,
  refunded: Colors.light.textTertiary,
};

// Category emoji mapping (matching web app)
export const CategoryEmojis: Record<string, string> = {
  electronics: '📱',
  clothing: '👕',
  home: '🏠',
  beauty: '💄',
  sports: '⚽',
  books: '📚',
  toys: '🧸',
  food: '🍔',
  automotive: '🚗',
  garden: '🌱',
  health: '💊',
  jewelry: '💎',
  office: '📎',
  pets: '🐾',
  music: '🎵',
  default: '📦',
};

// API Configuration
export const API_CONFIG = {
  graphqlEndpoint: __DEV__
    ? 'http://192.168.1.100:4000/graphql' // Change to your local IP
    : 'https://api.your-domain.com/graphql',
  timeout: 30000,
  retryAttempts: 3,
};

// App Configuration
export const APP_CONFIG = {
  name: '3A Storefront',
  version: '1.0.0',
  currency: 'USD',
  currencySymbol: '$',
  itemsPerPage: 20,
  maxCartItems: 99,
  freeShippingThreshold: 50,
  shippingCost: 5.99,
};

// Animation durations (ms)
export const Animations = {
  fast: 150,
  normal: 300,
  slow: 500,
};
