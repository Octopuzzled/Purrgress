import { Avatar } from '../avatar/Avatar.jsx';
import { Coin } from '../ui/Coin.jsx';
import { Modal } from '../ui/Modal.jsx';
import { btnPrimary } from '../ui/styles.js';
import { useI18n } from '../../i18n/useI18n.js';

export function LevelUpModal({ info, equip, onClose }) {
  const { t } = useI18n();
  return (
    <Modal onClose={onClose} labelledBy="lvl-title">
      <div className="text-center">
        <div className="mx-auto h-[160px] w-[160px]"><Avatar equip={equip} mood="cheer" /></div>
        <h2 id="lvl-title" className="mt-2 font-display text-3xl font-semibold text-slate-800 dark:text-slate-50">{t('hero.levelUpTitle', { level: info.level })}</h2>
        <p className="mt-1 text-slate-600 dark:text-slate-300">{t('hero.levelUpText')}</p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 font-bold text-amber-900 dark:bg-amber-400/15 dark:text-amber-100">
          {t('hero.levelUpBonus', { bonus: info.bonus })} <Coin size={16} />
        </p>
        <button type="button" data-autofocus className={`${btnPrimary} mt-5 w-full`} onClick={onClose}>{t('common.continue')}</button>
      </div>
    </Modal>
  );
}
