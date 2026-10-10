# Public backend on Railway

The repository is public. Deploy the API from this repository using the root Dockerfile. Add PostgreSQL and set the API's DATABASE_URL to the database service reference. Railway runs the idempotent foundation migration before starting the API and checks /health. Generate a Railway HTTPS domain; no purchased domain is needed. Set NEXORA_API_URL to that origin before launching the desktop.

Verify your account's current free credits, expiration, resource limits and spending controls first. PostgreSQL and an always-running API consume resources: $0 operation is not guaranteed. Do not activate a subscription or paid storage automatically. If free resources are unavailable, run PostgreSQL and this API locally for development.

The public API exposes JSON metadata and site content for the Nexora client; it provides no HTML website gateway. Anyone can inspect public content; desktop identity is not a security boundary. Uploaded JavaScript remains disabled in this foundation. Domain registration, uploads, accounts and moderation are not available yet. Before enabling public writes, implement owner authorization, quotas, abuse handling and durable object storage.

Monitor service resource usage and logs in Railway. /health returns 503 when the database is unavailable. Limit the initial network to the bundled seed sites. To verify shared access, launch two desktop instances with the same NEXORA_API_URL and navigate to welcome.zen. This requires an actual deployed backend; it has not been verified merely by generating configuration.
