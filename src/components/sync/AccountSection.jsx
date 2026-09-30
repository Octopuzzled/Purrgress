import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/useI18n.js';
import { Icon } from '../ui/Icon.jsx';
import { SegmentedControl } from '../ui/SegmentedControl.jsx';
import { btnPrimary, btnSoft, focusRing, inputCls, sheet } from '../ui/styles.js';

const STATUS_ICON = { ok: 'cloud', syncing: 'refresh', idle: 'cloud', offline: 'cloudOff', error: 'cloudOff', auth: 'cloudOff' };

/** Bereich „Konto & Sync“ in den Einstellungen. */
export function AccountSection({ sync }) {
  const { t } = useI18n();

  return (
    <section className={`${sheet} p-4 sm:p-5`} aria-labelledby="account-title">
      <h3 id="account-title" className="flex items-center gap-2 font-display text-lg font-semibold text-slate-800 dark:text-slate-100">
        <Icon name="cloud" size={20} className="text-violet-400" />{t('sync.heading')}
      </h3>
      {!sync.enabled ? (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('sync.notConfigured')}</p>
      ) : sync.session ? (
        <SignedIn sync={sync} />
      ) : (
        <SignInForm sync={sync} />
      )}
    </section>
  );
}

function SyncStatus({ status, lastSync }) {
  const { t, clock } = useI18n();
  const text = status === 'ok' && lastSync ? t('sync.status.ok', { time: clock(lastSync) }) : t(`sync.status.${status === 'ok' ? 'idle' : status}`);
  const tone = status === 'error' || status === 'offline' ? 'text-orange-700 dark:text-orange-300' : 'text-slate-500 dark:text-slate-400';
  return (
    <p className={`flex items-center gap-2 text-sm ${tone}`} role="status" aria-live="polite">
      <Icon name={STATUS_ICON[status] || 'cloud'} size={16} className={status === 'syncing' ? 'animate-spin' : ''} />
      {text}
    </p>
  );
}

function SignedIn({ sync }) {
  const { t } = useI18n();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState(null);

  const remove = async () => {
    const result = await sync.deleteAccount();
    if (result) setError(result);
    else setConfirmDelete(false);
  };

  return (
    <div className="mt-2 space-y-3">
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('sync.signedInAs', { email: sync.session.email })}</p>
      <SyncStatus status={sync.status} lastSync={sync.lastSync} />
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnSoft} onClick={sync.syncNow} disabled={sync.status === 'syncing'}>
          <Icon name="refresh" size={16} />{t('sync.syncNow')}
        </button>
        <button type="button" className={btnSoft} onClick={sync.signOut}>
          <Icon name="logout" size={16} />{t('sync.signOut')}
        </button>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{t('sync.signOutHint')}</p>

      {!confirmDelete ? (
        <button type="button" onClick={() => setConfirmDelete(true)}
          className={`rounded-xl px-2 py-1 text-sm font-bold text-rose-700 hover:bg-rose-50 dark:text-rose-200 dark:hover:bg-rose-400/10 ${focusRing}`}>
          {t('sync.deleteAccount')}
        </button>
      ) : (
        <div className="anim-fade rounded-2xl bg-rose-50 p-3 dark:bg-rose-400/10">
          <p className="text-sm font-semibold text-rose-900 dark:text-rose-100">{t('sync.deleteWarning')}</p>
          {error && <p className="mt-1 text-sm text-rose-800 dark:text-rose-200">{t(`sync.errors.${error}`)}</p>}
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={remove} className={`rounded-xl bg-rose-200 px-3 py-1.5 text-sm font-bold text-rose-900 hover:bg-rose-300 ${focusRing}`}>{t('sync.deleteConfirm')}</button>
            <button type="button" onClick={() => setConfirmDelete(false)} className={`rounded-xl px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700 ${focusRing}`}>{t('common.cancel')}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function SignInForm({ sync }) {
  const { t } = useI18n();
  const [mode, setMode] = useState(sync.invite ? 'register' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [invite, setInvite] = useState(sync.invite || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Einladungslink kann auch später noch eintreffen
  useEffect(() => {
    if (sync.invite) {
      setInvite(sync.invite);
      setMode('register');
    }
  }, [sync.invite]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await sync.signIn(mode, { email, password, invite });
    setBusy(false);
    if (result) setError(result);
  };

  const field = (id, label, props) => (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-200">{label}</label>
      <input id={id} className={inputCls} {...props} />
    </div>
  );

  return (
    <div className="mt-1 space-y-3">
      <p className="text-sm text-slate-500 dark:text-slate-400">{t('sync.intro')}</p>
      {sync.status === 'auth' && <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">{t('sync.status.auth')}</p>}

      <SegmentedControl label={t('sync.mode')} value={mode} onChange={(m) => { setMode(m); setError(null); }}
        options={[{ value: 'login', label: t('sync.login') }, { value: 'register', label: t('sync.register') }]} />

      <form onSubmit={submit} className="space-y-3" noValidate>
        {field('acc-email', t('sync.email'), { type: 'email', autoComplete: 'email', required: true, value: email, onChange: (e) => setEmail(e.target.value) })}
        {field('acc-password', t('sync.password'), {
          type: 'password', autoComplete: mode === 'register' ? 'new-password' : 'current-password', required: true, minLength: 8,
          value: password, onChange: (e) => setPassword(e.target.value),
          'aria-describedby': mode === 'register' ? 'acc-password-hint' : undefined,
        })}
        {mode === 'register' && <p id="acc-password-hint" className="-mt-2 text-xs text-slate-500 dark:text-slate-400">{t('sync.passwordHint')}</p>}
        {mode === 'register' && field('acc-invite', t('sync.invite'), {
          autoComplete: 'off', autoCapitalize: 'characters', spellCheck: false, required: true,
          value: invite, onChange: (e) => setInvite(e.target.value.toUpperCase()),
        })}

        {error && <p className="rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-900 dark:bg-rose-400/10 dark:text-rose-100" role="alert">{t(`sync.errors.${error}`)}</p>}

        <button type="submit" className={`${btnPrimary} w-full`} disabled={busy || !email || !password || (mode === 'register' && !invite)}>
          {busy ? t('sync.working') : t(mode === 'register' ? 'sync.submitRegister' : 'sync.submitLogin')}
        </button>
      </form>

      <p className="text-xs text-slate-500 dark:text-slate-400">{t('sync.localKept')}</p>
      {mode === 'login' && <p className="text-xs text-slate-500 dark:text-slate-400">{t('sync.forgotPassword')}</p>}
    </div>
  );
}
