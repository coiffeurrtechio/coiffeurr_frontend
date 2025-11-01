import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import EnvironmentPlugin from 'vite-plugin-environment'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),           // ✅ Add this line
    tailwindcss(),
    EnvironmentPlugin('all'),
  ],
  build: {
    outDir: 'dist',    // ✅ optional but recommended for Vercel
  },
  resolve: {
    alias: {
      '@': '/src',     // ✅ optional but good for clean imports
    },
  },
})
