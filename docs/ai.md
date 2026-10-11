# Free AI summaries

Plain text entered in the address bar or home input opens ai.nex and renders a concise answer in a bordered box. Address-like input still uses the strict Nexora address parser; ordinary web URLs remain blocked instead of being sent to AI.

By default the backend runs onnx-community/SmolLM2-135M-Instruct-ONNX-MHA through Transformers.js, using quantized CPU inference. No API key is required. The Docker build caches the pinned model weights in the deployment image; the image must build successfully before AI is available. Only one generation runs at a time, and answers are limited to 160 new tokens. This small model is intended for simple questions and short summaries; its reasoning and factual accuracy are limited. Runtime CPU and memory consume the owner's existing Railway resources, so self-hosting does not imply $0 hosting.

Questions are processed on the Nexora backend and are not written to the database. Responses are rendered as text, never executable HTML. The public endpoint limits input to 2,000 characters and requests to five per minute per client IP. A busy model returns a retry message rather than accumulating a queue. For a larger community, add authenticated quotas before increasing limits. The model has no browsing tools, so responses are not current web search results.

An optional server-only OPENROUTER_API_KEY switches to OpenRouter's openrouter/free router, which has separate quotas and sends questions to that external provider. No paid-model fallback exists. Keep any key in Railway variables, never the app or GitHub. Model reference: https://huggingface.co/onnx-community/SmolLM2-135M-Instruct-ONNX-MHA.
