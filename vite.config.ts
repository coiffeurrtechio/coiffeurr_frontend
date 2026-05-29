import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
// Option A: If you must use process.env, keep the import
import EnvironmentPlugin from 'vite-plugin-environment'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Changed 'all' to a specific object to prevent the build error
    EnvironmentPlugin({
      NODE_ENV: process.env.NODE_ENV || 'development',
    }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: false
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/^\/$/, /^\/salons/, /^\/profile/, /^\/search/],
        runtimeCaching: [
          {
            urlPattern: /^\/feedback\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'feedback-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Coiffure App',
        short_name: 'Coiffure',
        description: 'Premium Hair Styling PWA',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: 'maskable.png',
            sizes: '1136x1136',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 3001,
    strictPort: true,
    allowedHosts: [
      '1e4e-2405-201-d035-1107-3d64-cbd3-cb9b-dd5a.ngrok-free.app'
    ]
  },
  build: {
    outDir: 'dist',
    // Helpful for debugging PWA builds
    sourcemap: false, 
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})