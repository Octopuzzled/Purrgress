import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { authErrorKey, createApi } from '../sync/api.js';
import { SYNC_URL } from '../sync/config.js';
import { syncOnce } from '../sync/engine.js';
import { equal, merge3 } from '../sync/merge.js';
import { loadSession, loadSyncMeta, saveSession, saveSyncMeta } from '../sync/storage.js';
import { applySyncable, toSyncable } from '../sync/syncable.js';

const DEBOUNCE_MS = 3000;
const PULL_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Konto und automatischer Abgleich.
 *
 * Abgeglichen wird beim Start, nach Anmeldung, einige Sekunden nach jeder Änderung,
 * beim Zurückkehren zur App, beim Wechsel in den Hintergrund, wenn das Netz zurückkommt
 * und alle fünf Minuten.
 *
 * status: off | idle | syncing | ok | offline | error | auth
 */
export function useSync({ state, setState }) {
  const api = useMemo(() => (SYNC_URL ? createApi(SYNC_URL) : null), []);
  const [session, setSession] = useState(() => (api ? loadSession() : null));
  const [status, setStatus] = useState(() => (api && loadSession() ? 'idle' : 'off'));
  const [lastSync, setLastSync] = useState(() => loadSyncMeta().lastSync || null);
  const [needsChoice, setNeedsChoice] = useState(false);
  const [invite, setInvite] = useState('');

  const stateRef = useRef(state);
  stateRef.current = state;
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const running = useRef(false);
  const queued = useRef(false);

  const signOutLocally = useCallback((nextStatus = 'off') => {
    saveSession(null);
    saveSyncMeta({});
    sessionRef.current = null;
    setSession(null);
    setNeedsChoice(false);
    setLastSync(null);
    setStatus(nextStatus);
  }, []);

  const run = useCallback(async (choice) => {
    const current = sessionRef.current;
    if (!api || !current) return;
    if (running.current) {
      queued.current = true;
      return;
    }
    running.current = true;
    setStatus('syncing');
    try {
      const meta = loadSyncMeta();
      const base = meta.userId === current.userId ? meta.base || null : null;
      const local = toSyncable(stateRef.current);
      const result = await syncOnce({ api, session: current, base, local, choice });
      if (sessionRef.current !== current) return; // inzwischen abgemeldet
      if (result.needsChoice) {
        setNeedsChoice(true);
        setStatus('idle');
        return;
      }
      // Was während der Anfrage auf diesem Gerät passiert ist, bleibt erhalten
      setState((s) => applySyncable(s, merge3(local, toSyncable(s), result.merged)));
      const now = Date.now();
      saveSyncMeta({ userId: current.userId, base: result.merged, lastSync: now });
      setLastSync(now);
      setNeedsChoice(false);
      setStatus('ok');
    } catch (error) {
      if (error.kind === 'auth') {
        signOutLocally('auth');
      } else {
        setStatus(error.kind === 'network' ? 'offline' : 'error');
      }
    } finally {
      running.current = false;
      if (queued.current) {
        queued.current = false;
        setTimeout(() => run(), 300);
      }
    }
  }, [api, setState, signOutLocally]);

  /* Beim Start: Anmeldung auffrischen, dann abgleichen */
  useEffect(() => {
    const current = sessionRef.current;
    if (!api || !current) return;
    let cancelled = false;
    api.refresh(current)
      .then((fresh) => {
        if (cancelled || sessionRef.current !== current) return;
        saveSession(fresh);
        sessionRef.current = fresh;
        setSession(fresh);
        run();
      })
      .catch((error) => {
        if (cancelled) return;
        if (error.kind === 'auth') signOutLocally('auth');
        else setStatus(error.kind === 'network' ? 'offline' : 'error');
      });
    return () => {
      cancelled = true;
    };
    // nur einmal beim Start
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  /* Einige Sekunden nach einer Änderung abgleichen */
  useEffect(() => {
    if (!session) return undefined;
    const meta = loadSyncMeta();
    if (!meta.base || meta.userId !== session.userId) return undefined;
    if (equal(toSyncable(state), meta.base)) return undefined;
    const t = setTimeout(() => run(), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [state, session, run]);

  /* Zurück in der App, wieder online, im Hintergrund, alle fünf Minuten */
  useEffect(() => {
    if (!session) return undefined;
    const onVisibility = () => run();
    const onOnline = () => run();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', onOnline);
    const iv = setInterval(() => run(), PULL_INTERVAL_MS);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onOnline);
      clearInterval(iv);
    };
  }, [session, run]);

  const signIn = useCallback(async (mode, { email, password, invite: code }) => {
    try {
      const fresh = mode === 'register'
        ? await api.register(email.trim(), password, code.trim().toUpperCase())
        : await api.login(email.trim(), password);
      saveSession(fresh);
      saveSyncMeta({});
      sessionRef.current = fresh;
      setSession(fresh);
      setInvite('');
      await run();
      return null;
    } catch (error) {
      return authErrorKey(error, mode);
    }
  }, [api, run]);

  const signOut = useCallback(() => signOutLocally('off'), [signOutLocally]);

  const deleteAccount = useCallback(async () => {
    const current = sessionRef.current;
    if (!current) return null;
    try {
      await api.deleteAccount(current);
      signOutLocally('off');
      return null;
    } catch (error) {
      return error.kind === 'network' ? 'network' : 'generic';
    }
  }, [api, signOutLocally]);

  return {
    enabled: !!api,
    session,
    status,
    lastSync,
    needsChoice,
    invite,
    setInvite,
    syncNow: () => run(),
    resolveChoice: (choice) => run(choice),
    signIn,
    signOut,
    deleteAccount,
  };
}
