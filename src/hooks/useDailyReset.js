import { useEffect } from 'react';
import { reopenDailyTasks } from '../lib/tasks.js';

/** Öffnet tägliche Aufgaben am neuen Tag wieder – beim Start, jede Minute und beim Zurückkehren zur App. */
export function useDailyReset(setState) {
  useEffect(() => {
    const run = () => setState((s) => reopenDailyTasks(s));
    run();
    const iv = setInterval(run, 60000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') run();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [setState]);
}
