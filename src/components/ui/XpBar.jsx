import { useI18n } from '../../i18n/useI18n.js';

export function XpBar({ pct }) {
  const { t } = useI18n();
  const value = Math.round(pct * 100);
  return (
    <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-violet-100 dark:bg-slate-700" role="progressbar"
      aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={t('hero.xpProgress')}>
      <div className="h-full rounded-full bg-violet-300 transition-[width] duration-700 ease-out" style={{ width: `${Math.max(3, value)}%` }} />
    </div>
  );
}
