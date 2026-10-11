# Nexora

A free minimalist Windows browser for an independent community network.

Public download website: https://nexora-zen.up.railway.app

API: https://nexora-api-production-90da.up.railway.app

## Features

- Tabs, address navigation, bookmarks, history, keyboard shortcuts, themes and permitted file downloads.
- Responsive layouts and device safe-area spacing; the installed application targets Windows.
- Free accounts, encrypted local sessions, profiles, private password recovery codes and account deletion.
- Free .nex, .vnt, .zen, .orb and .kiv addresses.
- Visual website builder, templates, headings, paragraphs, images, links, colors, fonts and movable sections.
- HTML/CSS/JavaScript editing with syntax highlighting, uploaded assets and isolated live previews.
- Complete static-site ZIP uploads, saved-site editing, drafts and separate published versions.
- Published-site search, extension filters, domain management and authenticated moderation.
- Self-hosted AI answers and summaries, with no API key or per-user payment.
- Community sites are added and published through Nexora Studio; manually linked sites have been removed.
- Velora Desktop: an independent Windows virtual desktop with Nexora built in. Download through velora.nex. See docs/velora.md for desktop apps, storage and build instructions.

## Run and package

```sh
npm install
npm install --prefix apps/api
npm run build
npm run desktop
npm test
npm run dist
npm run dist:velora
```

Installer output: `release/Nexora-Setup.exe`. Windows icons use the approved textured white angular N. The installer registers Nexora addresses with Windows. Public release builds run through `.github/workflows/windows-release.yml`; dispatch it or update `release-trigger.json` to release again.

`npm run dev` provides an interface preview. Account, AI, preview and publishing bridges run inside Electron, rather than an ordinary browser gateway.

## Network pages

`home.nex`, `studio.nex`, `search.nex`, `domains.nex`, `explore.nex`, `account.nex`, `settings.nex`, `status.nex`, `help.nex`, `downloads.nex`, `apps.nex`, `velora.nex`, `admin.nex`.

## Hosting and quotas

Railway hosts the API, Postgres, a private S3-compatible asset bucket and the public download page. Hosting uses the owner's existing Railway plan. Users are not charged.

Initial limits: 100 accounts, 5 sites per account, 8 MB stored drafts/publications per account, 2 MB per website/ZIP, 200 static files, 1 MB per asset and 512 KB per HTML file. ZIP traversal, hidden files, executables, symlinks, encrypted archives, duplicates and excessive expansion are rejected.

## Security and practical limits

Uploaded scripts run in sandboxed frames without Node, a Nexora bridge, parent access, forms, popups or external internet requests. Resources load through the allowlisted registry. Authorization, salted scrypt passwords, hashed server sessions, recovery-code rotation, rate limits and moderation run on the backend. Sensitive server keys are never bundled.

The installer is an unsigned preview. Email recovery is unavailable; save the private recovery code. AI is a small model and can make mistakes. Solo live playback requires an active host. Freq retains its own account system and approved video sources; camera/microphone access is currently denied in its isolated session. Browser tabs reload pages when switching rather than retaining every page in memory.

See `docs/architecture.md`, `docs/studio.md` and `docs/release-notes.md`.

