# Purrgress nutzen: lokal, im Browser und als Android-App

Es gibt drei Wege. Du kannst sie kombinieren.

| Weg | Wofür | Aufwand |
| --- | --- | --- |
| **A. Lokal testen** | Entwickeln und ausprobieren | 2 Minuten |
| **B. Web-App auf deinem Server** | Im Browser nutzen und auf dem Handy wie eine App installieren (PWA). Funktioniert auf Android, iPhone und am PC | einmalig ca. 20 Minuten |
| **C. Android-APK** | Eine echte App-Datei, die ohne Server läuft | einmalig ca. 45 Minuten (vor allem Android Studio installieren) |

> **Daten auf mehreren Geräten:** Ohne Konto hat jedes Gerät (und jeder Browser) seinen eigenen Spielstand. Mit einem Konto sind alle Geräte automatisch auf demselben Stand. Wie du den Sync-Server einrichtest, steht in **[SYNC.md](SYNC.md)**.

---

## Voraussetzungen

- **Node.js 20.19 oder neuer** (empfohlen: 22). Prüfen mit `node -v`.
- Einmalig im Projektordner: `npm install`

---

## A. Lokal testen

```bash
npm run dev
```

Öffne <http://localhost:5173>.

### Auf dem Handy im selben WLAN testen

```bash
npm run dev:phone
```

Vite zeigt dir eine zweite Adresse wie `http://192.168.178.23:5173`. Öffne sie im Handy-Browser. Handy und PC müssen im selben WLAN sein. Installieren als App geht so noch nicht, dafür braucht es HTTPS (Weg B).

### Den fertigen Build testen

```bash
npm run build
npm run preview
```

---

## B. Web-App auf deinem Server (empfohlen)

### Einmalig: Server vorbereiten

**1. Subdomain anlegen.** Beim Domain-Anbieter einen A-Record anlegen, z. B. `purrgress` → IP deines Servers. Es kann ein paar Minuten dauern, bis er aktiv ist.

**2. Ordner auf dem Server anlegen** (per `ssh` einloggen):

```bash
sudo mkdir -p /var/www/purrgress
sudo chown "$USER": /var/www/purrgress
```

**3. Caddy einrichten.** In die Caddyfile (meist `/etc/caddy/Caddyfile`) einfügen und die Domain anpassen. Der Block enthält schon die Weiterleitung für den Sync-Server. Solange der nicht läuft, stört sie nicht.

```caddy
purrgress.example.de {
	encode zstd gzip

	# Sync-Server (PocketBase), siehe docs/SYNC.md
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

	# Dateien mit Hash im Namen dürfen lange im Cache bleiben
	@assets path /assets/*
	header @assets Cache-Control "public, max-age=31536000, immutable"

	# Diese Dateien müssen immer frisch sein, sonst kommen Updates nicht an
	@fresh path /index.html /sw.js /registerSW.js /manifest.webmanifest
	header @fresh Cache-Control "no-cache"
}
```

Prüfen und neu laden:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Caddy holt das HTTPS-Zertifikat automatisch.

### Einmalig: Deployment auf deinem PC einrichten

```bash
cp .env.deploy.example .env.deploy
```

In `.env.deploy` eintragen, wie du dich per SSH anmeldest und wohin die Dateien sollen:

```sh
DEPLOY_HOST=benutzer@dein-server
DEPLOY_PATH=/var/www/purrgress
```

`.env.deploy` wird nicht ins Git-Repo übernommen, deine Serverdaten bleiben also privat.

### Jedes Mal: Neue Version hochladen

```bash
npm run deploy
```

Das baut die App und lädt sie per `rsync` hoch. Voraussetzung: `ssh` und `rsync` sind installiert (unter Windows am einfachsten in WSL).

### Als App installieren

- **Android (Chrome):** Seite öffnen → Menü ⋮ → **„App installieren“**.
- **iPhone (Safari):** Seite öffnen → Teilen-Symbol → **„Zum Home-Bildschirm“**.
- **PC (Chrome, Edge):** Installieren-Symbol rechts in der Adressleiste.

