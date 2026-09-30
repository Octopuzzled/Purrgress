import { describe, expect, it } from 'vitest';
import { initialState, normalizeTask } from '../src/lib/state.js';
import { completeTask, removeTask } from '../src/lib/tasks.js';
import { authErrorKey, SyncError } from '../src/sync/api.js';
import { syncOnce } from '../src/sync/engine.js';
import { equal, merge3, mergeById } from '../src/sync/merge.js';
import { applySyncable, emptySyncable, firstSyncBase, hasProgress, normalizeSyncable, toSyncable } from '../src/sync/syncable.js';

const task = (id, extra = {}) => normalizeTask({ id, title: id.toUpperCase(), createdAt: 1, ...extra });
const withTasks = (ids) => ({ ...initialState(), tasks: ids.map((id) => task(id)) });

describe('Drei-Wege-Abgleich', () => {
  it('addiert Fortschritt von beiden Geräten', () => {
    const base = toSyncable({ ...initialState(), xp: 100, coins: 80 });
    const local = { ...base, xp: 130, coins: 60, history: { '2026-09-29': 2 } }; // 30 XP verdient, 20 Münzen ausgegeben
    const remote = { ...base, xp: 125, coins: 95, history: { '2026-09-29': 1 } }; // 25 XP, 15 Münzen verdient
    const m = merge3(base, local, remote);
    expect(m.xp).toBe(155);
    expect(m.coins).toBe(75);
    expect(m.history['2026-09-29']).toBe(3);
  });

  it('übernimmt Änderungen, die nur auf einer Seite passiert sind', () => {
    const base = toSyncable(withTasks(['a', 'b']));
    const local = { ...base, tasks: base.tasks.map((t) => (t.id === 'a' ? { ...t, done: true } : t)) };
    const remote = { ...base, tasks: base.tasks.map((t) => (t.id === 'b' ? { ...t, title: 'Neu' } : t)) };
    const m = merge3(base, local, remote);
    expect(m.tasks.find((t) => t.id === 'a').done).toBe(true);
    expect(m.tasks.find((t) => t.id === 'b').title).toBe('Neu');
  });

  it('löscht, was auf einer Seite gelöscht und auf der anderen unverändert ist', () => {
    const base = toSyncable(withTasks(['a', 'b']));
    const local = { ...base, tasks: base.tasks.filter((t) => t.id !== 'a') };
    expect(merge3(base, local, base).tasks.map((t) => t.id)).toEqual(['b']);
    expect(merge3(base, base, local).tasks.map((t) => t.id)).toEqual(['b']);
  });

  it('behält eine Aufgabe, die auf einer Seite gelöscht und auf der anderen bearbeitet wurde', () => {
    const base = toSyncable(withTasks(['a']));
    const local = { ...base, tasks: [] };
    const remote = { ...base, tasks: [{ ...base.tasks[0], title: 'Bearbeitet' }] };
    expect(merge3(base, local, remote).tasks[0].title).toBe('Bearbeitet');
  });

  it('nimmt neue Aufgaben von beiden Seiten auf, neue von anderen Geräten oben', () => {
    const base = toSyncable(withTasks(['a']));
    const local = { ...base, tasks: [task('l'), ...base.tasks] };
    const remote = { ...base, tasks: [task('r'), ...base.tasks] };
    expect(merge3(base, local, remote).tasks.map((t) => t.id)).toEqual(['l', 'r', 'a']);
  });

  it('übernimmt die Reihenfolge des Geräts, das umsortiert hat', () => {
    const base = [task('a'), task('b'), task('c')];
    const local = [task('b'), task('c'), task('a')]; // „Später“ auf diesem Gerät
    expect(mergeById(base, local, base).map((t) => t.id)).toEqual(['b', 'c', 'a']);
    expect(mergeById(base, base, local).map((t) => t.id)).toEqual(['b', 'c', 'a']);
  });

  it('gleicht Käufe und Ausrüstung ab', () => {
    const base = toSyncable(initialState());
    const local = { ...base, owned: [...base.owned, 'kopf-muetze'], hero: { ...base.hero, equip: { ...base.hero.equip, kopf: 'kopf-muetze' } } };
    const remote = { ...base, owned: [...base.owned, 'fell-pfirsich'], hero: { ...base.hero, name: 'Mimi' } };
    const m = merge3(base, local, remote);
    expect(m.owned).toContain('kopf-muetze');
    expect(m.owned).toContain('fell-pfirsich');
    expect(m.hero.equip.kopf).toBe('kopf-muetze');
    expect(m.hero.name).toBe('Mimi');
  });

  it('ist stabil: ohne Änderungen kommt genau der Server-Stand heraus', () => {
    const base = toSyncable(withTasks(['a', 'b']));
    expect(equal(merge3(base, base, base), base)).toBe(true);
  });

  it('lässt Münzen nie negativ werden', () => {
    const base = toSyncable({ ...initialState(), coins: 100 });
    expect(merge3(base, { ...base, coins: 0 }, { ...base, coins: 20 }).coins).toBe(0);
  });
});

