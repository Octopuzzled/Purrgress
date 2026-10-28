/**
 * Kleines, abhängigkeitsfreies Übersetzungssystem.
 *
 * - Texte liegen als verschachtelte Objekte in ./locales/<sprache>.js
 * - t('bereich.schluessel', { name: 'Mochi' }) liefert den Text mit ersetzten Platzhaltern
 * - Plural: Ist der Eintrag ein Objekt mit zero/one/other, entscheidet vars.count
 * - Fehlt ein Text in einer Sprache, wird Deutsch verwendet, sonst der Schlüssel selbst
 */
import { de } from './locales/de.js';
import { en } from './locales/en.js';
import { dayKey, daysBetween, parseDayKey } from '../lib/date.js';

export const DICTIONARIES = { de, en };
export const LANGUAGES = ['de', 'en'];
export const FALLBACK_LANGUAGE = 'de';

/** Entscheidet die tatsächliche Sprache aus der Einstellung ('system' | 'de' | 'en'). */
export function resolveLanguage(setting, preferred = browserLanguages()) {
  if (LANGUAGES.includes(setting)) return setting;
  for (const tag of preferred) {
    const base = String(tag).toLowerCase().split('-')[0];
    if (LANGUAGES.includes(base)) return base;
  }
  return 'en';
}

function browserLanguages() {
  if (typeof navigator === 'undefined') return [];
  return navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
}

function lookup(dict, key) {
  return key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dict);
}

function interpolate(text, vars) {
  return text.replace(/\{(\w+)\}/g, (match, name) => (vars[name] !== undefined ? String(vars[name]) : match));
}

function isPlural(value) {
  return value && typeof value === 'object' && !Array.isArray(value) && 'other' in value;
}

/** Erzeugt alle sprachabhängigen Helfer für eine Sprache. */
export function createI18n(lang) {
  const language = LANGUAGES.includes(lang) ? lang : FALLBACK_LANGUAGE;
  const dict = DICTIONARIES[language];
  const locale = dict.meta.locale;
  const plural = new Intl.PluralRules(locale);

  function t(key, vars = {}) {
    let value = lookup(dict, key);
    if (value === undefined) value = lookup(DICTIONARIES[FALLBACK_LANGUAGE], key);
    if (value === undefined) return key;

    if (isPlural(value)) {
      const count = Number(vars.count) || 0;
      const form = count === 0 && value.zero !== undefined ? 'zero' : plural.select(count);
      value = value[form] !== undefined ? value[form] : value.other;
    }
    return typeof value === 'string' ? interpolate(value, vars) : value;
  }

  /** Dauer in Minuten, z. B. „25 Min.“ / „1 h 30 min“. */
  function duration(minutes) {
    const total = Math.max(0, Math.round(minutes));
    if (total < 60) return t('units.minutes', { m: total });
    const h = Math.floor(total / 60);
    const m = total % 60;
    return m ? t('units.hoursMinutes', { h, m }) : t('units.hours', { h });
  }

  /** Uhrzeit in der Schreibweise der Sprache, z. B. „14:35“. */
  function clock(timestamp) {
    return new Date(timestamp).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  }

  /** Tag als kurzes Wort: „Heute“, „Morgen“, „Freitag“ – weiter weg „Mo., 3. Nov.“ */
  function day(key, today = dayKey()) {
    const diff = daysBetween(today, key);
    if (diff === 0) return t('due.today');
    if (diff === 1) return t('due.tomorrow');
    if (diff === -1) return t('due.yesterday');
    const date = parseDayKey(key);
    if (Math.abs(diff) < 7) return date.toLocaleDateString(locale, { weekday: 'long' });
    const sameYear = key.slice(0, 4) === today.slice(0, 4);
    return date.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) });
  }

  return { lang: language, locale, t, duration, clock, day };
}

/** Übersetzt eine Vorlage aus der Bibliothek (Texte kommen aus dem Wörterbuch). */
export function localizeTemplate(t, template) {
  const steps = t(`library.items.${template.id}.steps`);
  return {
    ...template,
    title: t(`library.items.${template.id}.title`),
    desc: t(`library.items.${template.id}.desc`),
    steps: Array.isArray(steps) ? steps : undefined,
  };
}