Danach startet Purrgress ohne Browserleiste und funktioniert offline. Nach einem neuen Deployment aktualisiert sich die App beim nächsten Öffnen selbst.

---

## C. Android-APK bauen

Die APK enthält die komplette App und braucht keinen Server. Gebaut wird sie mit [Capacitor](https://capacitorjs.com/) und dem Android SDK.

### Einmalig: Android Studio installieren

1. [Android Studio](https://developer.android.com/studio) herunterladen und installieren.
2. Beim ersten Start den Einrichtungsassistenten mit den Standardeinstellungen durchlaufen. Er installiert das Android SDK und ein passendes Java (JDK).
3. Unter Linux die Umgebungsvariablen setzen (z. B. in `~/.bashrc`), dann Terminal neu öffnen:

   ```bash
   export ANDROID_HOME="$HOME/Android/Sdk"
   export JAVA_HOME="/opt/android-studio/jbr"   # Pfad deiner Android-Studio-Installation
   ```

### Einmalig: Android-Projekt anlegen

```bash
npm run android:add      # legt den Ordner android/ an
npm run android:icons    # erzeugt App-Icon und Startbildschirm aus assets/
```

Der Ordner `android/` gehört ins Git-Repo.

### APK bauen

```bash
npm run android:apk
```

Die fertige Datei liegt danach hier:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Alternativ mit Oberfläche: `npm run android:sync`, dann `npm run android:open` und in Android Studio **Build → Build App Bundle(s) / APK(s) → Build APK(s)**.

### APK aufs Handy bringen

**Variante 1: Datei kopieren**

1. `app-debug.apk` aufs Handy schicken, z. B. per USB, Cloud oder Nextcloud.
2. Auf dem Handy antippen. Android fragt einmalig, ob die App (z. B. „Dateien“) andere Apps installieren darf. Erlauben.
3. Installieren.

**Variante 2: Direkt per USB-Kabel**

1. Am Handy die Entwickleroptionen aktivieren: Einstellungen → Über das Telefon → 7× auf „Build-Nummer“ tippen.
2. Unter Entwickleroptionen **„USB-Debugging“** einschalten und das Handy anschließen.
3. Installieren:

   ```bash
   "$ANDROID_HOME/platform-tools/adb" install -r android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Updates

Nach Code-Änderungen einfach wieder `npm run android:apk` ausführen und die neue APK installieren. Die Daten bleiben erhalten, solange du vom **selben PC** aus baust. Die Debug-APK wird mit einem Schlüssel signiert, der nur auf diesem Rechner liegt.

> **Debug-APK oder Release-APK?** Für die eigene Nutzung reicht die Debug-APK völlig. Für den Play Store bräuchtest du eine signierte Release-Version mit eigenem Schlüssel. Das lohnt sich erst, wenn andere die App herunterladen sollen.

---

## Fehlerbehebung

| Problem | Lösung |
| --- | --- |
| `npm run deploy`: „Fehlt: .env.deploy“ | Schritt „Deployment einrichten“ ausführen |
| Nach dem Deployment ist noch die alte Version zu sehen | App einmal schließen und neu öffnen. Der Service Worker lädt die neue Version im Hintergrund |
| „App installieren“ erscheint nicht | Die Seite muss über `https://` laufen, nicht über eine lokale IP |
| `android:apk`: „SDK location not found“ | `ANDROID_HOME` setzen (siehe oben) oder Projekt einmal in Android Studio öffnen |
| `android:apk`: Java-Fehler | `JAVA_HOME` auf das JDK von Android Studio zeigen lassen |
| Android meldet „App nicht installiert“ bei einem Update | Die alte Version wurde auf einem anderen PC gebaut. Alte App deinstallieren, dann neu installieren (Daten gehen dabei verloren) |
| Der Ende-Ton der Zeitbox kommt nicht, wenn das Handy gesperrt ist | Android pausiert JavaScript im Hintergrund. Die Zeit stimmt trotzdem. Für zuverlässige Signale kann später `@capacitor/local-notifications` ergänzt werden |
