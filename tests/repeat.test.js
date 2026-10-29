import { describe, expect, it } from 'vitest';
import { createI18n } from '../src/i18n/index.js';
import { initialState, normalizeTask } from '../src/lib/state.js';
import { latestOccurrence, nextOccurrence, normalizeRepeat } from '../src/lib/repeat.js';
import { clearDoneTasks, rollRepeatingTasks } from '../src/lib/tasks.js';
import { normalizeCustomTemplate } from '../src/lib/templates.js';

// Woche vom 26.10.2026 (Montag) bis 1.11.2026 (Sonntag)
const MON = '2026-10-26';
const TUE = '2026-10-27';
const WED = '2026-10-28';
const FRI = '2026-10-30';
const NEXT_TUE = '2026-11-03';
const trash = (extra = {}) => normalizeTask({ id: 'muell', title: 'Müll raus', repeat: 'weekly', repeatDays: [2], due: TUE, ...extra });
const roll = (tasks, today) => rollRepeatingTasks({ ...initialState(), tasks }, today).tasks[0];

describe('Wiederholung an Wochentagen', () => {
  it('räumt die Einstellung auf', () => {
    expect(normalizeRepeat({ repeat: 'weekly', repeatDays: [5, 2, 2, 9] })).toEqual({ repeat: 'weekly', repeatDays: [2, 5] });
    expect(normalizeRepeat({ repeat: 'weekly', repeatDays: [] })).toEqual({ repeat: 'none', repeatDays: [] });
    expect(normalizeRepeat({ repeat: 'weekly', repeatDays: [0, 1, 2, 3, 4, 5, 6] }).repeat).toBe('daily');
    expect(normalizeCustomTemplate({ title: 'X', repeat: 'weekly', repeatDays: [1] }).repeatDays).toEqual([1]);
  });

  it('findet den nächsten und den letzten Termin', () => {
    const t = { repeat: 'weekly', repeatDays: [2, 5] };
    expect(nextOccurrence(t, WED)).toBe(FRI);
    expect(nextOccurrence(t, TUE)).toBe(TUE);
    expect(latestOccurrence(t, WED)).toBe(TUE);
  });

  it('bekommt beim Anlegen den nächsten Termin', () => {
    const t = normalizeTask({ title: 'X', repeat: 'weekly', repeatDays: [2] });
    expect(new Date(`${t.due}T12:00`).getDay()).toBe(2);
  });

  it('öffnet sich nach dem Erledigen am nächsten Tag wieder, fällig am nächsten Termin', () => {
    const t = roll([trash({ done: true, doneDay: TUE })], WED);
    expect(t.done).toBe(false);
    expect(t.due).toBe(NEXT_TUE);
  });

  it('zählt früher Erledigtes für den anstehenden Termin', () => {
    const t = roll([trash({ done: true, doneDay: MON })], TUE);
    expect(t.done).toBe(false);
    expect(t.due).toBe(NEXT_TUE);
  });

  it('wartet verpasst als überfällig – bis der nächste Termin da ist, ohne Kopie', () => {
    const start = [trash()];
    expect(roll(start, FRI).due).toBe(TUE);
    const later = rollRepeatingTasks({ ...initialState(), tasks: start }, NEXT_TUE);
    expect(later.tasks).toHaveLength(1);
    expect(later.tasks[0].due).toBe(NEXT_TUE);
  });

  it('bleibt beim Aufräumen erledigter Aufgaben erhalten', () => {
    const s = { ...initialState(), tasks: [trash({ done: true, doneDay: TUE }), normalizeTask({ id: 'x', title: 'X', done: true })] };
    expect(clearDoneTasks(s).tasks.map((t) => t.id)).toEqual(['muell']);
  });

  it('beschriftet die Tage in beiden Sprachen, Woche ab Montag', () => {
    const task = { repeat: 'weekly', repeatDays: [0, 2] };
    expect(createI18n('de').repeatLabel(task)).toMatch(/^Di\.?, So\.?$/); // mit oder ohne Punkt, je nach ICU
    expect(createI18n('en').repeatLabel(task)).toBe('Tue, Sun');
    expect(createI18n('de').repeatLabel({ repeat: 'daily', repeatDays: [] })).toBe('täglich');
  });
});

describe('Vorlagen und Einstellungen für 1.7', () => {
  it('bringt wöchentliche Vorlagen mit festen Tagen mit', async () => {
    const { LIBRARY } = await import('../src/constants/library.js');
    const weekly = LIBRARY.flatMap((g) => g.items).filter((i) => i.repeat === 'weekly');
    expect(weekly.length).toBeGreaterThan(0);
    for (const item of weekly) expect(normalizeTask({ title: 'x', ...item }).repeat).toBe('weekly');
    expect(LIBRARY.every((g) => g.items.length <= 8)).toBe(true);
  });

  it('fragt standardmäßig morgens und abends – auch nach dem Update', async () => {
    const { migrate } = await import('../src/lib/state.js');
    expect(initialState().settings).toMatchObject({ checkIn: true, wrapUp: true, tour: true });
    expect(migrate({ settings: { sound: false } }).settings).toMatchObject({ checkIn: true, wrapUp: true, tour: true, sound: false });
    expect(migrate({ settings: { tour: false } }).settings.tour).toBe(false);
  });
});
