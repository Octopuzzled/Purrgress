import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Zwei Build-Varianten:
 * - normal (`npm run build`): Web-Version mit PWA (Offline-Speicher, installierbar)
 * - android (`npm run android:sync`): für die APK ohne Service Worker,
 *   weil die App-Dateien dort ohnehin lokal im Paket liegen
 */
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    mode !== 'android' &&
      VitePWA({
        // Neue Versionen werden beim nächsten Öffnen automatisch aktiv
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
        manifest: {
          name: 'Purrgress',
          short_name: 'Purrgress',
          description: 'Kleine Aufgaben, sanfte Belohnungen und eine Zeitbox, die dich nicht hetzt.',
          lang: 'de',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#fff9f5',
          theme_color: '#fff9f5',
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // Alles für den Offline-Betrieb vorab speichern, inklusive Schriften
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          // Sync-API und PocketBase-Admin nie durch die App-Seite ersetzen
          navigateFallbackDenylist: [/^\/api\//, /^\/_\//],
        },
      }),
  ].filter(Boolean),
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
}));
