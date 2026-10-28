/**
 * Fälligkeit von Aufgaben: Was ist heute dran, was überfällig, was kommt später?
 * Aufgaben ohne Datum gelten als „jederzeit“ und sind immer sichtbar.
 */
import { dayKey } from './date.js';

/** 'none' | 'overdue' | 'today' | 'future' */
export function dueStatus(task, today = dayKey()) {
  if (!task.due) return 'none';
  if (task.due < today) return 'overdue';
  return task.due === today ? 'today' : 'future';
}

/** Gehört die Aufgabe in die heutige Liste? (kein Datum, heute oder überfällig) */
export function isCurrent(task, today = dayKey()) {
  return dueStatus(task, today) !== 'future';
}

/** Ist sie heute fällig oder schon drüber? */
export function isDueToday(task, today = dayKey()) {
  return !!task.due && task.due <= today;
}

/**
 * Sortiert nach Datum: Überfälliges zuerst (das älteste oben), dann Heutiges, dann Späteres,
 * zuletzt Aufgaben ohne Datum. Bei gleichem Datum bleibt die bisherige Reihenfolge.
 */
export function sortByDue(tasks) {
  return tasks
    .map((t, i) => ({ t, i }))
    .sort((a, b) => {
      if (a.t.due !== b.t.due) {
        if (!a.t.due) return 1;
        if (!b.t.due) return -1;
        return a.t.due < b.t.due ? -1 : 1;
      }
      return a.i - b.i;
    })
    .map((x) => x.t);
}

/** Teilt künftige Aufgaben nach Tag auf – in Datumsreihenfolge. */
export function groupByDay(tasks) {
  const groups = new Map();
  for (const t of sortByDue(tasks)) {
    if (!groups.has(t.due)) groups.set(t.due, []);
    groups.get(t.due).push(t);
  }
  return [...groups].map(([day, list]) => ({ day, tasks: list }));
}
