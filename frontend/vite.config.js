import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), 
  ],
  server: {
    host: true, // Guarantees Vite exposes ports to network layers
    allowedHosts: ['.loca.lt'], // <-- Unlocks LocalTunnel connection routes globally
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})