/**
 * Reine Funktionen für Aufgaben und Belohnungen.
 * Sie verändern nichts, sondern geben immer einen neuen Zustand zurück.
 */
import { DAILY_GOAL_BONUS, DIFF, LEVEL_BONUS_COINS, STEP_XP } from '../constants/game.js';
import { dayKey } from './date.js';
import { isCurrent, isDueToday } from './due.js';
import { levelInfo } from './progress.js';
import { withoutTimer } from './timebox.js';

/**
 * Wählt eine offene Aufgabe zufällig aus. Leichte Aufgaben kommen öfter dran,
 * Aufgaben der aktuellen Tageszeit (daypart) deutlich öfter, heute fällige etwas öfter.
 * Erst später fällige Aufgaben kommen nicht in Frage.
 */
export function pickTask(openTasks, excludeId, daypart = null, today = dayKey()) {
  const current = openTasks.filter((t) => isCurrent(t, today));
  const pool = current.length > 1 ? current.filter((t) => t.id !== excludeId) : current;
  if (pool.length === 0) return null;
  const byDifficulty = { leicht: 3, mittel: 2, schwer: 1 };
  const weight = (t) => (byDifficulty[t.difficulty] || 1)
    * (daypart && t.when === daypart ? 4 : 1)
    * (isDueToday(t, today) ? 2 : 1);
  const total = pool.reduce((s, t) => s + weight(t), 0);
  let r = Math.random() * total;
  for (const t of pool) {
    r -= weight(t);
    if (r <= 0) return t;
  }
  return pool[pool.length - 1];
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
  const goalBonus = doneToday >= (state.settings?.dailyGoal || 3) && state.goalBonusDay !== day ? DAILY_GOAL_BONUS : 0;
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
 * Neuer Tag für tägliche Aufgaben: Erledigte öffnen sich wieder, und alle sind heute fällig.
 * Wurde eine gestern nicht geschafft, rutscht nur ihr Datum weiter – es entsteht keine Kopie.
 */
export function reopenDailyTasks(state, today = dayKey()) {
  let changed = false;
  const tasks = state.tasks.map((t) => {
    if (t.repeat !== 'daily') return t;
    const reopen = t.done && t.doneDay !== today;
    if (!reopen && t.due === today) return t;
    changed = true;
    if (!reopen) return { ...t, due: today };
    return { ...t, due: today, done: false, doneDay: null, awarded: null, steps: t.steps.map((s) => ({ ...s, done: false, xp: 0, coins: 0 })) };
  });
  return changed ? { ...state, tasks } : state;
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

/** Entfernt erledigte Aufgaben. Tägliche bleiben, weil sie morgen wiederkommen. */
export function clearDoneTasks(state) {
  return { ...state, tasks: state.tasks.filter((t) => !(t.done && t.repeat !== 'daily')) };
}
