# Purrgress

Eine neurodivergenz-freundliche Aufgaben-App mit sanfter Gamification: kleine Aufgaben abhaken, XP und Münzen sammeln, den Katzen-Helden Mochi einkleiden – und mit einer Zeitbox im Stil von Llama Life fokussiert bleiben, ohne gehetzt zu werden.

## Funktionen

- **Aufgaben** mit Kategorie, Schwierigkeit, Mikro-Schritten, täglicher Wiederholung, Suche und Filter
- **Vorlagen** für ADHS, Autismus, Alltag und Wohlbefinden – ein Tipp, und die Aufgabe steht in der Liste
- **Eigene Vorlagen:** jede Aufgabe lässt sich als Vorlage speichern und wiederverwenden
- **Held Mochi** mit Level, Werten und einer Umkleide (kostenlos anprobieren, mit Münzen kaufen)
- **Zeitbox:** Start per ▶, eigene Zeit wählen, ±5 Minuten, Pause, „Später“, erlaubte Überzeit, Listenzeit mit voraussichtlichem Ende, Erinnerungs-Klang und braunes Rauschen
- **„Was jetzt?“** wählt eine Aufgabe für dich aus, wenn die Entscheidung schwerfällt
- **Fortschritt:** 7-Tage-Verlauf, Tagesziel, Fokuszeit, Streak ohne Strafe für Pausentage
- **Deutsch und Englisch:** automatisch nach Gerätesprache oder fest in den Einstellungen
- **Ruhig und zugänglich:** heller und dunkler Modus, „Ruhige Animationen“, Tastaturbedienung, Screenreader-Labels
- **Offline-fähig** als installierbare PWA

## Spielbalance

| Schwierigkeit | XP | Münzen |
| --- | --- | --- |
| Leicht | 10 | 5 |
| Mittel | 25 | 12 |
| Schwer | 50 | 25 |

Dazu kommen +2 XP je Mikro-Schritt, +20 Münzen je Level-Aufstieg und einmal am Tag +10 Münzen für das erreichte Tagesziel. Die Umkleide kostet insgesamt 3.635 Münzen. Grundteile gibt es ab 20 Münzen, besondere Teile erst ab Level 5, 8 oder 12. Bei drei Aufgaben am Tag dauert es etwa drei bis vier Monate, bis alles gekauft ist – der erste Kauf klappt trotzdem am ersten Tag.

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
├── scripts/deploy.sh          Bauen und per rsync hochladen
├── capacitor.config.json      Einstellungen für die Android-App
├── src/
│   ├── main.jsx               Einstiegspunkt: Schriften, CSS, React
│   ├── App.jsx                Oberste Komponente: verbindet Zustand, Hooks und Ansichten
│   ├── styles/index.css       Tailwind-Import, Theme-Tokens, Animationen
│   ├── constants/             Feste Daten ohne Texte: Spielregeln, Shop, Vorlagen, Navigation, Zeitbox
│   ├── i18n/                  Übersetzungen: Wörterbücher (locales/), t(), Sprachwahl
│   ├── lib/                   Reine Funktionen ohne React (Logik, Formatierung, Audio, Speicher)
│   ├── hooks/                 Eigene React-Hooks (Spielstand, Zeitbox, Farbschema, Belohnungen)
│   ├── components/
│   │   ├── ui/                Wiederverwendbare Bausteine: Icon, Modal, Toast, Toggle, Styles
│   │   ├── layout/            Kopfzeile und Tab-Leiste
│   │   ├── avatar/            Mochi als SVG, aufgeteilt in Einzelteile
│   │   ├── hero/              Heldenkarte und Level-Up
│   │   ├── tasks/             Aufgabenzeile und Aufgaben-Formular
│   │   └── timebox/           Zeitauswahl, Timer-Ring, Mini-Leiste, Timer- und „Was jetzt?“-Dialog
│   └── views/                 Die vier Bereiche: Aufgaben, Vorlagen, Umkleide, Fortschritt
└── tests/                     Unit-Tests für die Logik in src/lib
```

## Architektur in Kürze

- **Ein Zustand, eine Quelle:** Der komplette Spielstand liegt in einem Objekt (`useGameState`) und wird bei jeder Änderung in `localStorage` gespeichert (Schlüssel `purrgress-v1`). `migrate()` in `src/lib/state.js` ergänzt fehlende Felder, wenn ältere Spielstände geladen werden.
- **Logik ohne React:** Alles, was den Zustand verändert (Abhaken, Belohnungen, Zeitbox), steckt als reine Funktion in `src/lib/`. Diese Funktionen bekommen einen Zustand und geben einen neuen zurück. Dadurch sind sie leicht zu testen und unabhängig von der Oberfläche.
- **Zeitbox mit Zeitstempeln:** Der Timer speichert Endzeitpunkt bzw. Restzeit statt eines laufenden Zählers. So bleibt die Zeit auch nach einem Neuladen oder im Hintergrund korrekt.
- **Texte getrennt vom Code:** Komponenten enthalten keine Anzeigetexte, sondern Schlüssel wie `t('tasks.heading')`. Die Texte stehen in `src/i18n/locales/`.
- **Hooks für Nebenwirkungen:** Tab-Titel, Töne, Farbschema und der tägliche Reset leben in eigenen Hooks unter `src/hooks/`.

## Übersetzungen

Die App nutzt ein kleines eigenes Übersetzungssystem ohne zusätzliche Bibliothek (`src/i18n/`).

**So wird ein Text verwendet**

```jsx
const { t, duration, clock } = useI18n();

t('tasks.heading');                        // „Deine Aufgaben“ / „Your tasks“
t('hero.title', { name: 'Mochi' });        // Platzhalter: „Mochi, dein Held“
t('tasks.open', { count: 3 });             // Plural über zero/one/other
duration(90);                              // „1 Std. 30 Min.“ / „1 h 30 min“
clock(Date.now());                         // Uhrzeit im Format der Sprache
```

**Einen neuen Text hinzufügen:** Schlüssel in `de.js` **und** `en.js` eintragen, dann `t('bereich.schluessel')` im Code verwenden. `npm test` meldet, wenn ein Schlüssel oder Platzhalter in einer Sprache fehlt.

**Eine neue Sprache hinzufügen** (Beispiel Niederländisch):

1. `src/i18n/locales/en.js` nach `nl.js` kopieren, `export const nl` nennen und alle Texte übersetzen. `meta.name` ist der Name der Sprache in ihr selbst („Nederlands“), `meta.locale` z. B. `nl-NL`.
2. In `src/i18n/index.js` importieren und bei `DICTIONARIES` und `LANGUAGES` ergänzen.
3. `npm test` ausführen. Die Sprache erscheint danach automatisch in den Einstellungen.

Selbst angelegte Aufgaben werden nicht übersetzt – sie gehören der Person, die sie geschrieben hat. Vorlagen und Starter-Aufgaben übernehmen die Sprache, die beim Hinzufügen aktiv ist.

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

Alle Daten bleiben im Browser bzw. auf dem Gerät. Es gibt keinen Server-Speicher und kein Tracking. Beim Löschen der Browserdaten oder beim Deinstallieren der App gehen die Daten verloren.
