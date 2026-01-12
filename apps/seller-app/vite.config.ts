import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import * as path from 'path';
import { SERVICE_URLS, SHELL_APP_URL } from '@3asoftwares/utils';

export default defineConfig(({ mode }) => {
  // Load env files based on mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      federation({
        name: 'sellerApp',
        filename: 'remoteEntry.js',
        exposes: {
          './App': './src/bootstrap.tsx',
          './Dashboard': './src/pages/Dashboard.tsx',
          './SellerProducts': './src/pages/SellerProducts.tsx',
          './SellerUpload': './src/pages/SellerUpload.tsx',
          './SellerOrders': './src/pages/SellerOrders.tsx',
          './SellerEarnings': './src/pages/SellerEarnings.tsx',
        },
        shared: ['react', 'react-dom', 'react-router-dom'],
      }),
    ],
    define: {
      'process.env.VITE_ENV': JSON.stringify(env.VITE_ENV || mode),
      'process.env.VITE_AUTH_SERVICE': JSON.stringify(env.VITE_AUTH_SERVICE || SERVICE_URLS.AUTH_SERVICE),
      'process.env.VITE_PRODUCT_SERVICE': JSON.stringify(env.VITE_PRODUCT_SERVICE || SERVICE_URLS.PRODUCT_SERVICE),
      'process.env.VITE_ORDER_SERVICE': JSON.stringify(env.VITE_ORDER_SERVICE || SERVICE_URLS.ORDER_SERVICE),
      'process.env.VITE_CATEGORY_SERVICE': JSON.stringify(env.VITE_CATEGORY_SERVICE || SERVICE_URLS.CATEGORY_SERVICE),
      'process.env.VITE_SHELL_APP_URL': JSON.stringify(env.VITE_SHELL_APP_URL || SHELL_APP_URL),
      'process.env.VITE_CLOUDINARY_CLOUD_NAME': JSON.stringify(env.VITE_CLOUDINARY_CLOUD_NAME || 'dpdfyou3r'),
      'process.env.VITE_CLOUDINARY_UPLOAD_PRESET': JSON.stringify(env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ECommerce'),
    },
    build: {
      modulePreload: false,
      target: 'esnext',
      minify: false,
      cssCodeSplit: false,
    },
    server: {
      port: 3002,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    preview: {
      port: 3002,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    css: {
      postcss: path.resolve(__dirname, 'postcss.config.js'),
    },
  };
});
