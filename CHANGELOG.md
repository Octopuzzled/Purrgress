# Changelog

All notable changes to this project. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), the versions follow [Semantic Versioning](https://semver.org/).

## [1.7.0] – 2026-10-29

### Added

- Due dates for tasks: "No date", "Today", "Tomorrow" or any other date
- Views in the task list: "Now" (no date, today and overdue), "Today only" and "Outlook" (plus everything later, grouped by day)
- A note under the list showing how many tasks are planned for later. One tap shows them
- Chips on tasks: "Today", "Tomorrow", weekday or date; overdue tasks in a soft orange with "since …"
- "Not today" on every task: moves it to tomorrow with one tap (daily ones too), with undo
- "Ta-da!" next to Mochi's speech bubble: log things you already did afterwards and get rewarded for them
- Evening wrap-up from 6 pm: shows what got done today and, if you like, moves leftovers to tomorrow with a date. Can be hidden for today
- Energy check-in: once a day the app asks "How much energy do you have today?" (Low, Medium, High, or skip). With low energy, "What now?" only suggests easy things and the daily goal is halved (rounded up); with high energy, bigger tasks come up more often. Synced between devices
- "Too big?": tasks that have been waiting for three days or are overdue and have no open micro-step ask for the very smallest first step. Also available any time in "What now?"
- Repeating on weekdays (e.g. "Mon, Thu" for the trash): Repeat is now "Never / Daily / On weekdays". Finished tasks come back on the next due date, and tasks done early count for the upcoming date. Missed ones stay visible until their next day, without copies
- Rest days: "Today is a rest day" in the energy check-in or the wrap-up. Rest days don't break the streak, Mochi takes the pressure off, and a moon marks the day in the weekly history. Tapping the rest-day chip takes it back
- Cozy blanket in the wardrobe (60 coins, up to 2 in stock): automatically protects the streak on forgotten days, but only if the stock covers the whole gap
- Mochi works alongside you: during a timebox, Mochi sits next to the timer and reads (Care), knits (Routine, Social) or writes (Focus). During a pause, Mochi dozes. Respects "Calm animations"
- Settings: the morning energy question and the evening wrap-up can each be switched off
- Introduction: a short, calm tour in seven steps. It starts once by itself (also after the update to 1.7) and can be switched back on any time under Progress → Settings. While it runs, the energy question and the wrap-up wait
- Weekly templates: "Take out the trash" and "Weekly planning"
- Wardrobe expanded: 16 new items, including one milestone item each for levels 15, 20, 25 and 30 (stardust fur, crescent moon hat, lantern, northern lights) and more choice between 100 and 180 coins
- Five items are only available as surprises and can't be bought: butterfly, four-leaf clover and soap bubbles, and, rarely, halo and shooting star
- Little surprises when ticking off: found coins (+3 to 10), a rare Mochi line or now and then a gift for the wardrobe. The first surprise of the day comes fairly easily, a second one rarely, and there are no more than that. Undo also takes the surprise back
- Time sense: timeboxes that end with "Done" become measurements (planned vs. actual, without pauses and without ±5). From three measurements on, the timebox suggests a better-fitting length at start, first for the same task, otherwise for the category, otherwise in general. Also shown as a small hint in the task form. Synced

### Changed

- Game balance for many tasks a day: from the seventh task of the day on, coins are halved (XP stay full), surprises are limited to two a day, and from level 10 on every level takes a little longer. If you're already higher, you keep your level and your progress exactly
- Finished one-off tasks are quietly cleared out after 14 days. XP, coins, stats and history stay. Keeps the list tidy and the save small enough for syncing
- Sync: format 2. An app version that doesn't understand newer data pauses syncing (with a notice) instead of overwriting it. Older saves are converted on the first sync
- Sync: the sign-in is refreshed regularly during sync, not only on start. Apps that stay open for days or are only resumed (PWA, Android) remain signed in
- Calmer task rows: instead of "Easy: +10 XP, 5 coins", one to three dots show how much energy a task costs (details as a tooltip). Deleting moved into the edit dialog
- The list is sorted by date: overdue first, then today's, then tasks without a date
- Daily tasks are always due today. If one is left over, only its date moves forward, no copy is created
- "Clear finished" keeps all repeating tasks, not just daily ones
- "What now?", "Continue with …", the number of open tasks and the list time only consider what is due today; things due today are suggested a little more often by "What now?"

### Security

- Invitation codes can only be used exactly once, even with simultaneous sign-ups (transaction)
- Rate limits and the proxy setting (real IP addresses behind Caddy) are set by a migration instead of by hand
- Sync container with minimal privileges (no capabilities, read-only file system); the PocketBase download is verified by SHA-256
- Content Security Policy for the web app; the color scheme script is no longer inline in `index.html` for this reason
- Caddy template with security headers (HSTS, nosniff, no embedding in other sites); admin interface and admin login are blocked from the outside and only reachable through an SSH tunnel
- Clear message on too many sign-in attempts; invitation links only accept letters and digits
- Dependencies updated (Vite, Vitest 5); the icon tool for Android is only loaded when needed

### Important when updating

Please update all devices to 1.7 before they sync again. Version 1.6 doesn't know the new data (due dates, weekdays, rest days …) yet and would remove it during sync. The web app updates itself; the Android app needs the new APK.

For the sync server: run `npm run deploy:server` and replace the Purrgress block in the Caddyfile with the new template from `docs/SYNC.md`. The admin interface is then only reachable through an SSH tunnel.

## [1.6.1] – 2026-09-30

### Changed

- Tasks from templates created before version 1.6 take over their template's time of day once on load. Times of day you chose yourself stay unchanged.

## [1.6.0] – 2026-09-30

### Added

- Times of day for tasks: Start of day, Anytime, Wind-down
- Sections in the task list, collapsible (remembered per device), only visible when an open task has a fixed time of day
- "What now?" prefers tasks of the current time of day (morning until 12 pm, evening from 5 pm)
- Templates with a fitting time of day (e.g. morning and evening anchors, launch pad, planning check)

## [1.5.0] – 2026-09-30

### Added

- Export a backup: download as a file or copy as text
- Import a backup: from a file or pasted text, with a preview and confirmation
- On import, the device's language, color scheme, sounds and animations are kept
- Tests for backups (foreign files, newer versions, older formats)

## [1.4.0] – 2026-09-30

### Added

- Account & sync: same progress on all devices, also usable offline
- Sign-up only with an invitation code (valid once, via link `?invite=CODE`)
- Three-way sync: counters are added up, tasks are synced one by one, editing beats deleting
- Choice on first sign-in when the device and the account both already have progress
- Delete your account in the app
- Sync server with PocketBase in `server/` (Docker, migration, invitation hook), `npm run deploy:server`
- Guide `docs/SYNC.md`

### Changed

- Starter tasks have fixed IDs so they don't show up twice on several devices
- The service worker no longer redirects `/api/` and `/_/` to the app

## [1.3.0] – 2026-09-29

### Added

- Android app with Capacitor: `npm run android:apk` builds an installable APK
- App icon and splash screen for Android in Mochi's look (`assets/`)
- `npm run deploy` builds the app and uploads it to your own server via rsync
- `npm run dev:phone` for testing on your phone over Wi-Fi
- Guide for all ways in `docs/DEPLOYMENT.md`

### Changed

- Separate build mode for Android without a service worker

## [1.2.0] – 2026-09-29

### Added

- New template group "Everyday life & paperwork" (mail, calls, conversation script, laundry, chaos pile, bills)
- More templates: launch pad, first sentence, evening anchor, recovery time, daylight, passion topic
- Your own templates: save tasks as a template with a switch in the form, reuse and delete them under "Templates → Your own"
- Daily goal bonus: once a day +10 coins as soon as your own daily goal is reached
- Special wardrobe items unlock at level 5, 8 or 12 (trying on always works)

### Changed

- The app is now called **Purrgress** (formerly "Sanfte Quests"), storage key `purrgress-v1`
- New price curve in the wardrobe: basic items stay cheap, special items cost 150–400 coins (3,635 in total instead of 1,835)
- Coins per difficulty: Easy 5, Medium 12, Hard 25 (before 5 / 15 / 35), so that rating honestly pays off

## [1.1.0] – 2026-09-29

### Added

- English as a second language, switchable under Progress → Settings → Language
- "Automatic" follows the device language, German and English can be chosen explicitly
- Own translation system with placeholders, plurals and language-dependent time display (`src/i18n/`)
- Tests that find missing keys and placeholders between the languages

### Changed

- All display texts moved from components and constants into dictionaries
- Settings use shared building blocks (`SegmentedControl`, `SettingRow`)
- Resetting keeps the chosen language

## [1.0.0] – 2026-09-27

### Added

- Tasks with categories, difficulty, micro-steps, daily repeating, search and filters
- Template library for ADHD, autism and wellbeing
- Hero Mochi with level, stats, coin shop and wardrobe
- Timebox with your own time picker, ±5 minutes, pause, "Later", overtime, list time, reminder chime and brown noise
- Progress view with 7-day history, daily goal, streak and focus time
- Light and dark mode, "Calm animations"
- Project setup with Vite, Tailwind CSS 4, PWA, ESLint, Prettier and Vitest
