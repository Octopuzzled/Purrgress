import { focusRing } from './styles.js';

export function Toggle({ checked, onChange, label, hint }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between gap-4 rounded-2xl py-3 text-left ${focusRing}`}>
      <span className="min-w-0">
        <span className="block font-bold text-slate-800 dark:text-slate-100">{label}</span>
        {hint && <span className="block text-sm text-slate-500 dark:text-slate-400">{hint}</span>}
      </span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? 'bg-violet-300' : 'bg-slate-200 dark:bg-slate-600'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${checked ? 'left-6' : 'left-1'}`} />
      </span>
    </button>
  );
}
