# Setting up account & sync

With an account, progress is the same on all devices: phone, laptop and APK. Behind it is [PocketBase](https://pocketbase.io) on your own server. Only people who have an invitation code from you can sign up.

## How it works

- Each device keeps its own copy and also works offline.
- It syncs on start, a few seconds after every change, when you return to the app, when the network comes back, and every five minutes.
- **Merging instead of overwriting:** XP, coins and history from both devices are added up. Tasks are synced one by one. Deleting on one device versus editing on the other: the edited version stays.
- **Synced:** tasks (with due date, repeating and micro-steps), your own templates, XP, coins, stats, history, focus time, hero and wardrobe, daily goal, today's energy check-in, rest days and cozy blankets, and the measurements for time sense.
- **Stays per device:** running timebox, language, color scheme, sounds, animations, reminder chime, the switches for the energy question, wrap-up and introduction, and collapsed sections.
- **New day on several devices:** Each device moves repeating tasks forward by itself, by the same rules, so there are no copies and no conflicts.
- The server holds one save per person, usually 20 to 50 KB. Finished one-off tasks are cleared out after 14 days so it stays small even with many tasks a day (PocketBase accepts up to 2 MB).
- **Versions:** The save carries a format number. If an app meets data from a newer version, it pauses syncing and asks for an update instead of overwriting anything (from 1.7). So after an update, update all devices: the web app does it by itself, the Android app needs the new APK.
- **Sign-in:** is refreshed on start and then at least every 12 hours during sync, so even apps that stay open for a long time remain signed in.

---

## Once: set up the server

Requirements: Docker and Caddy are already running (as for your other services), and the web app is set up according to [DEPLOYMENT.md](DEPLOYMENT.md).

### 1. Upload the server files and start

`.env.deploy` already contains `SERVER_PATH=docker/purrgress-api`. Then:

```bash
npm run deploy:server
```

This uploads the `server/` folder and starts PocketBase with `docker compose up -d --build`. On first start, PocketBase creates the collections `invites` and `saves` automatically.

Check on the server:

```bash
cd ~/docker/purrgress-api
docker compose ps           # status should become "healthy"
docker compose logs --tail 30
```

> Port 8090 already in use? In `server/docker-compose.yml`, change the left number (e.g. `127.0.0.1:8095:8090`) and do the same in the Caddy block below.

### 2. Create admin access

```bash
cd ~/docker/purrgress-api
docker compose exec pocketbase /pb/pocketbase superuser create YOU@EXAMPLE.COM 'A-LONG-PASSWORD' --dir=/pb/pb_data
```

### 3. Extend Caddy

Replace the Purrgress block in the Caddyfile with this one. It forwards `/api/` to PocketBase, sets security headers and blocks the admin interface and admin login from the outside. Everything else is the app:

```caddy
purrgress.example.com {
	encode zstd gzip

	# Security headers for all responses
	header {
		Strict-Transport-Security "max-age=31536000; includeSubDomains"
		X-Content-Type-Options "nosniff"
		X-Frame-Options "DENY"
		Referrer-Policy "strict-origin-when-cross-origin"
		Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
		-Server
	}

	# Sync server (PocketBase), see docs/SYNC.md.
	# Admin login is blocked from the outside: admin access only through an SSH tunnel.
	handle /api/* {
		respond /api/collections/_superusers* 404
		reverse_proxy 127.0.0.1:8090
	}

	# Admin interface is never public (SSH tunnel, see docs/SYNC.md)
	handle /_/* {
		respond 404
	}

	# The app
	handle {
		root * /var/www/purrgress
		try_files {path} /index.html
		file_server
	}

	# Files with a hash in their name may stay in the cache for a long time
	@assets path /assets/*
	header @assets Cache-Control "public, max-age=31536000, immutable"

	# These files must always be fresh, otherwise updates don't arrive
	@fresh path /index.html /sw.js /registerSW.js /manifest.webmanifest /theme-init.js
	header @fresh Cache-Control "no-cache"
}
```

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

### 4. Open the admin interface (through an SSH tunnel)

The admin interface is deliberately not reachable from the internet, so nobody can try out your admin password. You open it through an SSH tunnel from your PC:

```bash
ssh -N -L 8090:127.0.0.1:8090 user@your-server
```

While that window stays open, you reach the admin interface at <http://localhost:8090/_/>. To stop, press `Ctrl+C`.

### 5. Configure PocketBase

In the admin interface under **Settings**:

- **Application:** name `Purrgress`, URL `https://purrgress.example.com`.
- **Backups:** schedule a regular backup, e.g. daily (cron expression `0 3 * * *` = every day at 03:00). Backups on the same server don't help if the server is lost, so copy them elsewhere, for example with `rsync`, or set up S3 storage in the same settings page.

Rate limits and the proxy setting (real IP addresses behind Caddy) are set automatically by the migration `1790800000_purrgress_security.js`. You can check them under **Settings → Rate limits**.

### 6. Publish the app again

```bash
npm run deploy
```

Under **Progress → Account & sync**, Sign in and Register now appear.

---

## Inviting friends

1. Open the admin interface through the SSH tunnel (see above), then **Collections → invites → New record**.
2. The code is generated automatically, e.g. `K7MQ4TXB`. Under `note` you can write down who it is for. Save.
3. Send this link:

   ```
   https://purrgress.example.com/?invite=K7MQ4TXB
   ```

   It opens the sign-up directly with the code filled in. Every code works exactly once. Afterwards you can see under `usedBy` who redeemed it.

**Forgot password?** Without mail sending, you reset it yourself: **Collections → users →** open the person → enter a new password → save. The person then signs in with the new password. Later you can enter an SMTP account under **Settings → Mail settings**, and then "Forgot password" works by email.

**Block or delete an account:** under **Collections → users**. Deleting also removes the save.

---

## For the Android app

The APK needs the server address built in. It is set in `.env.android`:

```sh
VITE_SYNC_URL=https://purrgress.example.com
```

After that, run `npm run android:apk` as usual.

## Developing locally with sync

Copy `.env.example` to `.env.development.local`. Then `npm run dev` uses the sync server on your server. Without this file, sync is switched off locally.

---

## Maintenance

**Backup:** Everything is in `~/docker/purrgress-api/pb_data`. In addition to the PocketBase backups, you can simply back up that folder as well. PocketBase backups land in `pb_data/backups`.

**Updating PocketBase:**

1. Read the [changelog](https://github.com/pocketbase/pocketbase/blob/master/CHANGELOG.md). PocketBase is still before version 1.0, so bigger jumps may need adjustments.
2. Create a backup.
3. In `server/Dockerfile` and `server/docker-compose.yml`, change `PB_VERSION`, `PB_SHA256` (from that release's `checksums.txt`) and `image`.
4. Run `npm run deploy:server`.

**Logs:** `docker compose logs -f` in the server folder, or in the admin interface under **Logs**.

**"unable to open database file" after updating to 1.7:** Since 1.7 the container runs with minimal privileges and may only write to folders owned by root. If `pb_data` was created by hand, fix the ownership once: `sudo chown -R root:root ~/docker/purrgress-api/pb_data`, then `docker compose up -d`.

**New app version with an extended save:** Raise `SYNC_FORMAT` in `src/sync/syncable.js` and mention it in the CHANGELOG. Nothing to do on the server, the save is stored there as a single JSON field. Older apps (from 1.7) then pause syncing by themselves until they are updated.

**What the status messages mean** (Progress → Account & sync):

| Message | Meaning |
| --- | --- |
| Offline | No network. Syncing happens automatically as soon as it's back |
| Sync didn't work | Server not reachable or an error. It is retried at the next opportunity |
| Sign-in expired | Sign in again. The data on the device is kept |
| Newer version on another device | Update this app. Until then syncing pauses so nothing gets lost |

## Security at a glance

- **Invitations:** Signing up only works with a code that is valid exactly once, even with simultaneous attempts (checking, creating and using up happen in one transaction).
- **Access rules:** Each person sees and changes only their own account and their own save. Only the admin sees invitations.
- **Rate limits:** slow down the guessing of passwords and invitation codes, per real IP address.
- **Admin only through an SSH tunnel**, security headers through Caddy, Content Security Policy in the web app.
- **Container with minimal privileges:** no Linux capabilities, read-only file system, PocketBase download verified by SHA-256.

## Privacy

If other people use the app, their tasks are stored on your server. That means:

- HTTPS is mandatory and runs automatically through Caddy.
- Regular backups are part of it, and only you have admin access.
- Everyone can delete their account in the app themselves. That also removes their data from the server.
- For a small circle of friends, a short note about where the data lives is enough. If the circle grows, a privacy policy belongs with it.
