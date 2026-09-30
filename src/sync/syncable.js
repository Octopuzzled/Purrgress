/**
 * Welcher Teil des Spielstands wird zwischen Geräten abgeglichen?
 *
 * Abgeglichen: Fortschritt, Aufgaben, eigene Vorlagen, Held, Umkleide, Tagesziel.
 * Pro Gerät: laufende Zeitbox und Einstellungen wie Sprache, Farbschema oder Töne.
 */
import { FREE_ITEMS } from '../constants/shop.js';
import { initialState, migrate } from '../lib/state.js';

export const SYNC_FORMAT = 1;

export function toSyncable(state) {
  return {
    v: SYNC_FORMAT,
    xp: state.xp,
    coins: state.coins,
    stats: state.stats,
    history: state.history,
    focusLog: state.focusLog || {},
    goalBonusDay: state.goalBonusDay || null,
    owned: state.owned,
    hero: { name: state.hero.name, equip: state.hero.equip },
    tasks: state.tasks,
    customTemplates: state.customTemplates || [],
    dailyGoal: state.settings.dailyGoal,
  };
}

export function applySyncable(state, s) {
  return {
    ...state,
    xp: s.xp,
    coins: s.coins,
    stats: s.stats,
    history: s.history,
    focusLog: s.focusLog,
    goalBonusDay: s.goalBonusDay,
    owned: s.owned,
    hero: { ...state.hero, name: s.hero.name, equip: s.hero.equip },
    tasks: s.tasks,
    customTemplates: s.customTemplates,
    settings: { ...state.settings, dailyGoal: s.dailyGoal },
  };
}

/** Bringt Daten vom Server in eine saubere Form (fehlende Felder, alte Formate, Unsinn). */
export function normalizeSyncable(data) {
  const d = data && typeof data === 'object' ? data : {};
  const state = migrate({
    ...d,
    tasks: Array.isArray(d.tasks) ? d.tasks : [],
    settings: { dailyGoal: d.dailyGoal },
  });
  return toSyncable(state);
}

/** Ausgangspunkt für den ersten Abgleich: ein leerer Spielstand ohne Aufgaben. */
export function emptySyncable() {
  return toSyncable({ ...initialState(), tasks: [], customTemplates: [] });
}

const isUntouchedStarter = (t) => String(t.id).startsWith('starter-') && !t.done && !t.steps.some((s) => s.done);

/**
 * Ausgangspunkt beim ersten Zusammenführen eines Geräts mit dem Konto.
 * Unberührte Starter-Aufgaben zählen als „schon bekannt“ – so kommen im Konto
 * gelöschte Starter-Aufgaben nicht zurück.
 */
export function firstSyncBase(local) {
  return { ...emptySyncable(), tasks: local.tasks.filter(isUntouchedStarter) };
}

/** Hat dieses Gerät schon echten Fortschritt, der beim ersten Anmelden nicht verloren gehen sollte? */
export function hasProgress(s) {
  return (
    s.xp > 0 ||
    s.customTemplates.length > 0 ||
    s.owned.length > FREE_ITEMS.length ||
    s.tasks.some((t) => !String(t.id).startsWith('starter-')) ||
    Object.values(s.history).some((n) => n > 0)
  );
}
