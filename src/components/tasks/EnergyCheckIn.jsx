import { ENERGY_ICONS, ENERGY_LEVELS } from '../../lib/energy.js';
import { Icon } from '../ui/Icon.jsx';
import { focusRing } from '../ui/styles.js';
import { useI18n } from '../../i18n/useI18n.js';

const TONES = {
  wenig: 'bg-rose-100 text-rose-900 hover:bg-rose-200 dark:bg-rose-400/15 dark:text-rose-100 dark:hover:bg-rose-400/25',
  mittel: 'bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-400/15 dark:text-amber-100 dark:hover:bg-amber-400/25',
  viel: 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 dark:bg-emerald-400/15 dark:text-emerald-100 dark:hover:bg-emerald-400/25',
};

/** Einmal am Tag: Wie viel Kraft ist da? level null = übersprungen. */
export function EnergyCheckIn({ onChoose }) {
  const { t } = useI18n();
  return (
    <section aria-labelledby="energy-title" className="anim-fade rounded-3xl bg-white p-4 ring-1 ring-slate-900/5 dark:bg-nightcard dark:ring-white/5">
      <h3 id="energy-title" className="font-display text-lg font-semibold text-slate-800 dark:text-slate-50">{t('energy.question')}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{t('energy.hint')}</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {ENERGY_LEVELS.map((level) => (
          <button key={level} type="button" onClick={() => onChoose(level)}
            className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2.5 text-sm font-bold transition active:scale-[0.98] ${TONES[level]} ${focusRing}`}>
            <Icon name={ENERGY_ICONS[level]} size={22} />{t(`energy.${level}`)}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => onChoose(null)}
        className={`mt-2 rounded-xl px-2 py-1 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 ${focusRing}`}>
        {t('energy.skip')}
      </button>
    </section>
  );
}
