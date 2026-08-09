import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const root = resolve(import.meta.dirname, '..');

// Docs site. Aliased straight at the library source so edits hot-reload.
export default defineConfig({
  root: resolve(root, 'demo'),
  base: process.env.DEMO_BASE ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@marktoadvine/riffle': resolve(root, 'src/index.ts'),
    },
  },
  build: {
    outDir: resolve(root, 'dist-demo'),
    emptyOutDir: true,
  },
});
