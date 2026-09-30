import { useRef, useState } from 'react';
import { useI18n } from '../../i18n/useI18n.js';
import { BackupError, backupFileName, parseBackup, serializeBackup, summarizeBackup } from '../../lib/backup.js';
import { Icon } from '../ui/Icon.jsx';
import { btnSoft, focusRing, inputCls } from '../ui/styles.js';

/** „Deine Daten“: Sicherung exportieren, einspielen und alles zurücksetzen. */
export function DataSection({ state, signedIn, onRestore, onReset }) {
  const { t, locale } = useI18n();
  const fileRef = useRef(null);
  const [copyState, setCopyState] = useState(null); // null | 'copied' | { text }
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState('');
  const [pending, setPending] = useState(null); // { state, exportedAt }
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const download = () => {
    const blob = new Blob([serializeBackup(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backupFileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const copy = async () => {
    const text = serializeBackup(state);
    try {
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
      setTimeout(() => setCopyState(null), 2500);
    } catch {
      setCopyState({ text }); // z. B. ohne HTTPS: Text zum Kopieren von Hand anzeigen
    }
  };

  const check = (text) => {
    setError(null);
    setDone(false);
    try {
      setPending(parseBackup(text));
    } catch (e) {
      setPending(null);
      setError(e instanceof BackupError ? e.reason : 'invalid');
    }
  };

  const onFile = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    file.text().then(check, () => setError('read'));
  };

  const restore = () => {
    onRestore(pending.state);
    setPending(null);
    setPasted('');
    setPasteOpen(false);
    setDone(true);
  };

  const summary = pending && summarizeBackup(pending.state);
  const date = pending && pending.exportedAt
    ? new Date(pending.exportedAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="space-y-4 py-4">
      <div>
        <p className="font-bold text-slate-800 dark:text-slate-100">{t('settings.data')}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.dataHint')}</p>
      </div>

      {/* Exportieren */}
      <div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('backup.exportTitle')}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('backup.exportHint')}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" className={btnSoft} onClick={download}><Icon name="download" size={16} />{t('backup.download')}</button>
          <button type="button" className={btnSoft} onClick={copy}>
            <Icon name={copyState === 'copied' ? 'check' : 'copy'} size={16} />{copyState === 'copied' ? t('backup.copied') : t('backup.copy')}
          </button>
        </div>
        {copyState && copyState.text && (
          <div className="mt-2">
            <p className="text-sm text-slate-600 dark:text-slate-300">{t('backup.copyFallback')}</p>
            <textarea readOnly value={copyState.text} rows={4} onFocus={(e) => e.target.select()}
              className={`${inputCls} mt-1 font-mono text-xs`} aria-label={t('backup.pasteLabel')} />
          </div>
        )}
      </div>

      {/* Einspielen */}
      <div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('backup.importTitle')}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" className={btnSoft} onClick={() => fileRef.current && fileRef.current.click()}>
            <Icon name="upload" size={16} />{t('backup.chooseFile')}
          </button>
          <button type="button" className={btnSoft} aria-expanded={pasteOpen} onClick={() => setPasteOpen((o) => !o)}>
            <Icon name="clipboard" size={16} />{t('backup.pasteText')}
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json,text/plain" className="hidden" onChange={onFile} tabIndex={-1} aria-hidden="true" />
        </div>

        {pasteOpen && (
          <div className="anim-fade mt-2 space-y-2">
            <textarea value={pasted} onChange={(e) => setPasted(e.target.value)} rows={4} placeholder={t('backup.pastePlaceholder')}
              className={`${inputCls} font-mono text-xs`} aria-label={t('backup.pasteLabel')} />
            <button type="button" className={btnSoft} disabled={!pasted.trim()} onClick={() => check(pasted)}>{t('backup.check')}</button>
          </div>
        )}

        {error && <p className="mt-2 rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-900 dark:bg-rose-400/10 dark:text-rose-100" role="alert">{t(`backup.errors.${error}`)}</p>}
        {done && <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300" role="status"><Icon name="check" size={16} strokeWidth={3} />{t('backup.restored')}</p>}

        {pending && (
          <div className="anim-fade mt-2 rounded-2xl bg-amber-50 p-3 dark:bg-amber-400/10">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {date ? t('backup.preview', { date, ...summary }) : t('backup.previewNoDate', summary)}
            </p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{t('backup.replaceWarning')}</p>
            {signedIn && <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{t('backup.replaceWarningSync')}</p>}
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={restore} className={`rounded-xl bg-amber-200 px-3 py-1.5 text-sm font-bold text-amber-950 hover:bg-amber-300 ${focusRing}`}>{t('backup.replaceConfirm')}</button>
              <button type="button" onClick={() => setPending(null)} className={`rounded-xl px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700 ${focusRing}`}>{t('common.cancel')}</button>
            </div>
          </div>
        )}
      </div>

      {/* Zurücksetzen */}
      <div>
        {!confirmReset ? (
          <button type="button" onClick={() => setConfirmReset(true)} className={`rounded-2xl px-3 py-2 text-sm font-bold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50 dark:text-rose-200 dark:ring-rose-300/30 dark:hover:bg-rose-400/10 ${focusRing}`}>
            {t('settings.reset')}
          </button>
        ) : (
          <div className="anim-fade rounded-2xl bg-rose-50 p-3 dark:bg-rose-400/10">
            <p className="text-sm font-semibold text-rose-900 dark:text-rose-100">{t('settings.resetWarning')}</p>
            {signedIn && <p className="mt-1 text-sm text-rose-900 dark:text-rose-100">{t('settings.resetWarningSync')}</p>}
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => { onReset(); setConfirmReset(false); }} className={`rounded-xl bg-rose-200 px-3 py-1.5 text-sm font-bold text-rose-900 hover:bg-rose-300 ${focusRing}`}>{t('settings.resetConfirm')}</button>
              <button type="button" onClick={() => setConfirmReset(false)} className={`rounded-xl px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700 ${focusRing}`}>{t('common.cancel')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
