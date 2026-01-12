import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: path.resolve(__dirname, 'postcss.config.cjs'),
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'ui-library',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => `ui-library.${format}.js`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@fortawesome/fontawesome-svg-core',
        '@fortawesome/free-solid-svg-icons',
        '@fortawesome/react-fontawesome',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@fortawesome/fontawesome-svg-core': 'FontAwesome',
          '@fortawesome/free-solid-svg-icons': 'FontAwesomeSolid',
          '@fortawesome/react-fontawesome': 'FontAwesomeReact',
        },
      },
    },
  },
});