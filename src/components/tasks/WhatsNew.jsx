import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon.jsx';
import { btnPrimary, iconBtn } from '../ui/styles.js';
import { useI18n } from '../../i18n/useI18n.js';

const KEY = 'purrgress-news-seen';
const VERSION = '1.7.0';
const ICONS = ['calendar', 'later', 'sparkles', 'moon', 'repeat', 'timer'];

function seenVersion() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return VERSION; // ohne Speicher lieber gar nicht zeigen als bei jedem Start
  }
}

function markSeen() {
  try {
    localStorage.setItem(KEY, VERSION);
  } catch {
    /* ignorieren */
  }
}

/**
 * Einmalige Karte „Neu in 1.7“ – damit Neues nicht unangekündigt auftaucht.
 * Nur für Menschen, die die App schon kannten; wer neu startet, sieht sie nie.
 * Gilt pro Gerät.
 */
export function WhatsNew({ isReturning }) {
  const { t } = useI18n();
  const [seen, setSeen] = useState(() => seenVersion() === VERSION);

  useEffect(() => {
    if (!seen && !isReturning) {
      markSeen();
      setSeen(true);
    }
  }, [seen, isReturning]);

  if (seen || !isReturning) return null;

  const close = () => {
    markSeen();
    setSeen(true);
  };

  return (
    <section aria-labelledby="news-title" className="anim-fade rounded-3xl bg-violet-50 p-4 ring-1 ring-violet-900/5 dark:bg-violet-400/10 dark:ring-white/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id="news-title" className="font-display text-lg font-semibold text-violet-950 dark:text-violet-50">{t('news.title')}</h3>
          <p className="text-sm text-violet-900/80 dark:text-violet-100/80">{t('news.intro')}</p>
        </div>
        <button type="button" className={iconBtn} onClick={close} aria-label={t('common.close')}><Icon name="x" size={16} /></button>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
        {t('news.items').map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Icon name={ICONS[i] || 'sparkles'} size={16} className="mt-0.5 shrink-0 text-violet-500 dark:text-violet-300" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-violet-900/70 dark:text-violet-100/70">{t('news.settingsHint')}</p>
      <button type="button" className={`${btnPrimary} mt-3 py-2 text-sm`} onClick={close}>{t('news.ok')}</button>
    </section>
  );
}
