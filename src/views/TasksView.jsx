import { useState } from 'react';
import { CATS, CAT_ORDER } from '../constants/game.js';
import { useNow } from '../hooks/useNow.js';
import { useCollapsed } from '../hooks/useCollapsed.js';
import { dayKey } from '../lib/date.js';
import { groupByDaypart, usesDayparts } from '../lib/dayparts.js';
import { groupByDay, isCurrent, isDueToday, sortByDue } from '../lib/due.js';
import { timerLeft } from '../lib/timebox.js';
import { DayWrapUp } from '../components/tasks/DayWrapUp.jsx';
import { EnergyCheckIn } from '../components/tasks/EnergyCheckIn.jsx';
import { WRAP_UP_FROM } from '../constants/dayparts.js';
import { ENERGY_ICONS } from '../lib/energy.js';
import { DaypartSection } from '../components/tasks/DaypartSection.jsx';
import { TaskRow } from '../components/tasks/TaskRow.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { SegmentedControl } from '../components/ui/SegmentedControl.jsx';
import { btnPrimary, btnSoft, focusRing, iconBtn, inputCls, pill, sheet } from '../components/ui/styles.js';
import { useI18n } from '../i18n/useI18n.js';

export function TasksView({ tasks, timer, todayCount, energy, onEnergy, onToggle, onToggleStep, onEdit, onNew, onFocus, onClearDone, onGoLibrary, onStart, onOpenTimer, onSnooze, onMoveToTomorrow }) {
  const { t, duration, clock, day } = useI18n();
  const now = useNow(timer && timer.running ? 15000 : 30000);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('alle');
  const [showDone, setShowDone] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  // 'now': ohne Datum + heute/überfällig · 'today': nur Fälliges · 'all': dazu alles Geplante
  // Bewusst nicht gespeichert: Beim Öffnen startet die Liste immer ruhig bei „Jetzt“.
  const [view, setView] = useState('now');
  const sections = useCollapsed();
  const [collapsedDays, setCollapsedDays] = useState(() => new Set());
  const today = dayKey(new Date(now));
  // Tagesform: nur heute gültig; abends wird nicht mehr gefragt
  const energyToday = energy && energy.day === today ? energy : null;
  const askEnergy = !energyToday && new Date(now).getHours() < WRAP_UP_FROM;

  const q = query.trim().toLowerCase();
  const matches = (t) => (cat === 'alle' || t.category === cat)
    && (!q || t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q));
  const open = sortByDue(tasks.filter((t) => !t.done && matches(t)));
  const openTasks = open.filter((t) => (view === 'today' ? isDueToday(t, today) : isCurrent(t, today)));
  const laterTasks = open.filter((t) => !isCurrent(t, today));
  const doneTasks = tasks.filter((t) => t.done && matches(t));
  const currentTasks = tasks.filter((t) => isCurrent(t, today));
  const totalOpen = currentTasks.filter((t) => !t.done).length;
  const filtering = q || cat !== 'alle';
  const clearable = tasks.filter((t) => t.done && t.repeat !== 'daily').length;

  // Abschnitte nach Tageszeit nur, wenn wirklich eine Aufgabe eine feste Tageszeit hat
  const grouped = usesDayparts(currentTasks);

  const rowProps = { onToggle, onToggleStep, onEdit, onStart, onOpenTimer, onSnooze, activeId: timer ? timer.taskId : null, today };

  const toggleDay = (key) => setCollapsedDays((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  });

  /* Listenzeit: Summe aller Zeitboxen der heute offenen Aufgaben + voraussichtliches Ende */
  const planMs = currentTasks.reduce((sum, t) => {
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
          {energyToday && energyToday.level && (
            <button type="button" onClick={() => onEnergy(undefined)} aria-label={t('energy.change')} title={t('energy.change')}
              className={`mt-1 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 ${focusRing}`}>
              <Icon name={ENERGY_ICONS[energyToday.level]} size={14} />{t('energy.current', { level: t(`energy.${energyToday.level}`) })}
            </button>
          )}
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

      {askEnergy && <EnergyCheckIn onChoose={onEnergy} />}

      <DayWrapUp tasks={tasks} today={today} now={now} doneCount={todayCount} onMoveToTomorrow={onMoveToTomorrow} />

      <div className="space-y-2.5">
        <SegmentedControl label={t('tasks.view.label')} value={view} onChange={setView}
          options={['now', 'today', 'all'].map((v) => ({ value: v, label: t(`tasks.view.${v}`) }))} />
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
          {view === 'today' && !filtering ? (
            <>
              <p className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">{t('tasks.todayEmptyTitle')}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('tasks.todayEmptyText')}</p>
              <button type="button" className={`${btnSoft} mt-4`} onClick={() => setView('now')}>{t('tasks.view.now')}</button>
            </>
          ) : filtering ? (
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

      {view === 'all' && laterTasks.length > 0 && (
        <div className="space-y-3">
          {groupByDay(laterTasks).map((g) => {
            const name = day(g.day, today);
            return (
              <DaypartSection key={g.day} title={name} group={{ id: `due-${g.day}`, icon: 'calendar', tone: 'text-slate-400', tasks: g.tasks }}
                collapsed={collapsedDays.has(g.day)} onToggle={() => toggleDay(g.day)}>
                {g.tasks.map((t) => <TaskRow key={t.id} task={t} {...rowProps} hideDue />)}
              </DaypartSection>
            );
          })}
        </div>
      )}

      {view === 'now' && laterTasks.length > 0 && (
        <button type="button" onClick={() => setView('all')}
          className={`flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-slate-500 border-2 border-dashed border-slate-200 hover:bg-white hover:text-slate-800 dark:text-slate-400 dark:border-white/10 dark:hover:bg-nightcard dark:hover:text-slate-100 ${focusRing}`}>
          <Icon name="calendar" size={16} className="shrink-0 text-slate-400" />
          <span className="flex-1">{t('tasks.later', { count: laterTasks.length })}</span>
          <span className="font-bold text-violet-700 dark:text-violet-300">{t('tasks.showLater')}</span>
        </button>
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
