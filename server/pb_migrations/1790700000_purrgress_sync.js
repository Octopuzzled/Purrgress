/// <reference path="../pb_data/types.d.ts" />

/**
 * Purrgress: Sammlungen für Einladungen und Spielstände.
 * Wird beim Start von PocketBase automatisch einmal ausgeführt.
 */
migrate((app) => {
  const users = app.findCollectionByNameOrId("users");

  // Registrieren darf jede Person versuchen – pb_hooks/invites.pb.js prüft den Einladungscode.
  // Sonst sieht, ändert und löscht jede Person nur ihr eigenes Konto.
  users.createRule = "";
  users.listRule = "id = @request.auth.id";
  users.viewRule = "id = @request.auth.id";
  users.updateRule = "id = @request.auth.id";
  users.deleteRule = "id = @request.auth.id";
  app.save(users);

  // Einladungen: nur in der Admin-Oberfläche sichtbar (alle Regeln gesperrt)
  const invites = new Collection({
    type: "base",
    name: "invites",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "code",
        type: "text",
        required: true,
        presentable: true,
        min: 6,
        max: 40,
        // wird beim Anlegen automatisch erzeugt (ohne leicht verwechselbare Zeichen wie 0/O, 1/I)
        autogeneratePattern: "[A-HJ-NP-Z2-9]{8}",
      },
      { name: "note", type: "text", max: 200 },
      { name: "usedBy", type: "relation", collectionId: users.id, maxSelect: 1, cascadeDelete: false },
      { name: "usedAt", type: "date" },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_invites_code ON invites (code)"],
  });
  app.save(invites);

  // Spielstände: genau einer pro Person, nur für sie selbst lesbar und änderbar.
  // rev muss bei jedem Update steigen – so kann ein Gerät nie unbemerkt
  // überschreiben, was ein anderes Gerät gerade gespeichert hat.
  const saves = new Collection({
    type: "base",
    name: "saves",
    listRule: "user = @request.auth.id",
    viewRule: "user = @request.auth.id",
    createRule: "@request.auth.id != '' && @request.body.user = @request.auth.id",
    updateRule: "user = @request.auth.id && @request.body.user:isset = false && @request.body.rev > rev",
    deleteRule: "user = @request.auth.id",
    fields: [
      { name: "user", type: "relation", collectionId: users.id, required: true, maxSelect: 1, cascadeDelete: true },
      { name: "data", type: "json", maxSize: 2000000 },
      { name: "rev", type: "number", onlyInt: true, min: 0 },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_saves_user ON saves (user)"],
  });
  app.save(saves);
}, (app) => {
  for (const name of ["saves", "invites"]) {
    try {
      app.delete(app.findCollectionByNameOrId(name));
    } catch (_) {
      // schon gelöscht
    }
  }
});
