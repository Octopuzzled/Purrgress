# Konto & Sync einrichten

Mit einem Konto ist der Fortschritt auf allen Geräten gleich: Handy, Laptop und APK. Dahinter steckt [PocketBase](https://pocketbase.io) auf deinem eigenen Server. Registrieren kann sich nur, wer einen Einladungscode von dir hat.

## So funktioniert es

- Jedes Gerät behält eine eigene Kopie und funktioniert auch offline.
- Abgeglichen wird beim Start, ein paar Sekunden nach jeder Änderung, beim Zurückkehren zur App, wenn das Netz zurückkommt, und alle fünf Minuten.
- **Zusammenführen statt Überschreiben:** XP, Münzen und Verlauf von beiden Geräten werden addiert. Aufgaben werden einzeln abgeglichen. Löschen auf einem Gerät gegen Bearbeiten auf dem anderen: Die bearbeitete Fassung bleibt.
- **Abgeglichen werden:** Aufgaben (mit Fälligkeit, Wiederholung und Mikro-Schritten), eigene Vorlagen, XP, Münzen, Werte, Verlauf, Fokuszeit, Held und Umkleide, Tagesziel, die Tagesform von heute, Ruhetage und Kuscheldecken sowie die Messungen fürs Zeitgefühl.
- **Pro Gerät bleiben:** laufende Zeitbox, Sprache, Farbschema, Töne, Animationen, Erinnerungs-Klang, die Schalter für Tagesform-Frage, Tagesabschluss und Einführung sowie eingeklappte Abschnitte.
- **Neuer Tag auf mehreren Geräten:** Jedes Gerät schiebt wiederkehrende Aufgaben selbst weiter – nach denselben Regeln, darum entstehen keine Kopien und keine Konflikte.
- Auf dem Server liegt ein Spielstand pro Person, meist 20 bis 50 KB. Erledigte einmalige Aufgaben werden nach 14 Tagen aufgeräumt, damit er auch bei vielen Aufgaben am Tag klein bleibt (PocketBase nimmt bis 2 MB an).
- **Versionen:** Der Spielstand trägt eine Formatnummer. Trifft eine App auf Daten einer neueren Version, pausiert sie den Abgleich und bittet um ein Update, statt etwas zu überschreiben (ab 1.7). Darum nach einem Update alle Geräte aktualisieren – die Web-App macht das von selbst, die Android-App braucht die neue APK.
- **Anmeldung:** wird beim Start und danach spätestens alle 12 Stunden beim Abgleich aufgefrischt, damit auch lange offene Apps angemeldet bleiben.

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

Den Purrgress-Block in der Caddyfile durch diesen ersetzen. Er leitet `/api/` an PocketBase weiter, setzt Sicherheits-Header und sperrt die Admin-Oberfläche und die Admin-Anmeldung von außen. Alles andere ist die App:

```caddy
purrgress.octopuzzled.de {
	encode zstd gzip

	# Sicherheits-Header für alle Antworten
	header {
		Strict-Transport-Security "max-age=31536000; includeSubDomains"
		X-Content-Type-Options "nosniff"
		X-Frame-Options "DENY"
		Referrer-Policy "strict-origin-when-cross-origin"
		Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
		-Server
	}

	# Sync-Server (PocketBase), siehe docs/SYNC.md.
	# Die Admin-Anmeldung ist von außen gesperrt – Admin-Zugang nur über SSH-Tunnel.
	handle /api/* {
		respond /api/collections/_superusers* 404
		reverse_proxy 127.0.0.1:8090
	}

	# Admin-Oberfläche nie öffentlich (SSH-Tunnel, siehe docs/SYNC.md)
	handle /_/* {
		respond 404
	}

	# Die App
	handle {
		root * /var/www/purrgress
		try_files {path} /index.html
		file_server
	}

	# Dateien mit Hash im Namen dürfen lange im Cache bleiben
	@assets path /assets/*
	header @assets Cache-Control "public, max-age=31536000, immutable"

	# Diese Dateien müssen immer frisch sein, sonst kommen Updates nicht an
	@fresh path /index.html /sw.js /registerSW.js /manifest.webmanifest /theme-init.js
	header @fresh Cache-Control "no-cache"
}
```

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

### 4. Admin-Oberfläche öffnen (über SSH-Tunnel)

Die Admin-Oberfläche ist absichtlich nicht aus dem Internet erreichbar – so kann niemand dein Admin-Passwort durchprobieren. Du öffnest sie über einen SSH-Tunnel von deinem PC aus:

```bash
ssh -N -L 8090:127.0.0.1:8090 benutzer@dein-server
```

Solange das Fenster offen ist, erreichst du die Admin-Oberfläche unter <http://localhost:8090/_/>. Zum Beenden `Strg+C`.

### 5. PocketBase einstellen

In der Admin-Oberfläche unter **Settings**:

- **Application:** Name `Purrgress`, URL `https://purrgress.octopuzzled.de`.
- **Backups:** eine regelmäßige Sicherung einplanen, z. B. täglich.

Rate Limits und die Einstellung für den Proxy (echte IP-Adressen hinter Caddy) setzt die Migration `1790800000_purrgress_security.js` automatisch. Unter **Settings → Rate limits** kannst du sie kontrollieren.

### 6. App neu veröffentlichen

```bash
npm run deploy
```

Unter **Fortschritt → Konto & Sync** erscheinen jetzt Anmelden und Registrieren.

---

## Freunde einladen

1. Admin-Oberfläche über den SSH-Tunnel öffnen (siehe oben), dann **Collections → invites → New record**.
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

**„unable to open database file“ nach dem Update auf 1.7:** Der Container läuft seit 1.7 mit minimalen Rechten und darf nur in Ordner schreiben, die root gehören. Wurde `pb_data` von Hand angelegt, einmal die Besitzrechte korrigieren: `sudo chown -R root:root ~/docker/purrgress-api/pb_data`, dann `docker compose up -d`.

**Neue App-Version mit erweitertem Spielstand:** In `src/sync/syncable.js` `SYNC_FORMAT` erhöhen und im CHANGELOG darauf hinweisen. Am Server ist nichts zu tun – der Spielstand liegt dort als ein JSON-Feld. Ältere Apps (ab 1.7) pausieren den Abgleich dann von selbst, bis sie aktualisiert sind.

**Was die Statusmeldungen bedeuten** (Fortschritt → Konto & Sync):

| Meldung | Bedeutung |
| --- | --- |
| Offline | Kein Netz. Abgeglichen wird automatisch, sobald es wieder da ist |
| Abgleich hat nicht geklappt | Server nicht erreichbar oder ein Fehler. Wird bei der nächsten Gelegenheit erneut versucht |
| Anmeldung abgelaufen | Neu anmelden. Die Daten auf dem Gerät bleiben erhalten |
| Neuere Version auf einem anderen Gerät | Diese App aktualisieren. Bis dahin pausiert der Abgleich, damit nichts verloren geht |

## Sicherheit im Überblick

- **Einladungen:** Registrieren geht nur mit einem Code, der genau einmal gilt – auch bei gleichzeitigen Versuchen (Prüfen, Anlegen und Verbrauchen in einer Transaktion).
- **Zugriffsregeln:** Jede Person sieht und ändert nur ihr eigenes Konto und ihren eigenen Spielstand. Einladungen sieht nur der Admin.
- **Rate Limits:** bremsen das Durchprobieren von Passwörtern und Einladungscodes – pro echter IP-Adresse.
- **Admin nur über SSH-Tunnel**, Sicherheits-Header über Caddy, Content-Security-Policy in der Web-App.
- **Container mit minimalen Rechten:** keine Linux-Capabilities, nur lesbares Dateisystem, PocketBase-Download per SHA-256 geprüft.

## Datenschutz

Wenn andere Menschen die App nutzen, liegen ihre Aufgaben auf deinem Server. Das heißt:

- HTTPS ist Pflicht und läuft über Caddy automatisch.
- Regelmäßige Backups gehören dazu, und nur du hast Admin-Zugang.
- Jede Person kann ihr Konto in der App selbst löschen. Damit verschwinden auch ihre Daten vom Server.
- Für einen kleinen Freundeskreis reicht ein kurzer Hinweis, wo die Daten liegen. Wird der Kreis größer, gehört eine Datenschutzerklärung dazu.
