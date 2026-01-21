import { defineConfig } from 'vite';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { staticAdapter } from '@builder.io/qwik-city/adapters/static/vite';

export default defineConfig(() => {
  return {
    plugins: [
      qwikCity({
        basePathname: '/',
        trailingSlash: true,
      }),
      qwikVite(),
      staticAdapter({
        origin: 'https://unitconverterhub.com',
      }),
      {
        name: 'stub-node-sqlite',
        resolveId(id) {
          if (id === 'node:sqlite') {
            return '\0node:sqlite';
          }
        },
        load(id) {
          if (id === '\0node:sqlite') {
            return 'export {};';
          }
        }
      }
    ],
    build: {
      ssr: true,
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: ['@qwik-city-plan'],
      },
    },
    ssr: {
      noExternal: [/^@builder\.io\/qwik/],
      external: ['node:sqlite']
    },
    optimizeDeps: {
      exclude: ['node:sqlite']
    }
  };
});
