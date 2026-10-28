/**
 * Kleine Überraschungen beim Abhaken: Unvorhersehbare Belohnungen halten die Freude frisch.
 * Wird vor dem Abhaken einmal ausgewürfelt und dann an completeTask übergeben,
 * damit die Funktion rein bleibt (und zweimaliges Aufrufen dasselbe Ergebnis liefert).
 */
import { SHOP, SLOTS, isUnlocked } from '../constants/shop.js';
import { levelInfo } from './progress.js';

export const SURPRISE_CHANCE = 1 / 7;
/** So viele seltene Sätze gibt es in jeder Sprache (surprise.phrases). */
export const PHRASE_COUNT = 8;
/** Geschenkt werden nur kleine Teile, die es ohne Level-Grenze gibt. */
export const MAX_GIFT_PRICE = 60;

export function giftCandidates(state) {
  const owned = new Set(state.owned);
  const level = levelInfo(state.xp).level;
  return SLOTS.flatMap((slot) => SHOP[slot].items
    .filter((i) => i.price > 0 && i.price <= MAX_GIFT_PRICE && !owned.has(i.id) && isUnlocked(i, level))
    .map((i) => ({ slot, id: i.id })));
}

/** null oder { kind: 'coins', coins } | { kind: 'phrase', index } | { kind: 'gift', slot, id } */
export function rollSurprise(state, rng = Math.random) {
  if (rng() >= SURPRISE_CHANCE) return null;
  const r = rng();
  if (r < 0.1) {
    const gifts = giftCandidates(state);
    if (gifts.length > 0) return { kind: 'gift', ...gifts[Math.floor(rng() * gifts.length)] };
  }
  if (r < 0.4 && r >= 0.1) return { kind: 'phrase', index: Math.floor(rng() * PHRASE_COUNT) };
  return { kind: 'coins', coins: 3 + Math.floor(rng() * 8) };
}
