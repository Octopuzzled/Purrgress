/**
 * Reine Funktionen rund um die Zeitbox.
 *
 * Ein Timer rechnet nie mit einem laufenden Zähler, sondern mit Zeitstempeln.
 * Dadurch bleibt die Restzeit auch nach einem Neuladen oder im Hintergrund korrekt.
 *
 * Form eines Timers:
 * {
 *   taskId, startedAt, plannedMs,     // Aufgabe, Startzeit, geplante Gesamtlänge
 *   running,                          // läuft gerade?
 *   endAt,                            // nur wenn running: geplantes Ende (ms)
 *   remainingMs,                      // nur wenn pausiert: Restzeit (negativ = Überzeit)
 *   segStart,                         // Beginn des aktuellen Laufabschnitts (für die Fokuszeit)
 *   notified,                         // Ende-Signal schon gespielt?
 * }
 */
import { dayKey } from './date.js';

const MINUTE = 60000;

export function timerLeft(timer, now) {
  if (!timer) return 0;
  return timer.running ? timer.endAt - now : timer.remainingMs;
}

export function timerProgress(timer, left) {
  return timer.plannedMs > 0 ? 1 - Math.max(0, left) / timer.plannedMs : 1;
}

export function createTimer(taskId, minutes, now) {
  return {
    taskId,
    plannedMs: minutes * MINUTE,
    endAt: now + minutes * MINUTE,
    remainingMs: null,
    running: true,
    segStart: now,
    startedAt: now,
    notified: false,
  };
}

export function pausedTimer(timer, now) {
  return { ...timer, running: false, remainingMs: timer.endAt - now, endAt: null };
}

export function resumedTimer(timer, now) {
  return { ...timer, running: true, endAt: now + timer.remainingMs, remainingMs: null, segStart: now };
}

/** Verlängert oder verkürzt die Zeitbox. Kürzen geht nie unter eine Minute Restzeit. */
export function adjustedTimer(timer, deltaMinutes, now) {
  const left = timerLeft(timer, now);
  let next = left + deltaMinutes * MINUTE;
  if (deltaMinutes < 0) next = Math.max(Math.min(left, MINUTE), next);
  const applied = next - left;
  if (applied === 0) return timer;
  return {
    ...timer,
    plannedMs: Math.max(MINUTE, timer.plannedMs + applied),
    notified: next > 0 ? false : timer.notified,
    ...(timer.running ? { endAt: now + next } : { remainingMs: next }),
  };
}

/** Schreibt fokussierte Zeit (in Sekunden) in das Tages-Log. */
export function logFocus(state, ms) {
  if (!(ms >= 1000)) return state;
  const day = dayKey();
  const log = state.focusLog || {};
  return { ...state, focusLog: { ...log, [day]: (log[day] || 0) + Math.round(ms / 1000) } };
}

/** Beendet den laufenden Abschnitt und verbucht ihn als Fokuszeit. */
export function closeSegment(state, now) {
  return state.timer && state.timer.running ? logFocus(state, now - state.timer.segStart) : state;
}

/** Entfernt die Zeitbox aus dem Zustand und verbucht die Fokuszeit. */
export function withoutTimer(state, now) {
  return { ...closeSegment(state, now), timer: null };
}
