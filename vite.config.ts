import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    qwikCity({
      routesDir: './src-qwik/routes',
      serviceWorker: {
        // ❌ DISABLE Service Worker - it causes Code(31) serialization issues
        register: false,
      },
    }),
    qwikVite(),
  ],
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
  },
  preview: {
    headers: {
      'Cache-Control': 'public, max-age=600',
    },
  },
});
