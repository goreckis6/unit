/**
 * Ollama API fetch with extended timeouts.
 * Node's default fetch uses undici with ~5min headers timeout, causing HeadersTimeoutError
 * for long-running LLM requests. Use undici's Agent with 90min timeouts.
 */
import { fetch as undiciFetch, Agent } from 'undici';

const OLLAMA_TIMEOUT_MS = 5_400_000; // 90 min

const ollamaAgent = new Agent({
  headersTimeout: OLLAMA_TIMEOUT_MS,
  bodyTimeout: OLLAMA_TIMEOUT_MS,
  connectTimeout: 60_000,
});

export type OllamaFetchOptions = RequestInit & { body?: string };

export async function ollamaFetch(url: string, options: OllamaFetchOptions = {}): Promise<Response> {
  const res = await undiciFetch(url, {
    ...options,
    dispatcher: ollamaAgent,
  });
  return res as unknown as Response;
}
