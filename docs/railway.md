# Public backend on Railway

The repository is public. Deploy the API from this repository using the root Dockerfile. Add PostgreSQL and set the API's DATABASE_URL to the database service reference. Railway runs the idempotent foundation migration before starting the API and checks /health. Generate a Railway HTTPS domain; no purchased domain is needed. Set NEXORA_API_URL to that origin before launching the desktop.

Verify your account's current free credits, expiration, resource limits and spending controls first. PostgreSQL and an always-running API consume resources: $0 operation is not guaranteed. Do not activate a subscription or paid storage automatically. If free resources are unavailable, run PostgreSQL and this API locally for development.

The public API exposes JSON metadata and site content for the Nexora client; it provides no HTML website gateway. Anyone can inspect public content; desktop identity is not a security boundary. Uploaded JavaScript remains disabled. Free accounts and single-file HTML publishing are available with quotas, owner checks, reports and protected moderation. See docs/studio.md. HTML is stored in PostgreSQL; future asset uploads require durable object storage.

Monitor service resource usage and logs in Railway. /health returns 503 when the registry is unavailable. To verify shared access, publish a site in studio.nex and visit its address from another client using the same API. Initial quotas keep the community small. The image includes a small CPU AI model; its inference consumes Railway resources on the owner's existing plan. The empty starter domains have been removed; solo.zen is the real Solo integration.
