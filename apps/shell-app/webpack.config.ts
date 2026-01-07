const webpack = require('webpack');
const path = require('path');
const { ModuleFederationPlugin } = require('webpack').container;
const { createBaseWebpackConfig } = require('3a-ecommerce-utils/config/webpack');

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
  resolve: {
    ...baseConfig.resolve,
    alias: {
      '3a-ecommerce-ui-library': path.resolve(
        __dirname,
        '../../packages/ui-library/dist/ui-library.es.js'
      ),
      '3a-ecommerce-utils': path.resolve(__dirname, '../../packages/utils/dist'),
      '3a-ecommerce-types': path.resolve(__dirname, '../../packages/types/dist'),
    },
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
    },
  },
  plugins: [
    ...baseConfig.plugins,
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
      'process.env.ADMIN_APP_URL': JSON.stringify(ADMIN_APP_URL),
      'process.env.SELLER_APP_URL': JSON.stringify(SELLER_APP_URL),
    }),
  ],
};
