import { DAYPARTS, DEFAULT_DAYPART, EVENING_FROM, MORNING_UNTIL } from '../constants/dayparts.js';

/** Welche Tageszeit ist gerade? */
export function currentDaypart(date = new Date()) {
  const hour = date.getHours();
  if (hour < MORNING_UNTIL) return 'morgens';
  if (hour >= EVENING_FROM) return 'abends';
  return DEFAULT_DAYPART;
}

/** Abschnitte lohnen sich erst, wenn mindestens eine offene Aufgabe eine feste Tageszeit hat. */
export function usesDayparts(tasks) {
  return tasks.some((t) => !t.done && t.when && t.when !== DEFAULT_DAYPART);
}

/** Teilt Aufgaben in Abschnitte auf – Reihenfolge innerhalb bleibt erhalten, leere fallen weg. */
export function groupByDaypart(tasks) {
  return DAYPARTS.map((d) => ({
    ...d,
    tasks: tasks.filter((t) => (t.when || DEFAULT_DAYPART) === d.id),
  })).filter((g) => g.tasks.length > 0);
}
