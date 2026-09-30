/**
 * Tageszeiten für Aufgaben (wie bei Finch: Start in den Tag, Jederzeit, Tagesausklang).
 * Texte stehen in src/i18n/locales (daypart.*).
 */
export const DAYPARTS = [
  { id: 'morgens', icon: 'sun', tone: 'text-amber-500' },
  { id: 'jederzeit', icon: 'clock', tone: 'text-sky-500' },
  { id: 'abends', icon: 'moon', tone: 'text-violet-500' },
];

export const DAYPART_IDS = DAYPARTS.map((d) => d.id);
export const DEFAULT_DAYPART = 'jederzeit';

/** Ab wann „morgens“ endet und „abends“ beginnt (volle Stunden, Ortszeit). */
export const MORNING_UNTIL = 12;
export const EVENING_FROM = 17;
