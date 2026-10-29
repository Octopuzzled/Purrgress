import { useEffect, useState } from 'react';
import { Avatar } from '../avatar/Avatar.jsx';
import { Icon } from '../ui/Icon.jsx';
import { btnPrimary, btnSoft, focusRing } from '../ui/styles.js';
import { useI18n } from '../../i18n/useI18n.js';

/**
 * Schritte der Einführung. target = data-tour-Attribut des Elements, das hervorgehoben wird.
 * Texte stehen in src/i18n/locales (tour.<id>).
 */
const TOUR_STEPS = [
  { id: 'welcome', target: null },
  { id: 'new', target: 'new' },
  { id: 'list', target: 'list' },
  { id: 'views', target: 'views' },
  { id: 'focus', target: 'focus' },
  { id: 'tada', target: 'tada' },
  { id: 'tabs', target: 'tabs' },
];

/**
 * Ruhige Einführung: eine Karte unten, das passende Element bekommt einen weichen Rahmen
 * und wird in Sichtweite gescrollt. Kein Abdunkeln, nichts springt. Überspringen geht immer.
 */
export function Tour({ hero, reduceMotion, onFinish }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const step = TOUR_STEPS[index];
  const last = index === TOUR_STEPS.length - 1;

  useEffect(() => {
    if (!step.target) return undefined;
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) return undefined;
    el.classList.add('tour-target');
    el.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
    return () => el.classList.remove('tour-target');
  }, [step.target, reduceMotion]);

  return (
    <div className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4" style={{ bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}>
      <section role="dialog" aria-modal="false" aria-labelledby="tour-title" aria-describedby="tour-text"
        className="anim-fade pointer-events-auto w-full max-w-md rounded-3xl bg-white p-4 shadow-2xl ring-1 ring-slate-900/10 dark:bg-nightcard dark:ring-white/10">
        <div className="flex items-start gap-3">
          {index === 0 && (
            <span className="h-16 w-16 shrink-0" aria-hidden="true"><Avatar equip={hero.equip} still /></span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-violet-700 dark:text-violet-300">
              {t('tour.label')} · {t('tour.step', { n: index + 1, total: TOUR_STEPS.length })}
            </p>
            <h2 id="tour-title" className="font-display text-lg font-semibold text-slate-800 dark:text-slate-50">{t(`tour.${step.id}.title`, { name: hero.name })}</h2>
            <p id="tour-text" className="mt-0.5 text-sm text-slate-600 dark:text-slate-300" aria-live="polite">{t(`tour.${step.id}.text`)}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          {last ? <span /> : (
            <button type="button" onClick={onFinish}
              className={`rounded-xl px-2 py-1 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 ${focusRing}`}>
              {t('tour.skip')}
            </button>
          )}
          <div className="flex gap-2">
            {index > 0 && (
              <button type="button" className={`${btnSoft} px-3 py-2 text-sm`} onClick={() => setIndex((i) => i - 1)}>{t('tour.back')}</button>
            )}
            <button type="button" data-autofocus className={`${btnPrimary} py-2 text-sm`} onClick={() => (last ? onFinish() : setIndex((i) => i + 1))}>
              {last ? t('tour.done') : t('tour.next')}{!last && <Icon name="chevron" size={16} className="-rotate-90" />}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
