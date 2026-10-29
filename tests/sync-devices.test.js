/**
 * Zwei Geräte, ein Konto: Handy und Laptop gleichen über einen Server im Speicher ab –
 * so wie useSync es tut (Basis merken, zusammenführen, Ergebnis übernehmen).
 * Geprüft wird, dass alles aus 1.7 heil auf dem anderen Gerät ankommt.
 */
import { describe, expect, it } from 'vitest';
import { setEnergy, todayEnergy } from '../src/lib/energy.js';
import { buyShield, setRestDay } from '../src/lib/rest.js';
import { initialState, normalizeTask } from '../src/lib/state.js';
import { addTask, completeTask, postponeTask, reopenTask, rollRepeatingTasks, updateTask } from '../src/lib/tasks.js';
import { createTimer } from '../src/lib/timebox.js';
import { SyncError } from '../src/sync/api.js';
import { syncOnce } from '../src/sync/engine.js';
import { merge3 } from '../src/sync/merge.js';
import { applySyncable, SYNC_FORMAT, toSyncable } from '../src/sync/syncable.js';

const session = { token: 't', userId: 'u1' };

function fakeServer() {
  const server = { record: null };
  server.api = {
    async getSave() {
      return server.record && { ...server.record, data: JSON.parse(JSON.stringify(server.record.data)) };
    },
    async createSave(_s, data) {
      server.record = { id: 'save1', rev: 1, data: JSON.parse(JSON.stringify(data)) };
      return server.record;
    },
    async updateSave(_s, id, data, rev) {
      if (!(rev > server.record.rev)) throw new SyncError('notfound', 404);
      server.record = { id, rev, data: JSON.parse(JSON.stringify(data)) };
      return server.record;
    },
  };
  return server;
}

/** Ein Gerät mit eigenem Spielstand und eigener Abgleich-Basis. */
function device(server, state) {
  const d = {
    state,
    base: null,
    change(fn) { d.state = fn(d.state); return d; },
    async sync(choice = 'merge') {
      const local = toSyncable(d.state);
      const result = await syncOnce({ api: server.api, session, base: d.base, local, choice });
      d.state = applySyncable(d.state, merge3(local, toSyncable(d.state), result.merged));
      d.base = result.merged;
      return d;
    },
  };
  return d;
}

const blank = () => ({ ...initialState(), tasks: [], coins: 0 });
const task = (id, extra = {}) => normalizeTask({ id, title: id, createdAt: 1, ...extra });
const find = (d, id) => d.state.tasks.find((t) => t.id === id);

async function pair(start = blank()) {
  const server = fakeServer();
  const phone = await device(server, start).sync();
  const laptop = await device(server, blank()).sync('account');
  return { server, phone, laptop };
}

