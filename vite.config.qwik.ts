import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig(() => {
  return {
    plugins: [
      qwikCity({
        routesDir: './src/routes',
      }),
      qwikVite({
        client: {
          outDir: 'dist/client',
        },
        ssr: {
          outDir: 'dist/server',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: false,
    },
    ssr: {
      noExternal: ['@builder.io/qwik-city'],
    },
  };
});

