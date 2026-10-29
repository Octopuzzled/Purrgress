# Purrgress

Eine neurodivergenz-freundliche Aufgaben-App mit sanfter Gamification: kleine Aufgaben abhaken, XP und Münzen sammeln, den Katzen-Helden Mochi einkleiden – und mit einer Zeitbox im Stil von Llama Life fokussiert bleiben, ohne gehetzt zu werden.

## Funktionen

- **Aufgaben** mit Kategorie, Kraftaufwand, Mikro-Schritten, Suche und Filter
- **Fälligkeit:** ohne Datum, heute, morgen oder ein anderer Tag – Ansichten „Jetzt“, „Nur heute“ und „Ausblick“, Überfälliges sanft statt rot
- **Wiederholen:** täglich oder an Wochentagen. Verpasstes rutscht weiter, ohne Kopien
- **„Nicht heute“** legt eine Aufgabe mit einem Tipp auf morgen, **„Zu groß?“** fragt nach dem allerkleinsten ersten Schritt
- **„Ta-da!“:** Geschafftes eintragen, das nie geplant war – zählt wie jede andere Aufgabe
- **Tagesform am Morgen** (wenig Kraft = nur leichte Vorschläge, kleineres Tagesziel) und **Tagesabschluss am Abend** – beides abschaltbar
- **Tageszeiten:** Start in den Tag, Jederzeit, Zum Tagesausklang – als einklappbare Abschnitte, nur wenn sie genutzt werden
- **Vorlagen** für ADHS, Autismus, Alltag und Wohlbefinden – ein Tipp, und die Aufgabe steht in der Liste
- **Eigene Vorlagen:** jede Aufgabe lässt sich als Vorlage speichern und wiederverwenden
- **Held Mochi** mit Level, Werten und einer Umkleide: kostenlos anprobieren, mit Münzen kaufen, Meilenstein-Teile bis Level 30 und ein paar Teile, die es nur als Überraschung gibt
- **Zeitbox:** Start per ▶, eigene Zeit wählen, ±5 Minuten, Pause, „Später“, erlaubte Überzeit, Listenzeit mit voraussichtlichem Ende, Erinnerungs-Klang und braunes Rauschen. Mochi arbeitet nebenher mit (Body Doubling) und lernt, wie lange Dinge bei dir wirklich dauern
- **„Was jetzt?“** wählt eine Aufgabe für dich aus, wenn die Entscheidung schwerfällt
- **Fortschritt:** 7-Tage-Verlauf, Tagesziel, Fokuszeit, Serie ohne Strafe – Ruhetage und Kuscheldecken (Umkleide) unterbrechen sie nicht
- **Kleine Überraschungen:** höchstens zwei am Tag – Fundmünzen, ein seltener Mochi-Satz oder ein Geschenk für die Umkleide
- **Einführung:** eine kurze, ruhige Tour beim ersten Start, jederzeit in den Einstellungen wieder einschaltbar
- **Bleibt übersichtlich:** erledigte einmalige Aufgaben verschwinden nach 14 Tagen still aus der Liste – Fortschritt und Verlauf bleiben
- **Deutsch und Englisch:** automatisch nach Gerätesprache oder fest in den Einstellungen
- **Ruhig und zugänglich:** heller und dunkler Modus, „Ruhige Animationen“, Tastaturbedienung, Screenreader-Labels
- **Offline-fähig** als installierbare PWA
- **Konto & Sync** über den eigenen Server (PocketBase), Registrierung nur mit Einladung
- **Sicherung** als Datei oder Text exportieren und wieder einspielen

## Spielbalance

| Schwierigkeit | XP | Münzen |
| --- | --- | --- |
| Leicht | 10 | 5 |
| Mittel | 25 | 12 |
| Schwer | 50 | 25 |

