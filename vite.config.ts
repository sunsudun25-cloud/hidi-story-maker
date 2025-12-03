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
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: [
      "*.sandbox.novita.ai"
    ]
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: [
      "*.sandbox.novita.ai"
    ]
  }
})
