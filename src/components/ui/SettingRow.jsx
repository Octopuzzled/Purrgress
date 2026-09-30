/** Eine Zeile in den Einstellungen: Titel und Hinweis links, Bedienelement rechts. */
export function SettingRow({ title, hint, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3">
      <span>
        <span className="block font-bold text-slate-800 dark:text-slate-100">{title}</span>
        {hint && <span className="block text-sm text-slate-500 dark:text-slate-400">{hint}</span>}
      </span>
      {children}
    </div>
  );
}
