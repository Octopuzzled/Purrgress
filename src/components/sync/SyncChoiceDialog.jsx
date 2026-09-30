import { useI18n } from '../../i18n/useI18n.js';
import { Modal } from '../ui/Modal.jsx';
import { focusRing } from '../ui/styles.js';

/** Einmalige Frage beim ersten Anmelden, wenn Gerät und Konto schon Fortschritt haben. */
export function SyncChoiceDialog({ onChoose, onClose }) {
  const { t } = useI18n();
  const option = (choice, title, hint, primary) => (
    <button type="button" data-autofocus={primary || undefined} onClick={() => onChoose(choice)}
      className={`w-full rounded-2xl p-4 text-left transition ${focusRing} ${primary
        ? 'bg-violet-100 hover:bg-violet-200 dark:bg-violet-400/20 dark:hover:bg-violet-400/30'
        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-700'}`}>
      <span className="block font-bold text-slate-800 dark:text-slate-100">{title}</span>
      <span className="block text-sm text-slate-600 dark:text-slate-300">{hint}</span>
    </button>
  );

  return (
    <Modal onClose={onClose} labelledBy="sync-choice-title">
      <h2 id="sync-choice-title" className="font-display text-2xl font-semibold text-slate-800 dark:text-slate-50">{t('sync.choice.title')}</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('sync.choice.text')}</p>
      <div className="mt-4 space-y-2">
        {option('merge', t('sync.choice.merge'), t('sync.choice.mergeHint'), true)}
        {option('account', t('sync.choice.account'), t('sync.choice.accountHint'), false)}
      </div>
    </Modal>
  );
}
