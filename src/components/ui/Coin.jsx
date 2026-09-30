import { useI18n } from '../../i18n/useI18n.js';

export function Coin({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#fcd98a" />
      <circle cx="12" cy="12" r="7" fill="#fde9b4" stroke="#efbd57" strokeWidth="1.5" />
      <path d="M12 8.3l1.1 2.3 2.4.3-1.8 1.7.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.7 2.4-.3Z" fill="#efbd57" />
    </svg>
  );
}

export function CoinBadge({ coins, big = false }) {
  const { t } = useI18n();
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 font-bold tabular-nums text-amber-900 ring-1 ring-amber-200/70 dark:bg-amber-400/10 dark:text-amber-100 dark:ring-amber-300/20 ${big ? 'px-3.5 py-1.5 text-base' : 'px-2.5 py-1 text-sm'}`}
      aria-label={t('common.coins', { count: coins })}>
      <Coin size={big ? 20 : 16} />{coins}
    </span>
  );
}
