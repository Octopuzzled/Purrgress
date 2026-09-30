import { useEffect, useMemo } from 'react';
import { createI18n, resolveLanguage } from '../i18n/index.js';

/**
 * Löst die Spracheinstellung auf ('system' folgt dem Gerät), baut die Übersetzungshelfer
 * und hält <html lang> aktuell – wichtig für Screenreader und Silbentrennung.
 */
export function useLanguage(setting) {
  const lang = resolveLanguage(setting);
  const i18n = useMemo(() => createI18n(lang), [lang]);

  useEffect(() => {
    document.documentElement.lang = i18n.lang;
  }, [i18n.lang]);

  return i18n;
}
