import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => ({
  plugins: [
    qwikCity(),
    qwikVite(),
    tsconfigPaths(),
  ],
  build: {
    chunkSizeWarningLimit: 1000, // Zwiększ limit do 1000 kB (dla plików tłumaczeń)
  },
}));
