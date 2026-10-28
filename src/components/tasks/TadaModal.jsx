import { useState } from 'react';
import { DIFF, DIFF_ORDER } from '../../constants/game.js';
import { Coin } from '../ui/Coin.jsx';
import { Icon } from '../ui/Icon.jsx';
import { Modal } from '../ui/Modal.jsx';
import { btnPrimary, focusRing, iconBtn, inputCls } from '../ui/styles.js';
import { useI18n } from '../../i18n/useI18n.js';

/** „Ta-da!“: etwas eintragen, das schon geschafft ist – auch wenn es nie geplant war. */
export function TadaModal({ onClose, onSave }) {
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('leicht');

  const submit = (e) => {
    e.preventDefault();
    const name = title.trim();
    if (!name) return;
    onSave({ title: name, difficulty }, e);
  };

  return (
    <Modal onClose={onClose} labelledBy="tada-title">
      <form onSubmit={submit} className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="tada-title" className="font-display text-2xl font-semibold text-slate-800 dark:text-slate-50">{t('tada.title')}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('tada.subtitle')}</p>
          </div>
          <button type="button" className={iconBtn} onClick={onClose} aria-label={t('common.close')}><Icon name="x" /></button>
        </div>

        <div>
          <label htmlFor="tada-name" className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200">{t('tada.name')}</label>
          <input id="tada-name" data-autofocus value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)}
            placeholder={t('tada.placeholder')} className={inputCls} />
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">{t('tada.effort')}</legend>
          <div className="grid grid-cols-3 gap-2">
            {DIFF_ORDER.map((d) => (
              <button key={d} type="button" aria-pressed={difficulty === d} onClick={() => setDifficulty(d)}
                className={`rounded-2xl px-2 py-2.5 text-center transition ${focusRing} ${difficulty === d ? 'bg-violet-100 text-violet-900 ring-2 ring-violet-300 dark:bg-violet-400/15 dark:text-violet-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700/70 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
                <span className="block text-sm font-bold">{t(`difficulty.${d}`)}</span>
                <span className="mt-0.5 flex items-center justify-center gap-1 text-xs font-semibold opacity-80">+{DIFF[d].xp} XP <Coin size={12} />{DIFF[d].coins}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <button type="submit" className={`${btnPrimary} w-full`} disabled={!title.trim()}>
          <Icon name="sparkles" size={18} />{t('tada.submit')}
        </button>
      </form>
    </Modal>
  );
}
