/**
 * Deprecated / invalid Ollama Cloud model ids used in older UI builds.
 * @see https://ollama.com/library/qwen3.5/tags — cloud tier uses `qwen3.5:cloud` or `qwen3.5:397b-cloud`, not `qwen3.5:122b-cloud`.
 */
const OLLAMA_CLOUD_MODEL_ALIASES: Record<string, string> = {
  'qwen3.5:122b-cloud': 'qwen3.5:cloud',
};

/**
 * Normalize user-selected model id before calling Ollama Cloud API.
 */
export function normalizeOllamaCloudModel(model: string | undefined): string | undefined {
  if (!model?.trim()) return undefined;
  const m = model.trim();
  return OLLAMA_CLOUD_MODEL_ALIASES[m] ?? m;
}