Dazu kommen +2 XP je Mikro-Schritt, +20 Münzen je Level-Aufstieg und einmal am Tag +10 Münzen für das erreichte Tagesziel. Ab der siebten Aufgabe am Tag gibt es die halbe Münzzahl (aufgerundet), XP bleiben voll – so reicht die Umkleide auch dann lange, wenn Purrgress die einzige Aufgaben-App ist. Bis Level 10 braucht jedes Level 20 XP mehr als das vorige, danach wird es zusätzlich Stück für Stück länger. Überraschungen gibt es höchstens zwei am Tag. Die Umkleide kostet insgesamt 7.510 Münzen. Grundteile gibt es ab 20 Münzen, besondere Teile ab Level 5, 8 oder 12, und alle fünf Level bis Level 30 wartet ein Meilenstein-Teil. Bei drei Aufgaben am Tag dauert es etwa sieben Monate, bis alles gekauft ist (bei zwölf etwa drei) – der erste Kauf klappt trotzdem am ersten Tag. Fünf Teile lassen sich nicht kaufen: Mochi verschenkt sie ab und zu als Überraschung, zwei davon nur selten.

Alle Werte stehen in `src/constants/game.js` und `src/constants/shop.js`.

## Tech-Stack

| Bereich | Werkzeug |
| --- | --- |
| UI | React 19 |
| Build & Dev-Server | Vite 7 |
| Styling | Tailwind CSS 4 (eigene Werte in px) |
| Offline & Installation | vite-plugin-pwa (Workbox) |
| Schriften | Fredoka und Nunito, lokal über Fontsource |
| Tests | Vitest |
| Android-App | Capacitor |
| Konto & Sync | PocketBase (selbst gehostet, Docker) |
| Codequalität | ESLint 9, Prettier |

## Voraussetzungen

- Node.js **20.19 oder neuer** (empfohlen: 22, siehe `.nvmrc`)
- npm

## Schnellstart

```bash
npm install
npm run dev
```

Die App läuft dann unter <http://localhost:5173>. Änderungen im Code erscheinen sofort im Browser.

## Skripte

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Entwicklungsserver mit Hot Reload |
| `npm run build` | Produktions-Build nach `dist/` |
| `npm run preview` | Den fertigen Build lokal testen (inklusive PWA) |
| `npm test` | Unit-Tests einmal ausführen |
| `npm run test:watch` | Tests bei jeder Änderung neu ausführen |
| `npm run lint` | Code mit ESLint prüfen |
| `npm run format` | Code mit Prettier formatieren |
| `npm run dev:phone` | Entwicklungsserver im WLAN erreichbar machen |
| `npm run deploy` | Bauen und auf den eigenen Server hochladen |
| `npm run deploy:server` | Sync-Server (PocketBase) hochladen und neu starten |
| `npm run android:add` | Android-Projekt einmalig anlegen |
| `npm run android:icons` | App-Icon und Startbildschirm für Android erzeugen |
| `npm run android:apk` | Android-APK bauen |
| `npm run android:open` | Android-Projekt in Android Studio öffnen |

## Projektstruktur

