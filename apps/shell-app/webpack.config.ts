const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const { ModuleFederationPlugin } = require('webpack').container;
const { createBaseWebpackConfig } = require('@3asoftwares/utils/config/webpack');

// Load environment variables based on NODE_ENV
const dotenv = require('dotenv');
const nodeEnv = process.env.NODE_ENV || 'development';

// Load .env files in order of priority (later files override earlier ones)
const envFiles = [
  '.env.local',                    // Local defaults (optional)
  `.env.${nodeEnv}`,               // Environment-specific (.env.development, .env.production)
  '.env',                          // Base .env file (highest priority)
];

envFiles.forEach((file) => {
  const envPath = path.resolve(__dirname, file);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
  }
});

// Remote app URLs - configurable via environment variables
const ADMIN_APP_URL = process.env.ADMIN_APP_URL || 'http://localhost:3001';
const SELLER_APP_URL = process.env.SELLER_APP_URL || 'http://localhost:3002';

// Get base configuration
const baseConfig = createBaseWebpackConfig({
  rootDir: __dirname,
  htmlTemplate: './public/index.html',
  htmlTitle: '3A Softwares',
  devServerPort: 3000,
});

module.exports = {
  ...baseConfig,
  mode: nodeEnv === 'production' ? 'production' : 'development',
  resolve: {
    ...baseConfig.resolve,
    fallback: {
      crypto: false,
      url: false,
      http: false,
      https: false,
      http2: false,
      zlib: false,
      stream: false,
      fs: false,
      path: false,
      os: false,
      net: false,
      tls: false,
      tty: false,
      assert: false,
      util: false,
      buffer: false,
      querystring: false,
      process: false,
    },
  },
  plugins: [
    ...baseConfig.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new ModuleFederationPlugin({
      name: 'shell',
      filename: 'remoteEntry.js',
      remotes: {
        adminApp: `adminApp@${ADMIN_APP_URL}/remoteEntry.js`,
        sellerApp: `sellerApp@${SELLER_APP_URL}/remoteEntry.js`,
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.2.0',
          eager: true,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.2.0',
          eager: true,
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^6.20.0',
          eager: true,
        },
      },
    }),
    new webpack.DefinePlugin({
      'process.env.AUTH_SERVICE_BASE': JSON.stringify(process.env.AUTH_SERVICE_BASE || 'http://localhost:3011/api/auth'),
      'process.env.ADMIN_APP_URL': JSON.stringify(ADMIN_APP_URL),
      'process.env.SELLER_APP_URL': JSON.stringify(SELLER_APP_URL),
    }),
  ],
};
