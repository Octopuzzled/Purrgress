import { describe, expect, it } from 'vitest';
import { LIBRARY } from '../src/constants/library.js';
import { SHOP, SLOTS } from '../src/constants/shop.js';
import { createI18n, DICTIONARIES, LANGUAGES, localizeTemplate, resolveLanguage } from '../src/i18n/index.js';
import { starterTasks } from '../src/lib/state.js';

/** Alle Schlüssel eines Wörterbuchs als Liste, z. B. „tasks.heading“. Arrays und Plural-Objekte zählen als ein Eintrag. */
function flatten(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    const isLeaf = typeof v !== 'object' || Array.isArray(v) || 'other' in v;
    return isLeaf ? [[key, v]] : flatten(v, key);
  });
}

function placeholders(value) {
  const text = JSON.stringify(value);
  return [...new Set([...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort();
}

describe('Wörterbücher', () => {
  const reference = new Map(flatten(DICTIONARIES.de));

  for (const lang of LANGUAGES.filter((l) => l !== 'de')) {
    const entries = new Map(flatten(DICTIONARIES[lang]));

    it(`${lang} hat genau dieselben Schlüssel wie de`, () => {
      expect([...entries.keys()].sort()).toEqual([...reference.keys()].sort());
    });

    it(`${lang} verwendet dieselben Platzhalter wie de`, () => {
      const mismatches = [...reference.keys()].filter(
        (k) => JSON.stringify(placeholders(entries.get(k))) !== JSON.stringify(placeholders(reference.get(k))),
      );
      expect(mismatches).toEqual([]);
    });

    it(`${lang} hat für Listen gleich viele Einträge`, () => {
      const mismatches = [...reference.keys()].filter(
        (k) => Array.isArray(reference.get(k)) && entries.get(k).length !== reference.get(k).length,
      );
      expect(mismatches).toEqual([]);
    });
  }

  it('enthält Texte für jede Vorlage und jedes Teil der Umkleide', () => {
    for (const lang of LANGUAGES) {
      const { t } = createI18n(lang);
      for (const group of LIBRARY) {
        expect(typeof t(`library.groups.${group.id}.title`)).toBe('string');
        for (const item of group.items) expect(t(`library.items.${item.id}.title`)).not.toBe(`library.items.${item.id}.title`);
      }
      for (const slot of SLOTS) {
        for (const item of SHOP[slot].items) expect(t(`shop.items.${item.id}`)).not.toBe(`shop.items.${item.id}`);
      }
    }
  });
});

describe('t()', () => {
  const { t, duration } = createI18n('de');
  const en = createI18n('en');

  it('ersetzt Platzhalter', () => {
    expect(t('hero.title', { name: 'Mochi' })).toBe('Mochi, dein Held');
    expect(en.t('hero.title', { name: 'Mochi' })).toBe('Mochi, your hero');
  });

  it('wählt die richtige Pluralform', () => {
    expect(t('tasks.open', { count: 0 })).toBe('Gerade ist nichts offen.');
    expect(t('tasks.open', { count: 1 })).toBe('Eine Aufgabe offen.');
    expect(t('tasks.open', { count: 4 })).toBe('4 offen. Eine nach der anderen.');
    expect(en.t('common.coins', { count: 1 })).toBe('1 coin');
    expect(en.t('common.coins', { count: 7 })).toBe('7 coins');
  });

  it('gibt bei unbekannten Schlüsseln den Schlüssel zurück', () => {
    expect(t('gibt.es.nicht')).toBe('gibt.es.nicht');
  });

  it('formatiert Dauern je Sprache', () => {
    expect(duration(25)).toBe('25 Min.');
    expect(duration(90)).toBe('1 Std. 30 Min.');
    expect(en.duration(60)).toBe('1 h');
    expect(en.duration(75)).toBe('1 h 15 min');
  });

  it('übersetzt Vorlagen samt Mini-Schritten', () => {
    const tpl = LIBRARY[0].items.find((i) => i.id === 't-impuls');
    const item = localizeTemplate(en.t, tpl);
    expect(item.title).toMatch(/^Impulse pause/);
    expect(item.steps).toHaveLength(4);
    expect(item.minutes).toBe(10);
  });
});

describe('Sprachwahl', () => {
  it('nimmt eine feste Einstellung direkt', () => {
    expect(resolveLanguage('en', ['de-DE'])).toBe('en');
    expect(resolveLanguage('de', ['en-US'])).toBe('de');
  });

  it('folgt bei „system“ dem Gerät', () => {
    expect(resolveLanguage('system', ['de-AT', 'en'])).toBe('de');
    expect(resolveLanguage('system', ['en-GB'])).toBe('en');
    expect(resolveLanguage('system', ['fr-FR', 'de-DE'])).toBe('de');
  });

  it('fällt bei unbekannten Sprachen auf Englisch zurück', () => {
    expect(resolveLanguage('system', ['fr-FR'])).toBe('en');
  });

  it('legt Starter-Aufgaben in der gewählten Sprache an', () => {
    expect(starterTasks('en')[0].title).toBe('Tick me off to meet Mochi');
    expect(starterTasks('de')[3].steps).toHaveLength(3);
  });
});