describe('Spielstand-Auszug', () => {
  it('lässt Zeitbox und Geräte-Einstellungen unangetastet', () => {
    const state = { ...initialState(), timer: { taskId: 'x' }, settings: { ...initialState().settings, theme: 'dark', dailyGoal: 3 } };
    const next = applySyncable(state, { ...toSyncable(state), xp: 50, dailyGoal: 5 });
    expect(next.timer).toEqual({ taskId: 'x' });
    expect(next.settings.theme).toBe('dark');
    expect(next.settings.dailyGoal).toBe(5);
    expect(next.xp).toBe(50);
  });

  it('repariert kaputte Server-Daten', () => {
    const s = normalizeSyncable({ xp: '12', tasks: [{ title: 'Ohne ID' }], coins: null });
    expect(s.tasks).toHaveLength(1);
    expect(typeof s.tasks[0].id).toBe('string');
    expect(normalizeSyncable(null).tasks).toEqual([]);
  });

  it('erkennt echten Fortschritt, aber nicht die unberührten Starter-Aufgaben', () => {
    expect(hasProgress(toSyncable(initialState()))).toBe(false);
    const done = completeTask(initialState(), 'starter-1').state;
    expect(hasProgress(toSyncable(done))).toBe(true);
  });
});

/** Nachbau des Servers im Speicher – verhält sich bei rev wie die PocketBase-Regel. */
function fakeServer() {
  const server = { record: null, updates: 0, failNextUpdate: false };
  server.api = {
    async getSave() {
      return server.record && { ...server.record, data: JSON.parse(JSON.stringify(server.record.data)) };
    },
    async createSave(_s, data) {
      server.record = { id: 'save1', rev: 1, data };
      return server.record;
    },
    async updateSave(_s, id, data, rev) {
      server.updates++;
      if (server.failNextUpdate) {
        server.failNextUpdate = false;
        server.record = { ...server.record, rev: server.record.rev + 1, data: { ...server.record.data, xp: server.record.data.xp + 5 } };
      }
      if (!(rev > server.record.rev)) throw new SyncError('notfound', 404);
      server.record = { id, rev, data };
      return server.record;
    },
  };
  return server;
}

