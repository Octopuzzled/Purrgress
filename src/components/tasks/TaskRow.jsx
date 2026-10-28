import { useState } from 'react';
import { CATS, DIFF, DIFF_ORDER, STEP_XP } from '../../constants/game.js';
import { TimePicker } from '../timebox/TimePicker.jsx';
import { FirstStepPrompt } from './FirstStepPrompt.jsx';
import { isStuck } from '../../lib/tasks.js';
import { Icon } from '../ui/Icon.jsx';
import { btnPrimary, focusRing, iconBtn } from '../ui/styles.js';
import { useI18n } from '../../i18n/useI18n.js';
import { addDays, dayKey } from '../../lib/date.js';
import { dueStatus, isCurrent } from '../../lib/due.js';

/** Farben für das Fälligkeits-Kärtchen – Überfälliges sanft orange, nicht alarmrot. */
const DUE_TONE = {
  overdue: 'bg-orange-100 text-orange-900 dark:bg-orange-400/15 dark:text-orange-100',
  today: 'bg-teal-100 text-teal-900 dark:bg-teal-400/15 dark:text-teal-100',
  future: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

/** Wie viel Kraft eine Aufgabe kostet – ein bis drei Punkte statt Text. Details als Tooltip und für Screenreader. */
function EnergyDots({ difficulty, label }) {
  const filled = DIFF_ORDER.indexOf(difficulty) + 1;
  return (
    <span role="img" aria-label={label} title={label} className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-1">
      {DIFF_ORDER.map((d, i) => (
        <span key={d} className={`h-1.5 w-1.5 rounded-full ${i < filled ? 'bg-violet-400 dark:bg-violet-300' : 'bg-slate-200 dark:bg-slate-600'}`} />
      ))}
    </span>
  );
}

export function TaskRow({ task, onToggle, onToggleStep, onEdit, onStart, onOpenTimer, onSnooze, onAddFirstStep, activeId, today = dayKey(), hideDue = false }) {
  const { t, duration, day, repeatLabel } = useI18n();
  const isActive = activeId === task.id;
  const [picking, setPicking] = useState(false);
  const [open, setOpen] = useState(false);
  const [shrinking, setShrinking] = useState(false);
  const cat = CATS[task.category];
  const diff = DIFF[task.difficulty];
  const stepsDone = task.steps.filter((s) => s.done).length;
  const hasMore = !!task.desc || task.steps.length > 0;
  const allSteps = task.steps.length > 0 && stepsDone === task.steps.length;
  // Tägliche Aufgaben sind immer heute fällig – dafür reicht das „täglich“-Kärtchen.
  // hideDue: Die Aufgabe steht schon unter einer Datums-Überschrift.
  const due = hideDue || task.repeat === 'daily' || task.done ? 'none' : dueStatus(task, today);
  const dueText = due === 'overdue'
    ? (task.due === addDays(today, -1) ? t('due.sinceYesterday') : t('due.since', { day: day(task.due, today) }))
    : due !== 'none' ? day(task.due, today) : '';

  return (
    <li className="p-3 sm:p-4">
      <div className="flex items-start gap-3">
        <button type="button" onClick={(e) => onToggle(task.id, e)} aria-pressed={task.done}
          aria-label={t(task.done ? 'task.reopen' : 'task.complete', { title: task.title })}
          className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-emerald-200 ${task.done
            ? 'anim-pop border-emerald-300 bg-emerald-300 text-emerald-900'
            : 'border-slate-300 text-transparent hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-400 dark:border-slate-500 dark:hover:bg-emerald-400/10'}`}>
          <Icon name="check" size={18} strokeWidth={3} />
        </button>

        <div className="min-w-0 flex-1">
          <button type="button" onClick={() => hasMore && setOpen((o) => !o)} aria-expanded={hasMore ? open : undefined}
            className={`flex w-full items-start gap-1 rounded-lg text-left font-bold leading-snug ${focusRing} ${hasMore ? 'cursor-pointer' : 'cursor-default'} ${task.done ? 'text-slate-400 line-through decoration-2 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
            <span className="min-w-0 flex-1">{task.title}</span>
            {hasMore && <Icon name="chevron" size={18} className={`mt-0.5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />}
          </button>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs font-bold">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${cat.chip}`}><Icon name={cat.icon} size={12} strokeWidth={2.5} />{t(`category.${task.category}.label`)}</span>
            <EnergyDots difficulty={task.difficulty} label={t('task.energy', { label: t(`difficulty.${task.difficulty}`), xp: diff.xp, coins: diff.coins })} />
            {due !== 'none' && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${DUE_TONE[due]}`} title={t('task.due', { day: day(task.due, today) })}>
                <Icon name="calendar" size={12} strokeWidth={2.5} />{dueText}
              </span>
            )}
            {task.tada && (
              <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2 py-0.5 text-pink-900 dark:bg-pink-400/15 dark:text-pink-100"><Icon name="sparkles" size={12} strokeWidth={2.5} />{t('task.tada')}</span>
            )}
            {task.repeat !== 'none' && (
              <span title={t('task.repeats', { days: repeatLabel(task) })}
                className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-sky-800 dark:bg-sky-400/15 dark:text-sky-200"><Icon name="repeat" size={12} strokeWidth={2.5} />{repeatLabel(task)}</span>
            )}
            {isActive ? (
              <button type="button" onClick={onOpenTimer}
                className={`inline-flex items-center gap-1.5 rounded-full bg-violet-200 px-2 py-0.5 text-violet-900 dark:bg-violet-400/25 dark:text-violet-50 ${focusRing}`}>
                <span className="live-dot" aria-hidden="true" />{t('task.timerRunning')}
              </button>
            ) : task.minutes && !task.done ? (
              <button type="button" onClick={() => setPicking((v) => !v)} aria-expanded={picking} aria-label={t('task.pickTime', { title: task.title, duration: duration(task.minutes) })}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 transition ${focusRing} ${picking
                  ? 'bg-violet-200 text-violet-900 dark:bg-violet-400/25 dark:text-violet-50'
                  : 'bg-violet-50 text-violet-800 hover:bg-violet-100 dark:bg-violet-400/10 dark:text-violet-200 dark:hover:bg-violet-400/20'}`}>
                <Icon name="timer" size={12} strokeWidth={2.5} />{duration(task.minutes)}
              </button>
            ) : null}
            {task.steps.length > 0 && (
              <button type="button" onClick={() => setOpen((o) => !o)}
                className={`inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-900 dark:bg-amber-400/15 dark:text-amber-100 ${focusRing}`}>
                <Icon name="steps" size={12} strokeWidth={2.5} />{t('task.steps', { done: stepsDone, total: task.steps.length })}
              </button>
            )}
            {!shrinking && isStuck(task, today) && (
              <button type="button" onClick={() => setShrinking(true)} aria-label={t('tooBig.buttonLabel')} title={t('tooBig.buttonLabel')}
                className={`inline-flex items-center gap-1 rounded-full border border-dashed border-amber-400 px-2 py-px text-amber-800 hover:bg-amber-50 dark:border-amber-300/50 dark:text-amber-200 dark:hover:bg-amber-400/10 ${focusRing}`}>
                <Icon name="steps" size={12} strokeWidth={2.5} />{t('tooBig.button')}
              </button>
            )}
          </div>

          {open && (
            <div className="anim-fade mt-3 space-y-3">
              {task.desc && <p className="whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">{task.desc}</p>}
              {task.steps.length > 0 && (
                <ul className="space-y-1">
                  {task.steps.map((s) => (
                    <li key={s.id}>
                      <button type="button" onClick={(e) => onToggleStep(task.id, s.id, e)} aria-pressed={s.done}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 ${focusRing}`}>
                        <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 ${s.done ? 'border-amber-300 bg-amber-200 text-amber-900' : 'border-slate-300 text-transparent dark:border-slate-500'}`}>
                          <Icon name="check" size={12} strokeWidth={3.5} />
                        </span>
                        <span className={`min-w-0 flex-1 ${s.done ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{s.text}</span>
                        {!s.done && <span className="shrink-0 text-xs font-semibold text-slate-400">+{STEP_XP} XP</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {allSteps && !task.done && (
                <button type="button" className={`${btnPrimary} w-full bg-emerald-200 hover:bg-emerald-300`} onClick={(e) => onToggle(task.id, e)}>
                  <Icon name="check" size={18} strokeWidth={3} />{t('task.allStepsDone')}
                </button>
              )}
            </div>
          )}

          {shrinking && !task.done && (
            <div className="mt-3">
              <FirstStepPrompt onCancel={() => setShrinking(false)}
                onAdd={(text) => { setShrinking(false); setOpen(true); onAddFirstStep(task.id, text); }} />
            </div>
          )}

          {picking && !task.done && !isActive && (
            <div className="mt-3">
              <TimePicker initial={task.minutes} onStart={(m) => { setPicking(false); onStart(task.id, m); }} onCancel={() => setPicking(false)} />
            </div>
          )}

        </div>

        <div className="flex shrink-0 items-center">
          {!task.done && (
            <button type="button" className={`${iconBtn} ${isActive ? 'text-violet-500 dark:text-violet-300' : ''}`}
              onClick={() => (isActive ? onOpenTimer() : onStart(task.id))}
              aria-label={t(isActive ? 'task.openTimer' : 'task.startTimer', { title: task.title })}>
              <Icon name={isActive ? 'timer' : 'play'} size={16} />
            </button>
          )}
          {!task.done && !isActive && isCurrent(task, today) && (
            <button type="button" className={iconBtn} onClick={(e) => onSnooze(task.id, e)}
              aria-label={t('task.snooze', { title: task.title })} title={t('task.snooze', { title: task.title })}>
              <Icon name="later" size={17} />
            </button>
          )}
          <button type="button" className={iconBtn} onClick={() => onEdit(task)} aria-label={t('task.edit', { title: task.title })}><Icon name="pencil" size={17} /></button>
        </div>
      </div>
    </li>
  );
}
