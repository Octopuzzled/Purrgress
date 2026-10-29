/// <reference path="../pb_data/types.d.ts" />

/**
 * Registrierung nur mit gültigem Einladungscode.
 *
 * - Die App schickt den Code als Feld "invite" mit.
 * - Jeder Code gilt genau einmal und wird danach mit dem neuen Konto verknüpft.
 * - Prüfen, Konto anlegen und Code verbrauchen passieren in einer Transaktion:
 *   Zwei gleichzeitige Registrierungen können denselben Code nicht beide nutzen.
 * - Superuser (Admin-Oberfläche) können Konten auch ohne Code anlegen.
 *
 * Hinweis: PocketBase führt jeden Hook isoliert aus. Hilfsfunktionen müssen
 * deshalb innerhalb des Hooks stehen.
 */
onRecordCreateRequest((e) => {
  if (e.hasSuperuserAuth()) {
    return e.next();
  }

  const invalid = () =>
    new BadRequestError("Invalid invitation code.", {
      invite: new ValidationError("invalid_invite", "The invitation code is invalid or has already been used."),
    });

  const body = e.requestInfo().body || {};
  const code = String(body.invite || "").trim().toLowerCase().slice(0, 40);
  if (!code) {
    throw invalid();
  }

  const findUnused = (app) => {
    try {
      return app.findFirstRecordByFilter("invites", "code:lower = {:code} && usedBy = ''", { code: code });
    } catch (_) {
      return null;
    }
  };

  // Schnelle Absage ohne Transaktion
  if (!findUnused(e.app)) {
    throw invalid();
  }

  let used = false;
  e.app.runInTransaction((txApp) => {
    // Innerhalb der Transaktion noch einmal prüfen – Schreibzugriffe laufen hier nacheinander
    const invite = findUnused(txApp);
    if (!invite) {
      used = true;
      return;
    }
    e.app = txApp;
    e.next();
    invite.set("usedBy", e.record.id);
    invite.set("usedAt", new Date().toISOString());
    txApp.save(invite);
  });

  if (used) {
    throw invalid();
  }
}, "users");
