/**
 * Eigene Vorlagen: aus einer Aufgabe eine wiederverwendbare Vorlage machen.
 * Eigene Vorlagen werden nicht übersetzt – sie gehören der Person, die sie geschrieben hat.
 */
import { DAYPART_IDS, DEFAULT_DAYPART } from '../constants/dayparts.js';
import { CATS, DIFF } from '../constants/game.js';
import { uid } from './id.js';

export const CUSTOM_ID_PREFIX = 'c-';
export const MAX_CUSTOM_TEMPLATES = 50;

/** Bringt eine (evtl. alte oder beschädigte) Vorlage in eine saubere Form. */
export function normalizeCustomTemplate(tpl = {}) {
  const minutes = Number(tpl.minutes);
  return {
    id: typeof tpl.id === 'string' && tpl.id.startsWith(CUSTOM_ID_PREFIX) ? tpl.id : `${CUSTOM_ID_PREFIX}${uid()}`,
    title: String(tpl.title || '').trim().slice(0, 120),
    desc: String(tpl.desc || '').trim(),
    category: CATS[tpl.category] ? tpl.category : 'routine',
    difficulty: DIFF[tpl.difficulty] ? tpl.difficulty : 'leicht',
    repeat: tpl.repeat === 'daily' ? 'daily' : 'none',
    when: DAYPART_IDS.includes(tpl.when) ? tpl.when : DEFAULT_DAYPART,
    minutes: minutes > 0 ? Math.min(240, Math.round(minutes)) : null,
    // Schritte als reiner Text – Häkchen und Belohnungen gehören zur Aufgabe, nicht zur Vorlage
    steps: Array.isArray(tpl.steps)
      ? tpl.steps.map((s) => String(typeof s === 'string' ? s : (s && s.text) || '').trim()).filter(Boolean)
      : [],
  };
}

/**
 * Speichert die Felder einer Aufgabe als eigene Vorlage.
 * Gibt es schon eine Vorlage mit gleichem Titel, wird sie aktualisiert statt verdoppelt.
 */
export function saveCustomTemplate(state, fields) {
  const tpl = normalizeCustomTemplate({ ...fields, id: undefined });
  if (!tpl.title) return state;
  const list = state.customTemplates || [];
  const existing = list.find((t) => t.title.toLowerCase() === tpl.title.toLowerCase());
  if (existing) {
    return { ...state, customTemplates: list.map((t) => (t.id === existing.id ? { ...tpl, id: existing.id } : t)) };
  }
  return { ...state, customTemplates: [tpl, ...list].slice(0, MAX_CUSTOM_TEMPLATES) };
}

/** Löscht eine eigene Vorlage. Aufgaben, die daraus entstanden sind, bleiben unberührt. */
export function removeCustomTemplate(state, id) {
  return { ...state, customTemplates: (state.customTemplates || []).filter((t) => t.id !== id) };
}
