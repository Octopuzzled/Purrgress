import { useI18n } from '../../i18n/useI18n.js';
import { Icon } from '../ui/Icon.jsx';
import { focusRing, sheet } from '../ui/styles.js';

/** Ein einklappbarer Abschnitt der Aufgabenliste (Start in den Tag, Jederzeit, Tagesausklang). */
export function DaypartSection({ group, collapsed, onToggle, children }) {
  const { t } = useI18n();
  const name = t(`daypart.${group.id}.heading`);
  const listId = `daypart-${group.id}`;

  return (
    <section>
      <h3>
        <button type="button" onClick={onToggle} aria-expanded={!collapsed} aria-controls={listId}
          aria-label={t('tasks.sectionToggle', { name, count: group.tasks.length })}
          className={`flex w-full items-center gap-2 rounded-xl px-1 py-1.5 text-left ${focusRing}`}>
          <Icon name={group.icon} size={18} className={group.tone} />
          <span className="font-display text-lg font-semibold text-slate-700 dark:text-slate-100">{name}</span>
          <span className="rounded-full bg-slate-100 px-2 text-xs font-bold tabular-nums text-slate-500 dark:bg-slate-700 dark:text-slate-300">{group.tasks.length}</span>
          <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" aria-hidden="true" />
          <Icon name="chevron" size={18} className={`text-slate-400 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </h3>
      {!collapsed && (
        <ul id={listId} className={`${sheet} anim-fade mt-1.5 divide-y divide-slate-100 dark:divide-white/5`}>
          {children}
        </ul>
      )}
    </section>
  );
}
