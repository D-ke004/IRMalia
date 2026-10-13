import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // /api/auth/login.php → http://localhost:8000/api/auth/login.php
        // The PHP built-in server serves from project root, so path stays the same
      },
    },
  },
})
