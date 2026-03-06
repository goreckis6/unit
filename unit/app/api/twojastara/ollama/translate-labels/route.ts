import { NextRequest, NextResponse } from 'next/server';
import { Agent, fetch } from 'undici';
import { getSession } from '@/lib/auth';
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

async function ollamaChat(messages: { role: string; content: string }[]) {
  const apiKey = process.env.OLLAMA_API_KEY;
  if (!apiKey) {
    throw new Error('OLLAMA_API_KEY environment variable is not set');
  }
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
        body: JSON.stringify({ model: MODEL, messages, stream: false }),
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
 * Body: { labels: Record<string, string>, targetLocale?: string, targetLocales?: string[] }
 * Single: targetLocale → returns { labels }
 * Batch: targetLocales → returns { labelsByLocale: { [loc]: Record<string,string> } }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { labels, targetLocale, targetLocales } = body;
    if (targetLocale === 'en' && !targetLocales) {
      return NextResponse.json({ labels: labels ?? {} });
    }
    const locales: string[] = Array.isArray(targetLocales) && targetLocales.length > 0
      ? targetLocales.filter((l: unknown) => typeof l === 'string' && l !== 'en')
      : targetLocale && typeof targetLocale === 'string'
        ? [targetLocale]
        : [];
    if (locales.length === 0) {
      return NextResponse.json({ error: 'targetLocale or targetLocales (non-en) required' }, { status: 400 });
    }

    const enLabels =
      labels && typeof labels === 'object' && !Array.isArray(labels)
        ? (labels as Record<string, string>)
        : {};
    const entries = Object.entries(enLabels).filter(([, v]) => v != null && String(v).trim());

    if (entries.length === 0) {
      const out: Record<string, Record<string, string>> = {};
      for (const loc of locales) out[loc] = { ...enLabels };
      return NextResponse.json(locales.length === 1 ? { labels: enLabels } : { labelsByLocale: out });
    }

    const langList = locales.map((l) => `${l} (${LOCALE_NAMES[l] || l})`).join(', ');
    const systemPrompt = locales.length === 1
      ? `Translate UI label values from English to ${LOCALE_NAMES[locales[0]] || locales[0]}. Source is ALWAYS English.

RULES:
- OUTPUT LANGUAGE: Every value MUST be written entirely in the target language. Never leave any value in English.
- Output ONLY valid JSON object: same keys as input, values translated
- Keys stay unchanged (e.g. "calculate", "reset")
- Values: short UI strings, translate naturally for native speakers
- No markdown, no extra text, just the JSON object`
      : `Translate UI label values from English to multiple languages. Source is ALWAYS English.

TARGET LANGUAGES: ${langList}

RULES:
- Output ONLY a valid JSON object with keys: ${locales.join(', ')}
- Each key maps to an object with same keys as input, values translated to that language
- Every value MUST be in its target language. Never leave English.
- Keys (e.g. "calculate", "reset") stay unchanged in each inner object
- No markdown, no extra text, just the JSON object

Example format: { "pl": { "calculate": "Oblicz", "reset": "Resetuj" }, "de": { "calculate": "Berechnen", "reset": "Zurücksetzen" } }`;

    const userContent = locales.length === 1
      ? `[Target: ${locales[0]} = ${LOCALE_NAMES[locales[0]]}. All values MUST be in that language.]\n\nTranslate these label values:\n${JSON.stringify(Object.fromEntries(entries), null, 2)}`
      : `[Translate to: ${langList}. Each locale's object must have keys: ${Object.keys(Object.fromEntries(entries)).join(', ')}]\n\nTranslate these label values to all ${locales.length} languages:\n${JSON.stringify(Object.fromEntries(entries), null, 2)}`;

    const raw = await withOllamaSlot(() => ollamaChat([{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }]));
    let trimmed = (raw || '').trim();
    trimmed = trimmed.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    let jsonStr = jsonMatch ? jsonMatch[0] : trimmed;
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonStr) as Record<string, unknown>;
    } catch {
      throw new Error('Ollama returned invalid JSON. Try again.');
    }

    if (locales.length === 1) {
      const single = parsed as Record<string, string>;
      const result: Record<string, string> = { ...enLabels };
      for (const [k] of entries) {
        const translated = single[k];
        if (translated != null && typeof translated === 'string' && translated.trim()) {
          result[k] = translated.trim();
        }
      }
      return NextResponse.json({ labels: result });
    }

    const labelsByLocale: Record<string, Record<string, string>> = {};
    for (const loc of locales) {
      const inner = parsed[loc];
      const obj = (inner && typeof inner === 'object' && !Array.isArray(inner)) ? inner as Record<string, unknown> : {};
      const result: Record<string, string> = { ...enLabels };
      for (const [k] of entries) {
        const v = obj[k];
        if (v != null && typeof v === 'string' && v.trim()) result[k] = v.trim();
      }
      labelsByLocale[loc] = result;
    }
    return NextResponse.json({ labelsByLocale });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to translate labels';
    console.error('[Ollama translate-labels]', msg, error);
    const status = isRetryableError(msg) ? 503 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
