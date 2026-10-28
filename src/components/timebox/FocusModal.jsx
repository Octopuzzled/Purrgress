import { useState } from 'react';
import { CATS, DIFF } from '../../constants/game.js';
import { QUICK_MINUTES } from '../../constants/timebox.js';
import { pickTask } from '../../lib/tasks.js';
import { TimePicker } from './TimePicker.jsx';
import { Coin } from '../ui/Coin.jsx';
import { Icon } from '../ui/Icon.jsx';
import { Modal } from '../ui/Modal.jsx';
import { btnPrimary, btnSoft, focusRing, iconBtn, sheet } from '../ui/styles.js';
import { useI18n } from '../../i18n/useI18n.js';
import { currentDaypart } from '../../lib/dayparts.js';
import { isCurrent } from '../../lib/due.js';

export function FocusModal({ tasks, onClose, onComplete, onToggleStep, onGoLibrary, onStart }) {
  const { t, duration } = useI18n();
  // Erst später fällige Aufgaben bleiben hier außen vor
  const openTasks = tasks.filter((t) => !t.done && isCurrent(t));
  const [currentId, setCurrentId] = useState(() => { const p = pickTask(openTasks, null, currentDaypart()); return p ? p.id : null; });
  const current = openTasks.find((t) => t.id === currentId) || null;

  const [picking, setPicking] = useState(false);
  const other = () => {
    const p = pickTask(openTasks, currentId, currentDaypart());
    if (p) { setCurrentId(p.id); setPicking(false); }
  };

  const nextStep = current ? current.steps.find((s) => !s.done) : null;
  const mins = current ? current.minutes || QUICK_MINUTES : QUICK_MINUTES;

  return (
    <Modal onClose={onClose} labelledBy="focus-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="focus-title" className="font-display text-2xl font-semibold text-slate-800 dark:text-slate-50">{t('focus.title')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('focus.subtitle')}</p>
        </div>
        <button type="button" className={iconBtn} onClick={onClose} aria-label={t('common.close')}><Icon name="x" /></button>
      </div>

      {current ? (
        <div className="mt-5 space-y-4">
          <div className={`${sheet} p-4`}>
            <p className="font-display text-xl font-semibold leading-snug text-slate-800 dark:text-slate-50">{current.title}</p>
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-bold">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${CATS[current.category].chip}`}><Icon name={CATS[current.category].icon} size={12} />{t(`category.${current.category}.label`)}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-700 dark:text-slate-300">{t('common.xpGain', { xp: DIFF[current.difficulty].xp })}, <Coin size={12} />{DIFF[current.difficulty].coins}</span>
            </div>
            {current.desc && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{current.desc}</p>}
            {nextStep && (
              <button type="button" onClick={(e) => onToggleStep(current.id, nextStep.id, e)}
                className={`mt-3 flex w-full items-center gap-3 rounded-2xl bg-amber-50 p-3 text-left hover:bg-amber-100 dark:bg-amber-400/10 dark:hover:bg-amber-400/20 ${focusRing}`}>
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 border-amber-300 text-transparent"><Icon name="check" size={14} strokeWidth={3.5} /></span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-amber-800 dark:text-amber-200">{t('focus.nextStep')}</span>
                  <span className="block font-semibold text-slate-800 dark:text-slate-100">{nextStep.text}</span>
                </span>
              </button>
            )}
          </div>

          <div className="rounded-2xl bg-violet-50 p-4 dark:bg-violet-400/10">
            <p className="flex items-center gap-1.5 text-sm font-bold text-violet-900 dark:text-violet-100">
              <Icon name="timer" size={16} />{current.minutes ? t('focus.timebox', { duration: duration(current.minutes) }) : t('focus.quickRule')}
            </p>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
              {t(current.minutes ? 'focus.timeboxHint' : 'focus.quickHint')}
            </p>
            {picking ? (
              <div className="mt-3">
                <TimePicker key={current.id} initial={mins} onStart={(m) => onStart(current.id, m)} onCancel={() => setPicking(false)} />
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" data-autofocus className={btnPrimary} onClick={() => onStart(current.id, mins)}>
                  <Icon name="play" size={16} />{t('focus.start', { duration: duration(mins) })}
                </button>
                <button type="button" className={btnSoft} onClick={() => setPicking(true)}>
                  <Icon name="timer" size={16} />{t('focus.otherTime')}
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button type="button" className={`${btnSoft} flex-1`} onClick={other} disabled={openTasks.length < 2}>{t('focus.otherTask')}</button>
            <button type="button" className={`${btnSoft} flex-1`} onClick={(e) => onComplete(current.id, e)}>
              <Icon name="check" size={18} strokeWidth={3} className="text-emerald-500" />{t('focus.alreadyDone')}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 text-center">
          <p className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">{t('focus.emptyTitle')}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('focus.emptyText')}</p>
          <button type="button" data-autofocus className={`${btnPrimary} mt-4`} onClick={onGoLibrary}><Icon name="book" size={18} />{t('tasks.browseTemplates')}</button>
        </div>
      )}
    </Modal>
  );
}
