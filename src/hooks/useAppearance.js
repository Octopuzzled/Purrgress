import { useEffect, useState } from 'react';
import { systemPrefersDark } from '../lib/media.js';

/**
 * Setzt Farbschema und „Ruhige Animationen“ als Klassen auf <html>.
 * Gibt zurück, ob gerade das dunkle Schema aktiv ist.
 */
export function useAppearance({ theme, reduceMotion }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && systemPrefersDark());
      root.classList.toggle('dark', dark);
      root.classList.toggle('light', !dark);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', dark ? '#1e2433' : '#fff9f5');
      setIsDark(dark);
    };
    apply();
    let mq = null;
    try {
      mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
    } catch {
      mq = null;
    }
    return () => {
      if (mq) mq.removeEventListener('change', apply);
    };
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', !!reduceMotion);
  }, [reduceMotion]);

  return isDark;
}
