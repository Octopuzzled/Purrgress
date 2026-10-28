# Changelog

Alle nennenswerten Änderungen an diesem Projekt. Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionen an [Semantic Versioning](https://semver.org/lang/de/).

## [Unveröffentlicht]

### Hinzugefügt

- Fälligkeitsdatum für Aufgaben: „Kein Datum“, „Heute“, „Morgen“ oder ein anderes Datum
- Ansichten in der Aufgabenliste: „Jetzt“ (ohne Datum, heute und überfällig), „Nur heute“ und „Mit Geplantem“ (dazu alles Spätere, nach Tagen gruppiert)
- Hinweis unter der Liste, wie viele Aufgaben für später geplant sind – ein Tipp zeigt sie an
- Kärtchen an der Aufgabe: „Heute“, „Morgen“, Wochentag oder Datum; Überfälliges sanft orange mit „seit …“
- „Nicht heute“ an jeder Aufgabe: legt sie mit einem Tipp auf morgen (auch tägliche), mit Rückgängig
- „Ta-da!“ neben Mochis Sprechblase: schon Geschafftes nachträglich eintragen und dafür belohnt werden
- Tagesabschluss ab 18 Uhr: zeigt, was heute geschafft ist, und legt Liegengebliebenes mit Datum auf Wunsch auf morgen. Für heute ausblendbar
- Tagesform: Einmal am Tag fragt die App „Wie viel Kraft hast du heute?“ (Wenig, Mittel, Viel – oder überspringen). Bei wenig Kraft schlägt „Was jetzt?“ nur Leichtes vor und das Tagesziel halbiert sich (aufgerundet); bei viel Kraft kommen größere Aufgaben öfter dran. Wird zwischen Geräten abgeglichen

### Geändert

- Ruhigere Aufgabenzeilen: Statt „Leicht: +10 XP, 5 Münzen“ zeigen ein bis drei Punkte, wie viel Kraft eine Aufgabe kostet (Details als Tooltip). Löschen ist in den Bearbeiten-Dialog umgezogen
- Die Liste ist nach Datum sortiert: Überfälliges zuerst, dann Heutiges, dann Aufgaben ohne Datum
- Tägliche Aufgaben sind immer heute fällig. Bleibt eine liegen, rutscht nur ihr Datum weiter – es entsteht keine Kopie
- „Was jetzt?“, „Weiter mit …“, die Anzahl offener Aufgaben und die Listenzeit beachten nur, was heute dran ist; heute Fälliges wird bei „Was jetzt?“ etwas öfter vorgeschlagen

## [1.6.1] – 2026-09-30

### Geändert

- Aufgaben aus Vorlagen, die vor Version 1.6 angelegt wurden, übernehmen beim Laden einmalig die Tageszeit ihrer Vorlage. Selbst gewählte Tageszeiten bleiben unverändert.

## [1.6.0] – 2026-09-30

### Hinzugefügt

- Tageszeiten für Aufgaben: Start in den Tag, Jederzeit, Zum Tagesausklang
- Abschnitte in der Aufgabenliste, einklappbar (pro Gerät gemerkt) – nur sichtbar, wenn eine offene Aufgabe eine feste Tageszeit hat
- „Was jetzt?“ bevorzugt Aufgaben der aktuellen Tageszeit (morgens bis 12 Uhr, abends ab 17 Uhr)
- Vorlagen mit passender Tageszeit (z. B. Morgen- und Abend-Anker, Startrampe, Planungs-Check)

## [1.5.0] – 2026-09-30

### Hinzugefügt

- Sicherung exportieren: als Datei herunterladen oder als Text kopieren
- Sicherung einspielen: per Datei oder eingefügtem Text, mit Vorschau und Rückfrage
- Beim Einspielen bleiben Sprache, Farbschema, Töne und Animationen des Geräts erhalten
- Tests für Sicherungen (fremde Dateien, neuere Versionen, ältere Formate)

## [1.4.0] – 2026-09-30

### Hinzugefügt

- Konto & Sync: Fortschritt auf allen Geräten gleich, auch offline nutzbar
- Registrierung nur mit Einladungscode (einmalig gültig, per Link `?invite=CODE`)
- Drei-Wege-Abgleich: Zähler werden addiert, Aufgaben einzeln abgeglichen, Bearbeiten schlägt Löschen
- Auswahl beim ersten Anmelden, wenn Gerät und Konto schon Fortschritt haben
- Konto in der App löschen
- Sync-Server mit PocketBase in `server/` (Docker, Migration, Einladungs-Hook), `npm run deploy:server`
- Anleitung `docs/SYNC.md`

### Geändert

- Starter-Aufgaben haben feste IDs, damit sie auf mehreren Geräten nicht doppelt auftauchen
- Service Worker leitet `/api/` und `/_/` nicht mehr auf die App um

## [1.3.0] – 2026-09-29

### Hinzugefügt

- Android-App mit Capacitor: `npm run android:apk` baut eine installierbare APK
- App-Icon und Startbildschirm für Android im Mochi-Look (`assets/`)
- `npm run deploy` baut die App und lädt sie per rsync auf den eigenen Server
- `npm run dev:phone` zum Testen auf dem Handy im WLAN
- Anleitung für alle Wege in `docs/DEPLOYMENT.md`

### Geändert

- Eigener Build-Modus für Android ohne Service Worker

## [1.2.0] – 2026-09-29

### Hinzugefügt

- Neue Vorlagen-Gruppe „Alltag & Papierkram“ (Post, Anrufe, Gesprächsskript, Wäsche, Chaos-Stapel, Rechnungen)
- Weitere Vorlagen: Startrampe, erster Satz, Abend-Anker, Erholungszeit, Tageslicht, Herzensthema
- Eigene Vorlagen: Aufgaben per Schalter im Formular als Vorlage speichern, unter „Vorlagen → Eigene“ wiederverwenden und löschen
- Tagesziel-Bonus: einmal pro Tag +10 Münzen, sobald das eigene Tagesziel erreicht ist
- Besondere Teile der Umkleide werden ab Level 5, 8 oder 12 freigeschaltet (Anprobieren geht immer)

### Geändert

- Die App heißt jetzt **Purrgress** (vorher „Sanfte Quests“), Speicherschlüssel `purrgress-v1`
- Neue Preiskurve in der Umkleide: Grundteile bleiben günstig, besondere Teile kosten 150–400 Münzen (gesamt 3.635 statt 1.835)
- Münzen je Schwierigkeit: Leicht 5, Mittel 12, Schwer 25 (vorher 5 / 15 / 35), damit sich ehrliches Einstufen lohnt

## [1.1.0] – 2026-09-29

### Hinzugefügt

- Englisch als zweite Sprache, umschaltbar unter Fortschritt → Einstellungen → Sprache
- „Automatisch“ folgt der Gerätesprache, Deutsch und Englisch lassen sich fest wählen
- Eigenes Übersetzungssystem mit Platzhaltern, Plural und sprachabhängiger Zeitanzeige (`src/i18n/`)
- Tests, die fehlende Schlüssel und Platzhalter zwischen den Sprachen finden

### Geändert

- Alle Anzeigetexte aus Komponenten und Konstanten in Wörterbücher verschoben
- Einstellungen nutzen gemeinsame Bausteine (`SegmentedControl`, `SettingRow`)
- Beim Zurücksetzen bleibt die gewählte Sprache erhalten

## [1.0.0] – 2026-09-27

### Hinzugefügt

- Aufgaben mit Kategorien, Schwierigkeit, Mikro-Schritten, täglicher Wiederholung, Suche und Filter
- Vorlagen-Bibliothek für ADHS, Autismus und Wohlbefinden
- Held Mochi mit Level, Werten, Münz-Shop und Umkleide
- Zeitbox mit eigener Zeitauswahl, ±5 Minuten, Pause, „Später“, Überzeit, Listenzeit, Erinnerungs-Klang und braunem Rauschen
- Fortschrittsansicht mit 7-Tage-Verlauf, Tagesziel, Streak und Fokuszeit
- Heller und dunkler Modus, „Ruhige Animationen“
- Projektaufbau mit Vite, Tailwind CSS 4, PWA, ESLint, Prettier und Vitest
