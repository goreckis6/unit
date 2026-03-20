import { NextRequest, NextResponse } from 'next/server';
import { Agent, fetch } from 'undici';
import { getSession } from '@/lib/auth';
import { getOllamaApiKey } from '@/lib/admin-api-keys';
import { LOCALE_NAMES } from '@/lib/admin-locales';
import { withOllamaSlot } from '@/lib/ollama-concurrency';

const MODEL = process.env.OLLAMA_MODEL || 'glm-4.6:cloud';

const OLLAMA_TIMEOUT_MS = 172_800_000; // 48 h

/** Dispatcher with high timeouts — undici's default headersTimeout is low and causes UND_ERR_HEADERS_TIMEOUT on slow Ollama Cloud */
const ollamaDispatcher = new Agent({
  headersTimeout: OLLAMA_TIMEOUT_MS,
  bodyTimeout: OLLAMA_TIMEOUT_MS,
});

const SLOT_RETRY_DELAY_MS = 30_000; // 30 s — Ollama Cloud "concurrent request slot" often clears
const SLOT_RETRY_MAX = 5;

function isRetryableError(err: string): boolean {
  const s = err.toLowerCase();
  return (
    s.includes('concurrent request slot') ||
    s.includes('no slots available') ||
    s.includes('llm busy') ||
    s.includes('upstream request timeout') ||
    s.includes('429') ||
    s.includes('too many requests') ||
    s.includes('too many concurrent') ||
    s.includes('econnreset') ||
    s.includes('connection reset') ||
    s.includes('socket hang up') ||
    s.includes('etimedout') ||
    s.includes('und_err_headers_timeout')
  );
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
          const delayMs = res.status === 429 ? 60_000 : SLOT_RETRY_DELAY_MS; // 60 s for rate limit
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
          throw new Error(`Ollama API timeout (limit 48 h) — spróbuj ponownie lub skróć treść`);
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
  throw lastErr || new Error('Ollama error (429/slot/timeout) — reduce Parallel to 2–3, kliknij Resume.');
}

type TranslatedItem = {
  content?: string;
  title?: string;
  displayTitle?: string;
  description?: string;
  faqItems?: { question?: string; answer?: string }[];
};

