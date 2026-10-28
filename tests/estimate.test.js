import { describe, expect, it } from 'vitest';
import { estimateFor, makeSample, MAX_SAMPLES, normalizeTimeLog, taskKey } from '../src/lib/estimate.js';
import { initialState, normalizeTask } from '../src/lib/state.js';
import { completeTask, reopenTask } from '../src/lib/tasks.js';
import { adjustedTimer, createTimer, pausedTimer, resumedTimer } from '../src/lib/timebox.js';
import { merge3 } from '../src/sync/merge.js';
import { toSyncable } from '../src/sync/syncable.js';

const MIN = 60000;
const T0 = 1_800_000_000_000;
const task = (extra = {}) => normalizeTask({ id: 'a', title: 'Steuer', category: 'fokus', ...extra });
let n = 0;
const sample = (key, cat, planned, actual) => ({ id: `s-${T0 + n++}`, key, cat, planned, actual, day: '2026-10-28' });

describe('Messungen', () => {
  it('vergleichen die ursprüngliche Planung mit der Zeit ohne Pausen', () => {
    let timer = createTimer('a', 10, T0);
    timer = pausedTimer(timer, T0 + 4 * MIN); // 4 Min. gelaufen
    timer = resumedTimer(timer, T0 + 30 * MIN); // 26 Min. Pause
    timer = adjustedTimer(timer, 5, T0 + 31 * MIN); // +5 ändert die Planung nicht
    const s = makeSample(task(), timer, T0 + 40 * MIN); // weitere 10 Min.
    expect(s).toMatchObject({ planned: 10, actual: 14, cat: 'fokus', key: 'title:steuer' });
  });

  it('ignorieren vergessene Timer und Fehlklicks', () => {
    expect(makeSample(task(), createTimer('a', 10, T0), T0 + 60 * MIN)).toBeNull();
    expect(makeSample(task(), createTimer('a', 10, T0), T0 + 10_000)).toBeNull();
  });

  it('erkennen Aufgaben an Vorlage, Wiederholung oder Titel', () => {
    expect(taskKey(task({ templateId: 't-wasser' }))).toBe('tpl:t-wasser');
    expect(taskKey(task({ repeat: 'daily' }))).toBe('task:a');
    expect(taskKey(task({ title: '  Steuer ' }))).toBe('title:steuer');
  });

  it('entstehen beim Erledigen mit laufender Zeitbox und verschwinden beim Rückgängigmachen', () => {
    const start = { ...initialState(), tasks: [task()], timer: createTimer('a', 10, T0) };
    const { state } = completeTask(start, 'a', T0 + 15 * MIN);
    expect(state.timeLog).toHaveLength(1);
    expect(state.timeLog[0].actual).toBe(15);
    expect(reopenTask(state, 'a').timeLog).toEqual([]);
    expect(completeTask({ ...start, timer: null }, 'a').state.timeLog).toEqual([]);
  });
});

describe('Einschätzung', () => {
  it('schweigt, solange es zu wenige Messungen gibt', () => {
    expect(estimateFor([sample('title:steuer', 'fokus', 10, 20), sample('title:steuer', 'fokus', 10, 20)], task(), 10)).toBeNull();
  });

  it('nimmt zuerst dieselbe Aufgabe, dann die Kategorie, dann alles', () => {
    const same = [1, 2, 3].map(() => sample('title:steuer', 'fokus', 10, 20));
    expect(estimateFor(same, task(), 10)).toMatchObject({ scope: 'task', suggested: 20, longer: true });
    const cat = [1, 2, 3].map(() => sample('title:anderes', 'fokus', 10, 15));
    expect(estimateFor(cat, task(), 10)).toMatchObject({ scope: 'category', suggested: 15 });
    const all = [1, 2, 3].map(() => sample('title:x', 'pflege', 20, 30));
    expect(estimateFor(all, task(), 20)).toMatchObject({ scope: 'overall', suggested: 30 });
  });

  it('nutzt den Median – ein chaotischer Tag verzerrt nichts', () => {
    const log = [10, 11, 39, 10, 9].map((a) => sample('title:steuer', 'fokus', 10, a));
    expect(estimateFor(log, task(), 10)).toBeNull();
  });

  it('meldet auch, wenn etwas meist schneller geht', () => {
    const log = [1, 2, 3].map(() => sample('title:steuer', 'fokus', 30, 15));
    expect(estimateFor(log, task(), 30)).toMatchObject({ longer: false, suggested: 15 });
  });

  it('bleibt beim Abgleich chronologisch und begrenzt', () => {
    const many = Array.from({ length: MAX_SAMPLES + 5 }, () => sample('k', 'fokus', 10, 12));
    expect(normalizeTimeLog([...many].reverse())).toEqual(many.slice(-MAX_SAMPLES));
    const base = toSyncable(initialState());
    const local = toSyncable({ ...initialState(), timeLog: [many[1]] });
    const remote = toSyncable({ ...initialState(), timeLog: [many[0]] });
    expect(merge3(base, local, remote).timeLog.map((s) => s.id)).toEqual([many[0].id, many[1].id]);
  });
});
