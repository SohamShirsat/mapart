import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'Mapart',
        short_name: 'Mapart',
        description: 'Draw with your feet. Create GPS art routes for running.',
        start_url: '/',
        display: 'standalone',
        background_color: '#09090E',
        theme_color: '#09090E',
        orientation: 'portrait',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[a-z]\.basemaps\.cartocdn\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'map-tiles',
              expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /^https:\/\/router\.project-osrm\.org\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'osrm-routes', expiration: { maxEntries: 50 } },
          },
        ],
      },
    }),
  ],
})
