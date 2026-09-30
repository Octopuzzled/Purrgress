import { useState, useEffect, useMemo, useRef } from 'react';
import { BOX_CHOICES, QUICK_MINUTES } from '../../constants/timebox.js';
import { uid } from '../../lib/id.js';
import { Icon } from '../ui/Icon.jsx';
import { btnPrimary, btnSoft, focusRing } from '../ui/styles.js';
import { useI18n } from '../../i18n/useI18n.js';

/** Zeitauswahl: feste Längen oder eigene Zeit, direkt vor dem Start. */
export function TimePicker({ initial, onStart, onCancel }) {
  const { t, duration } = useI18n();
  const clamp = (m) => Math.min(240, Math.max(1, Math.round(m)));
  const [mins, setMins] = useState(clamp(initial || QUICK_MINUTES));
  const [text, setText] = useState(String(clamp(initial || QUICK_MINUTES)));
  const startRef = useRef(null);
  const inputId = useMemo(() => `tp-${uid()}`, []);

  useEffect(() => { if (startRef.current) startRef.current.focus({ preventScroll: true }); }, []);

  const set = (m) => { const v = clamp(m); setMins(v); setText(String(v)); };
  const onType = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
    const n = parseInt(raw, 10);
    setText(n > 240 ? '240' : raw);
    if (n > 0) setMins(clamp(n));
  };
  const chip = (active) => `min-w-[44px] rounded-full px-3 py-1.5 text-sm font-bold tabular-nums transition ${focusRing} ${active
    ? 'bg-violet-300 text-slate-800'
    : 'bg-white text-slate-600 ring-1 ring-slate-900/10 hover:bg-slate-50 dark:bg-nightcard dark:text-slate-300 dark:ring-white/10 dark:hover:bg-slate-700'}`;
  const step = `inline-grid h-9 w-9 place-items-center rounded-xl bg-white text-slate-600 ring-1 ring-slate-900/10 transition hover:bg-slate-50 disabled:opacity-40 dark:bg-nightcard dark:text-slate-200 dark:ring-white/10 dark:hover:bg-slate-700 ${focusRing}`;

  return (
    <div className="anim-fade rounded-2xl bg-violet-50 p-3 dark:bg-violet-400/10">
      <p className="text-xs font-bold text-violet-900 dark:text-violet-100">{t('picker.question')} <span className="font-semibold opacity-70">{t('picker.unit')}</span></p>
      <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label={t('picker.choose')}>
        {BOX_CHOICES.map((m) => (
          <button key={m} type="button" aria-pressed={mins === m} aria-label={t('units.minutesLong', { count: m })} onClick={() => set(m)} className={chip(mins === m)}>{m}</button>
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t('picker.custom')}</label>
        <div className="flex items-center gap-1.5">
          <button type="button" className={step} onClick={() => set(mins - 5)} disabled={mins <= 1} aria-label={t('picker.decrease')}><Icon name="minus" size={16} /></button>
          <input id={inputId} value={text} onChange={onType} onBlur={() => setText(String(mins))} inputMode="numeric" autoComplete="off"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onStart(mins); } }}
            className="h-9 w-16 rounded-xl border-0 bg-white text-center font-bold tabular-nums text-slate-800 ring-1 ring-slate-900/10 focus:outline-hidden focus:ring-4 focus:ring-violet-200 dark:bg-nightcard dark:text-slate-100 dark:ring-white/10 dark:focus:ring-violet-400/40" />
          <button type="button" className={step} onClick={() => set(mins + 5)} disabled={mins >= 240} aria-label={t('picker.increase')}><Icon name="plus" size={16} /></button>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button ref={startRef} type="button" className={`${btnPrimary} flex-1`} onClick={() => onStart(mins)}>
          <Icon name="play" size={16} />{t('focus.start', { duration: duration(mins) })}
        </button>
        {onCancel && <button type="button" className={btnSoft} onClick={onCancel}>{t('common.cancel')}</button>}
      </div>
    </div>
  );
}
