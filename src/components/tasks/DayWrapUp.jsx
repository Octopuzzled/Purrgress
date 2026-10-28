import { useState } from 'react';
import { WRAP_UP_FROM } from '../../constants/dayparts.js';
import { leftoverTasks } from '../../lib/tasks.js';
import { Icon } from '../ui/Icon.jsx';
import { btnSoft, iconBtn } from '../ui/styles.js';
import { useI18n } from '../../i18n/useI18n.js';

const KEY = 'purrgress-wrapup-hidden';
const MAX_TITLES = 4;

function hiddenDay() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/**
 * Tagesabschluss am Abend: zeigt, was geschafft ist – nicht, was fehlt.
 * Liegengebliebenes mit Datum lässt sich mit einem Tipp auf morgen legen.
 * Ausblenden gilt bis morgen und nur für dieses Gerät.
 */
export function DayWrapUp({ tasks, today, now, doneCount, restToday, onRest, onMoveToTomorrow }) {
  const { t } = useI18n();
  const [hidden, setHidden] = useState(hiddenDay);
  const leftover = leftoverTasks(tasks, today);
  const doneTitles = tasks.filter((x) => x.done && x.doneDay === today).map((x) => x.title);

  if (new Date(now).getHours() < WRAP_UP_FROM || hidden === today) return null;
  // Ein ruhiger Tag ohne Offenes braucht keinen Abschluss mehr
  if (doneCount === 0 && leftover.length === 0 && restToday) return null;

  const hide = () => {
    setHidden(today);
    try {
      localStorage.setItem(KEY, today);
    } catch {
      /* ohne Speicher bleibt es bis zum Neuladen ausgeblendet */
    }
  };
  const more = doneCount - Math.min(doneTitles.length, MAX_TITLES);

  return (
    <section aria-labelledby="wrapup-title" className="anim-fade rounded-3xl bg-indigo-50 p-4 ring-1 ring-indigo-900/5 dark:bg-indigo-400/10 dark:ring-white/5">
      <div className="flex items-start gap-3">
        <Icon name="moon" size={20} className="mt-0.5 shrink-0 text-indigo-500 dark:text-indigo-300" />
        <div className="min-w-0 flex-1">
          <h3 id="wrapup-title" className="font-display text-lg font-semibold text-indigo-950 dark:text-indigo-50">{t('wrapUp.title')}</h3>
          <p className="text-sm text-indigo-900/80 dark:text-indigo-100/80">
            {doneCount > 0 ? t('wrapUp.done', { count: doneCount }) : restToday ? t('rest.line') : t('wrapUp.nothing')}
          </p>
          {doneTitles.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5 text-xs font-bold">
              {doneTitles.slice(0, MAX_TITLES).map((title, i) => (
                <li key={i} className="inline-flex max-w-full items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-emerald-800 dark:bg-white/10 dark:text-emerald-200">
                  <Icon name="check" size={12} strokeWidth={3} className="shrink-0" /><span className="truncate">{title}</span>
                </li>
              ))}
              {more > 0 && <li className="px-1 py-0.5 text-indigo-900/60 dark:text-indigo-100/60">{t('wrapUp.more', { count: more })}</li>}
            </ul>
          )}
          {doneCount === 0 && !restToday && (
            <button type="button" className={`${btnSoft} mt-3 py-2 text-sm`} onClick={() => onRest(true)}>
              <Icon name="moon" size={16} />{t('wrapUp.rest')}
            </button>
          )}
          {leftover.length > 0 && (
            <div className="mt-3">
              <button type="button" className={`${btnSoft} py-2 text-sm`} onClick={() => onMoveToTomorrow(leftover.map((x) => x.id))}>
                <Icon name="later" size={16} />{t('wrapUp.move', { count: leftover.length })}
              </button>
              <p className="mt-1.5 text-xs text-indigo-900/70 dark:text-indigo-100/70">{t('wrapUp.moveHint')}</p>
            </div>
          )}
        </div>
        <button type="button" className={iconBtn} onClick={hide} aria-label={t('wrapUp.hide')} title={t('wrapUp.hide')}><Icon name="x" size={16} /></button>
      </div>
    </section>
  );
}
