/**
 * Schlanker Client für die PocketBase-REST-API – nur das, was der Sync braucht.
 * Bewusst ohne SDK: so bleibt nachvollziehbar, welche Anfragen die App schickt.
 */

/** Fehler mit Art: network | auth | notfound | invalid | ratelimit | server | outdated (Daten von neuerer App-Version) */
export class SyncError extends Error {
  constructor(kind, status = 0, body = null) {
    super(kind);
    this.kind = kind;
    this.status = status;
    this.body = body;
  }
}

function kindFor(status) {
  if (status === 401 || status === 403) return 'auth';
  if (status === 404) return 'notfound';
  if (status === 400) return 'invalid';
  if (status === 429) return 'ratelimit';
  return 'server';
}

export function createApi(baseUrl, fetchImpl = (...args) => fetch(...args)) {
  async function request(path, { method = 'GET', token, body } = {}) {
    let res;
    try {
      res = await fetchImpl(baseUrl + path, {
        method,
        headers: {
          ...(body ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: token } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw new SyncError('network');
    }
    let json = null;
    try {
      json = res.status === 204 ? null : await res.json();
    } catch {
      json = null;
    }
    if (!res.ok) throw new SyncError(kindFor(res.status), res.status, json);
    return json;
  }

  const toSession = (res) => ({ token: res.token, userId: res.record.id, email: res.record.email, refreshedAt: Date.now() });

  return {
    async login(email, password) {
      const res = await request('/api/collections/users/auth-with-password', {
        method: 'POST',
        body: { identity: email, password },
      });
      return toSession(res);
    },

    async register(email, password, invite) {
      await request('/api/collections/users/records', {
        method: 'POST',
        body: { email, password, passwordConfirm: password, invite },
      });
      return this.login(email, password);
    },

    async refresh(session) {
      const res = await request('/api/collections/users/auth-refresh', { method: 'POST', token: session.token });
      return toSession(res);
    },

    /** Der Spielstand der angemeldeten Person oder null. */
    async getSave(session) {
      const filter = encodeURIComponent(`user = "${session.userId}"`);
      const res = await request(`/api/collections/saves/records?perPage=1&filter=${filter}`, { token: session.token });
      const record = res && res.items && res.items[0];
      return record ? { id: record.id, rev: Number(record.rev) || 0, data: record.data } : null;
    },

    async createSave(session, data) {
      const record = await request('/api/collections/saves/records', {
        method: 'POST',
        token: session.token,
        body: { user: session.userId, data, rev: 1 },
      });
      return { id: record.id, rev: Number(record.rev) || 1, data: record.data };
    },

    /** Schlägt mit notfound fehl, wenn ein anderes Gerät inzwischen gespeichert hat (rev passt nicht). */
    async updateSave(session, id, data, rev) {
      const record = await request(`/api/collections/saves/records/${id}`, {
        method: 'PATCH',
        token: session.token,
        body: { data, rev },
      });
      return { id: record.id, rev: Number(record.rev) || rev, data: record.data };
    },

    async deleteAccount(session) {
      await request(`/api/collections/users/records/${session.userId}`, { method: 'DELETE', token: session.token });
    },
  };
}

/** Übersetzt Server-Fehler bei Anmeldung und Registrierung in einen Schlüssel für die Oberfläche. */
export function authErrorKey(error, mode) {
  if (!(error instanceof SyncError)) return 'generic';
  if (error.kind === 'network') return 'network';
  if (error.kind === 'ratelimit') return 'tooMany';
  const fields = (error.body && error.body.data) || {};
  if (fields.invite) return 'invite';
  if (fields.email) return fields.email.code === 'validation_not_unique' ? 'emailTaken' : 'emailInvalid';
  if (fields.password || fields.passwordConfirm) return 'password';
  if (mode === 'login' && error.kind === 'invalid') return 'login';
  return 'generic';
}
