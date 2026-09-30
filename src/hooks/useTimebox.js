import { useEffect, useRef, useState } from 'react';
import { APP_NAME } from '../constants/game.js';
import { QUICK_MINUTES } from '../constants/timebox.js';
import { getAudio, playSound, startNoise, stopNoise } from '../lib/audio.js';
import { fmtTimer } from '../lib/format.js';
import { moveToEnd } from '../lib/tasks.js';
import {
  adjustedTimer, closeSegment, createTimer, pausedTimer, resumedTimer, timerLeft, withoutTimer,
} from '../lib/timebox.js';

const APP_TITLE = APP_NAME;

/**
 * Zeitbox à la Llama Life: Start, Pause, ±5 Minuten, Später, Beenden,
 * Tab-Titel mit Restzeit, Ende-Signal, Erinnerungs-Klang und braunes Rauschen.
 */
export function useTimebox({ state, setState, settings, onTimeUp }) {
  const timer = state.timer;
  const task = timer ? state.tasks.find((t) => t.id === timer.taskId && !t.done) || null : null;
  const [noiseOn, setNoiseOn] = useState(false);
  const chimeRef = useRef({ key: null, idx: 0 });
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const timeUpRef = useRef(onTimeUp);
  timeUpRef.current = onTimeUp;

  /* Tab-Titel, Ende-Signal und Erinnerungs-Klang */
  useEffect(() => {
    if (!timer || !task) {
      document.title = APP_TITLE;
      return undefined;
    }
    const tick = () => {
      const left = timerLeft(timer, Date.now());
      document.title = `${timer.running ? '' : '⏸ '}${fmtTimer(left)} · ${task.title}`;
      if (!timer.running) return;

      if (left <= 0 && !timer.notified) {
        if (settingsRef.current.sound) playSound('timer');
        setState((s) => (s.timer && s.timer.startedAt === timer.startedAt ? { ...s, timer: { ...s.timer, notified: true } } : s));
        if (timeUpRef.current) timeUpRef.current();
      }

      const every = Number(settingsRef.current.chimeEvery) || 0;
      if (every > 0 && left > 0) {
        const idx = Math.floor((timer.plannedMs - left) / (every * 60000));
        if (chimeRef.current.key !== timer.startedAt) {
          chimeRef.current = { key: timer.startedAt, idx };
        } else if (idx > chimeRef.current.idx) {
          chimeRef.current.idx = idx;
          if (settingsRef.current.sound) playSound('chime');
        }
      }
    };
    tick();
    const iv = setInterval(tick, 500);
    return () => clearInterval(iv);
  }, [timer, task, setState]);

  /* Verwaiste Zeitbox aufräumen (Aufgabe gelöscht oder anderweitig erledigt) */
  useEffect(() => {
    if (timer && !task) setState((s) => ({ ...s, timer: null }));
  }, [timer, task, setState]);

  /* Braunes Rauschen nur, solange die Zeitbox läuft */
  const running = !!(timer && timer.running);
  useEffect(() => {
    if (noiseOn && running) startNoise();
    else stopNoise();
  }, [noiseOn, running]);
  useEffect(() => {
    if (!timer) setNoiseOn(false);
  }, [timer]);
  useEffect(() => () => stopNoise(), []);

  const update = (fn) => {
    const now = Date.now();
    setState((s) => (s.timer ? fn(s, now) : s));
  };

  return {
    timer: task ? timer : null,
    task,
    noiseOn,
    /** Startet eine Zeitbox. Gibt false zurück, wenn die Aufgabe nicht (mehr) offen ist. */
    start(taskId, minutes) {
      const t = state.tasks.find((x) => x.id === taskId && !x.done);
      if (!t) return false;
      const mins = minutes || t.minutes || QUICK_MINUTES;
      const now = Date.now();
      getAudio(); // Ton freischalten, solange ein Klick da ist
      setState((s) => ({ ...closeSegment(s, now), timer: createTimer(taskId, mins, now) }));
      return true;
    },
    pause: () => update((s, now) => (s.timer.running ? { ...closeSegment(s, now), timer: pausedTimer(s.timer, now) } : s)),
    resume: () => {
      getAudio();
      update((s, now) => (s.timer.running ? s : { ...s, timer: resumedTimer(s.timer, now) }));
    },
    adjust: (deltaMinutes) => update((s, now) => ({ ...s, timer: adjustedTimer(s.timer, deltaMinutes, now) })),
    stop: () => update((s, now) => withoutTimer(s, now)),
    later: () => update((s, now) => moveToEnd(withoutTimer(s, now), s.timer.taskId)),
    toggleNoise: () => {
      getAudio();
      setNoiseOn((n) => !n);
    },
  };
}
