import { useState } from 'react';
import { CATS, CAT_ORDER } from '../constants/game.js';
import { useNow } from '../hooks/useNow.js';
import { useCollapsed } from '../hooks/useCollapsed.js';
import { groupByDaypart, usesDayparts } from '../lib/dayparts.js';
import { timerLeft } from '../lib/timebox.js';
import { DaypartSection } from '../components/tasks/DaypartSection.jsx';
import { TaskRow } from '../components/tasks/TaskRow.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { btnPrimary, btnSoft, focusRing, iconBtn, inputCls, pill, sheet } from '../components/ui/styles.js';
import { useI18n } from '../i18n/useI18n.js';

export function TasksView({ tasks, timer, onToggle, onToggleStep, onEdit, onDelete, onNew, onFocus, onClearDone, onGoLibrary, onStart, onOpenTimer }) {
  const { t, duration, clock } = useI18n();
  const now = useNow(timer && timer.running ? 15000 : 30000);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('alle');
  const [showDone, setShowDone] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const sections = useCollapsed();

  const q = query.trim().toLowerCase();
  const matches = (t) => (cat === 'alle' || t.category === cat)
    && (!q || t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q));
  const openTasks = tasks.filter((t) => !t.done && matches(t));
  const doneTasks = tasks.filter((t) => t.done && matches(t));
  const totalOpen = tasks.filter((t) => !t.done).length;
  const filtering = q || cat !== 'alle';
  const clearable = tasks.filter((t) => t.done && t.repeat !== 'daily').length;

  // Abschnitte nach Tageszeit nur, wenn wirklich eine Aufgabe eine feste Tageszeit hat
  const grouped = usesDayparts(tasks);

  const rowProps = { onToggle, onToggleStep, onEdit, onDelete, onStart, onOpenTimer, activeId: timer ? timer.taskId : null };

  /* Listenzeit: Summe aller Zeitboxen der offenen Aufgaben + voraussichtliches Ende */
  const planMs = tasks.reduce((sum, t) => {
    if (t.done) return sum;
    if (timer && timer.taskId === t.id) return sum + Math.max(0, timerLeft(timer, now));
    return sum + (t.minutes || 0) * 60000;
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-slate-800 dark:text-slate-50">{t('tasks.heading')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('tasks.open', { count: totalOpen })}
          </p>
          {planMs > 0 && (
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Icon name="timer" size={15} className="text-violet-400" />
              <span>{t('tasks.plan', { duration: duration(Math.ceil(planMs / 60000)), time: clock(now + planMs) })}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" className={btnSoft} onClick={onFocus}><Icon name="wand" size={18} />{t('tasks.whatNow')}</button>
          <button type="button" className={btnPrimary} onClick={onNew}><Icon name="plus" size={18} strokeWidth={2.5} />{t('tasks.new')}</button>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="relative">
          <Icon name="search" size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('tasks.search')} aria-label={t('tasks.search')} className={`${inputCls} pl-10 pr-10`} />
          {query && (
            <button type="button" onClick={() => setQuery('')} className={`${iconBtn} absolute right-1 top-1/2 -translate-y-1/2`} aria-label={t('tasks.clearSearch')}><Icon name="x" size={16} /></button>
          )}
        </div>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label={t('tasks.filterLabel')}>
          <button type="button" className={pill(cat === 'alle')} aria-pressed={cat === 'alle'} onClick={() => setCat('alle')}>{t('tasks.all')}</button>
          {CAT_ORDER.map((c) => (
            <button key={c} type="button" className={`${pill(cat === c)} inline-flex items-center gap-1.5`} aria-pressed={cat === c} onClick={() => setCat(c)}>
              <Icon name={CATS[c].icon} size={14} />{t(`category.${c}.label`)}
            </button>
          ))}
        </div>
      </div>

      {openTasks.length > 0 && grouped ? (
        <div className="space-y-3">
          {groupByDaypart(openTasks).map((g) => (
            <DaypartSection key={g.id} group={g} collapsed={sections.isCollapsed(g.id)} onToggle={() => sections.toggle(g.id)}>
              {g.tasks.map((t) => <TaskRow key={t.id} task={t} {...rowProps} />)}
            </DaypartSection>
          ))}
        </div>
      ) : openTasks.length > 0 ? (
        <ul className={`${sheet} divide-y divide-slate-100 dark:divide-white/5`}>
          {openTasks.map((t) => <TaskRow key={t.id} task={t} {...rowProps} />)}
        </ul>
      ) : (
        <div className={`${sheet} px-5 py-8 text-center`}>
          {filtering ? (
            <>
              <p className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">{t('tasks.noMatchTitle')}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('tasks.noMatchText')}</p>
              <button type="button" className={`${btnSoft} mt-4`} onClick={() => { setQuery(''); setCat('alle'); }}>{t('tasks.resetFilter')}</button>
            </>
          ) : (
            <>
              <p className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">{t('tasks.emptyTitle')}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('tasks.emptyText')}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button type="button" className={btnSoft} onClick={onGoLibrary}><Icon name="book" size={18} />{t('tasks.browseTemplates')}</button>
                <button type="button" className={btnPrimary} onClick={onNew}><Icon name="plus" size={18} />{t('tasks.new')}</button>
              </div>
            </>
          )}
        </div>
      )}

      {doneTasks.length > 0 && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button type="button" onClick={() => setShowDone((s) => !s)} aria-expanded={showDone}
              className={`inline-flex items-center gap-1.5 rounded-xl px-2 py-1 font-bold text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 ${focusRing}`}>
              <Icon name="chevron" size={18} className={`transition-transform ${showDone ? 'rotate-180' : ''}`} />
              {t('tasks.doneCount', { count: doneTasks.length })}
            </button>
            {clearable > 0 && !confirmClear && (
              <button type="button" onClick={() => setConfirmClear(true)} className={`rounded-xl px-2 py-1 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 ${focusRing}`}>
                {t('tasks.clearDone')}
              </button>
            )}
            {confirmClear && (
              <span className="anim-fade flex items-center gap-2 text-sm">
                <span className="text-slate-600 dark:text-slate-300">{t('tasks.clearConfirm', { count: clearable })}</span>
                <button type="button" onClick={() => { onClearDone(); setConfirmClear(false); }} className={`rounded-xl bg-slate-800 px-3 py-1 font-bold text-white dark:bg-slate-100 dark:text-slate-800 ${focusRing}`}>{t('common.yes')}</button>
                <button type="button" onClick={() => setConfirmClear(false)} className={`rounded-xl px-2 py-1 font-bold text-slate-500 ${focusRing}`}>{t('common.no')}</button>
              </span>
            )}
          </div>
          {showDone && (
            <ul className={`${sheet} anim-fade mt-2 divide-y divide-slate-100 opacity-90 dark:divide-white/5`}>
              {doneTasks.map((t) => <TaskRow key={t.id} task={t} {...rowProps} />)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
