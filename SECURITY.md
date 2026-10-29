# Sicherheit

## Eine Schwachstelle melden

Bitte melde Sicherheitslücken **nicht** als öffentliches Issue, sondern vertraulich über GitHub: **Security → Report a vulnerability** in diesem Repository. Beschreibe kurz, was betroffen ist und wie es sich nachvollziehen lässt. Du bekommst so bald wie möglich eine Rückmeldung.

*Please report security issues privately via **Security → Report a vulnerability**, not as a public issue.*

## Unterstützte Versionen

Sicherheitskorrekturen gibt es für die jeweils neueste Version (siehe [CHANGELOG](CHANGELOG.md)).

## Wie Purrgress geschützt ist

- **Ohne Konto** bleiben alle Daten auf dem Gerät. Es gibt keine Tracker, keine Werbung und keine Anfragen an fremde Server.
- **Web-App:** strenge Content-Security-Policy (Skripte, Verbindungen und Schriften nur von der eigenen Adresse), keine Inline-Skripte.
- **Sync-Server (PocketBase):** Registrierung nur mit einmaligem Einladungscode, Zugriffsregeln pro Person, Rate Limits pro IP-Adresse, Admin-Oberfläche nur über SSH-Tunnel, Container mit minimalen Rechten und geprüftem Download. Details in [docs/SYNC.md](docs/SYNC.md).
- **Keine Geheimnisse im Repository:** Zugangsdaten für das Deployment stehen nur lokal in `.env.deploy`.
