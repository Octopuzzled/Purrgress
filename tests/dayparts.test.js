import { describe, expect, it } from 'vitest';
import { LIBRARY } from '../src/constants/library.js';
import { currentDaypart, groupByDaypart, usesDayparts } from '../src/lib/dayparts.js';
import { initialState, migrate, normalizeTask } from '../src/lib/state.js';
import { pickTask } from '../src/lib/tasks.js';
import { saveCustomTemplate } from '../src/lib/templates.js';

const task = (id, when, extra = {}) => normalizeTask({ id, title: id, when, ...extra });
const at = (hour) => new Date(2026, 8, 30, hour, 0);

describe('Tageszeiten', () => {
  it('ordnet die Uhrzeit einer Tageszeit zu', () => {
    expect(currentDaypart(at(7))).toBe('morgens');
    expect(currentDaypart(at(11))).toBe('morgens');
    expect(currentDaypart(at(12))).toBe('jederzeit');
    expect(currentDaypart(at(16))).toBe('jederzeit');
    expect(currentDaypart(at(17))).toBe('abends');
    expect(currentDaypart(at(23))).toBe('abends');
  });

  it('zeigt Abschnitte nur, wenn eine offene Aufgabe eine feste Tageszeit hat', () => {
    expect(usesDayparts([task('a'), task('b')])).toBe(false);
    expect(usesDayparts([task('a'), task('b', 'abends', { done: true })])).toBe(false);
    expect(usesDayparts([task('a'), task('b', 'morgens')])).toBe(true);
  });

  it('teilt in Morgen, Jederzeit, Abend auf und behält die Reihenfolge', () => {
    const groups = groupByDaypart([task('x', 'abends'), task('a'), task('m1', 'morgens'), task('b'), task('m2', 'morgens')]);
    expect(groups.map((g) => g.id)).toEqual(['morgens', 'jederzeit', 'abends']);
    expect(groups[0].tasks.map((t) => t.id)).toEqual(['m1', 'm2']);
    expect(groups[1].tasks.map((t) => t.id)).toEqual(['a', 'b']);
  });

  it('lässt leere Abschnitte weg', () => {
    expect(groupByDaypart([task('m', 'morgens'), task('a')]).map((g) => g.id)).toEqual(['morgens', 'jederzeit']);
  });

  it('setzt „Jederzeit“ für alte oder ungültige Aufgaben', () => {
    expect(normalizeTask({ title: 'Alt' }).when).toBe('jederzeit');
    expect(normalizeTask({ title: 'Kaputt', when: 'mitternacht' }).when).toBe('jederzeit');
    expect(migrate({ tasks: [{ id: 'x', title: 'X' }] }).tasks[0].when).toBe('jederzeit');
  });

  it('gibt Aufgaben aus Vorlagen nachträglich die Tageszeit ihrer Vorlage', () => {
    const old = migrate({ tasks: [
      { id: 'a', title: 'Morgen-Anker', templateId: 't-anker' },
      { id: 'b', title: 'Startrampe', templateId: 't-startrampe' },
      { id: 'c', title: 'Ohne Vorlage' },
      { id: 'd', title: 'Selbst gewählt', templateId: 't-anker', when: 'jederzeit' },
      { id: 'e', title: 'Vorlage ohne Tageszeit', templateId: 't-5min' },
    ] });
    expect(old.tasks.map((t) => t.when)).toEqual(['morgens', 'abends', 'jederzeit', 'jederzeit', 'jederzeit']);
  });

  it('bevorzugt bei „Was jetzt?“ Aufgaben der aktuellen Tageszeit', () => {
    const pool = [task('morgen', 'morgens'), task('egal'), task('abend', 'abends')];
    const counts = { morgen: 0, egal: 0, abend: 0 };
    const original = Math.random;
    let seed = 1;
    Math.random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 600; i++) counts[pickTask(pool, null, 'morgens').id]++;
    Math.random = original;
    expect(counts.morgen > counts.egal * 2).toBe(true);
    expect(counts.egal > 0 && counts.abend > 0).toBe(true);
  });

  it('übernimmt die Tageszeit in eigene Vorlagen', () => {
    const s = saveCustomTemplate(initialState(), { title: 'Abendspaziergang', when: 'abends', steps: [] });
    expect(s.customTemplates[0].when).toBe('abends');
  });

  it('hat nur gültige Tageszeiten in der Bibliothek', () => {
    const whens = LIBRARY.flatMap((g) => g.items).map((i) => i.when).filter(Boolean);
    expect(whens.length > 0).toBe(true);
    expect(whens.every((w) => ['morgens', 'jederzeit', 'abends'].includes(w))).toBe(true);
  });
});
