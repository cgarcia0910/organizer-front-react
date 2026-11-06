/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxReadySignal } from '@nx/vite/plugins/nx-ready-signal.plugin';

// ...

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/react-front',
  server: {
    port: 4200,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://172.23.96.1:8080',
        changeOrigin: true,
      },
      '/resources': {
        target: 'http://172.23.96.1:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/resources/, ''),
      },
    },
  },
  preview: {
    port: 4300,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://172.23.96.1:8080',
        changeOrigin: true,
      },
      '/resources': {
        target: 'http://172.23.96.1:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/resources/, ''),
      },
    },
  },
  plugins: [react(), nxReadySignal()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    name: '@react-front/react-front',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
