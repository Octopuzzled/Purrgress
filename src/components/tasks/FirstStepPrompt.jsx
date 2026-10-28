import { useState } from 'react';
import { Icon } from '../ui/Icon.jsx';
import { btnPrimary, focusRing, inputCls } from '../ui/styles.js';
import { useI18n } from '../../i18n/useI18n.js';

/** „Zu groß?“ – fragt nach dem allerkleinsten ersten Schritt. */
export function FirstStepPrompt({ onAdd, onCancel }) {
  const { t } = useI18n();
  const [text, setText] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (text.trim()) onAdd(text.trim());
  };

  return (
    <form onSubmit={submit} className="anim-fade space-y-2 rounded-2xl bg-amber-50 p-3 dark:bg-amber-400/10">
      <label htmlFor="first-step" className="block text-sm font-bold text-amber-950 dark:text-amber-50">{t('tooBig.question')}</label>
      <p className="text-xs text-amber-900/80 dark:text-amber-100/80">{t('tooBig.hint')}</p>
      <input id="first-step" autoFocus value={text} maxLength={120} onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); onCancel(); } }}
        placeholder={t('tooBig.placeholder')} className={`${inputCls} bg-white py-2 text-sm dark:bg-slate-800`} />
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={`${btnPrimary} py-1.5 text-sm`} disabled={!text.trim()}><Icon name="steps" size={16} />{t('tooBig.add')}</button>
        <button type="button" onClick={onCancel} className={`rounded-xl px-3 py-1 text-sm font-bold text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700 ${focusRing}`}>{t('common.cancel')}</button>
      </div>
    </form>
  );
}
