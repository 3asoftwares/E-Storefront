/** @type {import('tailwindcss').Config} */
import baseConfig from '3a-ecommerce-utils/config/tailwind';

export default {
  ...baseConfig,
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui-library/src/**/*.{js,ts,jsx,tsx}',
  ],
};
