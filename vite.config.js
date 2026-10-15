import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',

      devOptions: {
        // Desactivado temporalmente durante esta sesión de pruebas locales —
        // el service worker en modo dev se queda en mal estado después de
        // varios reinicios del servidor y causa que la página no cargue.
        // Reactivar cuando se necesite probar el comportamiento PWA/offline.
        enabled: false,
        type: 'module',
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/^(?!\/(api|icons|assets)\/)/],
      },

      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
        // draco/ (decodificadores 3D, sin uso en la app) y la fuente SVG de
        // boxicons (1,2 MB; los navegadores modernos usan la woff2) inflaban
        // el precache del service worker en la primera visita.
        globIgnores: ['draco/**', 'assets/boxicons-*.svg'],
      },

      manifest: {
        name: 'Merku',
        short_name: 'Merku',
        description: 'Marketplace con tiendas, restaurantes, catálogo, pedidos y más.',
        lang: 'es-CO',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#f97316',
        background_color: '#0f172a',
        categories: ['shopping', 'food', 'business'],
        icons: [
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
        ],
        shortcuts: [
          {
            name: 'Ver tiendas',
            url: '/stores',
            description: 'Explorar todas las tiendas y restaurantes',
          },
          {
            name: 'Mi carrito',
            url: '/cart',
            description: 'Ver artículos en el carrito',
          },
        ],
      },
    }),
  ],

  build: {
    rollupOptions: {
      output: {
        // Split heavy, infrequently-needed third-party deps into their own
        // vendor chunks so a change to app code doesn't invalidate the cache
        // for these, and pages that don't use maps/charts don't pay for them
        // in the main bundle.
        //
        // Forma de función (no objeto): con la forma objeto, Rollup metía en
        // vendor-recharts dependencias compartidas (p. ej. clsx) que el entry
        // también usa, así que los ~410 KB de recharts se precargaban en TODAS
        // las páginas públicas aunque solo los usa el dashboard privado.
        manualChunks(id) {
          // Utilidades compartidas que usan tanto la app como recharts/leaflet:
          // Rollup mete las dependencias no asignadas dentro del primer chunk
          // manual que las importa, así que sin esto arrastraban ese chunk
          // completo a la carga inicial. Van con vendor-react, que ya es eager.
          if (id.includes('commonjsHelpers') || /[\\/]node_modules[\\/](clsx|tailwind-merge)[\\/]/.test(id)) {
            return 'vendor-react';
          }
          if (!id.includes('node_modules')) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
            return 'vendor-react';
          }
          if (/[\\/]node_modules[\\/](leaflet|react-leaflet|@react-leaflet[\\/][^\\/]+)[\\/]/.test(id)) {
            return 'vendor-leaflet';
          }
          if (/[\\/]node_modules[\\/](recharts|recharts-scale|victory-vendor|d3-[^\\/]+|internmap|decimal\.js-light)[\\/]/.test(id)) {
            return 'vendor-recharts';
          }
          if (/[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) {
            return 'vendor-motion';
          }
          return undefined;
        },
      },
    },
  },

  server: {
    proxy: {
      // Reenvía las llamadas del frontend local a la API de producción
      // desde el propio servidor de Vite (server-to-server), para que el
      // navegador nunca haga la petición cross-origin y no choque con CORS
      // (ALLOWED_ORIGINS en producción no incluye localhost). Se quita el
      // header Origin real del navegador (localhost:5173) antes de reenviar,
      // porque si el backend lo ve tal cual, lo rechaza — y lo hace lanzando
      // un Error sin capturar dentro del callback de cors(), lo que crashea
      // la request con un 500 en vez de responder un 403 normal.
      '/api': {
        target: 'https://api.merku.co',
        changeOrigin: true,
        secure: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        },
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@domain': path.resolve(__dirname, 'src/domain'),
      '@application': path.resolve(__dirname, 'src/application'),
      '@infrastructure': path.resolve(__dirname, 'src/infrastructure'),
      '@presentation': path.resolve(__dirname, 'src/presentation'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@atoms': path.resolve(__dirname, 'src/presentation/ui/atoms'),
      '@molecules': path.resolve(__dirname, 'src/presentation/ui/molecules'),
      '@organisms': path.resolve(__dirname, 'src/presentation/ui/organisms'),
    },
  },
});
