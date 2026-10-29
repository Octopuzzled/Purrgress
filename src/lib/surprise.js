/**
 * Kleine Überraschungen beim Abhaken: Unvorhersehbare Belohnungen halten die Freude frisch.
 * Wird vor dem Abhaken einmal ausgewürfelt und dann an completeTask übergeben,
 * damit die Funktion rein bleibt (und zweimaliges Aufrufen dasselbe Ergebnis liefert).
 */
import { SHOP, SLOTS, isUnlocked } from '../constants/shop.js';
import { levelInfo, totalXp } from './progress.js';
import { dayKey } from './date.js';
import { surprisesToday } from './tasks.js';

/**
 * Überraschungen gibt es pro Tag, nicht pro Aufgabe: Die erste des Tages kommt recht leicht,
 * eine zweite selten, mehr nicht. So bleiben sie besonders – bei drei wie bei zwölf Aufgaben am Tag.
 */
export const SURPRISE_CHANCE = 1 / 6;
const SECOND_SURPRISE_CHANCE = 1 / 20;
export const MAX_SURPRISES_PER_DAY = 2;
/** So viele seltene Sätze gibt es in jeder Sprache (surprise.phrases). */
export const PHRASE_COUNT = 8;
/** Aus dem Laden werden nur kleine Teile verschenkt, die es ohne Level-Grenze gibt. */
export const MAX_GIFT_PRICE = 60;
/**
 * Anteile innerhalb der Überraschungen. Bei etwa drei Aufgaben am Tag heißt das ungefähr:
 * ein Geschenk alle zwei bis drei Wochen, ein Überraschungs-Teil etwa alle sechs Wochen,
 * ein seltenes alle drei bis vier Monate.
 */
const GIFT_SHARE = 0.15;
const EXCLUSIVE_SHARE = 0.5;
const RARE_SHARE = 0.3;

/** Was noch verschenkt werden kann: kleine Ladenteile und Überraschungs-Teile (häufiger und selten). */
export function giftPools(state) {
  const owned = new Set(state.owned);
  const level = levelInfo(totalXp(state)).level;
  const pools = { small: [], common: [], rare: [] };
  for (const slot of SLOTS) {
    for (const i of SHOP[slot].items) {
      if (owned.has(i.id)) continue;
      if (i.surprise) pools[i.surprise === 'rare' ? 'rare' : 'common'].push({ slot, id: i.id });
      else if (i.price > 0 && i.price <= MAX_GIFT_PRICE && isUnlocked(i, level)) pools.small.push({ slot, id: i.id });
    }
  }
  return pools;
}

export function giftCandidates(state) {
  const { small, common, rare } = giftPools(state);
  return [...small, ...common, ...rare];
}

function pickFrom(list, rng) {
  return list[Math.floor(rng() * list.length)];
}

/** Ein Geschenk auswählen – oder null, wenn es nichts mehr zu verschenken gibt. */
function pickGift(state, rng) {
  const { small, common, rare } = giftPools(state);
  if (common.length + rare.length > 0 && (small.length === 0 || rng() < EXCLUSIVE_SHARE)) {
    return pickFrom(rare.length > 0 && (common.length === 0 || rng() < RARE_SHARE) ? rare : common, rng);
  }
  return small.length > 0 ? pickFrom(small, rng) : null;
}

/** null oder { kind: 'coins', coins } | { kind: 'phrase', index } | { kind: 'gift', slot, id } */
export function rollSurprise(state, rng = Math.random, today = dayKey()) {
  const already = surprisesToday(state, today);
  const chance = already === 0 ? SURPRISE_CHANCE : already < MAX_SURPRISES_PER_DAY ? SECOND_SURPRISE_CHANCE : 0;
  if (rng() >= chance) return null;
  const r = rng();
  if (r < GIFT_SHARE) {
    const gift = pickGift(state, rng);
    if (gift) return { kind: 'gift', ...gift };
  }
  if (r < 0.4 && r >= GIFT_SHARE) return { kind: 'phrase', index: Math.floor(rng() * PHRASE_COUNT) };
  return { kind: 'coins', coins: 3 + Math.floor(rng() * 8) };
}
