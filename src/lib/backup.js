/**
 * Sicherung als Datei: exportieren und wieder einspielen.
 *
 * Eine Sicherung enthält den kompletten Spielstand dieses Geräts. Beim Einspielen
 * wird der aktuelle Stand ersetzt (nicht zusammengeführt – sonst würden XP und
 * Münzen doppelt zählen, wenn dieselbe Sicherung zweimal eingespielt wird).
 */
import { APP_NAME } from '../constants/game.js';
import { migrate } from './state.js';

export const BACKUP_FORMAT = 1;

/** Einstellungen, die zum Gerät gehören und beim Einspielen nicht überschrieben werden. */
const DEVICE_SETTINGS = ['language', 'theme', 'sound', 'reduceMotion', 'chimeEvery'];

export class BackupError extends Error {
  /** reason: invalid | newer */
  constructor(reason) {
    super(reason);
    this.reason = reason;
  }
}

export function createBackup(state, now = Date.now()) {
  const { timer, ...data } = state; // eslint-disable-line no-unused-vars
  return { app: APP_NAME.toLowerCase(), format: BACKUP_FORMAT, exportedAt: new Date(now).toISOString(), data };
}

export function serializeBackup(state, now) {
  return JSON.stringify(createBackup(state, now), null, 2);
}

export function backupFileName(now = Date.now()) {
  return `${APP_NAME.toLowerCase()}-backup-${new Date(now).toISOString().slice(0, 10)}.json`;
}

/** Liest eine Sicherung und bringt sie in die aktuelle Form. Wirft BackupError. */
export function parseBackup(text) {
  let parsed;
  try {
    parsed = JSON.parse(String(text).trim());
  } catch {
    throw new BackupError('invalid');
  }
  if (!parsed || typeof parsed !== 'object' || parsed.app !== APP_NAME.toLowerCase() || !parsed.data || typeof parsed.data !== 'object') {
    throw new BackupError('invalid');
  }
  if (Number(parsed.format) > BACKUP_FORMAT) throw new BackupError('newer');
  return { exportedAt: parsed.exportedAt || null, state: migrate(parsed.data) };
}

/** Kurzüberblick für die Rückfrage vor dem Einspielen. */
export function summarizeBackup(state) {
  return {
    xp: state.xp,
    coins: state.coins,
    tasks: state.tasks.length,
    done: Object.values(state.history || {}).reduce((sum, n) => sum + (Number(n) || 0), 0),
  };
}

/** Ersetzt den Spielstand durch die Sicherung, behält aber Geräte-Einstellungen. */
export function restoreBackup(current, imported) {
  const deviceSettings = Object.fromEntries(DEVICE_SETTINGS.map((k) => [k, current.settings[k]]));
  return { ...imported, timer: null, settings: { ...imported.settings, ...deviceSettings } };
}
