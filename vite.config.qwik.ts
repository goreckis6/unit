import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => ({
  plugins: [
    qwikCity(),
    qwikVite({
      client: {
        outDir: "dist/client",
      },
      ssr: {
        outDir: "server",  // Zmienione z dist/server na server
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    chunkSizeWarningLimit: 1000,
  },
}));

