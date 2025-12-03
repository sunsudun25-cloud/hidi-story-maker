import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    hmr: {
      host: '3000-i5dcsscuqxml7neuit43a-de59bda9.sandbox.novita.ai',
      protocol: 'wss'
    }
  },
  preview: {
    host: true,
    port: 3000,
    strictPort: true
  }
})
