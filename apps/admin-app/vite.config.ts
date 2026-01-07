import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import * as path from 'path';

export default defineConfig({
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
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
    },
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
}));
