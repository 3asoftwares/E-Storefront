import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import * as path from 'path';
import { SERVICE_URLS, SHELL_APP_URL } from '../../packages/utils/src/constants';

export default defineConfig(({ mode }) => {
  // Load env files based on mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    resolve: {
      alias: {
        '@3asoftwares/ui/styles.css': path.resolve(
          __dirname,
          '../../packages/ui-library/dist/style.css'
        ),
      },
    },
    plugins: [
      react(),
      federation({
        name: 'adminApp',
        filename: 'remoteEntry.js',
        exposes: {
          './App': './src/bootstrap.tsx',
          './Dashboard': './src/pages/Dashboard.tsx',
          './Users': './src/pages/Users.tsx',
          './Products': './src/pages/Products.tsx',
          './Orders': './src/pages/Orders.tsx',
          './Coupons': './src/pages/Coupons.tsx',
        },
        shared: ['react', 'react-dom', 'react-router-dom'],
      }),
    ],
    define: {
      'process.env.VITE_ENV': JSON.stringify(env.VITE_ENV || mode),
      'process.env.VITE_GRAPHQL_URL': JSON.stringify(
        env.VITE_GRAPHQL_URL || SERVICE_URLS.GRAPHQL_GATEWAY
      ),
      'process.env.VITE_AUTH_SERVICE': JSON.stringify(
        env.VITE_AUTH_SERVICE || SERVICE_URLS.AUTH_SERVICE
      ),
      'process.env.VITE_SHELL_APP_URL': JSON.stringify(env.VITE_SHELL_APP_URL || SHELL_APP_URL),
      'process.env.VITE_SUPPORT_APP_URL': JSON.stringify(
        env.VITE_SUPPORT_APP_URL || SUPPORT_APP_URL
      ),
      'process.env.VITE_CLOUDINARY_CLOUD_NAME': JSON.stringify(
        env.VITE_CLOUDINARY_CLOUD_NAME || 'dpdfyou3r'
      ),
      'process.env.VITE_CLOUDINARY_UPLOAD_PRESET': JSON.stringify(
        env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ECommerce'
      ),
    },
    build: {
      modulePreload: false,
      target: 'esnext',
      minify: false,
      cssCodeSplit: false,
    },
    server: {
      port: 3001,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    preview: {
      port: 3001,
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
