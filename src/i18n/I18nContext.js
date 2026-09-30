import { createContext } from 'react';
import { createI18n } from './index.js';

/** Stellt t(), duration() und clock() für alle Komponenten bereit. Standard: Deutsch. */
export const I18nContext = createContext(createI18n('de'));
