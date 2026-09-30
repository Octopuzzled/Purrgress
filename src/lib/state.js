/**
 * Spielstand: Anfangszustand, Normalisierung, Migration älterer Versionen
 * und Speichern in localStorage.
 */
import { CATS, DIFF, STORAGE_KEY } from '../constants/game.js';
import { DEFAULT_EQUIP, FREE_ITEMS } from '../constants/shop.js';
import { DAYPART_IDS, DEFAULT_DAYPART } from '../constants/dayparts.js';
import { DICTIONARIES, resolveLanguage } from '../i18n/index.js';
import { uid } from './id.js';
import { prefersReducedMotion } from './media.js';
import { normalizeCustomTemplate } from './templates.js';

export function normalizeTask(t) {
  return {
    id: t.id || uid(),
    title: String(t.title || 'Ohne Titel'),
    desc: String(t.desc || ''),
    category: CATS[t.category] ? t.category : 'routine',
    difficulty: DIFF[t.difficulty] ? t.difficulty : 'leicht',
    done: !!t.done,
    doneDay: t.doneDay || null,
    awarded: t.awarded || null,
    repeat: t.repeat === 'daily' ? 'daily' : 'none',
    steps: Array.isArray(t.steps)
      ? t.steps.map((s) => (typeof s === 'string'
        ? { id: uid(), text: s, done: false, xp: 0, coins: 0 }
        : { id: s.id || uid(), text: String(s.text || ''), done: !!s.done, xp: s.xp || 0, coins: s.coins || 0 }))
      : [],
    minutes: Number(t.minutes) > 0 ? Math.min(240, Math.round(Number(t.minutes))) : null,
    when: DAYPART_IDS.includes(t.when) ? t.when : DEFAULT_DAYPART,
    templateId: t.templateId || null,
    createdAt: t.createdAt || Date.now(),
  };
}

/** Erste Aufgaben für neue Nutzer:innen, in der Sprache des Geräts. */
export function starterTasks(lang = resolveLanguage('system')) {
  const text = (DICTIONARIES[lang] || DICTIONARIES.de).starter;
  const now = Date.now();
  return [
    normalizeTask({ id: 'starter-1', ...text[0], category: 'pflege', difficulty: 'leicht', createdAt: now }),
    normalizeTask({ id: 'starter-2', ...text[1], category: 'pflege', difficulty: 'leicht', repeat: 'daily', templateId: 't-wasser', createdAt: now - 1 }),
    normalizeTask({ id: 'starter-3', ...text[2], category: 'fokus', difficulty: 'leicht', minutes: 5, createdAt: now - 2 }),
    normalizeTask({ id: 'starter-4', ...text[3], category: 'sozial', difficulty: 'leicht', createdAt: now - 3 }),
  ];
}

/** Anfangszustand. language: 'system' | 'de' | 'en' – bestimmt auch die Sprache der Starter-Aufgaben. */
export function initialState(language = 'system') {
  return {
    version: 1,
    hero: { name: 'Mochi', equip: { ...DEFAULT_EQUIP } },
    xp: 0,
    coins: 50,
    owned: [...FREE_ITEMS],
    stats: { routine: 0, fokus: 0, pflege: 0, sozial: 0 },
    tasks: starterTasks(resolveLanguage(language)),
    customTemplates: [],
    history: {},
    goalBonusDay: null,
    focusLog: {},
    timer: null,
    settings: { language, theme: 'system', sound: true, reduceMotion: prefersReducedMotion(), dailyGoal: 3, chimeEvery: 0 },
    createdAt: Date.now(),
  };
}

export function validTimer(t, tasks) {
  if (!t || typeof t !== 'object' || !t.taskId || !(Number(t.plannedMs) > 0)) return null;
  if (!Array.isArray(tasks) || !tasks.some((x) => x && x.id === t.taskId && !x.done)) return null;
  if (t.running ? !Number.isFinite(t.endAt) : !Number.isFinite(t.remainingMs)) return null;
  return t;
}

export function migrate(p) {
  const base = initialState();
  const hero = p.hero || {};
  return {
    ...base,
    ...p,
    hero: { ...base.hero, ...hero, equip: { ...DEFAULT_EQUIP, ...(hero.equip || {}) } },
    xp: Number(p.xp) || 0,
    coins: Number(p.coins) || 0,
    owned: Array.from(new Set([...base.owned, ...(Array.isArray(p.owned) ? p.owned : [])])),
    stats: { ...base.stats, ...(p.stats || {}) },
    tasks: Array.isArray(p.tasks) ? p.tasks.map(normalizeTask) : base.tasks,
    history: p.history && typeof p.history === 'object' ? p.history : {},
    focusLog: p.focusLog && typeof p.focusLog === 'object' ? p.focusLog : {},
    goalBonusDay: typeof p.goalBonusDay === 'string' ? p.goalBonusDay : null,
    customTemplates: Array.isArray(p.customTemplates)
      ? p.customTemplates.map(normalizeCustomTemplate).filter((t) => t.title)
      : [],
    timer: validTimer(p.timer, p.tasks),
    settings: { ...base.settings, ...(p.settings || {}) },
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch { /* Speicher nicht verfügbar oder beschädigt: frisch starten */ }
  return initialState();
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* z. B. privater Modus oder voller Speicher: App läuft ohne Speichern weiter */
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignorieren */
  }
}
