import { BUDDY_ACTIVITY, QUICK_MINUTES } from '../../constants/timebox.js';
import { Avatar } from '../avatar/Avatar.jsx';
import { useNow } from '../../hooks/useNow.js';
import { fmtTimer } from '../../lib/format.js';
import { timerLeft, timerProgress } from '../../lib/timebox.js';
import { TimerRing } from './TimerRing.jsx';
import { Icon } from '../ui/Icon.jsx';
import { Modal } from '../ui/Modal.jsx';
import { btnPrimary, btnSoft, focusRing, iconBtn } from '../ui/styles.js';
import { useI18n } from '../../i18n/useI18n.js';

export function TimerModal({ timer, task, hero, after, nextTask, noiseOn, onNoise, onMinimize, onPause, onResume, onAdjust, onComplete, onStop, onLater, onToggleStep, onStartNext }) {
  const now = useNow(timer && timer.running ? 250 : null);
  const { t, clock, duration } = useI18n();

  if (after || !timer || !task) {
    return (
      <Modal onClose={onMinimize} labelledBy="timer-title">
        <div className="py-2 text-center">
          <span className="anim-pop mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-200 text-emerald-900"><Icon name="check" size={30} strokeWidth={3} /></span>
          <h2 id="timer-title" className="mt-4 font-display text-2xl font-semibold text-slate-800 dark:text-slate-50">{t('timer.finishedTitle')}</h2>
          {after && <p className="mt-1 text-slate-600 dark:text-slate-300">{t('timer.finishedText', { title: after.title })}</p>}
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('timer.finishedHint')}</p>
          <div className="mt-5 flex flex-col gap-2">
            {nextTask && (
              <button type="button" data-autofocus className={`${btnPrimary} w-full`} onClick={() => onStartNext(nextTask.id)}>
                <Icon name="play" size={16} /><span className="min-w-0 truncate">{t('timer.continueWith', { title: nextTask.title })}</span>
                <span className="shrink-0 opacity-70">{duration(nextTask.minutes || QUICK_MINUTES)}</span>
              </button>
            )}
            <button type="button" data-autofocus={nextTask ? undefined : true} className={`${btnSoft} w-full`} onClick={onMinimize}>{t('timer.takeBreak')}</button>
          </div>
        </div>
      </Modal>
    );
  }

  const left = timerLeft(timer, now);
  const over = left < 0;
  const nextStep = task.steps.find((s) => !s.done);
  // Mochi arbeitet mit (Body Doubling) – und döst, solange pausiert ist
  const activity = timer.running ? BUDDY_ACTIVITY[task.category] || 'read' : 'doze';
  const status = over ? t('timer.over') : timer.running ? t('timer.until', { time: clock(now + left) }) : t('timer.paused');

  return (
    <Modal onClose={onMinimize} labelledBy="timer-title">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm font-bold text-violet-700 dark:text-violet-200"><Icon name="timer" size={16} />{t('timer.label')}</p>
        <div className="flex items-center gap-1">
          <button type="button" className={`${iconBtn} ${noiseOn ? 'bg-violet-100 text-violet-800 dark:bg-violet-400/20 dark:text-violet-100' : ''}`} onClick={onNoise}
            aria-pressed={noiseOn} aria-label={t('timer.noise')} title={t('timer.noise')}><Icon name="waves" size={18} /></button>
          <button type="button" className={iconBtn} onClick={onMinimize} aria-label={t('timer.minimize')} title={t('timer.minimizeHint')}><Icon name="chevron" size={20} /></button>
        </div>
      </div>

      <h2 id="timer-title" className="mt-2 text-center font-display text-2xl font-semibold leading-snug text-slate-800 dark:text-slate-50">{task.title}</h2>
      <p className="mt-0.5 text-center text-sm text-slate-500 dark:text-slate-400" aria-live="polite">{t(`buddy.${activity}`, { name: hero.name })}</p>

      <div className="relative mx-auto mt-4 flex w-fit justify-center">
        <div className="absolute z-10 -left-20 -bottom-2 h-28 w-28 sm:-left-28 sm:h-32 sm:w-32" aria-hidden="true">
          <Avatar equip={hero.equip} activity={activity} />
        </div>
        <TimerRing size={196} stroke={7} progress={timerProgress(timer, left)} over={over} running={timer.running}>
          <div>
            <span className={`block font-display text-[44px] font-semibold leading-none tabular-nums ${over ? 'text-orange-600 dark:text-orange-300' : 'text-slate-800 dark:text-slate-50'}`}
              role="timer" aria-live="off">{fmtTimer(left)}</span>
            <span className="mt-1.5 block text-sm font-semibold text-slate-500 dark:text-slate-400">{status}</span>
          </div>
        </TimerRing>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button type="button" className={`${btnSoft} h-11 w-16 px-0 text-sm`} onClick={() => onAdjust(-5)} disabled={left <= 60000} aria-label={t('timer.less')}>−5</button>
        <button type="button" data-autofocus onClick={timer.running ? onPause : onResume} aria-label={t(timer.running ? 'common.pause' : 'common.resume')}
          className={`grid h-16 w-16 place-items-center rounded-full bg-violet-300 text-slate-800 shadow-xs transition hover:bg-violet-400 active:scale-95 ${focusRing}`}>
          <Icon name={timer.running ? 'pause' : 'play'} size={26} />
        </button>
        <button type="button" className={`${btnSoft} h-11 w-16 px-0 text-sm`} onClick={() => onAdjust(5)} aria-label={t('timer.more')}>+5</button>
      </div>

      {over && (
        <p className="anim-fade mt-4 rounded-2xl bg-orange-50 p-3 text-center text-sm text-orange-900 dark:bg-orange-400/10 dark:text-orange-100">
          {t('timer.overText')}
        </p>
      )}

      {nextStep && (
        <button type="button" onClick={(e) => onToggleStep(task.id, nextStep.id, e)}
          className={`mt-4 flex w-full items-center gap-3 rounded-2xl bg-amber-50 p-3 text-left hover:bg-amber-100 dark:bg-amber-400/10 dark:hover:bg-amber-400/20 ${focusRing}`}>
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 border-amber-300 text-transparent"><Icon name="check" size={14} strokeWidth={3.5} /></span>
          <span className="min-w-0">
            <span className="block text-xs font-bold text-amber-800 dark:text-amber-200">{t('focus.nextStep')}</span>
            <span className="block font-semibold text-slate-800 dark:text-slate-100">{nextStep.text}</span>
          </span>
        </button>
      )}

      <button type="button" className={`${btnPrimary} mt-5 w-full bg-emerald-200 hover:bg-emerald-300`} onClick={onComplete}>
        <Icon name="check" size={18} strokeWidth={3} />{t('timer.done')}
      </button>
      <div className="mt-2 flex justify-center gap-1">
        <button type="button" onClick={onLater} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100 ${focusRing}`}>
          <Icon name="later" size={16} />{t('timer.later')}
        </button>
        <button type="button" onClick={onStop} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100 ${focusRing}`}>
          <Icon name="stop" size={14} />{t('timer.stop')}
        </button>
      </div>
    </Modal>
  );
}
