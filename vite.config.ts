import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const isProd = process.env.NODE_ENV === 'production'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(isProd ? [VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'SmartQR — One QR. Your entire customer experience.',
        short_name: 'SmartQR',
        description: 'Digital menu, WiFi access, and Google Reviews for your business.',
        start_url: '/',
        display: 'standalone',
        background_color: '#fafaf9',
        theme_color: '#f59e0b',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,png}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    })] : []),
  ],
  server: {
    host: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
