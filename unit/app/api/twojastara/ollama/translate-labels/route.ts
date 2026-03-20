import { NextRequest, NextResponse } from 'next/server';
import { Agent, fetch } from 'undici';
import { getSession } from '@/lib/auth';
import { getOllamaApiKey } from '@/lib/admin-api-keys';
import { LOCALE_NAMES } from '@/lib/admin-locales';
import { withOllamaSlot } from '@/lib/ollama-concurrency';

const MODEL = process.env.OLLAMA_MODEL || 'glm-4.6:cloud';
const OLLAMA_TIMEOUT_MS = 172_800_000; // 48 h

/** Dispatcher with high timeouts — undici's default headersTimeout causes UND_ERR_HEADERS_TIMEOUT on slow Ollama Cloud */
const ollamaDispatcher = new Agent({
  headersTimeout: OLLAMA_TIMEOUT_MS,
  bodyTimeout: OLLAMA_TIMEOUT_MS,
});

const SLOT_RETRY_DELAY_MS = 30_000;
const SLOT_RETRY_MAX = 5;

function isRetryableError(err: string): boolean {
  const s = err.toLowerCase();
  return s.includes('concurrent request slot') || s.includes('no slots available') || s.includes('llm busy') || s.includes('upstream request timeout') || s.includes('429') || s.includes('too many requests') || s.includes('too many concurrent') || s.includes('econnreset') || s.includes('connection reset') || s.includes('socket hang up') || s.includes('etimedout') || s.includes('und_err_headers_timeout');
}

async function ollamaChat(apiKey: string, messages: { role: string; content: string }[], modelOverride?: string) {
  const model = modelOverride && modelOverride.trim() ? modelOverride.trim() : MODEL;
  let lastErr: Error | null = null;
  for (let attempt = 0; attempt <= SLOT_RETRY_MAX; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);
    try {
      const res = await fetch('https://ollama.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages, stream: false }),
        signal: controller.signal,
        dispatcher: ollamaDispatcher,
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        const errText = await res.text();
        let errObj: { error?: string } = {};
        try {
          errObj = JSON.parse(errText) as { error?: string };
        } catch {
          errObj = { error: errText };
        }
        const errMsg = (errObj?.error ?? errText) || `Ollama API error: ${res.status}`;
        if (isRetryableError(errMsg) && attempt < SLOT_RETRY_MAX) {
          const delayMs = res.status === 429 ? 60_000 : SLOT_RETRY_DELAY_MS;
          await new Promise((r) => setTimeout(r, delayMs));
          continue;
        }
        throw new Error(errMsg);
      }
      const data = (await res.json()) as { message?: { content?: string } };
      return data?.message?.content ?? '';
    } catch (e) {
      clearTimeout(timeoutId);
      if (e instanceof Error) {
        if (e.name === 'AbortError') {
          throw new Error('Ollama API timeout (limit 48 h) — spróbuj ponownie');
        }
        if (isRetryableError(e.message) && attempt < SLOT_RETRY_MAX) {
          lastErr = e;
          const delayMs = e.message.includes('429') || e.message.toLowerCase().includes('too many requests') ? 60_000 : SLOT_RETRY_DELAY_MS;
          await new Promise((r) => setTimeout(r, delayMs));
          continue;
        }
      }
      throw e;
    }
  }
  throw lastErr || new Error('Ollama error (429/slot) — reduce Parallel (labels) to 2–3, kliknij Resume.');
}

/**
 * POST /api/twojastara/ollama/translate-labels
 * Body: { labels: Record<string, string>, targetLocale: string }
 * Translates label values from English to targetLocale. Keys stay the same.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = await getOllamaApiKey();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Ollama API key is not configured. Set OLLAMA_API_KEY in the environment or save a key under Admin → API Keys.',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { labels, targetLocale, model: modelOverride } = body;
    if (!targetLocale || typeof targetLocale !== 'string') {
      return NextResponse.json({ error: 'targetLocale is required (e.g. pl, de)' }, { status: 400 });
    }
    if (targetLocale === 'en') {
      return NextResponse.json({ labels: labels ?? {} });
    }

    const enLabels =
      labels && typeof labels === 'object' && !Array.isArray(labels)
        ? (labels as Record<string, string>)
        : {};
    const entries = Object.entries(enLabels).filter(([, v]) => v != null && String(v).trim());

    if (entries.length === 0) {
      return NextResponse.json({ labels: enLabels });
    }

    const targetLanguage = LOCALE_NAMES[targetLocale] || targetLocale;
    const systemPrompt = `Translate UI label values from English to ${targetLanguage}. Source is ALWAYS English.

RULES:
- OUTPUT LANGUAGE: Every value MUST be written entirely in ${targetLanguage}. Never leave any value in English. For 中文, 日本語, 한국어, العربية, हिन्दी, etc., use ONLY the target language.
- Output ONLY valid JSON object: same keys as input, values translated to ${targetLanguage}
- Keys stay unchanged (e.g. "calculate", "reset")
- Values: short UI strings, translate naturally for native ${targetLanguage} speakers
- No markdown, no extra text, just the JSON object`;

    const userContent = `[Target: ${targetLocale} = ${targetLanguage}. All values MUST be in ${targetLanguage}, never English.]\n\nTranslate these label values:\n${JSON.stringify(Object.fromEntries(entries), null, 2)}`;

    const useModel = typeof modelOverride === 'string' && modelOverride.trim() ? modelOverride.trim() : undefined;
    const raw = await withOllamaSlot(() =>
      ollamaChat(apiKey, [{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }], useModel)
    );
    let trimmed = (raw || '').trim();
    trimmed = trimmed.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    let jsonStr = jsonMatch ? jsonMatch[0] : trimmed;
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
    let parsed: Record<string, string>;
    try {
      parsed = JSON.parse(jsonStr) as Record<string, string>;
    } catch {
      throw new Error('Ollama returned invalid JSON. Try again.');
    }

    const result: Record<string, string> = { ...enLabels };
    for (const [k] of entries) {
      const translated = parsed[k];
      if (translated != null && typeof translated === 'string' && translated.trim()) {
        result[k] = translated.trim();
      }
    }

    return NextResponse.json({ labels: result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to translate labels';
    console.error('[Ollama translate-labels]', msg, error);
    const status = isRetryableError(msg) ? 503 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
