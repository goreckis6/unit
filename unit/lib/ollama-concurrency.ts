/**
 * Limits concurrent Ollama API calls to avoid "too many concurrent requests" from Ollama Cloud.
 * Shared across translate, translate-labels, and generate-post routes.
 */
const MAX_CONCURRENT = parseInt(process.env.OLLAMA_MAX_CONCURRENT || '4', 10) || 2;
let active = 0;
const queue: Array<() => void> = [];

export async function withOllamaSlot<T>(fn: () => Promise<T>): Promise<T> {
  while (active >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => queue.push(resolve));
  }
  active++;
  try {
    return await fn();
  } finally {
    active--;
    const next = queue.shift();
    if (next) next();
  }
}
