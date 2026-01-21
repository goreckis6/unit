import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from 'path';

export default defineConfig(() => ({
  plugins: [
    qwikCity(),
    qwikVite({
      client: {
        outDir: "dist/client",
      },
      ssr: {
        outDir: "dist/server",
      },
    }),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      '~/': resolve(__dirname, './src-qwik/'),
      '@/': resolve(__dirname, './src-qwik/'),
    },
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
}));

