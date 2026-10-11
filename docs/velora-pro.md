# Velora Pro

Velora Pro is a separate, free application built from the shared Velora codebase. It uses `network.velora.pro`, a separate `Velora Pro` data directory and its own update feed. It is excluded from the unified Velora Installer catalog. No license, subscription, activation or online account is required for local features.

Implemented: Spaces with names, wallpapers and persistent window layouts; move windows between Spaces; halves, tiling and edge snapping; keep a window above other Velora windows; safe local command terminal; movable/resizable Clock, Date, Notes, launcher and workspace-size widgets; manually triggered app-opening routines; Control Center, theme presets, accents, icon sizes and corner radii; pinned/recent launcher apps; advanced virtual Files tabs, search, sorting, favorites, multiselect, copying, trash, restore and safe text previews; measured Electron process working-set/CPU statistics.

Both editions retain Liquid Glass, custom cursors, offline defaults, optional AI, per-feature connectivity, local snapshots and optional private cloud backup. Backup copies workspace content; imported media originals need separate transfer. Existing Velora data is never automatically moved or overwritten. Users can explicitly export/import a workspace backup.

The native extended-workspace control spans one Pro window across connected display work areas. Physical multi-monitor, mixed-DPI and unplug testing is still required. This preview does not claim independently detached native app windows or host virtual-desktop management.

Current limitations: routines open installed apps manually, with no startup/timed triggers; widgets do not yet integrate Reson playback or Kivo unread counts; Pro layout/widget/routine configuration currently persists locally, outside workspace backup; Files drag/drop and recent-file views, saved custom theme presets, window grouping and a companion app remain unfinished. No host shell is exposed. Mac builds remain unsigned and require manual replacement from a verified update disk image. Android production signing remains pending.

Release verification: TypeScript/Vite build, 22 shared tests and hidden native Electron checks cover offline defaults, theme/cursor persistence, Spaces, tiling, terminal rejection of unsupported commands, routines, Files tabs and widgets. Installer/update-channel and physical-monitor checks must pass before describing the preview as finished.