```
purrgress/
├── index.html                 Einstiegsseite (Vite)
├── vite.config.js             Vite, Tailwind, PWA-Manifest, Vitest
├── public/                    Favicon und App-Icons (Web)
├── assets/                    Quellbilder für Android-Icon und Startbildschirm
├── docs/DEPLOYMENT.md         Anleitung: lokal, Server, Handy, APK
├── docs/SYNC.md               Anleitung: Sync-Server, Einladungen, Wartung
├── scripts/deploy.sh          Bauen und per rsync hochladen
├── scripts/deploy-server.sh   Sync-Server hochladen und neu starten
├── server/                    PocketBase: Dockerfile, Compose, Migration, Einladungs-Hook
├── capacitor.config.json      Einstellungen für die Android-App
├── src/
│   ├── main.jsx               Einstiegspunkt: Schriften, CSS, React
│   ├── App.jsx                Oberste Komponente: verbindet Zustand, Hooks und Ansichten
│   ├── styles/index.css       Tailwind-Import, Theme-Tokens, Animationen
│   ├── constants/             Feste Daten ohne Texte: Spielregeln, Shop, Vorlagen, Navigation, Zeitbox
│   ├── i18n/                  Übersetzungen: Wörterbücher (locales/), t(), Sprachwahl
│   ├── sync/                  Abgleich: API-Client, Drei-Wege-Merge, Ablauf, Speicher
│   ├── lib/                   Reine Funktionen ohne React: Aufgaben, Fälligkeit, Wiederholung, Tagesform,
│   │                          Ruhetage, Überraschungen, Zeitgefühl, Level, Zeitbox, Speicher, Audio
│   ├── hooks/                 Eigene React-Hooks (Spielstand, Tageswechsel, Zeitbox, Sync, Farbschema, Belohnungen)
│   ├── components/
│   │   ├── ui/                Wiederverwendbare Bausteine: Icon, Modal, Toast, Toggle, Styles
│   │   ├── layout/            Kopfzeile und Tab-Leiste
│   │   ├── avatar/            Mochi als SVG, aufgeteilt in Einzelteile
│   │   ├── hero/              Heldenkarte und Level-Up
│   │   ├── settings/          Daten-Bereich: Sicherung, Einspielen, Zurücksetzen
│   │   ├── sync/              Konto-Bereich und Auswahl beim ersten Abgleich
│   │   ├── tasks/             Aufgabenzeile, Formular, Abschnitte, Tagesform, Tagesabschluss, Ta-da, „Zu groß?“
│   │   ├── tour/              Einführung
│   │   └── timebox/           Zeitauswahl, Timer-Ring, Mini-Leiste, Timer- und „Was jetzt?“-Dialog
│   └── views/                 Die vier Bereiche: Aufgaben, Vorlagen, Umkleide, Fortschritt
└── tests/                     Unit-Tests für src/lib und den Abgleich, inklusive Zwei-Geräte-Szenarien
```

## Architektur in Kürze

- **Ein Zustand, eine Quelle:** Der komplette Spielstand liegt in einem Objekt (`useGameState`) und wird bei jeder Änderung in `localStorage` gespeichert (Schlüssel `purrgress-v1`). `migrate()` in `src/lib/state.js` ergänzt fehlende Felder, wenn ältere Spielstände geladen werden.
- **Logik ohne React:** Alles, was den Zustand verändert (Abhaken, Belohnungen, Zeitbox), steckt als reine Funktion in `src/lib/`. Diese Funktionen bekommen einen Zustand und geben einen neuen zurück. Dadurch sind sie leicht zu testen und unabhängig von der Oberfläche.
- **Zeitbox mit Zeitstempeln:** Der Timer speichert Endzeitpunkt bzw. Restzeit statt eines laufenden Zählers. So bleibt die Zeit auch nach einem Neuladen oder im Hintergrund korrekt.
- **Texte getrennt vom Code:** Komponenten enthalten keine Anzeigetexte, sondern Schlüssel wie `t('tasks.heading')`. Die Texte stehen in `src/i18n/locales/`.
- **Sync ohne Datenverlust:** Jedes Gerät merkt sich den Stand beim letzten Abgleich. Beim nächsten Abgleich wird verglichen, was sich auf welcher Seite geändert hat (Drei-Wege-Merge in `src/sync/merge.js`). Zähler wie XP und Münzen werden addiert, sodass Fortschritt von allen Geräten zählt.
- **Tageswechsel an einer Stelle:** `useDailyReset` läuft beim Start, jede Minute und beim Zurückkehren zur App. Es schiebt wiederkehrende Aufgaben weiter (`rollRepeatingTasks`), legt bei Bedarf Kuscheldecken über verpasste Tage (`protectStreak`) und räumt alte erledigte Aufgaben auf (`pruneDoneTasks`). Alles reine Funktionen – zwei Geräte kommen unabhängig voneinander zum selben Ergebnis.
- **Zufall bleibt draußen:** Überraschungen werden vor dem Abhaken einmal ausgewürfelt (`rollSurprise`) und an `completeTask` übergeben. So bleibt die Logik rein und testbar.
- **Versionierter Abgleich:** Der abgeglichene Spielstand trägt eine Formatnummer (`SYNC_FORMAT` in `src/sync/syncable.js`). Trifft eine App auf ein neueres Format, pausiert sie den Abgleich, statt Unbekanntes zu überschreiben. Wird das Format erweitert, die Nummer erhöhen.
- **Hooks für Nebenwirkungen:** Töne, Farbschema, Sync und der Tageswechsel leben in eigenen Hooks unter `src/hooks/`.

