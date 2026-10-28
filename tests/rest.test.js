import { describe, expect, it } from 'vitest';
import { initialState, migrate } from '../src/lib/state.js';
import { buyShield, MAX_SHIELDS, protectStreak, SHIELD_PRICE, setRestDay, streakFrom } from '../src/lib/rest.js';
import { merge3 } from '../src/sync/merge.js';
import { toSyncable } from '../src/sync/syncable.js';

const TODAY = '2026-10-28';
const days = (...list) => Object.fromEntries(list.map((d) => [d, 1]));

describe('Serie', () => {
  it('zählt Tage in Folge – heute darf noch leer sein', () => {
    expect(streakFrom(days('2026-10-26', '2026-10-27'), [], TODAY)).toBe(2);
    expect(streakFrom(days('2026-10-26', '2026-10-27', TODAY), [], TODAY)).toBe(3);
    expect(streakFrom(days('2026-10-25', '2026-10-27'), [], TODAY)).toBe(1);
  });

  it('lässt sich von Ruhetagen nicht unterbrechen – sie zählen aber nicht mit', () => {
    expect(streakFrom(days('2026-10-25', '2026-10-27'), ['2026-10-26'], TODAY)).toBe(2);
    expect(streakFrom(days('2026-10-26'), [TODAY, '2026-10-27'], TODAY)).toBe(1);
  });
});

describe('Ruhetag', () => {
  it('lässt sich setzen und wieder entfernen', () => {
    const s = setRestDay(initialState(), true, TODAY);
    expect(s.restDays).toEqual([TODAY]);
    expect(setRestDay(s, false, TODAY).restDays).toEqual([]);
    expect(setRestDay(s, true, TODAY).restDays).toEqual([TODAY]);
  });
});

describe('Kuscheldecke', () => {
  const withStreak = (extra) => ({ ...initialState(), history: days('2026-10-24', '2026-10-25'), ...extra });

  it('kostet Münzen und hat einen begrenzten Vorrat', () => {
    const s = buyShield({ ...initialState(), coins: SHIELD_PRICE * 5 });
    expect(s.shields).toBe(1);
    expect(s.coins).toBe(SHIELD_PRICE * 4);
    const full = { ...s, shields: MAX_SHIELDS };
    expect(buyShield(full)).toBe(full);
    const poor = { ...initialState(), coins: SHIELD_PRICE - 1 };
    expect(buyShield(poor)).toBe(poor);
  });

  it('schützt verpasste Tage, wenn der Vorrat für die ganze Lücke reicht', () => {
    const s = protectStreak(withStreak({ shields: 2 }), TODAY);
    expect(s.restDays.sort()).toEqual(['2026-10-26', '2026-10-27']);
    expect(s.shields).toBe(0);
    expect(s.shieldUsedOn).toBe('2026-10-27');
    expect(streakFrom(s.history, s.restDays, TODAY)).toBe(2);
    expect(protectStreak(s, TODAY)).toBe(s);
  });

  it('wird nicht verschwendet, wenn die Lücke zu groß ist oder keine Serie lief', () => {
    const tooBig = withStreak({ shields: 1 });
    expect(protectStreak(tooBig, TODAY)).toBe(tooBig);
    const noStreak = { ...initialState(), shields: 2 };
    expect(protectStreak(noStreak, TODAY)).toBe(noStreak);
    const yesterdayDone = { ...withStreak({ shields: 1 }), history: days('2026-10-27') };
    expect(protectStreak(yesterdayDone, TODAY)).toBe(yesterdayDone);
  });

  it('übersteht Laden und Abgleich', () => {
    expect(migrate({ restDays: ['quatsch', TODAY], shields: 99 })).toMatchObject({ restDays: [TODAY], shields: MAX_SHIELDS });
    const base = toSyncable({ ...initialState(), shields: 1 });
    const local = toSyncable({ ...initialState(), shields: 0, restDays: ['2026-10-27'] }); // hier verbraucht
    const remote = toSyncable({ ...initialState(), shields: 2 }); // dort eine gekauft
    const m = merge3(base, local, remote);
    expect(m.shields).toBe(1);
    expect(m.restDays).toEqual(['2026-10-27']);
  });
});
