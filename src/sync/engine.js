/**
 * Ein Abgleich-Durchlauf: Server-Stand holen, zusammenführen, zurückschreiben.
 *
 * Jede Speicherung erhöht die Revision (rev). Der Server nimmt ein Update nur an,
 * wenn die neue Revision größer ist als die gespeicherte. Hat ein anderes Gerät
 * dazwischen gespeichert, schlägt das Update fehl und der Durchlauf beginnt neu.
 */
import { SyncError } from './api.js';
import { equal, merge3 } from './merge.js';
import { firstSyncBase, hasProgress, normalizeSyncable, SYNC_FORMAT } from './syncable.js';

const MAX_ATTEMPTS = 3;

/**
 * @param choice  nur beim allerersten Abgleich mit Fortschritt auf beiden Seiten:
 *                'merge' (zusammenführen) oder 'account' (nur Konto-Daten)
 * Rückgabe: ein Objekt mit merged (zusammengeführter Stand) oder mit needsChoice = true
 */
export async function syncOnce({ api, session, base, local, choice }) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const record = await api.getSave(session);

    if (!record) {
      const created = await api.createSave(session, local);
      return { merged: normalizeSyncable(created.data) };
    }

    // Von einer neueren App-Version gespeichert: lieber pausieren als Unbekanntes überschreiben
    if (Number(record.data && record.data.v) > SYNC_FORMAT) throw new SyncError('outdated');
    const remote = normalizeSyncable(record.data);
    let merged;
    if (base) {
      merged = merge3(base, local, remote);
    } else if (!hasProgress(local) || choice === 'account') {
      merged = remote;
    } else if (choice === 'merge') {
      merged = merge3(firstSyncBase(local), local, remote);
    } else {
      return { needsChoice: true };
    }

    // Nichts Neues – außer der Stand liegt noch im alten Format vor, dann einmal neu speichern
    if (equal(merged, remote) && Number(record.data && record.data.v) === SYNC_FORMAT) return { merged };

    try {
      await api.updateSave(session, record.id, merged, record.rev + 1);
      return { merged };
    } catch (error) {
      // Ein anderes Gerät war schneller – neu holen und erneut zusammenführen
      if (!(error instanceof SyncError) || error.kind !== 'notfound' || attempt === MAX_ATTEMPTS) throw error;
    }
  }
  throw new SyncError('server');
}
