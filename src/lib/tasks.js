/**
 * Reine Funktionen für Aufgaben und Belohnungen.
 * Sie verändern nichts, sondern geben immer einen neuen Zustand zurück.
 */
import { DAILY_GOAL_BONUS, DIFF, LEVEL_BONUS_COINS, STEP_XP } from '../constants/game.js';
import { addDays, dayKey } from './date.js';
import { isCurrent, isDueToday } from './due.js';
import { dailyGoalFor, energyWeight } from './energy.js';
import { latestOccurrence, nextOccurrence } from './repeat.js';
import { levelInfo } from './progress.js';
import { uid } from './id.js';
import { withoutTimer } from './timebox.js';

/** Ab wie vielen Tagen Warten eine Aufgabe „Zu groß?“ anbietet. */
export const STUCK_DAYS = 3;

/**
 * Wählt eine offene Aufgabe zufällig aus. Die Tagesform (energy) bestimmt, wie oft leichte
 * oder schwere drankommen – bei wenig Kraft nur leichte, solange es welche gibt.
 * Aufgaben der aktuellen Tageszeit (daypart) kommen deutlich öfter, heute fällige etwas öfter.
 * Erst später fällige Aufgaben kommen nicht in Frage.
 */
export function pickTask(openTasks, excludeId, { daypart = null, today = dayKey(), energy = null } = {}) {
  const current = openTasks.filter((t) => isCurrent(t, today));
  const pool = current.length > 1 ? current.filter((t) => t.id !== excludeId) : current;
  if (pool.length === 0) return null;
  const fits = pool.some((t) => energyWeight(t.difficulty, energy) > 0);
  const weight = (t) => energyWeight(t.difficulty, fits ? energy : null)
    * (daypart && t.when === daypart ? 4 : 1)
    * (isDueToday(t, today) ? 2 : 1);
  const total = pool.reduce((s, t) => s + weight(t), 0);
  let r = Math.random() * total;
  for (const t of pool) {
    const w = weight(t);
    r -= w;
    if (w > 0 && r <= 0) return t;
  }
  return [...pool].reverse().find((t) => weight(t) > 0) || pool[pool.length - 1];
}

/** Berechnet XP-Gewinn inklusive Level-Up-Bonus. */
export function rewardFor(currentXp, xp) {
  const before = levelInfo(currentXp).level;
  const after = levelInfo(currentXp + xp).level;
  const gained = after - before;
  return { gained, level: after, bonus: gained * LEVEL_BONUS_COINS };
}

/**
 * Hakt eine Aufgabe ab. Gibt den neuen Zustand und die Belohnung zurück.
 * Wird damit das Tagesziel erreicht, gibt es einmal pro Tag den Tagesziel-Bonus.
 */
export function completeTask(state, id, now = Date.now()) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task || task.done) return { state, reward: null };
  const r = DIFF[task.difficulty];
  const lv = rewardFor(state.xp, r.xp);
  const day = dayKey();
  const doneToday = (state.history[day] || 0) + 1;
  const goalBonus = doneToday >= dailyGoalFor(state, day) && state.goalBonusDay !== day ? DAILY_GOAL_BONUS : 0;
  const awarded = { xp: r.xp, coins: r.coins + lv.bonus + goalBonus, pts: r.pts, goalBonus };
  const base = state.timer && state.timer.taskId === id ? withoutTimer(state, now) : state;
  return {
    state: {
      ...base,
      xp: base.xp + r.xp,
      coins: base.coins + awarded.coins,
      stats: { ...base.stats, [task.category]: (base.stats[task.category] || 0) + r.pts },
      history: { ...base.history, [day]: doneToday },
      goalBonusDay: goalBonus ? day : base.goalBonusDay || null,
      tasks: base.tasks.map((t) => (t.id === id ? { ...t, done: true, doneDay: day, awarded } : t)),
    },
    reward: { xp: r.xp, coins: r.coins, goalBonus, ...lv },
  };
}

/** Öffnet eine erledigte Aufgabe wieder und nimmt die Belohnung zurück. */
export function reopenTask(state, id) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task || !task.done) return state;
  const a = task.awarded || { xp: 0, coins: 0, pts: 0 };
  const day = task.doneDay;
  return {
    ...state,
    xp: Math.max(0, state.xp - a.xp),
    coins: Math.max(0, state.coins - a.coins),
    stats: { ...state.stats, [task.category]: Math.max(0, (state.stats[task.category] || 0) - a.pts) },
    history: day ? { ...state.history, [day]: Math.max(0, (state.history[day] || 0) - 1) } : state.history,
    // Kam der Tagesziel-Bonus mit dieser Aufgabe, darf er heute erneut verdient werden
    goalBonusDay: a.goalBonus && state.goalBonusDay === day ? null : state.goalBonusDay || null,
    tasks: state.tasks.map((t) => (t.id === id ? { ...t, done: false, doneDay: null, awarded: null } : t)),
  };
}

function mapStep(state, taskId, stepId, fn) {
  return {
    ...state,
    tasks: state.tasks.map((t) => (t.id !== taskId ? t : { ...t, steps: t.steps.map((s) => (s.id === stepId ? fn(s) : s)) })),
  };
}

/** Hakt einen Mikro-Schritt ab (+STEP_XP). */
export function completeStep(state, taskId, stepId) {
  const lv = rewardFor(state.xp, STEP_XP);
  const next = mapStep(state, taskId, stepId, (s) => ({ ...s, done: true, xp: STEP_XP, coins: lv.bonus }));
  return {
    state: { ...next, xp: state.xp + STEP_XP, coins: state.coins + lv.bonus },
    reward: { xp: STEP_XP, ...lv },
  };
}

