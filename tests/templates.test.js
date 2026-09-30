import { describe, expect, it } from 'vitest';
import { LIBRARY } from '../src/constants/library.js';
import { initialState, migrate } from '../src/lib/state.js';
import { normalizeCustomTemplate, removeCustomTemplate, saveCustomTemplate } from '../src/lib/templates.js';

const fields = {
  title: 'Pflanzen gießen',
  desc: 'Alle auf der Fensterbank',
  category: 'pflege',
  difficulty: 'leicht',
  repeat: 'none',
  minutes: 5,
  steps: [{ id: 'x', text: 'Gießkanne füllen', done: true, xp: 2 }, { text: '  ' }, 'Gießen'],
};

describe('Eigene Vorlagen', () => {
  it('macht aus einer Aufgabe eine saubere Vorlage', () => {
    const s = saveCustomTemplate(initialState(), fields);
    const tpl = s.customTemplates[0];
    expect(tpl.id.startsWith('c-')).toBe(true);
    expect(tpl.title).toBe('Pflanzen gießen');
    expect(tpl.steps).toEqual(['Gießkanne füllen', 'Gießen']);
    expect(tpl.minutes).toBe(5);
  });

  it('aktualisiert bei gleichem Titel statt zu verdoppeln', () => {
    let s = saveCustomTemplate(initialState(), fields);
    const id = s.customTemplates[0].id;
    s = saveCustomTemplate(s, { ...fields, title: 'PFLANZEN gießen', minutes: 10 });
    expect(s.customTemplates).toHaveLength(1);
    expect(s.customTemplates[0].id).toBe(id);
    expect(s.customTemplates[0].minutes).toBe(10);
  });

  it('ignoriert Vorlagen ohne Titel', () => {
    const start = initialState();
    expect(saveCustomTemplate(start, { ...fields, title: '   ' })).toBe(start);
  });

  it('löscht eine Vorlage, ohne Aufgaben anzufassen', () => {
    const s = saveCustomTemplate(initialState(), fields);
    const next = removeCustomTemplate(s, s.customTemplates[0].id);
    expect(next.customTemplates).toHaveLength(0);
    expect(next.tasks).toBe(s.tasks);
  });

  it('repariert gespeicherte Vorlagen beim Laden', () => {
    const s = migrate({ ...initialState(), customTemplates: [{ title: 'Alt', category: 'gibtsnicht', minutes: 999 }, { title: '' }] });
    expect(s.customTemplates).toHaveLength(1);
    expect(s.customTemplates[0].category).toBe('routine');
    expect(s.customTemplates[0].minutes).toBe(240);
    expect(migrate({ xp: 1 }).customTemplates).toEqual([]);
  });

  it('normalisiert auch leere Eingaben', () => {
    expect(normalizeCustomTemplate().steps).toEqual([]);
  });
});

describe('Vorlagen-Bibliothek', () => {
  it('hat eindeutige IDs', () => {
    const ids = LIBRARY.flatMap((g) => g.items.map((i) => i.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('bleibt übersichtlich: höchstens 8 Vorlagen pro Gruppe', () => {
    for (const g of LIBRARY) expect(g.items.length <= 8).toBe(true);
  });
});
