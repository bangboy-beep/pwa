import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const isProd = process.env.NODE_ENV === 'production'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }
  const supabaseUrl =
    env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || 'https://dvuuvbzaanrwfsbkbmqu.supabase.co'
  // JWT holds the project's public anon key (role: anon), safe to expose to the browser.
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.JWT || ''

  return {
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
  },
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
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
          {
            // Cache gambar & media menu dengan masa kedaluwarsa 7 hari (1 minggu)
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp|mp4|webm)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'media-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 hari
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Cache request storage (R2 / Supabase Storage) dengan masa kedaluwarsa 7 hari (1 minggu)
            urlPattern: /^https:\/\/.*(?:r2\.cloudflarestorage\.com|supabase\.co\/storage).*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'storage-media-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 hari
              },
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
  }
})
