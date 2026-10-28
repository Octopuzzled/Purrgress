/**
 * Ruhetage und Kuscheldecken: Die Serie (Tage in Folge mit Häkchen) soll Halt geben, nicht Druck machen.
 * - Ruhetag: bewusst frei – unterbricht die Serie nicht. Kostenlos und unbegrenzt.
 * - Kuscheldecke: schützt automatisch einen vergessenen Tag. Kostet Münzen, höchstens MAX_SHIELDS auf Vorrat.
 */
import { addDays, dayKey, isDayKey } from './date.js';

export const SHIELD_PRICE = 60;
export const MAX_SHIELDS = 2;

export function isRestDay(state, day = dayKey()) {
  return (state.restDays || []).includes(day);
}

export function setRestDay(state, on, day = dayKey()) {
  const rest = (state.restDays || []).filter((d) => d !== day);
  return { ...state, restDays: on ? [...rest, day] : rest };
}

/** Tage in Folge mit mindestens einem Häkchen. Ruhetage zählen nicht mit, unterbrechen aber auch nicht. */
export function streakFrom(history, restDays = [], today = dayKey()) {
  const rest = new Set(restDays);
  const done = (d) => (history[d] || 0) > 0;
  let count = 0;
  let d = today;
  if (!done(d) && !rest.has(d)) d = addDays(d, -1); // heute ist noch Zeit
  while (done(d) || rest.has(d)) {
    if (done(d)) count += 1;
    d = addDays(d, -1);
  }
  return count;
}

/**
 * Legt Kuscheldecken über verpasste Tage seit gestern – aber nur, wenn das für die
 * ganze Lücke reicht und davor wirklich eine Serie lief. Sonst bleibt alles, wie es ist.
 */
export function protectStreak(state, today = dayKey()) {
  const shields = state.shields || 0;
  if (shields === 0) return state;
  const rest = new Set(state.restDays || []);
  const covered = (d) => (state.history[d] || 0) > 0 || rest.has(d);
  const gap = [];
  let d = addDays(today, -1);
  while (!covered(d) && gap.length <= shields) {
    gap.push(d);
    d = addDays(d, -1);
  }
  if (gap.length === 0 || gap.length > shields) return state;
  if (streakFrom(state.history, state.restDays, d) === 0) return state;
  return { ...state, restDays: [...(state.restDays || []), ...gap], shields: shields - gap.length, shieldUsedOn: gap[0] };
}

export function buyShield(state) {
  if ((state.shields || 0) >= MAX_SHIELDS || state.coins < SHIELD_PRICE) return state;
  return { ...state, coins: state.coins - SHIELD_PRICE, shields: (state.shields || 0) + 1 };
}

export function normalizeRest(p) {
  return {
    restDays: Array.isArray(p.restDays) ? [...new Set(p.restDays.filter(isDayKey))].sort() : [],
    shields: Math.min(MAX_SHIELDS, Math.max(0, Math.floor(Number(p.shields) || 0))),
    shieldUsedOn: isDayKey(p.shieldUsedOn) ? p.shieldUsedOn : null,
  };
}
