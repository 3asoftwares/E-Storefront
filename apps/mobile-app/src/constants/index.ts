export * from './Colors';
export * from './Layout';

// API Constants
export const API_URL = process.env.EXPO_PUBLIC_GRAPHQL_URL || 'https://e-graphql-gateway.vercel.app/graphql';
export const ENV = process.env.EXPO_PUBLIC_ENV || 'development';

// App Constants
export const APP_NAME = '3A Softwares Store';
export const APP_VERSION = '1.0.0';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Image placeholders
export const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x300?text=No+Image';
export const LOGO_URL = 'https://res.cloudinary.com/dpdfyou3r/image/upload/v1767265363/logo/3A_gczh29.png';
