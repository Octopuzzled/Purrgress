import { describe, expect, it } from 'vitest';
import { dailyGoalFor, energyAsked, normalizeEnergy, setEnergy, todayEnergy } from '../src/lib/energy.js';
import { initialState, migrate, normalizeTask } from '../src/lib/state.js';
import { completeTask, pickTask } from '../src/lib/tasks.js';
import { merge3 } from '../src/sync/merge.js';
import { toSyncable } from '../src/sync/syncable.js';

const TODAY = '2026-10-28';
const task = (id, difficulty) => normalizeTask({ id, title: id, difficulty });

function counts(pool, energy) {
  const original = Math.random;
  let seed = 7;
  Math.random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const out = Object.fromEntries(pool.map((t) => [t.id, 0]));
  for (let i = 0; i < 600; i++) out[pickTask(pool, null, { today: TODAY, energy }).id]++;
  Math.random = original;
  return out;
}

describe('Tagesform', () => {
  it('gilt nur für den Tag, an dem sie gewählt wurde', () => {
    const s = setEnergy(initialState(), 'wenig', TODAY);
    expect(todayEnergy(s, TODAY)).toBe('wenig');
    expect(todayEnergy(s, '2026-10-29')).toBeNull();
    expect(energyAsked(setEnergy(initialState(), null, TODAY), TODAY)).toBe(true);
    expect(setEnergy(s, undefined, TODAY).energy).toBeNull();
  });

  it('halbiert bei wenig Kraft das Tagesziel (aufgerundet, mindestens 1)', () => {
    const base = { ...initialState(), settings: { ...initialState().settings, dailyGoal: 3 } };
    expect(dailyGoalFor(base, TODAY)).toBe(3);
    expect(dailyGoalFor(setEnergy(base, 'wenig', TODAY), TODAY)).toBe(2);
    expect(dailyGoalFor(setEnergy(base, 'viel', TODAY), TODAY)).toBe(3);
    const one = { ...base, settings: { ...base.settings, dailyGoal: 1 } };
    expect(dailyGoalFor(setEnergy(one, 'wenig', TODAY), TODAY)).toBe(1);
  });

  it('gibt den Tagesziel-Bonus bei wenig Kraft schon früher', () => {
    let s = setEnergy({ ...initialState(), tasks: [task('a', 'leicht'), task('b', 'leicht')] }, 'wenig');
    s = completeTask(s, 'a').state;
    expect(completeTask(s, 'b').reward.goalBonus).toBeGreaterThan(0);
  });

  it('schlägt bei wenig Kraft nur Leichtes vor – und bei viel Kraft eher Großes', () => {
    const pool = [task('leicht', 'leicht'), task('mittel', 'mittel'), task('schwer', 'schwer')];
    const low = counts(pool, 'wenig');
    expect(low.mittel + low.schwer).toBe(0);
    const high = counts(pool, 'viel');
    expect(high.schwer > high.leicht * 2).toBe(true);
  });

  it('schlägt bei wenig Kraft trotzdem etwas vor, wenn nichts Leichtes offen ist', () => {
    expect(pickTask([task('schwer', 'schwer')], null, { today: TODAY, energy: 'wenig' }).id).toBe('schwer');
  });

  it('übersteht Laden und Abgleich', () => {
    expect(normalizeEnergy({ day: TODAY, level: 'quatsch' })).toEqual({ day: TODAY, level: null });
    expect(migrate({ energy: 'kaputt' }).energy).toBeNull();
    const base = toSyncable(initialState());
    const local = toSyncable(setEnergy(initialState(), 'viel', TODAY));
    expect(merge3(base, local, base).energy).toEqual({ day: TODAY, level: 'viel' });
  });
});
