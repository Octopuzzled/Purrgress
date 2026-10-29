# Using Purrgress: locally, in the browser and as an Android app

There are three ways. You can combine them.

| Way | What for | Effort |
| --- | --- | --- |
| **A. Test locally** | Developing and trying things out | 2 minutes |
| **B. Web app on your server** | Use it in the browser and install it on your phone like an app (PWA). Works on Android, iPhone and PC | once, about 20 minutes |
| **C. Android APK** | A real app file that runs without a server | once, about 45 minutes (mostly installing Android Studio) |

> **Data on several devices:** Without an account, every device (and every browser) has its own save. With an account, all devices are automatically on the same state. How to set up the sync server is described in **[SYNC.md](SYNC.md)**.

---

## Requirements

- **Node.js 20.19 or newer** (recommended: 22). Check with `node -v`.
- Once, in the project folder: `npm install`

---

## A. Test locally

```bash
npm run dev
```

Open <http://localhost:5173>.

### Test on your phone on the same Wi-Fi

```bash
npm run dev:phone
```

Vite shows a second address like `http://192.168.178.23:5173`. Open it in your phone's browser. Phone and PC must be on the same Wi-Fi. Installing it as an app doesn't work this way yet, that needs HTTPS (way B).

### Test the finished build

```bash
npm run build
npm run preview
```

---

## B. Web app on your server (recommended)

### Once: prepare the server

**1. Create a subdomain.** At your domain provider, add an A record, e.g. `purrgress` → your server's IP. It can take a few minutes until it is active.

**2. Create a folder on the server** (log in via `ssh`):

```bash
sudo mkdir -p /var/www/purrgress
sudo chown "$USER": /var/www/purrgress
```

**3. Set up Caddy.** Add this to the Caddyfile (usually `/etc/caddy/Caddyfile`) and adjust the domain. The block already includes the forwarding for the sync server (it does no harm while that isn't running), security headers and a block that keeps the PocketBase admin interface closed from the outside.

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

Check and reload:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Caddy fetches the HTTPS certificate automatically.

### Once: set up deployment on your PC

```bash
cp .env.deploy.example .env.deploy
```

Enter in `.env.deploy` how you log in via SSH and where the files should go:

```sh
DEPLOY_HOST=user@your-server
DEPLOY_PATH=/var/www/purrgress
```

`.env.deploy` is not committed to the Git repository, so your server details stay private.

### Every time: upload a new version

```bash
npm run deploy
```

This builds the app and uploads it via `rsync`. Requirement: `ssh` and `rsync` are installed (on Windows the easiest way is in WSL).

### Install as an app

- **Android (Chrome):** open the page → menu ⋮ → **"Install app"**.
- **iPhone (Safari):** open the page → Share icon → **"Add to Home Screen"**.
- **PC (Chrome, Edge):** install icon on the right of the address bar.

After that, Purrgress starts without a browser bar and works offline. After a new deployment, the app updates itself the next time it opens.

---

## C. Build the Android APK

The APK contains the complete app and needs no server. It is built with [Capacitor](https://capacitorjs.com/) and the Android SDK.

### Once: install Android Studio

1. Download and install [Android Studio](https://developer.android.com/studio).
2. On first start, go through the setup wizard with the default settings. It installs the Android SDK and a suitable Java (JDK).
3. On Linux, set the environment variables (e.g. in `~/.bashrc`), then reopen the terminal:

   ```bash
   export ANDROID_HOME="$HOME/Android/Sdk"
   export JAVA_HOME="/opt/android-studio/jbr"   # path of your Android Studio installation
   ```

### Once: create the Android project

```bash
npm run android:add      # creates the android/ folder
npm run android:icons    # generates app icon and splash screen from assets/
```

The `android/` folder belongs in the Git repository.

### Build the APK

```bash
npm run android:apk
```

The finished file is then here:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Alternatively with a UI: `npm run android:sync`, then `npm run android:open` and in Android Studio **Build → Build App Bundle(s) / APK(s) → Build APK(s)**.

### Get the APK onto your phone

**Option 1: copy the file**

1. Send `app-debug.apk` to your phone, e.g. via USB, cloud or Nextcloud.
2. Tap it on the phone. Android asks once whether the app (e.g. "Files") may install other apps. Allow it.
3. Install.

**Option 2: directly via USB cable**

1. Enable developer options on the phone: Settings → About phone → tap "Build number" 7 times.
2. Under developer options, turn on **"USB debugging"** and connect the phone.
3. Install:

   ```bash
   "$ANDROID_HOME/platform-tools/adb" install -r android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Updates

After code changes, just run `npm run android:apk` again and install the new APK. With an account: install the APK on **all** phones before they sync again. An older version otherwise pauses syncing (from 1.7) or doesn't know the new data yet (1.6 and older). Your data stays as long as you build from the **same PC**. The debug APK is signed with a key that only exists on that machine.

> **Debug APK or release APK?** For your own use, the debug APK is perfectly fine. For the Play Store you would need a signed release version with your own key. That only pays off once other people should download the app.

---

## Troubleshooting

| Problem | Solution |
| --- | --- |
| `npm run deploy`: "Missing: .env.deploy" | Do the step "set up deployment" |
| The old version is still shown after deployment | Close the app once and reopen it. The service worker loads the new version in the background |
| "Install app" doesn't appear | The page must be served over `https://`, not over a local IP |
| `android:apk`: "SDK location not found" | Set `ANDROID_HOME` (see above) or open the project in Android Studio once |
| `android:apk`: Java error | Point `JAVA_HOME` to Android Studio's JDK |
| Android says "App not installed" on an update | The old version was built on another PC. Uninstall the old app, then install again (data is lost) |
| "A newer version is running on another device" under Account & sync | This app is older than the one on another device. Reload the web app or install the new APK, after that it syncs again |
| "Your sign-in has expired" | Sign in again. Since 1.7 the sign-in is refreshed regularly during sync, so this should only happen after a very long break |
| The timebox's end sound doesn't play when the phone is locked | Android pauses JavaScript in the background. The time is still correct. For reliable signals, `@capacitor/local-notifications` could be added later |
