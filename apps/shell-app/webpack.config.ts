const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const { ModuleFederationPlugin } = require('webpack').container;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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

const isProduction = nodeEnv === 'production';

module.exports = {
  entry: './src/index.tsx',
  target: 'web',
  mode: isProduction ? 'production' : 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    publicPath: 'auto',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.css'],
    // Monorepo package aliases - resolve to built dist folders with subpath support
    alias: {
      '@3asoftwares/ui/styles.css': path.resolve(__dirname, '../../packages/ui-library/dist/style.css'),
      '@3asoftwares/ui': path.resolve(__dirname, '../../packages/ui-library/dist/ui-library.es.js'),
      '@3asoftwares/utils/client': path.resolve(__dirname, '../../packages/utils/dist/client.mjs'),
      '@3asoftwares/utils/server': path.resolve(__dirname, '../../packages/utils/dist/server.mjs'),
      '@3asoftwares/utils': path.resolve(__dirname, '../../packages/utils/dist/index.mjs'),
      '@3asoftwares/types': path.resolve(__dirname, '../../packages/types/dist/index.mjs'),
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
      process: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[hash][ext]',
        },
      },
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-react',
                ['@babel/preset-typescript', { onlyRemoveTypeImports: true }],
              ],
            },
          },
        ],
        exclude: /node_modules\/(?!3asoftwares)/,
      },
      {
        test: /\.css$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: '3A Softwares',
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
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
        zustand: {
          singleton: true,
          requiredVersion: '^4.4.7',
        },
      },
    }),
    new webpack.DefinePlugin({
      'process.env.AUTH_SERVICE_BASE': JSON.stringify(process.env.AUTH_SERVICE_BASE || 'http://localhost:3011/api/auth'),
      'process.env.ADMIN_APP_URL': JSON.stringify(ADMIN_APP_URL),
      'process.env.SELLER_APP_URL': JSON.stringify(SELLER_APP_URL),
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
          name: 'react-vendor',
          priority: 20,
        },
        uiLibrary: {
          test: /[\\/]packages[\\/]ui-library[\\/]/,
          name: 'ui-library',
          priority: 15,
        },
        utils: {
          test: /[\\/]packages[\\/]utils[\\/]/,
          name: 'utils',
          priority: 15,
        },
      },
    },
    runtimeChunk: 'single',
  },
  performance: {
    hints: false,
  },
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
};
