# Nexora

A free, minimalist Windows desktop browser for a community network with its own addresses. This repository includes the browser foundation and a read-only Railway-backed PostgreSQL registry. Publishing and accounts remain future milestones.

## Run

Install Node.js and run these commands from the repository:

```powershell
npm install
npm test
npm run build
npm run desktop
```

The desktop loads the built app, so run `npm run build` again after editing. `npm run dev` is a UI development server only; community protocol pages require Electron.

Try `welcome.zen`, `makers.vnt`, and `journal.kiv`. The home page, tabs, back/forward, reload, bookmarks, history, settings, light/dark appearance and keyboard shortcuts work locally. Settings persist in Electron's application data. Regular internet browsing, popups, permissions and downloads are blocked. Unregistered addresses show an error page. Local starter sites are text documents and do not execute scripts.

## Windows installer

```powershell
npm run dist
```

Electron Builder produces `dist/Nexora-Setup.exe` with Start Menu and desktop shortcuts and normal uninstall support. An unsigned installer may trigger Windows SmartScreen. Custom branding/icon and installed-app testing remain release milestones; do not treat this foundation as a public release.

## What remains

Accounts, custom domain registration, uploads, Studio, search indexing, moderation, permitted downloads and publishing are not implemented yet. There are no pretend account or publish buttons. See `docs/architecture.md` for the implementation sequence and security model. The backend uses the owner's existing Railway plan with authorization; hosting usage can incur charges. All users remain free to use Nexora.

`samples/index.html` is a future publishing test file. Domain registration will use PostgreSQL unique constraints and owner checks; it is not local DNS and requires no computer DNS changes. Backend setup and deployment instructions will accompany that functioning subsystem.

If the app cannot find `dist/index.html`, run the build first. If installing dependencies fails, verify Node/npm and network access. By default the browser uses the deployed API configured in `electron/config.cjs`. Set NEXORA_LOCAL=1 for bundled offline sites, or NEXORA_API_URL to another HTTPS API origin. Addresses in the browser are plain names such as welcome.zen; HTTPS is only internal backend connectivity.

## Backend

From apps/api, run npm install, set DATABASE_URL to a PostgreSQL connection string, then run npm run migrate and npm start. The API provides /health, /v1/sites and /v1/resolve/:domain. See docs/railway.md for Railway deployment and monitoring. No community write endpoints are exposed yet.
