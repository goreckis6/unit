import { defineConfig } from 'vite';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { qwikVite } from '@builder.io/qwik/optimizer';

export default defineConfig(({ mode }) => {
  const isClient = mode === 'client';
  
  return {
    plugins: [
      qwikCity(),
      qwikVite()
    ],
    build: {
      outDir: 'dist',
      ssr: !isClient ? 'src/entry.express.ts' : false
    },
    ssr: {
      noExternal: [/^@builder\.io\/qwik/]
    },
    optimizeDeps: {
      exclude: ['node:sqlite']
    }
  };
});
