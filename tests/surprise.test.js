import { describe, expect, it } from 'vitest';
import { DIFF } from '../src/constants/game.js';
import { DEFAULT_EQUIP } from '../src/constants/shop.js';
import { DICTIONARIES, LANGUAGES } from '../src/i18n/index.js';
import { initialState, normalizeTask } from '../src/lib/state.js';
import { giftCandidates, MAX_GIFT_PRICE, PHRASE_COUNT, rollSurprise, SURPRISE_CHANCE } from '../src/lib/surprise.js';
import { completeTask, reopenTask } from '../src/lib/tasks.js';

const start = () => ({ ...initialState(), coins: 0, tasks: [normalizeTask({ id: 'a', title: 'A', difficulty: 'leicht' })] });
/** Liefert die angegebenen Zufallszahlen der Reihe nach. */
const seq = (...values) => { let i = 0; return () => values[i++ % values.length]; };

describe('Überraschungen', () => {
  it('kommen nur manchmal', () => {
    expect(rollSurprise(start(), seq(SURPRISE_CHANCE + 0.01))).toBeNull();
    let seed = 3;
    const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    let hits = 0;
    for (let i = 0; i < 2000; i++) if (rollSurprise(start(), rng)) hits++;
    expect(hits / 2000).toBeGreaterThan(0.08);
    expect(hits / 2000).toBeLessThan(0.22);
  });

  it('würfeln Münzen, Sätze oder ein Geschenk', () => {
    expect(rollSurprise(start(), seq(0, 0.9, 0.5))).toEqual({ kind: 'coins', coins: 7 });
    expect(rollSurprise(start(), seq(0, 0.2, 0.99)).kind).toBe('phrase');
    expect(rollSurprise(start(), seq(0, 0.05, 0)).kind).toBe('gift');
  });

  it('verschenken nur kleine Teile, die noch fehlen – sonst gibt es Münzen', () => {
    expect(giftCandidates(start()).every((g) => !start().owned.includes(g.id))).toBe(true);
    expect(giftCandidates(start()).length).toBeGreaterThan(0);
    const all = { ...start(), owned: [...start().owned, ...giftCandidates(start()).map((g) => g.id)] };
    expect(giftCandidates(all)).toEqual([]);
    expect(rollSurprise(all, seq(0, 0.05, 0.5)).kind).toBe('coins');
    expect(MAX_GIFT_PRICE).toBeLessThanOrEqual(60);
  });

  it('geben Fundmünzen dazu und nehmen sie beim Rückgängigmachen wieder weg', () => {
    const { state, reward } = completeTask(start(), 'a', Date.now(), { kind: 'coins', coins: 5 });
    expect(state.coins).toBe(DIFF.leicht.coins + 5);
    expect(reward.surprise).toEqual({ kind: 'coins', coins: 5 });
    expect(reopenTask(state, 'a').coins).toBe(0);
  });

  it('nehmen ein Geschenk beim Rückgängigmachen zurück, auch wenn es angezogen war', () => {
    const gift = { kind: 'gift', slot: 'kopf', id: 'kopf-muetze' };
    const { state } = completeTask(start(), 'a', Date.now(), gift);
    expect(state.owned).toContain('kopf-muetze');
    const worn = { ...state, hero: { ...state.hero, equip: { ...state.hero.equip, kopf: 'kopf-muetze' } } };
    const back = reopenTask(worn, 'a');
    expect(back.owned).not.toContain('kopf-muetze');
    expect(back.hero.equip.kopf).toBe(DEFAULT_EQUIP.kopf);
  });

  it('schenken nichts doppelt', () => {
    const s = { ...start(), owned: [...start().owned, 'kopf-muetze'] };
    const { state, reward } = completeTask(s, 'a', Date.now(), { kind: 'gift', slot: 'kopf', id: 'kopf-muetze' });
    expect(reward.surprise).toBeNull();
    expect(reopenTask(state, 'a').owned).toContain('kopf-muetze');
  });

  it('haben in jeder Sprache gleich viele seltene Sätze', () => {
    for (const lang of LANGUAGES) expect(DICTIONARIES[lang].surprise.phrases).toHaveLength(PHRASE_COUNT);
  });
});
