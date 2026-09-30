import { useContext } from 'react';
import { I18nContext } from './I18nContext.js';

/**
 * Zugriff auf die aktuelle Sprache in Komponenten:
 * const { t, duration, clock, lang } = useI18n();
 */
export function useI18n() {
  return useContext(I18nContext);
}