describe('Abgleich zwischen zwei Geräten (1.7)', () => {
  it('überträgt Fälligkeit, Wochentage und Ta-da', async () => {
    const { phone, laptop } = await pair();
    phone.change((s) => addTask(s, task('arzt', { due: '2026-11-03' })))
      .change((s) => addTask(s, task('muell', { repeat: 'weekly', repeatDays: [2, 5] })))
      .change((s) => addTask(s, task('brief', { tada: true })));
    await phone.sync();
    await laptop.sync();
    expect(find(laptop, 'arzt').due).toBe('2026-11-03');
    expect(find(laptop, 'muell')).toMatchObject({ repeat: 'weekly', repeatDays: [2, 5] });
    expect(find(laptop, 'brief').tada).toBe(true);
  });

  it('verdoppelt wiederkehrende Aufgaben nicht, wenn beide Geräte den neuen Tag sehen', async () => {
    const { phone, laptop } = await pair({ ...blank(), tasks: [task('wasser', { repeat: 'daily', due: '2026-10-28', done: true, doneDay: '2026-10-28' })] });
    phone.change((s) => rollRepeatingTasks(s, '2026-10-29'));
    laptop.change((s) => rollRepeatingTasks(s, '2026-10-29'));
    await phone.sync();
    await laptop.sync();
    await phone.sync();
    for (const d of [phone, laptop]) {
      expect(d.state.tasks).toHaveLength(1);
      expect(find(d, 'wasser')).toMatchObject({ done: false, due: '2026-10-29' });
    }
  });

  it('behält „Nicht heute“ vom einen Gerät, auch wenn das andere den Tag weiterschiebt', async () => {
    const { phone, laptop } = await pair({ ...blank(), tasks: [task('sport', { repeat: 'daily', due: '2026-10-29' })] });
    laptop.change((s) => postponeTask(s, 'sport', '2026-10-29'));
    await laptop.sync();
    phone.change((s) => rollRepeatingTasks(s, '2026-10-29'));
    await phone.sync();
    expect(find(phone, 'sport').due).toBe('2026-10-30');
  });

  it('addiert Belohnungen von beiden Geräten – auch Überraschungsmünzen', async () => {
    const { phone, laptop } = await pair({ ...blank(), tasks: [task('a'), task('b')] });
    phone.change((s) => completeTask(s, 'a', Date.now(), { kind: 'coins', coins: 5 }).state);
    laptop.change((s) => completeTask(s, 'b').state);
    await phone.sync();
    await laptop.sync();
    await phone.sync();
    expect(phone.state.coins).toBe(laptop.state.coins);
    expect(phone.state.coins).toBe(5 + 5 + 5);
  });

  it('nimmt beim Rückgängigmachen auch die Messung fürs Zeitgefühl auf allen Geräten zurück', async () => {
    const T0 = 1_800_000_000_000;
    const { phone, laptop } = await pair({ ...blank(), tasks: [task('a', { category: 'fokus' })], timer: null });
    phone.change((s) => completeTask({ ...s, timer: createTimer('a', 10, T0) }, 'a', T0 + 12 * 60000).state);
    await phone.sync();
    await laptop.sync();
    expect(laptop.state.timeLog).toHaveLength(1);
    laptop.change((s) => reopenTask(s, 'a'));
    await laptop.sync();
    await phone.sync();
    expect(phone.state.timeLog).toEqual([]);
    expect(find(phone, 'a').done).toBe(false);
  });

  it('teilt Tagesform, Ruhetage und Kuscheldecken', async () => {
    const { phone, laptop } = await pair({ ...blank(), coins: 200 });
    phone.change((s) => setEnergy(s, 'wenig', '2026-10-29')).change((s) => setRestDay(s, true, '2026-10-28'));
    laptop.change(buyShield);
    await phone.sync();
    await laptop.sync();
    await phone.sync();
    for (const d of [phone, laptop]) {
      expect(todayEnergy(d.state, '2026-10-29')).toBe('wenig');
      expect(d.state.restDays).toEqual(['2026-10-28']);
      expect(d.state.shields).toBe(1);
    }
  });

  it('führt Bearbeitungen derselben Aufgabe ohne Datenverlust zusammen, wenn nur ein Gerät sie ändert', async () => {
    const { phone, laptop } = await pair({ ...blank(), tasks: [task('a'), task('b')] });
    phone.change((s) => updateTask(s, 'a', { due: '2026-11-01' }));
    laptop.change((s) => updateTask(s, 'b', { repeat: 'weekly', repeatDays: [1] }));
    await phone.sync();
    await laptop.sync();
    await phone.sync();
    expect(find(phone, 'b').repeatDays).toEqual([1]);
    expect(find(laptop, 'a').due).toBe('2026-11-01');
  });

  it('liest Spielstände älterer Versionen (Format 1) ohne Probleme', async () => {
    const server = fakeServer();
    server.record = { id: 'save1', rev: 3, data: { v: 1, xp: 40, coins: 10, tasks: [{ id: 'alt', title: 'Alt', repeat: 'daily' }] } };
    const d = await device(server, blank()).sync('account');
    expect(find(d, 'alt').due).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(d.state.restDays).toEqual([]);
    expect(server.record.data.v).toBe(SYNC_FORMAT);
  });

  it('pausiert, statt Daten einer neueren App-Version zu überschreiben', async () => {
    const server = fakeServer();
    const newer = { v: SYNC_FORMAT + 1, xp: 999, tasks: [], somethingNew: true };
    server.record = { id: 'save1', rev: 7, data: newer };
    await expect(device(server, blank()).sync()).rejects.toMatchObject({ kind: 'outdated' });
    expect(server.record).toMatchObject({ rev: 7, data: newer });
  });
});
