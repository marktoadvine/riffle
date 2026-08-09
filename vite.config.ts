import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Library build. The demo app has its own config at demo/vite.config.ts.
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'Riffle',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'riffle.js' : 'riffle.cjs'),
      cssFileName: 'riffle',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        /*
         * The 'use client' directive at the top of CardStack.tsx is stripped
         * during bundling, silently and without a warning, so it has to be put
         * back on the built chunks. Without it the package cannot be imported
         * from a React Server Components tree. The build is verified by
         * grepping dist for this string, not by trusting the source file.
         */
        banner: "'use client';",
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