/** Öffnet einen Mikro-Schritt wieder und nimmt seine Belohnung zurück. */
export function reopenStep(state, taskId, stepId) {
  const task = state.tasks.find((t) => t.id === taskId);
  const step = task && task.steps.find((s) => s.id === stepId);
  if (!step) return state;
  const next = mapStep(state, taskId, stepId, (s) => ({ ...s, done: false, xp: 0, coins: 0 }));
  return { ...next, xp: Math.max(0, state.xp - (step.xp || 0)), coins: Math.max(0, state.coins - (step.coins || 0)) };
}

/**
 * Neuer Tag für wiederkehrende Aufgaben (täglich oder an Wochentagen):
 * - Erledigte öffnen sich am nächsten Tag wieder, fällig am nächsten Termin.
 *   Wer früher dran war (Müll schon am Montag raus), hat den anstehenden Termin damit erledigt.
 * - Nicht geschaffte bleiben überfällig, bis ihr nächster Termin da ist – dann rutscht nur
 *   das Datum weiter. Es entsteht nie eine Kopie. Bei täglichen ist das jeden Tag.
 * - Mit „Nicht heute“ auf später gelegte warten bis zu ihrem Tag.
 */
export function rollRepeatingTasks(state, today = dayKey()) {
  let changed = false;
  const tasks = state.tasks.map((t) => {
    if (t.repeat === 'none') return t;
    if (t.done) {
      if (t.doneDay === today) return t;
      const after = t.repeat === 'daily' || !t.due || t.due < today ? today : addDays(t.due, 1);
      changed = true;
      return {
        ...t, due: nextOccurrence(t, after), done: false, doneDay: null, awarded: null,
        steps: t.steps.map((s) => ({ ...s, done: false, xp: 0, coins: 0 })),
      };
    }
    if (t.due && t.due >= today) return t;
    const latest = latestOccurrence(t, today);
    const due = !t.due ? nextOccurrence(t, today) : latest > t.due ? latest : t.due;
    if (due === t.due) return t;
    changed = true;
    return { ...t, due };
  });
  return changed ? { ...state, tasks } : state;
}

/** Setzt Fälligkeiten neu: dueById = { [id]: 'YYYY-MM-DD' | null } */
export function setDueDates(state, dueById) {
  return { ...state, tasks: state.tasks.map((t) => (t.id in dueById ? { ...t, due: dueById[t.id] } : t)) };
}

/** „Nicht heute“: Die Aufgabe ist morgen wieder dran – auch eine tägliche. */
export function postponeTask(state, id, today = dayKey()) {
  return setDueDates(state, { [id]: addDays(today, 1) });
}

/**
 * Was heute fällig war und offen blieb (ohne tägliche – die kommen von selbst wieder).
 * Aufgaben ohne Datum gehören zu keinem Tag und bleiben, wo sie sind.
 */
export function leftoverTasks(tasks, today = dayKey()) {
  return tasks.filter((t) => !t.done && t.repeat !== 'daily' && t.due && t.due <= today);
}

/**
 * Hängt eine Aufgabe fest? Sie wartet schon eine Weile (oder ist überfällig)
 * und hat keinen offenen Mikro-Schritt, an dem man einfach anfangen könnte.
 */
export function isStuck(task, today = dayKey(), now = Date.now()) {
  // Wiederkehrende sind Routine – da stört die Frage nur
  if (task.done || task.repeat !== 'none' || task.steps.some((s) => !s.done)) return false;
  return (!!task.due && task.due < today) || now - (task.createdAt || now) >= STUCK_DAYS * 86400000;
}

/** „Zu groß?“: Der allerkleinste erste Schritt kommt ganz nach vorn. */
export function addFirstStep(state, taskId, text) {
  const step = { id: uid(), text: String(text).trim(), done: false, xp: 0, coins: 0 };
  if (!step.text) return state;
  return { ...state, tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, steps: [step, ...t.steps] } : t)) };
}

/** Legt eine Aufgabe ans Ende der Liste („Später“). */
export function moveToEnd(state, id) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return state;
  return { ...state, tasks: [...state.tasks.filter((t) => t.id !== id), task] };
}

/** Nächste offene, heute sichtbare Aufgabe nach der angegebenen (für „Weiter mit …“). */
export function nextOpenTask(tasks, afterId, today = dayKey()) {
  const idx = tasks.findIndex((t) => t.id === afterId);
  const open = (t) => !t.done && isCurrent(t, today);
  return tasks.slice(idx + 1).find(open) || tasks.find((t) => open(t) && t.id !== afterId) || null;
}

export function addTask(state, task) {
  return { ...state, tasks: [task, ...state.tasks] };
}

export function updateTask(state, id, fields) {
  return { ...state, tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...fields } : t)) };
}

/** Löscht eine Aufgabe. Läuft gerade ihre Zeitbox, wird diese sauber beendet. */
export function removeTask(state, id, now = Date.now()) {
  const base = state.timer && state.timer.taskId === id ? withoutTimer(state, now) : state;
  return { ...base, tasks: base.tasks.filter((t) => t.id !== id) };
}

/** Entfernt erledigte Aufgaben. Wiederkehrende bleiben, weil sie wiederkommen. */
export function clearDoneTasks(state) {
  return { ...state, tasks: state.tasks.filter((t) => !(t.done && t.repeat === 'none')) };
}
