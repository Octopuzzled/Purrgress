import { describe, expect, it } from 'vitest';
import {
  adjustedTimer, createTimer, logFocus, pausedTimer, resumedTimer, timerLeft, timerProgress, withoutTimer,
} from '../src/lib/timebox.js';

const MIN = 60000;
const T0 = 1_000_000;

describe('Zeitbox', () => {
  it('rechnet die Restzeit über Zeitstempel', () => {
    const t = createTimer('a', 25, T0);
    expect(timerLeft(t, T0)).toBe(25 * MIN);
    expect(timerLeft(t, T0 + 5 * MIN)).toBe(20 * MIN);
    expect(timerProgress(t, 20 * MIN)).toBeCloseTo(0.2);
  });

  it('friert die Restzeit beim Pausieren ein und setzt sie danach fort', () => {
    const paused = pausedTimer(createTimer('a', 10, T0), T0 + 4 * MIN);
    expect(paused.running).toBe(false);
    expect(timerLeft(paused, T0 + 60 * MIN)).toBe(6 * MIN);
    const resumed = resumedTimer(paused, T0 + 60 * MIN);
    expect(timerLeft(resumed, T0 + 61 * MIN)).toBe(5 * MIN);
  });

  it('läuft in die Überzeit statt stehen zu bleiben', () => {
    const t = createTimer('a', 5, T0);
    expect(timerLeft(t, T0 + 7 * MIN)).toBe(-2 * MIN);
    expect(timerProgress(t, -2 * MIN)).toBe(1);
  });

  it('verlängert um 5 Minuten und passt die geplante Länge an', () => {
    const t = adjustedTimer(createTimer('a', 10, T0), 5, T0);
    expect(t.plannedMs).toBe(15 * MIN);
    expect(timerLeft(t, T0)).toBe(15 * MIN);
  });

  it('kürzt nie unter eine Minute Restzeit', () => {
    const t = adjustedTimer(createTimer('a', 3, T0), -5, T0);
    expect(timerLeft(t, T0)).toBe(1 * MIN);
    const unchanged = createTimer('a', 5, T0);
    expect(adjustedTimer(unchanged, -5, T0 + 4.5 * MIN)).toBe(unchanged);
  });

  it('setzt das Ende-Signal zurück, wenn wieder Zeit übrig ist', () => {
    const over = { ...createTimer('a', 5, T0), notified: true };
    expect(adjustedTimer(over, 5, T0 + 6 * MIN).notified).toBe(false);
  });

  it('verbucht Fokuszeit in Sekunden und ignoriert Sekundenbruchteile', () => {
    const s = logFocus({ focusLog: {} }, 90 * 1000);
    expect(Object.values(s.focusLog)).toEqual([90]);
    const same = { focusLog: {} };
    expect(logFocus(same, 400)).toBe(same);
  });

  it('beendet die Zeitbox und verbucht den laufenden Abschnitt', () => {
    const state = { focusLog: {}, timer: createTimer('a', 25, T0) };
    const next = withoutTimer(state, T0 + 2 * MIN);
    expect(next.timer).toBeNull();
    expect(Object.values(next.focusLog)).toEqual([120]);
  });
});
