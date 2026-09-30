/**
 * Gemeinsame Tailwind-Klassen für wiederkehrende Bausteine.
 * Zentral gehalten, damit Buttons, Eingabefelder und Karten überall gleich aussehen.
 */
export const focusRing = 'focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-violet-200 dark:focus-visible:ring-violet-400/40';

export const btnPrimary = `inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-300 px-4 py-2.5 font-bold text-slate-800 shadow-xs transition hover:bg-violet-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-violet-300 ${focusRing}`;

export const btnSoft = `inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 font-bold text-slate-700 ring-1 ring-slate-900/10 transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-nightcard dark:text-slate-100 dark:ring-white/10 dark:hover:bg-slate-700 ${focusRing}`;

export const iconBtn = `inline-grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100 ${focusRing}`;

export const inputCls = 'w-full rounded-2xl border-0 bg-slate-100 px-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-4 focus:ring-violet-200 dark:bg-slate-700/70 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:ring-violet-400/40';

export const sheet = 'rounded-3xl bg-white ring-1 ring-slate-900/5 dark:bg-nightcard dark:ring-white/5';

export function pill(active) {
  return `shrink-0 rounded-full px-3.5 py-1.5 text-sm font-bold transition ${focusRing} ${active
    ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-800'
    : 'bg-white text-slate-600 ring-1 ring-slate-900/10 hover:bg-slate-50 dark:bg-nightcard dark:text-slate-300 dark:ring-white/10 dark:hover:bg-slate-700'}`;
}
