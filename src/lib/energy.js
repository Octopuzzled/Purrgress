/**
 * Tagesform: Wie viel Kraft ist heute da? Die Antwort gilt nur für den Tag,
 * an dem sie gegeben wurde, und passt Vorschläge und Tagesziel an.
 */
import { dayKey } from './date.js';

export const ENERGY_LEVELS = ['wenig', 'mittel', 'viel'];
export const ENERGY_ICONS = { wenig: 'batteryLow', mittel: 'batteryMid', viel: 'batteryFull' };

/** Gewichte für „Was jetzt?“ je Tagesform. Bei wenig Kraft nur Leichtes, bei viel eher Großes. */
const WEIGHTS = {
  wenig: { leicht: 1, mittel: 0, schwer: 0 },
  mittel: { leicht: 3, mittel: 2, schwer: 1 },
  viel: { leicht: 1, mittel: 2, schwer: 3 },
};

/** Gespeichert als { day, level }; level null heißt „übersprungen“. */
export function normalizeEnergy(e) {
  if (!e || typeof e !== 'object' || typeof e.day !== 'string') return null;
  return { day: e.day, level: ENERGY_LEVELS.includes(e.level) ? e.level : null };
}

/** Wurde heute schon gefragt (beantwortet oder übersprungen)? */
export function energyAsked(state, today = dayKey()) {
  return !!state.energy && state.energy.day === today;
}

/** Tagesform von heute – oder null, wenn unbekannt. */
export function todayEnergy(state, today = dayKey()) {
  return energyAsked(state, today) ? state.energy.level : null;
}

export function setEnergy(state, level, today = dayKey()) {
  return { ...state, energy: level === undefined ? null : { day: today, level } };
}

/** Tagesziel für heute: Bei wenig Kraft halbiert (aufgerundet), sonst wie eingestellt. */
export function dailyGoalFor(state, today = dayKey()) {
  const goal = state.settings?.dailyGoal || 3;
  return todayEnergy(state, today) === 'wenig' ? Math.max(1, Math.ceil(goal / 2)) : goal;
}

/** Gewicht einer Schwierigkeit für „Was jetzt?“. */
export function energyWeight(difficulty, level) {
  const w = WEIGHTS[level] || WEIGHTS.mittel;
  return w[difficulty] ?? 1;
}
