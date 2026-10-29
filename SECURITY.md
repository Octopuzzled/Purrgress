# Security

## Reporting a vulnerability

Please report security issues **not** as a public issue, but privately through GitHub: **Security → Report a vulnerability** in this repository. Briefly describe what is affected and how to reproduce it. You will get a reply as soon as possible.

## Supported versions

Security fixes are provided for the latest version (see the [CHANGELOG](CHANGELOG.md)).

## How Purrgress is protected

- **Without an account**, all data stays on the device. There are no trackers, no ads and no requests to third-party servers.
- **Web app:** strict Content Security Policy (scripts, connections and fonts only from its own address), no inline scripts.
- **Sync server (PocketBase):** sign-up only with a single-use invitation code, access rules per person, rate limits per IP address, admin interface only through an SSH tunnel, container with minimal privileges and a verified download. Details in [docs/SYNC.md](docs/SYNC.md).
- **No secrets in the repository:** deployment credentials are only kept locally in `.env.deploy`.
