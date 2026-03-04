import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Thaïlande 2026',
        short_name: 'Thai 2026',
        description: 'App de voyage Thaïlande Novembre 2026',
        theme_color: '#0c1e2b',
        background_color: '#0c1e2b',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Cache les pages et assets pour le mode hors-ligne
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Cache les appels API de devises
            urlPattern: /^https:\/\/open\.er-api\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'currency-rates',
              expiration: { maxEntries: 5, maxAgeSeconds: 3600 }
            }
          }
        ]
      }
    })
  ]
});
