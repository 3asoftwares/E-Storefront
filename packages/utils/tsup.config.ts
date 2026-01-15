import { defineConfig } from 'tsup';

export default defineConfig([
  // Main library exports
  {
    entry: {
      index: 'src/index.ts',
      client: 'src/client.ts',
      server: 'src/validation/server.ts',
      backend: 'src/backend.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    splitting: false,
    external: ['express', 'express-validator', '@3asoftwares/types'],
  },
]);
