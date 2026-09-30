import { describe, expect, it } from 'vitest';
import { initialState, migrate, normalizeTask } from '../src/lib/state.js';

describe('Spielstand', () => {
  it('ergänzt fehlende Felder aus älteren Versionen', () => {
    const old = { xp: 40, coins: 12, tasks: [{ id: 'a', title: 'Alt' }], settings: { theme: 'dark' } };
    const s = migrate(old);
    expect(s.xp).toBe(40);
    expect(s.focusLog).toEqual({});
    expect(s.timer).toBeNull();
    expect(s.settings.theme).toBe('dark');
    expect(s.settings.chimeEvery).toBe(0);
    expect(s.settings.language).toBe('system');
  });

  it('verwirft eine Zeitbox, deren Aufgabe es nicht mehr gibt', () => {
    const s = migrate({ ...initialState(), timer: { taskId: 'weg', plannedMs: 60000, running: true, endAt: 1 } });
    expect(s.timer).toBeNull();
  });

  it('begrenzt Zeitboxen auf sinnvolle Werte', () => {
    expect(normalizeTask({ title: 'x', minutes: 999 }).minutes).toBe(240);
    expect(normalizeTask({ title: 'x', minutes: 0 }).minutes).toBeNull();
    expect(normalizeTask({ title: 'x', minutes: '25' }).minutes).toBe(25);
  });
});
