# Velora and Nexora

Two free Windows programs live in this repository. Nexora is the standalone network browser. Velora is a local virtual desktop with the same browser built in; it is an application, not a replacement for Windows. Neither program requires the other to be installed.

## Downloads

Visit nexora-zen.up.railway.app. Choose Nexora-Setup.exe for the browser or Velora-Setup.exe for the full desktop. The Nexora installer includes a bundled Velora-Setup.exe. Inside Nexora, velora.nex opens that installer when you choose Install Velora. Velora is not installed automatically. Installers are unsigned preview builds; publisher signing is not configured. Both apps include updates in Settings: check, download, then install and restart. Download integrity is verified; updates use separate nexora.yml and velora.yml release manifests. Versions must be increased in package.json for new updates. GitHub Releases hosts both installers together so stable download links remain valid.

## Running from source

Install Node.js and open a terminal in this repository. Run `npm install` once. Run `npm run build` to compile both interfaces. `npm run desktop` opens Nexora; `npm run velora` opens Velora. The existing Railway backend is configured in electron/config.cjs. Local Notes, Files, Settings, Store, and Studio work offline; network sites and AI need the backend.

## Building Windows installers

On Windows, run `npm run dist` (builds Velora first and bundles its installer) for release/Nexora-Setup.exe and release/win-unpacked/Nexora.exe. Run `npm run dist:velora` for release-velora/Velora-Setup.exe and release-velora/win-unpacked/Velora.exe. The applications have different IDs, installation folders, and data directories. Electron Builder publishing is explicitly disabled during packaging; the GitHub Actions release step publishes completed installers. A workflow failure preserves the previous download.

## Desktop controls

Click an icon or dock button to open an application. Drag its title bar to move it; drag the bottom-right handle to resize it. The title-bar buttons minimize, maximize, and close. A dock button restores a minimized application. Ctrl+Space opens the launcher; Ctrl+Alt+N opens Notes. Settings offers fullscreen and windowed modes. Window rectangles are clamped to the desktop area and may be remembered. One window per bundled application is supported in this version; Nexora has its own multiple tabs.

Notes saves edits automatically. Files keeps virtual folders and imported file bytes; double-click a folder to open it. Rename, move, copy, delete, import, and export are supported. Import and export show native Windows dialogs; import is limited to 2 MB per file. Deleting a folder includes its descendants and asks for confirmation. Store installs or removes optional bundled Calculator and Clock applications; core apps remain installed. Studio creates local HTML/CSS/JavaScript projects, edits metadata and code, saves automatically, and runs an isolated preview. The owner can publish sandboxed web apps directly from Studio: set a unique Store app ID and version, connect developer access with the Nexora API NEXORA_ADMIN_TOKEN, then choose Publish app. Refresh the Store to install the app. Publishing again creates a new revision and an Update app button. Unpublish removes it from discovery while retaining existing local installs. Public developer signups and native executable app submissions are not supported.

## Architecture

src/Browser.tsx is the shared browser interface. src/main.tsx selects the standalone browser or Velora desktop. src/velora contains the desktop window manager, settings model and bundled apps. electron/main.cjs configures the shared network session, protocols, sandbox and restricted browser IPC. electron/velora-main.cjs chooses the desktop entry point and separate profile. velora-builder.cjs defines the independent installer. No browser code is copied into a separate project and no external Nexora executable is launched. apps/api/app-store.js and database/010-velora-store.sql provide the owner-protected app catalog using the existing Railway database and S3 bucket. src/velora/AppStore.tsx handles publishing, installing and sandboxed app windows.

Add trusted bundled apps to the catalog in src/velora/model.ts and provide their component in the desktop dispatcher. Do not treat a community project as a trusted bundled component. Additional privileged operations need explicit validation in main-process IPC.

## Storage and security

Velora writes an atomic JSON snapshot to %APPDATA%/Velora/velora/desktop.json. It contains preferences, notes, virtual file bytes, projects, installed app IDs and remembered window rectangles. Installed web-app bundles are stored in the same snapshot and work offline. Developer access is separately stored using Windows encryption in velora-owner.bin, never embedded in the distributed executable. Desktop storage is limited to 32 MB; a failed save is shown in the dock status. Nexora uses its separate profile. Network session tokens remain in main-process memory and Windows-encrypted storage. Local snapshots are not encrypted; rely on Windows account protections for sensitive local content.

The virtual file manager has no renderer-provided host path. Imports and exports use only paths selected in native dialogs. Preview and network content live in opaque sandboxed frames with no Node integration or access to Nexora/Velora bridges. Resource policies block external browsing. IPC accepts only the trusted top-level app frame. Studio does not execute application code in the desktop’s privileged context. The Store runs only bundled trusted code.

## Network publishing

The manually linked Solo and Freq entries were removed at the owner's request. Their external repositories and Railway services are preserved. New community sites are registered, uploaded, and published through studio.nex. Existing user-owned published sites are preserved. The official velora.nex, apps.nex and other system pages remain reserved.

## Troubleshooting

If a download fails, check the latest GitHub Actions run and Releases page. If a network site fails, check status.nex and your connection; a draft is unavailable until explicitly published. A lost password needs the private recovery code saved at registration. If desktop saves fail, check free disk space and the 32 MB limit. Settings resets preferences without deleting notes, projects or files. Uninstalling an optional app retains its local data. Installation and uninstall behavior should be tested on a disposable Windows machine before wider distribution.