function cleanContent(raw: string): string {
  return (raw ?? '')
    .replace(/^##\s*Markdown\s+content\s*\n*/gi, '')
    .replace(/^content:\s*\n*/i, '')
    .replace(/\n*---\s*\n*FAQ\s*\([^\n)]*\)[^\n]*\n*/gi, '\n')
    .replace(/\n*FAQ\s*\([^\n)]*\)[^\n]*\n*/gi, '\n')
    .replace(/(\n\n)Q:\s+[^\n]+\nA:\s+[^\n]+(?=\n\n|$)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * POST /api/twojastara/ollama/translate
 * Body: { content, faqItems?, title?, displayTitle?, description?, targetLocale? | targetLocales? }
 * Single: targetLocale → returns { content, title, ..., locale }
 * Batch: targetLocales → returns { byLocale: { [loc]: { content, title, ... } } }
 */
export async function POST(request: NextRequest) {
  let targetLocale = '';
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { content?: unknown; faqItems?: unknown; targetLocale?: unknown; targetLocales?: unknown; title?: unknown; displayTitle?: unknown; description?: unknown; model?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { content, faqItems, targetLocale: tl, targetLocales: tls, title, displayTitle, description, model: modelOverride } = body;
    const locales: string[] = Array.isArray(tls) && tls.length > 0
      ? (tls as string[]).filter((l) => typeof l === 'string' && l !== 'en')
      : typeof tl === 'string' && tl !== 'en'
        ? [tl]
        : [];
    if (locales.length === 0) {
      return NextResponse.json({ error: 'targetLocale or targetLocales (non-en) required' }, { status: 400 });
    }
    targetLocale = locales[0] ?? '';

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const ollamaApiKey = await getOllamaApiKey();
    if (!ollamaApiKey) {
      return NextResponse.json(
        {
          error:
            'Ollama API key is not configured. Set OLLAMA_API_KEY in the environment or save a key under Admin → API Keys.',
        },
        { status: 400 }
      );
    }

    const enTitle = typeof title === 'string' ? title.trim() : '';
    const enDisplayTitle = typeof displayTitle === 'string' ? displayTitle.trim() : '';
    const enDescription = typeof description === 'string' ? description.trim() : '';
    const items = Array.isArray(faqItems)
      ? faqItems.filter(
          (f: unknown) =>
            f && typeof f === 'object' && typeof (f as { question?: unknown }).question === 'string' && typeof (f as { answer?: unknown }).answer === 'string'
        )
      : [];

    const faqBlock =
      items.length > 0
        ? `\n\n---\nFAQ (translate each Q&A into faqItems only — DO NOT put in content):\n${items.map((f: { question: string; answer: string }) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')}`
        : '';

    const langList = locales.map((l) => `${l} (${LOCALE_NAMES[l] || l})`).join(', ');
    const isBatch = locales.length > 1;

    const systemPrompt = isBatch
      ? `Translate from English to multiple languages. Source is ALWAYS English. Output ONLY valid JSON, no markdown or extra text.

TARGET LANGUAGES: ${langList}

OUTPUT FORMAT: A JSON object with keys ${locales.join(', ')}. Each key maps to an object with: content, title (if provided), displayTitle (if provided), description (if provided), faqItems (if FAQ was provided).

CRITICAL RULES:
- Each locale's content/faqItems/title/description MUST be written ENTIRELY in that language. Never copy English.
- 1:1 faithful translation: translate exactly what is given, no omissions, no additions
- "content" = ONLY the main article/body text. NEVER include FAQ blocks in content
- Preserve Markdown: # H1, ## H2, **bold**, *italic*, code blocks, bullets
- "faqItems" = array of {"question","answer"} — put translated Q&A here, NOT in content
- NEVER truncate. Output MUST be complete valid JSON with FULL content for each locale.
- Example: { "pl": { "content": "...", "title": "...", "faqItems": [...] }, "de": { ... } }`
      : `Translate from English to ${LOCALE_NAMES[locales[0]] || locales[0]}. Source is ALWAYS English. Output ONLY valid JSON, no markdown or extra text.

CRITICAL RULES:
- OUTPUT LANGUAGE: Every field (title, displayTitle, description, content, faqItems) MUST be written ENTIRELY in the target language. Never copy English.
- 1:1 faithful translation: translate exactly what is given, no omissions, no additions, no extra sections
- "content" = ONLY the main article/body text. NEVER include FAQ, Q&A, or question-answer blocks in content. FAQ goes ONLY in "faqItems"
- Preserve Markdown: # H1, ## H2, **bold**, *italic*, code blocks, bullets
- "faqItems" = array of {"question","answer"} — only if FAQ was provided. Put translated Q&A here, NOT in content
- Do NOT add "## Markdown content", "## FAQ", or similar headers to content
- NEVER truncate. Output MUST be complete valid JSON. Return the ENTIRE translation including full content.`;

    const userContent = isBatch
      ? [
          `[Translate to: ${langList}. Output object with keys: ${locales.join(', ')}. Each value: { content, title, displayTitle, description, faqItems }]`,
          enTitle && `title: ${enTitle}`,
          enDisplayTitle && `displayTitle: ${enDisplayTitle}`,
          enDescription && `description (SEO meta): ${enDescription}`,
          '---',
          'MAIN CONTENT (translate 1:1 to each language; output in each locale\'s "content" — NEVER add FAQ here):',
          content,
          faqBlock,
        ]
          .filter(Boolean)
          .join('\n\n')
      : [
          `[Target: ${locales[0]} = ${LOCALE_NAMES[locales[0]]}. All output MUST be in that language, never English.]`,
          enTitle && `title: ${enTitle}`,
          enDisplayTitle && `displayTitle: ${enDisplayTitle}`,
          enDescription && `description (SEO meta): ${enDescription}`,
          '---',
          'MAIN CONTENT (translate 1:1; output in "content" — NEVER add FAQ here):',
          content,
          faqBlock,
        ]
          .filter(Boolean)
          .join('\n\n');

    function extractJson(text: string): string {
      let s = (text || '').trim();
      s = s.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
      const jsonMatch = s.match(/\{[\s\S]*\}/);
      let jsonStr = jsonMatch ? jsonMatch[0] : s;
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
      return jsonStr;
    }

    /** Try to repair JSON truncated by Ollama (output token limit). Closes unclosed strings and braces. */
    function tryRepairTruncated(jsonStr: string): string {
      let s = jsonStr.trimEnd();
      const openBraces = (s.match(/\{/g) || []).length;
      const closeBraces = (s.match(/\}/g) || []).length;
      if (openBraces <= closeBraces) return s;
      const needed = openBraces - closeBraces;
      const lastChar = s.slice(-1);
      if (lastChar === '"' || lastChar === '}' || lastChar === ']') {
        s += '}'.repeat(needed);
      } else {
        s += '"' + '}'.repeat(needed);
      }
      return s;
    }

    const useModel = typeof modelOverride === 'string' && modelOverride.trim() ? modelOverride.trim() : undefined;
    let raw = await withOllamaSlot(() =>
      ollamaChat(ollamaApiKey, [{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }], useModel)
    );
    let trimmed = (raw || '').trim();
    let parsed: Record<string, unknown>;

    for (let attempt = 0; attempt < 3; attempt++) {
      let jsonStr = extractJson(trimmed);
      try {
        parsed = JSON.parse(jsonStr) as Record<string, unknown>;
        break;
      } catch {
        const repaired = tryRepairTruncated(jsonStr);
        if (repaired !== jsonStr) {
          try {
            parsed = JSON.parse(repaired) as Record<string, unknown>;
            console.warn('[Ollama translate] Used repaired truncated JSON');
            break;
          } catch {
            /* fall through to retry */
          }
        }
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 2000));
          raw = await withOllamaSlot(() =>
            ollamaChat(ollamaApiKey, [{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }], useModel)
          );
          trimmed = (raw || '').trim();
        } else {
          console.error('[Ollama translate] invalid JSON, raw snippet:', (trimmed || '').slice(0, 500));
          throw new Error('Ollama returned invalid JSON. Spróbuj ponownie.');
        }
      }
    }
    parsed = parsed!;

    if (isBatch) {
      const byLocale: Record<string, TranslatedItem> = {};
      for (const loc of locales) {
        const inner = parsed[loc];
        const obj = (inner && typeof inner === 'object' && !Array.isArray(inner)) ? inner as Record<string, unknown> : {};
        let resultContent = cleanContent(String(obj?.content ?? ''));
        if (!resultContent) {
          throw new Error(`Empty content translation for ${loc} from Ollama Cloud`);
        }
        const resultTitle = enTitle && obj.title ? String(obj.title).trim() : enTitle;
        const resultDisplayTitle = enDisplayTitle && obj.displayTitle ? String(obj.displayTitle).trim() : enDisplayTitle;
        const resultDescription = enDescription && obj.description ? String(obj.description).trim() : enDescription || undefined;
        const rawFaq = obj.faqItems;
        const resultFaq =
          items.length > 0 && Array.isArray(rawFaq)
            ? rawFaq
                .filter((t: unknown, i: number) => t && items[i])
                .map((t: unknown, i: number) => {
                  const tt = t as { question?: string; answer?: string };
                  return {
                    question: String(tt?.question ?? items[i].question).trim(),
                    answer: String(tt?.answer ?? items[i].answer).trim(),
                  };
                })
                .filter((f) => f.question && f.answer)
            : items.length > 0
              ? items.map((f) => ({ question: f.question, answer: f.answer }))
              : undefined;
        byLocale[loc] = { content: resultContent, title: resultTitle, displayTitle: resultDisplayTitle, description: resultDescription, faqItems: resultFaq };
      }
      return NextResponse.json({ byLocale });
    }

    const single = parsed as TranslatedItem;
    let resultContent = cleanContent(single.content ?? '');
    if (!resultContent) {
      throw new Error('Empty content translation from Ollama Cloud');
    }
    const resultTitle = enTitle && single.title ? String(single.title).trim() : enTitle;
    const resultDisplayTitle = enDisplayTitle && single.displayTitle ? String(single.displayTitle).trim() : enDisplayTitle;
    const resultDescription = enDescription && single.description ? String(single.description).trim() : enDescription || undefined;
    const resultFaq =
      items.length > 0 && Array.isArray(single.faqItems)
        ? single.faqItems
            .filter((t, i) => t && items[i])
            .map((t, i) => ({
              question: String(t?.question ?? items[i].question).trim(),
              answer: String(t?.answer ?? items[i].answer).trim(),
            }))
            .filter((f) => f.question && f.answer)
        : items.length > 0
          ? items.map((f) => ({ question: f.question, answer: f.answer }))
          : undefined;

    return NextResponse.json({
      content: resultContent,
      title: resultTitle || undefined,
      displayTitle: resultDisplayTitle || undefined,
      description: resultDescription,
      faqItems: resultFaq,
      locale: targetLocale,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to translate';
    console.error(`[Ollama translate] ${targetLocale || '?'}:`, msg, error);
    const status = isRetryableError(msg) ? 503 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
