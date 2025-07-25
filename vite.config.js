import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
     port: 5173,
    proxy: {
      '/rest/api': {
        target: 'http://localhost:9999',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})