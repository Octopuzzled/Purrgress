import { useEffect, useRef } from 'react';
import { Icon } from './Icon.jsx';
import { useI18n } from '../../i18n/useI18n.js';

export function Toast({ toast, onUndo, onClose, lifted = false }) {
  const { t } = useI18n();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const t = setTimeout(() => closeRef.current(), 5500);
    return () => clearTimeout(t);
  }, [toast.id]);
  return (
    <div className="pointer-events-none fixed inset-x-0 z-30 flex justify-center px-4" style={{ bottom: `calc(${lifted ? 92 : 16}px + env(safe-area-inset-bottom, 0px))` }}>
      <div role="status" className="anim-fade pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl bg-slate-800 py-2 pl-4 pr-2 text-sm text-white shadow-xl dark:bg-slate-100 dark:text-slate-800">
        <Icon name="check" size={18} strokeWidth={3} className="shrink-0 text-emerald-300 dark:text-emerald-600" />
        <span className="min-w-0 truncate">{t('toast.done', { title: toast.text })}</span>
        <button type="button" onClick={onUndo}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl px-3 py-1.5 font-bold text-violet-200 hover:bg-white/10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-violet-200 dark:text-violet-700 dark:hover:bg-slate-200">
          <Icon name="undo" size={16} />{t('toast.undo')}
        </button>
      </div>
    </div>
  );
}