describe('Abgleich-Durchlauf', () => {
  const session = { token: 't', userId: 'u1' };

  it('legt beim ersten Mal den Spielstand auf dem Server an', async () => {
    const server = fakeServer();
    const local = toSyncable({ ...initialState(), xp: 40 });
    const { merged } = await syncOnce({ api: server.api, session, base: null, local });
    expect(server.record.data.xp).toBe(40);
    expect(merged.xp).toBe(40);
  });

  it('übernimmt auf einem neuen Gerät ohne Fortschritt einfach die Konto-Daten', async () => {
    const server = fakeServer();
    server.record = { id: 'save1', rev: 3, data: toSyncable({ ...withTasks(['a']), xp: 200 }) };
    const { merged } = await syncOnce({ api: server.api, session, base: null, local: toSyncable(initialState()) });
    expect(merged.xp).toBe(200);
    expect(merged.tasks.map((t) => t.id)).toEqual(['a']);
    expect(server.updates).toBe(0);
  });

  it('fragt nach, wenn beide Seiten schon Fortschritt haben', async () => {
    const server = fakeServer();
    server.record = { id: 'save1', rev: 3, data: toSyncable({ ...withTasks(['a']), xp: 200 }) };
    const local = toSyncable({ ...withTasks(['b']), xp: 30 });
    expect(await syncOnce({ api: server.api, session, base: null, local })).toEqual({ needsChoice: true });

    const merged = (await syncOnce({ api: server.api, session, base: null, local, choice: 'merge' })).merged;
    expect(merged.xp).toBe(230);
    expect(merged.tasks.map((t) => t.id).sort()).toEqual(['a', 'b']);
    expect(server.record.rev).toBe(4);
  });

  it('versucht es erneut, wenn ein anderes Gerät gleichzeitig gespeichert hat', async () => {
    const server = fakeServer();
    const base = toSyncable({ ...initialState(), xp: 100 });
    server.record = { id: 'save1', rev: 1, data: base };
    server.failNextUpdate = true; // anderes Gerät speichert +5 XP genau dazwischen
    const { merged } = await syncOnce({ api: server.api, session, base, local: { ...base, xp: 110 } });
    expect(merged.xp).toBe(115);
    expect(server.record.data.xp).toBe(115);
    expect(server.updates).toBe(2);
  });

  it('bringt zwei Geräte zuverlässig auf denselben Stand', async () => {
    const server = fakeServer();
    let phone = initialState();
    let laptop = initialState();
    let phoneBase = null;
    let laptopBase = null;

    const sync = async (state, base) => {
      const { merged } = await syncOnce({ api: server.api, session, base, local: toSyncable(state) });
      return [applySyncable(state, merged), merged];
    };

    [phone, phoneBase] = await sync(phone, phoneBase);
    [laptop, laptopBase] = await sync(laptop, laptopBase);

    phone = completeTask(phone, 'starter-1').state; // Handy: Aufgabe abhaken
    laptop = removeTask(completeTask(laptop, 'starter-2').state, 'starter-3'); // Laptop: andere abhaken, eine löschen

    [phone, phoneBase] = await sync(phone, phoneBase);
    [laptop, laptopBase] = await sync(laptop, laptopBase);
    [phone, phoneBase] = await sync(phone, phoneBase);

    expect(phone.xp).toBe(20);
    expect(laptop.xp).toBe(20);
    expect(phone.tasks.map((t) => t.id)).toEqual(laptop.tasks.map((t) => t.id));
    expect(phone.tasks.find((t) => t.id === 'starter-3')).toBe(undefined);
    expect(phone.tasks.filter((t) => t.done).map((t) => t.id).sort()).toEqual(['starter-1', 'starter-2']);
  });
});

describe('Fehlermeldungen bei der Anmeldung', () => {
  const err = (data, status = 400) => new SyncError('invalid', status, { data });
  it('ordnet Server-Fehler verständlichen Texten zu', () => {
    expect(authErrorKey(err({ invite: { code: 'invalid_invite' } }), 'register')).toBe('invite');
    expect(authErrorKey(err({ email: { code: 'validation_not_unique' } }), 'register')).toBe('emailTaken');
    expect(authErrorKey(err({ email: { code: 'validation_is_email' } }), 'register')).toBe('emailInvalid');
    expect(authErrorKey(err({ password: { code: 'validation_length_out_of_range' } }), 'register')).toBe('password');
    expect(authErrorKey(err({}), 'login')).toBe('login');
    expect(authErrorKey(new SyncError('network'), 'login')).toBe('network');
  });
});

describe('Erstes Zusammenführen', () => {
  it('holt im Konto gelöschte Starter-Aufgaben nicht zurück', async () => {
    const account = toSyncable(removeTask(initialState(), 'starter-3'));
    const device = toSyncable({ ...initialState(), tasks: [...initialState().tasks, task('eigene')], xp: 10 });
    const merged = merge3(firstSyncBase(device), device, account);
    expect(merged.tasks.some((t) => t.id === 'starter-3')).toBe(false);
    expect(merged.tasks.some((t) => t.id === 'eigene')).toBe(true);
  });
});

describe('Startwerte', () => {
  it('leerer Ausgangsstand hat keine Aufgaben', () => {
    expect(emptySyncable().tasks).toEqual([]);
  });
});
