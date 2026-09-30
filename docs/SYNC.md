# Konto & Sync einrichten

Mit einem Konto ist der Fortschritt auf allen Geräten gleich: Handy, Laptop und APK. Dahinter steckt [PocketBase](https://pocketbase.io) auf deinem eigenen Server. Registrieren kann sich nur, wer einen Einladungscode von dir hat.

## So funktioniert es

- Jedes Gerät behält eine eigene Kopie und funktioniert auch offline.
- Abgeglichen wird beim Start, ein paar Sekunden nach jeder Änderung, beim Zurückkehren zur App, wenn das Netz zurückkommt, und alle fünf Minuten.
- **Zusammenführen statt Überschreiben:** XP, Münzen und Verlauf von beiden Geräten werden addiert. Aufgaben werden einzeln abgeglichen. Löschen auf einem Gerät gegen Bearbeiten auf dem anderen: Die bearbeitete Fassung bleibt.
- **Pro Gerät bleiben:** laufende Zeitbox, Sprache, Farbschema, Töne, Animationen, Erinnerungs-Klang.
- Auf dem Server liegt ein Spielstand pro Person, meist 20 bis 50 KB.

---

## Einmalig: Server einrichten

Voraussetzungen: Docker und Caddy laufen bereits (wie bei deinen anderen Diensten), und die Web-App ist nach [DEPLOYMENT.md](DEPLOYMENT.md) eingerichtet.

### 1. Server-Dateien hochladen und starten

In `.env.deploy` steht bereits `SERVER_PATH=docker/purrgress-api`. Dann:

```bash
npm run deploy:server
```

Das lädt den Ordner `server/` hoch und startet PocketBase mit `docker compose up -d --build`. Beim ersten Start legt PocketBase die Sammlungen `invites` und `saves` automatisch an.

Kontrolle auf dem Server:

```bash
cd ~/docker/purrgress-api
docker compose ps           # Status sollte "healthy" werden
docker compose logs --tail 30
```

> Port 8090 schon belegt? In `server/docker-compose.yml` die linke Zahl ändern (z. B. `127.0.0.1:8095:8090`) und im Caddy-Block unten ebenfalls.

### 2. Admin-Zugang anlegen

```bash
cd ~/docker/purrgress-api
docker compose exec pocketbase /pb/pocketbase superuser create DEINE@MAIL.DE 'EIN-LANGES-PASSWORT' --dir=/pb/pb_data
```

### 3. Caddy erweitern

Den Purrgress-Block in der Caddyfile durch diesen ersetzen. Er leitet `/api/` und die Admin-Oberfläche `/_/` an PocketBase weiter, alles andere ist die App:

```caddy
purrgress.octopuzzled.de {
	encode zstd gzip

	# Sync-Server (PocketBase): Schnittstelle und Admin-Oberfläche
	handle /api/* {
		reverse_proxy 127.0.0.1:8090
	}
	handle /_/* {
		reverse_proxy 127.0.0.1:8090
	}

	# Die App
	handle {
		root * /var/www/purrgress
		try_files {path} /index.html
		file_server
	}

	@assets path /assets/*
	header @assets Cache-Control "public, max-age=31536000, immutable"

	@fresh path /index.html /sw.js /registerSW.js /manifest.webmanifest
	header @fresh Cache-Control "no-cache"
}
```

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

### 4. PocketBase einstellen

Öffne `https://purrgress.octopuzzled.de/_/` und melde dich mit dem Admin-Zugang an. Unter **Settings**:

- **Application:** Name `Purrgress`, URL `https://purrgress.octopuzzled.de`.
- **Application → User IP proxy headers:** `X-Forwarded-For` eintragen. So sieht PocketBase die echten IP-Adressen statt der von Caddy.
- **Rate limits:** einschalten. Das bremst automatisierte Anmeldeversuche.
- **Backups:** eine regelmäßige Sicherung einplanen, z. B. täglich.

### 5. App neu veröffentlichen

```bash
npm run deploy
```

Unter **Fortschritt → Konto & Sync** erscheinen jetzt Anmelden und Registrieren.

---

## Freunde einladen

1. In der Admin-Oberfläche: **Collections → invites → New record**.
2. Der Code wird automatisch erzeugt, z. B. `K7MQ4TXB`. Unter `note` kannst du vermerken, für wen er ist. Speichern.
3. Diesen Link verschicken:

   ```
   https://purrgress.octopuzzled.de/?invite=K7MQ4TXB
   ```

   Er öffnet direkt die Registrierung mit ausgefülltem Code. Jeder Code funktioniert genau einmal. Danach siehst du unter `usedBy`, wer ihn eingelöst hat.

**Passwort vergessen?** Ohne Mailversand setzt du es selbst zurück: **Collections → users →** Person öffnen → neues Passwort eintragen → speichern. Die Person meldet sich dann mit dem neuen Passwort an. Später lässt sich unter **Settings → Mail settings** ein SMTP-Zugang eintragen, dann funktioniert „Passwort vergessen“ per E-Mail.

**Konto sperren oder löschen:** unter **Collections → users**. Beim Löschen verschwindet auch der Spielstand.

---

## Für die Android-App

Die APK braucht die Server-Adresse fest eingebaut. Sie steht in `.env.android`:

```sh
VITE_SYNC_URL=https://purrgress.octopuzzled.de
```

Danach wie gewohnt `npm run android:apk`.

## Lokal entwickeln mit Sync

`.env.example` nach `.env.development.local` kopieren. Dann nutzt `npm run dev` den Sync-Server auf deinem Hetzner-Server. Ohne diese Datei ist der Sync lokal ausgeschaltet.

---

## Wartung

**Sicherung:** Alles liegt in `~/docker/purrgress-api/pb_data`. Zusätzlich zu den PocketBase-Backups kannst du den Ordner einfach mitsichern.

**PocketBase aktualisieren:**

1. Das [Changelog](https://github.com/pocketbase/pocketbase/blob/master/CHANGELOG.md) lesen. PocketBase ist noch vor Version 1.0, größere Sprünge können Anpassungen brauchen.
2. Backup anlegen.
3. In `server/docker-compose.yml` die Version bei `PB_VERSION` und `image` ändern.
4. `npm run deploy:server` ausführen.

**Logs:** `docker compose logs -f` im Server-Ordner, oder in der Admin-Oberfläche unter **Logs**.

## Datenschutz

Wenn andere Menschen die App nutzen, liegen ihre Aufgaben auf deinem Server. Das heißt:

- HTTPS ist Pflicht und läuft über Caddy automatisch.
- Regelmäßige Backups gehören dazu, und nur du hast Admin-Zugang.
- Jede Person kann ihr Konto in der App selbst löschen. Damit verschwinden auch ihre Daten vom Server.
- Für einen kleinen Freundeskreis reicht ein kurzer Hinweis, wo die Daten liegen. Wird der Kreis größer, gehört eine Datenschutzerklärung dazu.
