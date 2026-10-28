import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, isDayKey } from '../src/lib/date.js';
import { dueStatus, groupByDay, isCurrent, isDueToday, sortByDue } from '../src/lib/due.js';
import { initialState, normalizeTask } from '../src/lib/state.js';
import { nextOpenTask, pickTask, reopenDailyTasks } from '../src/lib/tasks.js';
import { createI18n } from '../src/i18n/index.js';

const TODAY = '2026-10-28';
const task = (id, extra = {}) => normalizeTask({ id, title: id, ...extra });

describe('Fälligkeit', () => {
  it('rechnet mit Tagesschlüsseln, auch über Monatsgrenzen', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(daysBetween('2026-10-28', '2026-11-04')).toBe(7);
    expect(isDayKey('2026-10-28')).toBe(true);
    expect(isDayKey('morgen')).toBe(false);
  });

  it('unterscheidet ohne Datum, überfällig, heute und später', () => {
    expect(dueStatus(task('a'), TODAY)).toBe('none');
    expect(dueStatus(task('b', { due: '2026-10-27' }), TODAY)).toBe('overdue');
    expect(dueStatus(task('c', { due: TODAY }), TODAY)).toBe('today');
    expect(dueStatus(task('d', { due: '2026-10-29' }), TODAY)).toBe('future');
    expect(isCurrent(task('d', { due: '2026-10-29' }), TODAY)).toBe(false);
    expect(isDueToday(task('a'), TODAY)).toBe(false);
    expect(isDueToday(task('b', { due: '2026-10-27' }), TODAY)).toBe(true);
  });

  it('verwirft kaputte Daten und gibt täglichen Aufgaben das heutige Datum', () => {
    expect(task('a', { due: 'irgendwann' }).due).toBeNull();
    expect(task('b', { repeat: 'daily' }).due).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('sortiert nach Datum, Aufgaben ohne Datum zuletzt, sonst stabil', () => {
    const list = [task('ohne1'), task('morgen', { due: '2026-10-29' }), task('ohne2'), task('gestern', { due: '2026-10-27' }), task('heute', { due: TODAY })];
    expect(sortByDue(list).map((t) => t.id)).toEqual(['gestern', 'heute', 'morgen', 'ohne1', 'ohne2']);
  });

  it('gruppiert geplante Aufgaben nach Tag', () => {
    const groups = groupByDay([task('a', { due: '2026-11-02' }), task('b', { due: '2026-10-30' }), task('c', { due: '2026-11-02' })]);
    expect(groups.map((g) => [g.day, g.tasks.map((t) => t.id)])).toEqual([['2026-10-30', ['b']], ['2026-11-02', ['a', 'c']]]);
  });
});

describe('Tägliche Aufgaben', () => {
  it('rutschen weiter statt sich zu verdoppeln, wenn sie liegen geblieben sind', () => {
    const start = { ...initialState(), tasks: [task('a', { repeat: 'daily', due: '2026-10-25' })] };
    const next = reopenDailyTasks(start, TODAY);
    expect(next.tasks).toHaveLength(1);
    expect(next.tasks[0].due).toBe(TODAY);
    expect(reopenDailyTasks(next, TODAY)).toBe(next);
  });

  it('öffnen sich am neuen Tag wieder und sind dann heute fällig', () => {
    const start = { ...initialState(), tasks: [task('a', { repeat: 'daily', done: true, doneDay: '2026-10-27', due: '2026-10-27' })] };
    const t = reopenDailyTasks(start, TODAY).tasks[0];
    expect(t.done).toBe(false);
    expect(t.due).toBe(TODAY);
  });

  it('lassen Aufgaben mit festem Datum in Ruhe', () => {
    const start = { ...initialState(), tasks: [task('a', { due: '2026-10-20' })] };
    expect(reopenDailyTasks(start, TODAY)).toBe(start);
  });
});

describe('„Was jetzt?“ und „Weiter mit …“', () => {
  it('schlagen keine erst später fälligen Aufgaben vor', () => {
    const pool = [task('spaeter', { due: '2026-11-01' }), task('jetzt')];
    for (let i = 0; i < 50; i++) expect(pickTask(pool, null, null, TODAY).id).toBe('jetzt');
    expect(pickTask([task('spaeter', { due: '2026-11-01' })], null, null, TODAY)).toBeNull();
    expect(nextOpenTask([task('a'), pool[0], pool[1]], 'a', TODAY).id).toBe('jetzt');
  });
});

describe('Tagesnamen', () => {
  it('nennt nahe Tage beim Namen und fernere mit Datum', () => {
    const { day } = createI18n('de');
    expect(day(TODAY, TODAY)).toBe('Heute');
    expect(day('2026-10-29', TODAY)).toBe('Morgen');
    expect(day('2026-10-27', TODAY)).toBe('Gestern');
    expect(day('2026-10-30', TODAY)).toBe('Freitag');
    expect(day('2026-11-10', TODAY)).toMatch(/10/);
  });
});
