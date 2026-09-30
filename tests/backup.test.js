import { describe, expect, it } from 'vitest';
import { initialState } from '../src/lib/state.js';
import { completeTask } from '../src/lib/tasks.js';
import { createTimer } from '../src/lib/timebox.js';
import { BackupError, backupFileName, parseBackup, restoreBackup, serializeBackup, summarizeBackup } from '../src/lib/backup.js';

const reason = (fn) => {
  try {
    fn();
  } catch (e) {
    return e instanceof BackupError ? e.reason : 'other';
  }
  return 'none';
};

describe('Sicherung', () => {
  it('übersteht den Weg hin und zurück vollständig', () => {
    const state = completeTask({ ...initialState(), coins: 321 }, 'starter-1').state;
    const { state: back } = parseBackup(serializeBackup(state, Date.UTC(2026, 8, 30)));
    expect(back.coins).toBe(state.coins);
    expect(back.xp).toBe(state.xp);
    expect(back.tasks.map((t) => [t.id, t.done])).toEqual(state.tasks.map((t) => [t.id, t.done]));
  });

  it('lässt die laufende Zeitbox weg', () => {
    const state = { ...initialState(), timer: createTimer('starter-1', 5, 1000) };
    expect(JSON.parse(serializeBackup(state)).data.timer).toBe(undefined);
  });

  it('lehnt fremde oder kaputte Dateien ab', () => {
    expect(reason(() => parseBackup('kein json'))).toBe('invalid');
    expect(reason(() => parseBackup('{"app":"andere-app","format":1,"data":{}}'))).toBe('invalid');
    expect(reason(() => parseBackup('{"app":"purrgress","format":1}'))).toBe('invalid');
    expect(reason(() => parseBackup('null'))).toBe('invalid');
  });

  it('meldet Sicherungen aus neueren Versionen', () => {
    expect(reason(() => parseBackup('{"app":"purrgress","format":99,"data":{}}'))).toBe('newer');
  });

  it('ergänzt fehlende Felder aus älteren Sicherungen', () => {
    const { state } = parseBackup('{"app":"purrgress","format":1,"data":{"xp":42,"tasks":[]}}');
    expect(state.xp).toBe(42);
    expect(state.customTemplates).toEqual([]);
    expect(state.settings.dailyGoal).toBe(3);
  });

  it('behält beim Einspielen die Geräte-Einstellungen', () => {
    const current = { ...initialState(), settings: { ...initialState().settings, theme: 'dark', language: 'en', dailyGoal: 3 }, timer: createTimer('x', 5, 1) };
    const imported = { ...initialState(), xp: 99, settings: { ...initialState().settings, theme: 'light', language: 'de', dailyGoal: 6 } };
    const next = restoreBackup(current, imported);
    expect(next.xp).toBe(99);
    expect(next.settings.theme).toBe('dark');
    expect(next.settings.language).toBe('en');
    expect(next.settings.dailyGoal).toBe(6);
    expect(next.timer).toBeNull();
  });

  it('fasst eine Sicherung kurz zusammen und benennt die Datei mit Datum', () => {
    const s = completeTask(initialState(), 'starter-1').state;
    expect(summarizeBackup(s)).toEqual({ xp: s.xp, coins: s.coins, tasks: 4, done: 1 });
    expect(backupFileName(Date.UTC(2026, 8, 30, 12))).toBe('purrgress-backup-2026-09-30.json');
  });
});
