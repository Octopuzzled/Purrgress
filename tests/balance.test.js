/**
 * Spielbalance für viele Aufgaben am Tag: Level-Kurve, Münzen ab der siebten Aufgabe,
 * Überraschungen pro Tag und das Aufräumen alter erledigter Aufgaben.
 */
import { describe, expect, it } from 'vitest';
import { DIFF, FULL_COIN_TASKS } from '../src/constants/game.js';
import { dayKey } from '../src/lib/date.js';
import { CURVE_FROM, curveBonus, levelInfo, totalXp, xpForLevel } from '../src/lib/progress.js';
import { initialState, migrate, normalizeTask } from '../src/lib/state.js';
import { MAX_SURPRISES_PER_DAY, rollSurprise } from '../src/lib/surprise.js';
import { completeTask, pruneDoneTasks, reopenTask } from '../src/lib/tasks.js';
import { merge3 } from '../src/sync/merge.js';
import { toSyncable } from '../src/sync/syncable.js';

const linearLevel = (xp) => {
  let level = 1; let rest = xp; let need = 100;
  while (rest >= need) { rest -= need; level += 1; need = 80 + level * 20; }
  return { level, pct: rest / need };
};

describe('Level-Kurve', () => {
  it('bleibt bis Level 10 wie gehabt und wird danach steiler', () => {
    for (let l = 1; l <= CURVE_FROM; l++) expect(xpForLevel(l)).toBe(80 + l * 20);
    for (let l = CURVE_FROM + 1; l < 30; l++) expect(xpForLevel(l + 1) - xpForLevel(l)).toBeGreaterThan(20);
  });

  it('lässt beim Update niemanden ein Level zurückrutschen – auch der Balken bleibt', () => {
    for (const xp of [0, 500, 4000, 9000, 15000, 30000]) {
      const before = linearLevel(xp);
      const after = levelInfo(xp + curveBonus(xp));
      expect(after.level).toBe(before.level);
      expect(after.pct).toBeCloseTo(before.pct, 1);
    }
    expect(curveBonus(500)).toBe(0); // unter Level 10 ändert sich nichts
  });

  it('berechnet den Ausgleich genau einmal und gleicht ihn ohne Doppelzählung ab', () => {
    const old = migrate({ xp: 9000 });
    expect(old.xpBonus).toBeGreaterThan(0);
    expect(migrate({ ...old, xp: 9500 }).xpBonus).toBe(old.xpBonus);
    expect(initialState().xpBonus).toBe(0);
    const base = toSyncable({ ...initialState(), xp: 9000, xpBonus: 0 });
    const local = toSyncable({ ...old, xp: 9010 });
    const remote = toSyncable({ ...old, xp: 9020 });
    const m = merge3(base, local, remote);
    expect(m.xpBonus).toBe(old.xpBonus);
    expect(m.xp).toBe(9030);
    expect(totalXp(m)).toBe(9030 + old.xpBonus);
  });
});

describe('Münzen bei vielen Aufgaben', () => {
  const many = (n) => ({ ...initialState(), coins: 0, tasks: Array.from({ length: n }, (_, i) => normalizeTask({ id: `t${i}`, title: `T${i}`, difficulty: 'mittel' })) });
  const doAll = (s, n) => {
    const rewards = [];
    for (let i = 0; i < n; i++) { const r = completeTask(s, `t${i}`); s = r.state; rewards.push(r.reward); }
    return { s, rewards };
  };

  it('gibt bis zur sechsten Aufgabe volle Münzen, danach die Hälfte – unabhängig vom Tagesziel', () => {
    for (const goal of [1, 3, 10]) {
      const start = { ...many(8), settings: { ...initialState().settings, dailyGoal: goal } };
      const { rewards } = doAll(start, 8);
      expect(rewards.slice(0, FULL_COIN_TASKS).every((r) => r.coins === DIFF.mittel.coins)).toBe(true);
      expect(rewards[6].coins).toBe(Math.ceil(DIFF.mittel.coins / 2));
      expect(rewards.filter((r) => r.slowed)).toHaveLength(1);
      expect(rewards[6].slowed).toBe(true);
    }
  });

  it('nimmt beim Rückgängigmachen genau die halbierten Münzen zurück', () => {
    const { s } = doAll(many(7), 7);
    const back = reopenTask(s, 't6');
    expect(s.coins - back.coins).toBe(Math.ceil(DIFF.mittel.coins / 2));
  });
});

describe('Überraschungen pro Tag', () => {
  it('kommen höchstens zweimal am Tag', () => {
    const today = dayKey();
    const done = (id) => normalizeTask({ id, title: id, done: true, doneDay: today, awarded: { xp: 10, coins: 5, pts: 1, surprised: true } });
    const two = { ...initialState(), tasks: [done('a'), done('b')] };
    expect(MAX_SURPRISES_PER_DAY).toBe(2);
    expect(rollSurprise(two, () => 0)).toBeNull();
    const one = { ...initialState(), tasks: [done('a')] };
    expect(rollSurprise(one, () => 0.04)).not.toBeNull(); // unter 1/20
    expect(rollSurprise(one, () => 0.06)).toBeNull();
  });

  it('bleiben bei zwölf Aufgaben am Tag selten genug', () => {
    let seed = 5;
    const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    let total = 0;
    for (let day = 0; day < 300; day++) {
      let s = { ...initialState(), tasks: Array.from({ length: 12 }, (_, i) => normalizeTask({ id: `t${i}`, title: `T${i}` })) };
      for (let i = 0; i < 12; i++) {
        const surprise = rollSurprise(s, rng);
        if (surprise) total++;
        s = completeTask(s, `t${i}`, Date.now(), surprise).state;
      }
    }
    expect(total / 300).toBeLessThan(1.4);
    expect(total / 300).toBeGreaterThan(0.8);
  });
});

describe('Aufräumen erledigter Aufgaben', () => {
  it('entfernt nur einmalige Aufgaben, die länger als 14 Tage erledigt sind', () => {
    const t = (id, extra) => normalizeTask({ id, title: id, ...extra });
    const s = { ...initialState(), xp: 500, tasks: [
      t('alt', { done: true, doneDay: '2026-10-01' }),
      t('frisch', { done: true, doneDay: '2026-10-20' }),
      t('taeglich', { done: true, doneDay: '2026-10-01', repeat: 'daily' }),
      t('offen', { due: '2026-09-01' }),
    ] };
    const next = pruneDoneTasks(s, '2026-10-29');
    expect(next.tasks.map((x) => x.id)).toEqual(['frisch', 'taeglich', 'offen']);
    expect(next.xp).toBe(500);
    expect(pruneDoneTasks(next, '2026-10-29')).toBe(next);
  });
});
