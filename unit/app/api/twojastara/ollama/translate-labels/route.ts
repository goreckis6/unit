import { NextRequest, NextResponse } from 'next/server';
import { Agent, fetch } from 'undici';
import { getSession } from '@/lib/auth';
import { LOCALE_NAMES } from '@/lib/admin-locales';

const MODEL = process.env.OLLAMA_MODEL || 'glm-4.6:cloud';
const OLLAMA_TIMEOUT_MS = 172_800_000; // 48 h

/** Dispatcher with high timeouts — undici's default headersTimeout causes UND_ERR_HEADERS_TIMEOUT on slow Ollama Cloud */
const ollamaDispatcher = new Agent({
  headersTimeout: OLLAMA_TIMEOUT_MS,
  bodyTimeout: OLLAMA_TIMEOUT_MS,
});

const SLOT_RETRY_DELAY_MS = 30_000;
const SLOT_RETRY_MAX = 5;

function isSlotError(err: string): boolean {
  const s = err.toLowerCase();
  return s.includes('concurrent request slot') || s.includes('no slots available') || s.includes('llm busy');
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
        if (isSlotError(errMsg) && attempt < SLOT_RETRY_MAX) {
          await new Promise((r) => setTimeout(r, SLOT_RETRY_DELAY_MS));
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
        if (isSlotError(e.message) && attempt < SLOT_RETRY_MAX) {
          lastErr = e;
          await new Promise((r) => setTimeout(r, SLOT_RETRY_DELAY_MS));
          continue;
        }
      }
      throw e;
    }
  }
  throw lastErr || new Error('Ollama slot error — reduce Parallel (labels) to 2–3 and try again.');
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

    const body = await request.json();
    const { labels, targetLocale } = body;
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

    const raw = await ollamaChat([{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }]);
    const trimmed = (raw || '').trim();
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : trimmed;
    let parsed: Record<string, string>;
    try {
      parsed = JSON.parse(jsonStr) as Record<string, string>;
    } catch {
      throw new Error('Ollama returned invalid JSON. Try again.');
    }

    const result: Record<string, string> = { ...enLabels };
    for (const [k, v] of entries) {
      const translated = parsed[k];
      if (translated != null && typeof translated === 'string' && translated.trim()) {
        result[k] = translated.trim();
      }
    }

    return NextResponse.json({ labels: result });
  } catch (error) {
    console.error('Ollama translate-labels error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to translate labels';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
