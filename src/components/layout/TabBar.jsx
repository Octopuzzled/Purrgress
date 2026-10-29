import { TABS } from '../../constants/navigation.js';
import { Icon } from '../ui/Icon.jsx';
import { focusRing } from '../ui/styles.js';
import { useI18n } from '../../i18n/useI18n.js';

export function TabBar({ tab, onChange }) {
  const { t } = useI18n();
  return (
    <nav data-tour="tabs" className="sticky z-20 -mx-4 bg-cream/90 px-4 py-2 backdrop-blur-sm dark:bg-night/90 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 lg:pt-0"
      style={{ top: 'env(safe-area-inset-top, 0px)' }} aria-label={t('tabs.label')}>
      <div className="grid grid-cols-4 gap-1 rounded-2xl bg-white p-1 shadow-xs ring-1 ring-slate-900/5 dark:bg-nightcard dark:ring-white/5">
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button key={item.id} type="button" onClick={() => onChange(item.id)} aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-xs font-bold transition sm:flex-row sm:gap-2 sm:text-sm ${focusRing} ${active
                ? 'bg-violet-100 text-violet-900 dark:bg-violet-400/20 dark:text-violet-50'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'}`}>
              <Icon name={item.icon} size={18} />
              <span>{t(`tabs.${item.id}`)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