## Übersetzungen

Die App nutzt ein kleines eigenes Übersetzungssystem ohne zusätzliche Bibliothek (`src/i18n/`).

**So wird ein Text verwendet**

```jsx
const { t, duration, clock, day, weekday, repeatLabel } = useI18n();

t('tasks.heading');                        // „Deine Aufgaben“ / „Your tasks“
t('hero.title', { name: 'Mochi' });        // Platzhalter: „Mochi, dein Held“
t('tasks.open', { count: 3 });             // Plural über zero/one/other
duration(90);                              // „1 Std. 30 Min.“ / „1 h 30 min“
clock(Date.now());                         // Uhrzeit im Format der Sprache
day('2026-10-30');                         // „Morgen“, „Freitag“ oder „Mo., 3. Nov.“
weekday(2);                                // „Di.“ / „Tue“ (0 = Sonntag)
repeatLabel(task);                         // „täglich“ oder „Mo., Do.“
```

**Einen neuen Text hinzufügen:** Schlüssel in `de.js` **und** `en.js` eintragen, dann `t('bereich.schluessel')` im Code verwenden. `npm test` meldet, wenn ein Schlüssel oder Platzhalter in einer Sprache fehlt.

**Eine neue Sprache hinzufügen** (Beispiel Niederländisch):

1. `src/i18n/locales/en.js` nach `nl.js` kopieren, `export const nl` nennen und alle Texte übersetzen. `meta.name` ist der Name der Sprache in ihr selbst („Nederlands“), `meta.locale` z. B. `nl-NL`.
2. In `src/i18n/index.js` importieren und bei `DICTIONARIES` und `LANGUAGES` ergänzen.
3. `npm test` ausführen. Die Sprache erscheint danach automatisch in den Einstellungen.

Selbst angelegte Aufgaben werden nicht übersetzt – sie gehören der Person, die sie geschrieben hat. Vorlagen und Starter-Aufgaben übernehmen die Sprache, die beim Hinzufügen aktiv ist.

## Updates und mehrere Geräte

Wer ein Konto nutzt, sollte nach einem Update **alle Geräte** aktualisieren, bevor sie wieder abgleichen. Die Web-App macht das beim nächsten Öffnen von selbst, die Android-App braucht die neue APK. Ab 1.7 pausiert eine veraltete App den Abgleich und bittet um ein Update, statt neuere Daten zu überschreiben. Was sich je Version ändert, steht im [CHANGELOG](CHANGELOG.md).

## Nutzen und Deployment

Die vollständige Anleitung steht in **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**: lokal testen, auf dem eigenen Server mit Caddy veröffentlichen, als App aufs Handy installieren und eine Android-APK bauen.

Kurzfassung:

```bash
npm run dev          # lokal testen
npm run dev:phone    # im WLAN auf dem Handy testen
npm run deploy       # bauen und auf den Server laden (vorher .env.deploy anlegen)
npm run android:apk  # Android-APK bauen (vorher einmalig android:add und android:icons)
```

## Daten und Datenschutz

Ohne Konto bleiben alle Daten im Browser bzw. auf dem Gerät – kein Server, kein Tracking, keine Werbung. Unter Fortschritt → Einstellungen → Deine Daten lässt sich jederzeit eine Sicherung als Datei herunterladen. Mit Konto liegt zusätzlich ein Spielstand pro Person auf dem eigenen PocketBase-Server (siehe [docs/SYNC.md](docs/SYNC.md)). Jede Person kann ihr Konto samt Daten in der App selbst löschen.
