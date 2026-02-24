import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0', // Allow access from network
    port: 5173,
    strictPort: false,
    hmr: {
      host: '192.168.1.50' // Use network IP for HMR
    }
  }
})

