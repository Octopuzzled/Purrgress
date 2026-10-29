import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Content-Security-Policy für die Web-Version: Skripte, Styles, Schriften und Verbindungen
 * nur von der eigenen Adresse (plus Sync-Server, falls er woanders liegt). Erschwert es
 * eingeschleustem Code, etwas auszuführen oder Daten wegzuschicken.
 * - Nur beim Bauen: Der Entwicklungsserver braucht Inline-Skripte für Hot Reload.
 * - Nicht für Android: Capacitor fügt dort selbst ein Skript in die Seite ein.
 * - style-src braucht 'unsafe-inline' für style-Attribute (Fortschrittsbalken, Positionen).
 */
function contentSecurityPolicy(syncUrl) {
  let syncOrigin = '';
  try {
    syncOrigin = syncUrl ? new URL(syncUrl).origin : '';
  } catch {
    syncOrigin = '';
  }
  const policy = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:", // kleine Schrift-Teile bettet Vite als data: ein
    `connect-src 'self'${syncOrigin ? ` ${syncOrigin}` : ''}`,
    "manifest-src 'self'",
    "worker-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  return {
    name: 'purrgress-csp',
    apply: 'build',
    transformIndexHtml: () => [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: policy }, injectTo: 'head-prepend' }],
  };
}

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
    mode !== 'android' && contentSecurityPolicy(loadEnv(mode, process.cwd(), 'VITE_').VITE_SYNC_URL),
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
