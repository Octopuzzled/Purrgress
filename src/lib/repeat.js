/**
 * Wiederkehrende Aufgaben: täglich oder an festen Wochentagen.
 * Wochentage wie bei Date#getDay: 0 = Sonntag … 6 = Samstag.
 */
import { addDays, dayKey, parseDayKey } from './date.js';

export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
/** Anzeige-Reihenfolge: Woche beginnt am Montag. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** Bringt repeat/repeatDays in eine saubere Form. Alle sieben Tage = täglich, keiner = einmalig. */
export function normalizeRepeat(t) {
  if (t.repeat === 'daily') return { repeat: 'daily', repeatDays: [] };
  if (t.repeat !== 'weekly') return { repeat: 'none', repeatDays: [] };
  const days = Array.isArray(t.repeatDays)
    ? [...new Set(t.repeatDays.map(Number).filter((d) => ALL_DAYS.includes(d)))].sort()
    : [];
  if (days.length === 0) return { repeat: 'none', repeatDays: [] };
  if (days.length === 7) return { repeat: 'daily', repeatDays: [] };
  return { repeat: 'weekly', repeatDays: days };
}

function daysOf(task) {
  return task.repeat === 'daily' ? ALL_DAYS : task.repeat === 'weekly' ? task.repeatDays : [];
}

export function isOccurrence(task, key) {
  return daysOf(task).includes(parseDayKey(key).getDay());
}

/** Erster Termin am oder nach `from`. */
export function nextOccurrence(task, from = dayKey()) {
  for (let i = 0; i < 7; i++) {
    const key = addDays(from, i);
    if (isOccurrence(task, key)) return key;
  }
  return from;
}

/** Letzter Termin am oder vor `upTo`. */
export function latestOccurrence(task, upTo = dayKey()) {
  for (let i = 0; i < 7; i++) {
    const key = addDays(upTo, -i);
    if (isOccurrence(task, key)) return key;
  }
  return upTo;
}
