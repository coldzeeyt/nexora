# Architecture and milestones

Nexora is free for users. The desktop interface uses React and TypeScript; Electron owns content loading. Community content uses a separate custom-protocol origin and a sandboxed iframe without Node, preload bridges, scripts, network requests, permissions, or downloads in Phase 1. Official UI runs outside the frame. The allowlisted local resolver serves bundled test documents only. No public browser gateway is provided.

1. Browser foundation: tabs, navigation, address validation, home, bundled sites, local bookmarks/history, appearance, keyboard shortcuts.
2. Shared backend: Fastify, PostgreSQL registry, migrations, authenticated API, durable object storage. Demonstrate two clients resolving one site.
3. Publishing: accounts, owner authorization, atomic domain claims, bounded HTML/ZIP validation, drafts and publishing.
4. Discovery and moderation: PostgreSQL search, reports, suspension and administrator controls before public registration.
5. Studio editor: templates, accessible visual blocks, code editing, isolated preview.
6. Security: adversarial Electron integration tests, per-site partitions, safe asset routing, archive and authorization tests before enabling uploaded JavaScript.
7. Deployment: Railway configuration, health endpoints, monitoring and explicitly approved deployment after verifying available free resources.
8. Release: application icon, Windows installer, installation testing, optional signing.

Phase 1 has no backend costs. Railway hosting cannot be promised to remain at $0: available credits and account limits must be verified before deployment. Do not upgrade or purchase services automatically. A local-only network remains the free fallback. Future storage and upload quotas apply equally to users; no subscriptions or paid tiers are planned.
