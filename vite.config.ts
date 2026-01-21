import { defineConfig } from 'vite';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { qwikVite } from '@builder.io/qwik/optimizer';

export default defineConfig(({ mode }) => {
  const isClient = mode === 'client';
  
  return {
    plugins: [
      qwikCity(),
      qwikVite(),
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
      outDir: isClient ? 'dist' : 'dist-server',
      ssr: !isClient ? 'src/entry.express.ts' : false,
      emptyOutDir: isClient // Only empty outDir for client build, not SSR
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
