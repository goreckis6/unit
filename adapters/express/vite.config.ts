import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { resolve } from 'path';

export default defineConfig(() => {
  return {
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
    ssr: {
      noExternal: ['@builder.io/qwik', '@builder.io/qwik-city'],
    },
    build: {
      outDir: 'dist/server',
      emptyOutDir: false,
    },
  };
});
