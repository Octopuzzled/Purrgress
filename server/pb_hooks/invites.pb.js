/// <reference path="../pb_data/types.d.ts" />

/**
 * Registrierung nur mit gültigem Einladungscode.
 *
 * - Die App schickt den Code als Feld "invite" mit.
 * - Jeder Code gilt genau einmal und wird danach mit dem neuen Konto verknüpft.
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
  const code = String(body.invite || "").trim().toLowerCase();
  if (!code) {
    throw invalid();
  }

  let invite;
  try {
    invite = e.app.findFirstRecordByFilter("invites", "code:lower = {:code} && usedBy = ''", { code: code });
  } catch (_) {
    throw invalid();
  }

  e.next();

  invite.set("usedBy", e.record.id);
  invite.set("usedAt", new Date().toISOString());
  e.app.save(invite);
}, "users");
