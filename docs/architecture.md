# Architecture

Electron 44 isolates the trusted React/Vite browser interface from uploaded content. The main process owns API sessions, encrypted local authentication, validated IPC, previews, downloads and protocol resolution.

Railway runs Fastify, Postgres, private S3 assets and an independent public download page. Static uploads are bounded and validated before storage. Draft objects have immutable version keys; publishing copies the draft manifest and metadata into a separate public snapshot. Replaced objects are removed after successful database transactions.

Nexora and preview protocols serve only controlled resources. Uploaded pages use an opaque sandbox origin and strict CSP. Tests verify working relative CSS/JS while parent, privileged bridge, Node and ordinary internet access remain blocked.

Freq uses its own persistent isolated WebContentsView and a narrow service/media allowlist, without a preload. Solo Live uses an audited viewer component and restricted requests to its existing service.

The self-hosted Qwen2.5 0.5B quantized model is cached in the API container. No user payment or hosted API key is required.
