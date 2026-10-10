# Free AI summaries

Plain text entered in the address bar or home input opens ai.nex and renders a concise answer in a bordered box. Address-like input still uses the strict Nexora address parser; ordinary web URLs remain blocked instead of being sent to AI.

The backend calls only OpenRouter's openrouter/free router. It never switches to a paid model. Create a free API key at https://openrouter.ai/settings/keys and enter it directly in Railway's Nexora API service variables as OPENROUTER_API_KEY. Do not put it in the desktop, GitHub, or chat. Provider account limits apply; without a configured key, the app reports that AI is not connected. No live AI answer has been verified until that configuration exists.

Questions are sent to OpenRouter and its selected model provider. They are not written to the Nexora database. The UI displays that disclosure. Responses are rendered as text, never executable HTML. The public endpoint limits input to 2,000 characters and requests to five per minute per client IP. For a larger community, add authenticated quotas before increasing limits. The model has no browsing tools, so responses are not current web search results.
