/**
 * Anmeldung und Abgleich-Stand liegen getrennt vom Spielstand:
 * Sie gehören zu diesem Gerät und werden nie mit abgeglichen.
 */
const SESSION_KEY = 'purrgress-session-v1';
const META_KEY = 'purrgress-sync-v1';

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ohne Speicher: Sitzung gilt nur bis zum Neuladen */
  }
}

/** { token, userId, email } oder null */
export const loadSession = () => read(SESSION_KEY);
export const saveSession = (session) => write(SESSION_KEY, session);

/** { userId, base, lastSync } – base ist der Stand beim letzten erfolgreichen Abgleich */
export const loadSyncMeta = () => read(META_KEY) || {};
export const saveSyncMeta = (meta) => write(META_KEY, meta);
