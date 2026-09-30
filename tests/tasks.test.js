import { describe, expect, it } from 'vitest';
import { DAILY_GOAL_BONUS, DIFF, LEVEL_BONUS_COINS, STEP_XP } from '../src/constants/game.js';
import { dayKey } from '../src/lib/date.js';
import { initialState, normalizeTask } from '../src/lib/state.js';
import {
  clearDoneTasks, completeStep, completeTask, moveToEnd, nextOpenTask, removeTask, reopenDailyTasks, reopenStep, reopenTask,
} from '../src/lib/tasks.js';
import { createTimer } from '../src/lib/timebox.js';

function stateWith(tasks, extra = {}) {
  return { ...initialState(), tasks: tasks.map(normalizeTask), ...extra };
}

describe('Aufgaben', () => {
  it('belohnt das Abhaken nach Schwierigkeit und kann es vollständig zurücknehmen', () => {
    const start = stateWith([{ id: 'a', title: 'A', difficulty: 'mittel', category: 'fokus' }]);
    const { state, reward } = completeTask(start, 'a');
    expect(reward.xp).toBe(DIFF.mittel.xp);
    expect(state.xp).toBe(start.xp + DIFF.mittel.xp);
    expect(state.coins).toBe(start.coins + DIFF.mittel.coins);
    expect(state.stats.fokus).toBe(DIFF.mittel.pts);
    expect(state.history[dayKey()]).toBe(1);

    const back = reopenTask(state, 'a');
    expect(back.xp).toBe(start.xp);
    expect(back.coins).toBe(start.coins);
    expect(back.stats.fokus).toBe(0);
    expect(back.tasks[0].done).toBe(false);
  });

  it('gibt beim Level-Up Bonus-Münzen', () => {
    const start = stateWith([{ id: 'a', title: 'A', difficulty: 'schwer' }], { xp: 90 });
    const { state, reward } = completeTask(start, 'a');
    expect(reward.gained).toBe(1);
    expect(state.coins).toBe(start.coins + DIFF.schwer.coins + LEVEL_BONUS_COINS);
  });

  it('beendet eine laufende Zeitbox, wenn ihre Aufgabe erledigt wird', () => {
    const start = stateWith([{ id: 'a', title: 'A' }], { timer: createTimer('a', 5, Date.now()) });
    expect(completeTask(start, 'a').state.timer).toBeNull();
  });

  it('belohnt Mikro-Schritte und nimmt sie wieder zurück', () => {
    const start = stateWith([{ id: 'a', title: 'A', steps: ['eins'] }]);
    const stepId = start.tasks[0].steps[0].id;
    const { state } = completeStep(start, 'a', stepId);
    expect(state.xp).toBe(start.xp + STEP_XP);
    expect(reopenStep(state, 'a', stepId).xp).toBe(start.xp);
  });

  it('öffnet tägliche Aufgaben am nächsten Tag wieder', () => {
    const start = stateWith([{ id: 'a', title: 'A', repeat: 'daily', done: true, doneDay: '2000-01-01', steps: ['x'] }]);
    start.tasks[0].steps[0].done = true;
    const next = reopenDailyTasks(start, '2000-01-02');
    expect(next.tasks[0].done).toBe(false);
    expect(next.tasks[0].steps[0].done).toBe(false);
    expect(reopenDailyTasks(next, '2000-01-02')).toBe(next);
  });

  it('legt Aufgaben ans Ende und findet die nächste offene', () => {
    const start = stateWith([{ id: 'a', title: 'A' }, { id: 'b', title: 'B', done: true }, { id: 'c', title: 'C' }]);
    expect(moveToEnd(start, 'a').tasks.map((t) => t.id)).toEqual(['b', 'c', 'a']);
    expect(nextOpenTask(start.tasks, 'a').id).toBe('c');
    expect(nextOpenTask(start.tasks, 'c').id).toBe('a');
  });

  it('räumt beim Löschen die Zeitbox auf und behält tägliche Aufgaben beim Aufräumen', () => {
    const start = stateWith(
      [{ id: 'a', title: 'A' }, { id: 'b', title: 'B', done: true }, { id: 'c', title: 'C', done: true, repeat: 'daily' }],
      { timer: createTimer('a', 5, Date.now()) },
    );
    const removed = removeTask(start, 'a');
    expect(removed.timer).toBeNull();
    expect(clearDoneTasks(removed).tasks.map((t) => t.id)).toEqual(['c']);
  });
});

describe('Tagesziel-Bonus', () => {
  const goalState = () => stateWith(
    [{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }, { id: 'c', title: 'C' }],
    { settings: { ...initialState().settings, dailyGoal: 2 } },
  );

  it('gibt den Bonus einmal, sobald das Tagesziel erreicht ist', () => {
    let s = goalState();
    const start = s.coins;
    s = completeTask(s, 'a').state;
    expect(s.coins).toBe(start + DIFF.leicht.coins);
    const second = completeTask(s, 'b');
    expect(second.reward.goalBonus).toBe(DAILY_GOAL_BONUS);
    s = second.state;
    expect(s.coins).toBe(start + 2 * DIFF.leicht.coins + DAILY_GOAL_BONUS);
    const third = completeTask(s, 'c');
    expect(third.reward.goalBonus).toBe(0);
  });

  it('nimmt den Bonus beim Rückgängigmachen zurück und erlaubt ihn danach erneut', () => {
    let s = completeTask(completeTask(goalState(), 'a').state, 'b').state;
    const withBonus = s.coins;
    s = reopenTask(s, 'b');
    expect(s.coins).toBe(withBonus - DIFF.leicht.coins - DAILY_GOAL_BONUS);
    expect(s.goalBonusDay).toBeNull();
    expect(completeTask(s, 'b').reward.goalBonus).toBe(DAILY_GOAL_BONUS);
  });
});

describe('Münz-Balance', () => {
  it('belohnt schwere Aufgaben, aber nicht übermäßig', () => {
    expect(DIFF.schwer.coins / DIFF.leicht.coins <= 5).toBe(true);
  });
});
