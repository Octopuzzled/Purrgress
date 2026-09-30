/**
 * Spielregeln: Belohnungen je Schwierigkeit und Kategorien.
 * Anzeigetexte stehen in src/i18n/locales (difficulty.*, category.*).
 */
export const APP_NAME = 'Purrgress';

/**
 * Speicherschlüssel im Browser.
 * Nach dem ersten echten Einsatz nicht mehr ändern – sonst sind gespeicherte Spielstände nicht mehr auffindbar.
 * Für neue, inkompatible Formate stattdessen eine Migration in src/lib/state.js schreiben.
 */
export const STORAGE_KEY = 'purrgress-v1';

/**
 * Belohnung je Schwierigkeit. Münzen steigen bewusst flacher als XP,
 * damit es sich nicht lohnt, Aufgaben höher einzustufen, als sie sind.
 */
export const DIFF = {
  leicht: { xp: 10, coins: 5, pts: 1 },
  mittel: { xp: 25, coins: 12, pts: 2 },
  schwer: { xp: 50, coins: 25, pts: 3 },
};

export const DIFF_ORDER = ['leicht', 'mittel', 'schwer'];

export const STEP_XP = 2;

export const LEVEL_BONUS_COINS = 20;

/** Einmal pro Tag, sobald das eigene Tagesziel erreicht ist. */
export const DAILY_GOAL_BONUS = 10;

export const CATS = {
  routine: { icon: 'anchor',
    chip: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200', bar: 'bg-emerald-300' },
  fokus: { icon: 'target',
    chip: 'bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-200', bar: 'bg-violet-300' },
  pflege: { icon: 'leaf',
    chip: 'bg-orange-100 text-orange-800 dark:bg-orange-400/15 dark:text-orange-200', bar: 'bg-orange-300' },
  sozial: { icon: 'users',
    chip: 'bg-pink-100 text-pink-800 dark:bg-pink-400/15 dark:text-pink-200', bar: 'bg-pink-300' },
};

export const CAT_ORDER = ['routine', 'fokus', 'pflege', 'sozial'];
