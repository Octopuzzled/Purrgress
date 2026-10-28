/**
 * Zeitgefühl: Wie lange dauern Aufgaben wirklich – verglichen mit dem Plan?
 *
 * Jede Zeitbox, die mit „Erledigt“ endet, wird zu einer Messung { planned, actual } (Minuten).
 * Geplant zählt die ursprüngliche Länge (ohne ±5), tatsächlich nur die gelaufene Zeit (ohne Pausen).
 * Für eine Einschätzung wird vom Genauen zum Allgemeinen gesucht:
 *   1. dieselbe Aufgabe (gleiche Vorlage, wiederkehrende Aufgabe oder gleicher Titel)
 *   2. dieselbe Kategorie
 *   3. alle Messungen
 * Gesagt wird nur etwas, wenn es mindestens MIN_SAMPLES Messungen gibt und der Unterschied deutlich ist.
 */
import { dayKey } from './date.js';
import { activeTime } from './timebox.js';

export const MAX_SAMPLES = 50;
export const MIN_SAMPLES = 3;
/** Nur die letzten Messungen einer Gruppe zählen – Gewohnheiten ändern sich. */
const RECENT = 7;
/** Ab so viel Abweichung (25 %) und so vielen Minuten lohnt ein Hinweis. */
const MIN_RATIO_DIFF = 0.25;
const MIN_MINUTES_DIFF = 3;
/** Läuft eine Zeitbox mehr als viermal so lange, wurde sie wohl vergessen. */
const MAX_RATIO = 4;
const MIN_ACTUAL = 0.5;

/** Wiedererkennungs-Schlüssel: Vorlage, sonst wiederkehrende Aufgabe, sonst Titel. */
export function taskKey(task) {
  if (task.templateId) return `tpl:${task.templateId}`;
  if (task.repeat && task.repeat !== 'none') return `task:${task.id}`;
  return `title:${task.title.trim().toLowerCase()}`;
}

/** Messung aus einer beendeten Zeitbox – oder null, wenn sie nichts Verlässliches sagt. */
export function makeSample(task, timer, now = Date.now()) {
  const planned = (timer.baseMs || timer.plannedMs) / 60000;
  const actual = activeTime(timer, now) / 60000;
  if (!(planned > 0) || actual < MIN_ACTUAL || actual > planned * MAX_RATIO) return null;
  return {
    id: `${task.id}-${now}`,
    key: taskKey(task),
    cat: task.category,
    planned: Math.round(planned * 10) / 10,
    actual: Math.round(actual * 10) / 10,
    day: dayKey(new Date(now)),
  };
}

export function addSample(state, sample) {
  if (!sample) return state;
  return { ...state, timeLog: [...(state.timeLog || []), sample].slice(-MAX_SAMPLES) };
}

export function removeSample(state, id) {
  if (!id) return state;
  return { ...state, timeLog: (state.timeLog || []).filter((s) => s.id !== id) };
}

function median(values) {
  const v = [...values].sort((a, b) => a - b);
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

function roundToFive(minutes) {
  return Math.max(5, Math.round(minutes / 5) * 5);
}

/**
 * Einschätzung für eine Aufgabe mit geplanter Länge (Minuten):
 * null oder { scope: 'task' | 'category' | 'overall', ratio, suggested, longer }
 */
export function estimateFor(timeLog, task, plannedMinutes) {
  const log = timeLog || [];
  const key = taskKey(task);
  const groups = [
    ['task', log.filter((s) => s.key === key)],
    ['category', log.filter((s) => s.cat === task.category)],
    ['overall', log],
  ];
  const found = groups.find(([, samples]) => samples.length >= MIN_SAMPLES);
  if (!found || !(plannedMinutes > 0)) return null;
  const [scope, samples] = found;
  const ratio = median(samples.slice(-RECENT).map((s) => s.actual / s.planned));
  const suggested = roundToFive(plannedMinutes * ratio);
  if (Math.abs(ratio - 1) < MIN_RATIO_DIFF || Math.abs(suggested - plannedMinutes) < MIN_MINUTES_DIFF) return null;
  return { scope, ratio, suggested, longer: ratio > 1 };
}

/** Zeitpunkt einer Messung steckt am Ende ihrer id („aufgabe-1793181150156“). */
const sampleTime = (s) => Number(s.id.split('-').pop()) || 0;

/** Aufräumen und chronologisch sortieren (nach einem Abgleich kann die Reihenfolge gemischt sein). */
export function normalizeTimeLog(log) {
  if (!Array.isArray(log)) return [];
  return log
    .filter((s) => s && typeof s.id === 'string' && Number(s.planned) > 0 && Number(s.actual) > 0)
    .map((s) => ({ id: s.id, key: String(s.key || ''), cat: String(s.cat || ''), planned: Number(s.planned), actual: Number(s.actual), day: String(s.day || '') }))
    .sort((a, b) => sampleTime(a) - sampleTime(b))
    .slice(-MAX_SAMPLES);
}
