import { useNow } from '../../hooks/useNow.js';
import { fmtTimer } from '../../lib/format.js';
import { timerLeft, timerProgress } from '../../lib/timebox.js';
import { TimerRing } from './TimerRing.jsx';
import { Icon } from '../ui/Icon.jsx';
import { focusRing } from '../ui/styles.js';
import { useI18n } from '../../i18n/useI18n.js';

export function MiniTimer({ timer, task, onOpen, onPause, onResume }) {
  const { t, clock } = useI18n();
  const now = useNow(timer.running ? 500 : null);
  const left = timerLeft(timer, now);
  const over = left < 0;
  const sub = over ? t('timer.overShort') : timer.running ? t('timer.until', { time: clock(now + left) }) : t('timer.paused');
  return (
    <div className="pointer-events-none fixed inset-x-0 z-30 flex justify-center px-3" style={{ bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
      <div className="anim-fade pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-3xl bg-white p-1.5 pr-2 shadow-xl ring-1 ring-slate-900/5 dark:bg-nightcard dark:ring-white/10">
        <button type="button" onClick={onOpen} aria-label={t('timer.open', { title: task.title })}
          className={`flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-1 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 ${focusRing}`}>
          <TimerRing size={44} stroke={10} progress={timerProgress(timer, left)} over={over} running={timer.running} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-slate-800 dark:text-slate-100">{task.title}</span>
            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className={`tabular-nums ${over ? 'text-orange-600 dark:text-orange-300' : 'text-slate-700 dark:text-slate-200'}`}>{fmtTimer(left)}</span> · {sub}
            </span>
          </span>
        </button>
        <button type="button" onClick={timer.running ? onPause : onResume} aria-label={t(timer.running ? 'common.pause' : 'common.resume')}
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-900 transition hover:bg-violet-200 dark:bg-violet-400/20 dark:text-violet-50 ${focusRing}`}>
          <Icon name={timer.running ? 'pause' : 'play'} size={18} />
        </button>
      </div>
    </div>
  );
}
