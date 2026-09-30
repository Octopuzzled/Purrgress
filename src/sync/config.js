/**
 * Adresse des Sync-Servers (PocketBase).
 *
 * - Web-Version: gleiche Domain wie die App (Caddy leitet /api/ an PocketBase weiter)
 * - Android-App oder lokale Entwicklung: über VITE_SYNC_URL (siehe .env.android bzw. .env.example)
 * - Leer = Sync ist nicht eingerichtet, die App läuft rein lokal
 */
function resolveSyncUrl() {
  const fromEnv = import.meta.env && import.meta.env.VITE_SYNC_URL;
  if (fromEnv !== undefined) return String(fromEnv);
  if (typeof window === 'undefined') return '';
  const { protocol, hostname, origin } = window.location;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  return /^https?:$/.test(protocol) && !isLocal ? origin : '';
}

export const SYNC_URL = resolveSyncUrl().replace(/\/$/, '');
