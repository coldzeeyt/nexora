# Nexora

A free, minimalist Windows desktop browser for a community network with its own addresses. Includes animated browser navigation, a public Railway/PostgreSQL backend, free accounts, single-file HTML publishing at studio.nex, and Solo Live viewing/chat at solo.zen.

## Run

Install Node.js and run these commands from the repository:

```powershell
npm install
npm test
npm run build
npm run desktop
```

The desktop loads the built app, so run `npm run build` again after editing. `npm run dev` is a UI development server only; community protocol pages require Electron.

Try `solo.zen` or `studio.nex`. Home and Explore show published sites. Empty example sites have been removed. Tabs, navigation, bookmarks, history, light/dark appearance and keyboard shortcuts are available. Animations respect reduced-motion settings. Uploaded HTML runs in a restricted frame without scripts or external assets; the audited Solo integration connects only to its existing service. Regular internet browsing remains blocked.

## Windows installer

```powershell
npm run dist
```

Electron Builder produces `dist/Nexora-Setup.exe` with Start Menu and desktop shortcuts and normal uninstall support. An unsigned installer may trigger Windows SmartScreen. Custom branding/icon and installed-app testing remain release milestones; do not treat this foundation as a public release.

## What remains

ZIP uploads, external/static asset folders, a visual editor, saved-site code editing, email verification, password recovery, advanced search and permitted downloads remain unfinished. See docs/studio.md for the working upload flow and current limits. The backend uses the owner's existing Railway plan with authorization; hosting usage can incur charges. Nexora remains free for users.

Upload samples/index.html in studio.nex to test publishing. Domain creation uses PostgreSQL uniqueness and ownership checks; it requires no computer DNS changes. Sign-in tokens stay in the desktop main process and are cleared when the app restarts.

If the app cannot find `dist/index.html`, run the build first. If installing dependencies fails, verify Node/npm and network access. By default the browser uses the deployed API configured in `electron/config.cjs`. Set NEXORA_LOCAL=1 for bundled offline sites, or NEXORA_API_URL to another HTTPS API origin. Addresses in the browser are plain names such as welcome.zen; HTTPS is only internal backend connectivity.

## Backend

From apps/api, run npm install, set DATABASE_URL to a PostgreSQL connection string, then run npm run migrate and npm start. The API provides health, discovery, resolution, accounts, publishing, reports and protected moderation. Registration requires OPEN_REGISTRATION=true and a server-only administrator secret. See docs/railway.md, docs/studio.md and docs/solo.md.

Nexora AI uses a small self-hosted model by default, with one request at a time and short outputs. No AI API key is needed. The Docker build downloads and caches the model; model processing uses CPU/RAM on your Railway plan. It is intended for simple questions and short summaries, and it has no live web search. See docs/ai.md.
