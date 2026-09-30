import { focusRing } from './styles.js';

/**
 * Gruppe aus Umschalt-Knöpfen, von denen genau einer aktiv ist.
 * options: [{ value, label }]
 */
export function SegmentedControl({ label, options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-700/60" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={String(o.value)} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}
          className={`rounded-xl px-2.5 py-1.5 text-sm font-bold transition ${focusRing} ${value === o.value
            ? 'bg-white text-slate-800 shadow-xs dark:bg-slate-500 dark:text-white'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-300'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
