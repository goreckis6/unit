import { NextRequest, NextResponse } from 'next/server';
import { Agent, fetch } from 'undici';
import { getSession } from '@/lib/auth';
import { getOllamaApiKey } from '@/lib/admin-api-keys';
import { normalizeOllamaCloudModel } from '@/lib/ollama-cloud-models';
import { LOCALE_NAMES } from '@/lib/admin-locales';
import { withOllamaSlot } from '@/lib/ollama-concurrency';

const MODEL = process.env.OLLAMA_MODEL || 'glm-4.6:cloud';

const OLLAMA_TIMEOUT_MS = 172_800_000; // 48 h

/**
 * Max completion tokens for translate (`num_predict`). JSON + long markdown needs headroom; if too low,
 * models may shorten `content` but still close `}`. Cloud models often cap below 131072 (e.g. Gemini Flash 65536).
 * Override with OLLAMA_TRANSLATE_NUM_PREDICT (clamped to per-model cap; ignored below MIN — use default).
 */
const TRANSLATE_NUM_PREDICT_MAX = 131_072;
/** Safe default for Ollama Cloud models that reject num_predict > 65536 (e.g. gemini-*-flash-*:cloud). */
const TRANSLATE_NUM_PREDICT_DEFAULT = 65_536;
const TRANSLATE_NUM_PREDICT_MIN_ENV = 16_384;

/** Upper bound Ollama accepts for this model id (cloud backends differ). */
function translateNumPredictCeilingForModel(model: string): number {
  const m = model.toLowerCase();
  if (/gemini.*flash/i.test(m) || /flash.*gemini/i.test(m)) return 65_536;
  return TRANSLATE_NUM_PREDICT_MAX;
}

function translateNumPredict(model: string): number {
  const ceiling = translateNumPredictCeilingForModel(model);
  const raw = process.env.OLLAMA_TRANSLATE_NUM_PREDICT;
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  const hardMax = Math.min(TRANSLATE_NUM_PREDICT_MAX, ceiling);
  if (Number.isFinite(n) && n >= TRANSLATE_NUM_PREDICT_MIN_ENV) return Math.min(n, hardMax);
  return Math.min(TRANSLATE_NUM_PREDICT_DEFAULT, hardMax);
}

/** 0 = deterministic, less paraphrase/summarizing. Override with OLLAMA_TRANSLATE_TEMPERATURE (e.g. 0.1). */
function translateTemperature(): number {
  const raw = process.env.OLLAMA_TRANSLATE_TEMPERATURE;
  if (raw === undefined || raw === '') return 0;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n < 0 || n > 2) return 0;
  return n;
}

/** Passed to every Ollama /api/chat translate call. */
function translateOllamaOptions(model: string): Record<string, number> {
  return {
    num_predict: translateNumPredict(model),
    // num_ctx: total context window (input tokens + output tokens). Default in Ollama is often
    // 2048 which is insufficient for long articles. 16384 covers even large chunks + system prompt.
    // Cloud models (Gemini, Claude via Ollama) ignore this or use their own limits, so it's safe to set.
    num_ctx: 16_384,
    temperature: translateTemperature(),
    top_p: 0.9,
  };
}

/** Dispatcher with high timeouts — undici's default headersTimeout is low and causes UND_ERR_HEADERS_TIMEOUT on slow Ollama Cloud */
const ollamaDispatcher = new Agent({
  headersTimeout: OLLAMA_TIMEOUT_MS,
  bodyTimeout: OLLAMA_TIMEOUT_MS,
});

const SLOT_RETRY_DELAY_MS = 8_000; // 30 s — Ollama Cloud "concurrent request slot" often clears
const SLOT_RETRY_MAX = 5;

function isRetryableError(err: string): boolean {
  const s = err.toLowerCase();
  return (
    s.includes('internal server error') ||
    s.includes('bad gateway') ||
    s.includes('gateway timeout') ||
    s.includes('service unavailable') ||
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
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          options: translateOllamaOptions(model),
        }),
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
        if ((res.status >= 500 || isRetryableError(errMsg)) && attempt < SLOT_RETRY_MAX) {
          const delayMs = res.status === 429 ? 60_000 : (res.status >= 500 ? 20_000 : SLOT_RETRY_DELAY_MS);
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

/** Long EN articles exceed model output in one JSON blob; split body into several translate calls. */
const CONTENT_AUTO_CHUNK_CHARS = 900;
/** Small chunks + sentence/paragraph boundaries → fewer mid-paragraph cuts and less “lazy” summarizing. */
const CONTENT_CHUNK_TARGET = 420;

/** Appended to each LLM body request; must be copied verbatim to end of JSON "content" so we detect mid-string stops. */
const CHUNK_END_MARKER = '<<<CHUNK_EOC_UCH_a1b2c3>>>';

const TRUNCATED_MARKER_MESSAGE =
  `Brak wymaganego znacznika końca (${CHUNK_END_MARKER}) w odpowiedzi — model prawdopodobnie uciął treść przed końcem fragmentu. Ponów Translate; ustaw OLLAMA_TRANSLATE_NUM_PREDICT=131072; sprawdź reverse proxy (nginx proxy_read_timeout / client_max_body_size) i logi 504.`;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function contentEndsWithChunkMarker(text: string): boolean {
  return new RegExp(`${escapeRegExp(CHUNK_END_MARKER)}\\s*$`).test((text ?? '').trim());
}

function stripChunkEndMarker(text: string): string {
  return (text ?? '').replace(new RegExp(`\\n*${escapeRegExp(CHUNK_END_MARKER)}\\s*$`), '').trimEnd();
}

/**
 * Locales where character-count / sentence-count heuristics vs English are unreliable:
 * CJK (different script, no Western sentence terminators), Arabic, Hebrew, Hindi, Thai, etc.
 */
const CJK_LOCALE_PREFIX = /^(ja|zh|ko|tw|cn|hk|th|ar|he|fa|hi|ur|bn|ta|te|ml|si|km|lo|my|ka|am)(-|$)/i;

const TRUNCATED_BODY_RATIO_MESSAGE =
  'Tłumaczenie treści wygląda na ucięte (wynik znacznie krótszy niż angielski fragment). Model zamknął JSON, ale nie przetłumaczył całości — ponów Translate lub ustaw OLLAMA_TRANSLATE_NUM_PREDICT=131072.';


const ENGLISH_COPY_MESSAGE =
  'Tłumaczenie wygląda na skopiowany angielski oryginał zamiast docelowego języka. Model nie przetłumaczył treści 1:1 — ponów Translate lub użyj mocniejszego modelu.';

/**
 * Heuristic: valid JSON but `content` stopped early (token limit / model stopped inside the string).
 * Skipped for CJK where shorter character counts are normal.
 */
/** Per-chunk: output much shorter than source usually means summarization / drop. */
const CHUNK_MIN_LENGTH_RATIO = 0.60;

/**
 * Terminal punctuation characters that signal a properly finished sentence or block.
 * Covers Latin, Arabic (؟ .), Hebrew, CJK, Devanagari (।), Myanmar (၊ ။), etc.
 */
const SENTENCE_TERMINAL_RE = /[.!?。！？؟\u0964\u104A\u104B…»\]}"')\n]$/;

/**
 * Detects a mid-word or mid-sentence cut: the English source ends cleanly
 * but the translated output does not.  Catches e.g. German "Online-" (compound
 * word split by token limit) or any output that stops without closing its last
 * sentence while the source does close it.
 * Skipped when source is too short to be reliable.
 */
function looksLikeMidSentenceCut(en: string, out: string): boolean {
  const enTail = en.trimEnd();
  const outTail = out.trimEnd();
  if (enTail.length < 40 || outTail.length < 20) return false;
  const enEndsClean = SENTENCE_TERMINAL_RE.test(enTail);
  const outEndsClean = SENTENCE_TERMINAL_RE.test(outTail);
  return enEndsClean && !outEndsClean;
}

function looksTruncatedBodyChunk(en: string, out: string, targetLocale: string): boolean {
  if (CJK_LOCALE_PREFIX.test(targetLocale.trim())) return false;
  const enLen = en.trim().length;
  const outLen = out.trim().length;
  if (enLen < 80) return false; // very short chunks — skip
  if (outLen < enLen * CHUNK_MIN_LENGTH_RATIO) return true;
  // Catch near-complete but mid-sentence truncation (ratio looks fine but output stops mid-word)
  if (looksLikeMidSentenceCut(en, out)) return true;
  return false;
}


function normalizeForLocaleComparison(text: string): string {
  return (text ?? '')
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[`*_>#~\-]+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function phraseShingles(text: string, size = 3): Set<string> {
  const words = normalizeForLocaleComparison(text).split(' ').filter((w) => w.length > 1);
  const out = new Set<string>();
  if (words.length < size) return out;
  const limit = Math.min(words.length - size + 1, 180);
  for (let i = 0; i < limit; i++) {
    out.add(words.slice(i, i + size).join(' '));
  }
  return out;
}

function looksLikeEnglishCopy(en: string, out: string, targetLocale: string): boolean {
  if (!targetLocale || targetLocale.trim().toLowerCase() === 'en') return false;
  if (CJK_LOCALE_PREFIX.test(targetLocale.trim())) return false;
  const enNorm = normalizeForLocaleComparison(en);
  const outNorm = normalizeForLocaleComparison(out);
  if (enNorm.length < 250 || outNorm.length < 250) return false;
  if (enNorm === outNorm) return true;

  const prefixLen = Math.min(500, enNorm.length, outNorm.length);
  if (prefixLen >= 250 && enNorm.slice(0, prefixLen) === outNorm.slice(0, prefixLen)) {
    return true;
  }

  const enShingles = phraseShingles(enNorm);
  const outShingles = phraseShingles(outNorm);
  if (enShingles.size < 16 || outShingles.size < 16) return false;
  let overlap = 0;
  for (const s of outShingles) {
    if (enShingles.has(s)) overlap++;
  }
  const union = enShingles.size + outShingles.size - overlap;
  return union > 0 && overlap / union >= 0.88;
}

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

const TRUNCATED_JSON_MESSAGE =
  'Odpowiedź modelu została ucięta (niepełny JSON). Ustaw na serwerze OLLAMA_TRANSLATE_NUM_PREDICT=131072 i ponów tłumaczenie. Długie artykuły są dzielone na kilka żądań (treść EN > ~1200 znaków).';

/** Appended to system prompts so small/local models do not summarize or drop sections. */
const STRICT_COVERAGE_BLOCK = `STRICT COVERAGE: You are a professional translator. Full 1:1 translation — every English paragraph, heading, list item, table row, and sentence MUST appear in the target text. DO NOT summarize. DO NOT omit any paragraphs. Your output must have the same number of sentences as the input whenever the target language naturally allows it. If the input ends mid-sentence, translate it exactly as it is. NO skipping sections. NO condensed version. If the output stays mostly English or copies source sentences unchanged, that is a failure. Preserve ALL Markdown structure (# ## ** lists code blocks).`;

const STRICT_COVERAGE_BATCH = `STRICT COVERAGE: For EACH target locale, full 1:1 — every English paragraph, heading, list item, and sentence MUST appear in that locale's strings. DO NOT summarize. DO NOT omit any paragraphs. Each locale output must keep the same sentence coverage as the input whenever the target language naturally allows it. If the input ends mid-sentence, translate it exactly as it is. NO skipping. If any locale stays mostly English or copies source sentences unchanged, that locale is invalid. Preserve Markdown in every locale.`;

function localeLabel(locale: string): string {
  return LOCALE_NAMES[locale] || locale;
}

function englishCopyRetryNote(label: string): string {
  return `PREVIOUS OUTPUT FAILED QUALITY CHECK: it remained in English instead of ${label}. Retry now and translate EVERY sentence into ${label}. Returning English text again is invalid.`;
}

/**
 * Parse model JSON; if we only succeed by "repairing" truncated output, throw — never save partial body.
 */
function parseTranslatedJsonStrict(trimmed: string): Record<string, unknown> {
  const jsonStr = extractJson(trimmed);
  try {
    return JSON.parse(jsonStr) as Record<string, unknown>;
  } catch {
    const repaired = tryRepairTruncated(jsonStr);
    if (repaired !== jsonStr) {
      try {
        JSON.parse(repaired) as Record<string, unknown>;
        throw new Error(TRUNCATED_JSON_MESSAGE);
      } catch (e) {
        if (e instanceof Error && e.message === TRUNCATED_JSON_MESSAGE) throw e;
      }
    }
    throw new Error('Ollama returned invalid JSON. Spróbuj ponownie.');
  }
}

/**
 * Prefer cutting after ". " / "? " / "! " within the first maxChars so the next chunk does not start mid-clause.
 * Returns exclusive end index for rest.slice(0, cut), or -1 if no good boundary.
 */
function sentenceBoundaryCut(rest: string, maxChars: number): number {
  const minPos = Math.floor(maxChars * 0.33);
  const head = rest.slice(0, maxChars);
  const seps = ['. ', '.\n', '? ', '?\n', '! ', '!\n'] as const;
  let best = -1;
  for (const sep of seps) {
    let idx = head.length;
    for (;;) {
      const i = head.lastIndexOf(sep, idx);
      if (i < minPos) break;
      best = Math.max(best, i + sep.length);
      idx = i - 1;
      if (idx < minPos) break;
    }
  }
  return best;
}

/** Split markdown body so each piece stays under ~maxChars when possible (heading / paragraph / sentence boundaries). */
function splitContentAtBoundaries(text: string, maxChars: number): string[] {
  const t = text.trim();
  if (t.length <= maxChars) return [t];
  const chunks: string[] = [];
  let rest = t;
  while (rest.length > 0) {
    if (rest.length <= maxChars) {
      chunks.push(rest);
      break;
    }
    let cut = rest.lastIndexOf('\n## ', maxChars);
    if (cut < maxChars * 0.25) cut = rest.lastIndexOf('\n# ', maxChars);
    if (cut < maxChars * 0.25) cut = rest.lastIndexOf('\n\n', maxChars);
    if (cut < maxChars * 0.25) cut = rest.lastIndexOf('\n', maxChars);
    if (cut < maxChars * 0.25) {
      const sc = sentenceBoundaryCut(rest, maxChars);
      if (sc >= 80 && sc <= maxChars) cut = sc;
    }
    if (cut < 80) cut = maxChars;
    chunks.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).trimStart();
  }
  return chunks.filter(Boolean);
}

/**
 * Strip common model preamble from plain-text chunk output.
 * Models sometimes add "Here is the translation:" or "Translation (PL):" etc.
 */
function stripChunkPreamble(text: string): string {
  return text
    .replace(/^(here is the translation[^:\n]*:|translation[^:\n]*:|translated text[^:\n]*:)\s*/i, '')
    .replace(/^(oto tłumaczenie[^:\n]*:|tłumaczenie[^:\n]*:)\s*/i, '')
    .replace(/^## Markdown content\s*/i, '')
    .replace(/^content:\s*/i, '')
    .trim();
}

async function translateOneChunk(
  apiKey: string,
  useModel: string | undefined,
  enChunk: string,
  langName: string,
  targetLocale: string,
  chunkIndex: number,
  totalChunks: number
): Promise<string> {
  // Plain text output — no JSON wrapper.
  // The model cannot "escape" truncation by closing a JSON object early.
  // The only valid completion is: full translation + marker on the last line.
  let retryForEnglishCopy = false;
  let lastErr: Error | null = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    const chunkLen = enChunk.length;
    const sys = [
      `You are a professional translator. Translate the following English text into ${langName} (fragment ${chunkIndex + 1}/${totalChunks}).`,
      `Rules:`,
      `1. Output ONLY the translated text. No JSON, no code fences, no "Translation:", no preamble.`,
      `2. Full 1:1 translation — every sentence, heading, list item. No omissions, no summarizing.`,
      `3. Preserve ALL Markdown (# ## **bold** *italic* \`code\` bullets tables). Keep URLs unchanged.`,
      `4. Source is ${chunkLen} characters — translate ALL of it completely.`,
      `5. After the translated text, put this exact marker as the very last line: ${CHUNK_END_MARKER}`,
      retryForEnglishCopy
        ? `6. CRITICAL: previous attempt was rejected — it was in English. Output MUST be in ${langName}, NOT English.`
        : '',
    ].filter(Boolean).join('\n');

    try {
      const raw = await withOllamaSlot(() =>
        ollamaChat(apiKey, [{ role: 'system', content: sys }, { role: 'user', content: enChunk }], useModel)
      );
      const trimmed = (raw || '').trim();
      if (!contentEndsWithChunkMarker(trimmed)) {
        throw new Error(TRUNCATED_MARKER_MESSAGE);
      }
      const c = stripChunkPreamble(stripChunkEndMarker(trimmed));
      if (!c) {
        throw new Error(`Pusta treść — część ${chunkIndex + 1}/${totalChunks}`);
      }
      if (looksLikeEnglishCopy(enChunk, c, targetLocale)) {
        retryForEnglishCopy = true;
        throw new Error(ENGLISH_COPY_MESSAGE);
      }
      if (looksTruncatedBodyChunk(enChunk, c, targetLocale)) {
        throw new Error(TRUNCATED_BODY_RATIO_MESSAGE);
      }
      return c;
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      const msg = lastErr.message;
      if (msg === ENGLISH_COPY_MESSAGE) retryForEnglishCopy = true;
      if (attempt < 3) await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw lastErr!;
}

async function translateBodyInChunks(
  apiKey: string,
  useModel: string | undefined,
  enBody: string,
  langName: string,
  targetLocale: string
): Promise<string> {
  const chunks = splitContentAtBoundaries(enBody, CONTENT_CHUNK_TARGET);
  // Translate all chunks in parallel — order is preserved via Promise.all index.
  // Actual concurrency is capped by withOllamaSlot (MAX_CONCURRENT).
  const parts = await Promise.all(
    chunks.map((enChunk, i) =>
      translateOneChunk(apiKey, useModel, enChunk, langName, targetLocale, i, chunks.length)
    )
  );
  const merged = parts.join('\n\n').trim();
  const enTrim = enBody.trim();
  // Always validate merged result for non-CJK content regardless of length.
  if (!CJK_LOCALE_PREFIX.test(targetLocale.trim()) && enTrim.length > 200) {
    const r = merged.length / enTrim.length;
    if (r < 0.48) {
      throw new Error(
        `${TRUNCATED_BODY_RATIO_MESSAGE} (Łącznie ${merged.length} vs EN ${enTrim.length} znaków — stosunek ${(r * 100).toFixed(0)}%.)`
      );
    }
    // The merged body must end where the source ends (last sentence complete).
    if (looksLikeMidSentenceCut(enTrim, merged)) {
      throw new Error(`${TRUNCATED_BODY_RATIO_MESSAGE} (Scalona treść urywa się w środku zdania.)`);
    }
  }
  return merged;
}

async function translateMetaAndFaqOnly(
  apiKey: string,
  useModel: string | undefined,
  langName: string,
  enTitle: string,
  enDisplayTitle: string,
  enDescription: string,
  items: { question: string; answer: string }[],
  faqBlock: string
): Promise<TranslatedItem> {
  const userParts = [
    enTitle && `title: ${enTitle}`,
    enDisplayTitle && `displayTitle: ${enDisplayTitle}`,
    enDescription && `description (SEO meta): ${enDescription}`,
    items.length > 0 && faqBlock,
  ].filter(Boolean);
  const userContent = userParts.join('\n\n');
  let lastErr: Error | null = null;
  let retryForEnglishCopy = false;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const sys = `Translate from English to ${langName}. Source is ALWAYS English.
${STRICT_COVERAGE_BLOCK}
${retryForEnglishCopy ? englishCopyRetryNote(langName) : ''}
Output ONLY valid JSON with these keys when English source is provided: "title", "displayTitle", "description" (strings), "faqItems" (array of {"question","answer"}).
Translate every string to ${langName}. Same number of faqItems as English pairs. No markdown fences. Do not truncate.`;
      const raw = await withOllamaSlot(() =>
        ollamaChat(apiKey, [{ role: 'system', content: sys }, { role: 'user', content: userContent }], useModel)
      );
      const parsed = parseTranslatedJsonStrict((raw || '').trim()) as TranslatedItem;
      return parsed;
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      if (lastErr.message === ENGLISH_COPY_MESSAGE) retryForEnglishCopy = true;
      if (lastErr.message === TRUNCATED_JSON_MESSAGE) throw lastErr;
      if (attempt < 2) await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw lastErr || new Error('Meta/FAQ translation failed');
}

function buildTranslateSystemPrompt(
  locales: string[],
  useChunkEndMarker: boolean,
  retryLocales: string[]
): string {
  const isBatch = locales.length > 1;
  const langList = locales.map((l) => `${l} (${localeLabel(l)})`).join(', ');
  const retryLabels = retryLocales.map((l) => `${l} (${localeLabel(l)})`).join(', ');
  const retryBlock = retryLocales.length > 0
    ? `PREVIOUS OUTPUT FAILED QUALITY CHECK for these locale(s): ${retryLabels}. Those locale(s) remained in English instead of the target language. Retry now: every sentence must be translated into the requested locale, and returning English again is invalid.`
    : '';

  return isBatch
    ? `Translate from English to multiple languages. Source is ALWAYS English. Output ONLY valid JSON, no markdown or extra text.

TARGET LANGUAGES: ${langList}

OUTPUT FORMAT: A JSON object with keys ${locales.join(', ')}. Each key maps to an object with: content, title (if provided), displayTitle (if provided), description (if provided), faqItems (if FAQ was provided).

${STRICT_COVERAGE_BATCH}
${retryBlock}

CRITICAL RULES:
- Each locale's content/faqItems/title/description MUST be written ENTIRELY in that language. Never copy English.
- 1:1 faithful translation: translate exactly what is given, no omissions, no additions
- "content" = ONLY the main article/body text. NEVER include FAQ blocks in content
- Preserve Markdown: # H1, ## H2, **bold**, *italic*, code blocks, bullets
- "faqItems" = array of {"question","answer"} — put translated Q&A here, NOT in content
- NEVER truncate. Output MUST be complete valid JSON with FULL content for each locale.
- Example: { "pl": { "content": "...", "title": "...", "faqItems": [...] }, "de": { ... } }`
    : `Translate from English to ${localeLabel(locales[0] || '')}. Source is ALWAYS English. Output ONLY valid JSON, no markdown or extra text.

${STRICT_COVERAGE_BLOCK}
${retryBlock}

CRITICAL RULES:
- OUTPUT LANGUAGE: Every field (title, displayTitle, description, content, faqItems) MUST be written ENTIRELY in the target language. Never copy English.
- 1:1 faithful translation: translate exactly what is given, no omissions, no additions, no extra sections
- "content" = ONLY the main article/body text. NEVER include FAQ, Q&A, or question-answer blocks in content. FAQ goes ONLY in "faqItems"
- Preserve Markdown: # H1, ## H2, **bold**, *italic*, code blocks, bullets
- "faqItems" = array of {"question","answer"} — only if FAQ was provided. Put translated Q&A here, NOT in content
- Do NOT add "## Markdown content", "## FAQ", or similar headers to content
- NEVER truncate or summarize. The "content" string must include the full English article body translated end-to-end (every section and list item).
- Output MUST be complete valid JSON. Return the ENTIRE translation including full content.${
        useChunkEndMarker
          ? `
- The MAIN CONTENT ends with line ${CHUNK_END_MARKER} (machine footer). Copy that line exactly as the last line of JSON "content" after translated markdown — same ASCII; do not translate it.`
          : ''
      }`;
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

    const isBatch = locales.length > 1;
    /** End marker only for one-shot translate (chunked path adds its own per fragment). */
    const useChunkEndMarker =
      !isBatch &&
      content.trim().length >= 600 &&
      content.length <= CONTENT_AUTO_CHUNK_CHARS;
    const contentForLlm = useChunkEndMarker ? `${content}\n\n${CHUNK_END_MARKER}` : content;

    const userContent = isBatch
      ? [
          `[Translate to: ${locales.map((l) => `${l} (${localeLabel(l)})`).join(', ')}. Output object with keys: ${locales.join(', ')}. Each value: { content, title, displayTitle, description, faqItems }]`,
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
          contentForLlm,
          faqBlock,
        ]
          .filter(Boolean)
          .join('\n\n');

    const useModel = normalizeOllamaCloudModel(
      typeof modelOverride === 'string' && modelOverride.trim() ? modelOverride.trim() : undefined
    );

    const longSingleLocale = !isBatch && content.length > CONTENT_AUTO_CHUNK_CHARS;
    const hasMeta = Boolean(enTitle || enDisplayTitle || enDescription || items.length > 0);

    if (longSingleLocale) {
      const loc0 = locales[0]!;
      const langName = LOCALE_NAMES[loc0] || loc0;
      const mergedBody = await translateBodyInChunks(ollamaApiKey, useModel, content, langName, loc0);
      let resultTitle = enTitle;
      let resultDisplayTitle = enDisplayTitle;
      let resultDescription = enDescription || undefined;
      let resultFaq: { question: string; answer: string }[] | undefined =
        items.length > 0 ? items.map((f) => ({ question: f.question, answer: f.answer })) : undefined;
      if (hasMeta) {
        const meta = await translateMetaAndFaqOnly(
          ollamaApiKey,
          useModel,
          langName,
          enTitle,
          enDisplayTitle,
          enDescription,
          items,
          faqBlock
        );
        if (enTitle && meta.title) resultTitle = String(meta.title).trim();
        if (enDisplayTitle && meta.displayTitle) resultDisplayTitle = String(meta.displayTitle).trim();
        if (enDescription && meta.description) resultDescription = String(meta.description).trim();
        const rawFaq = meta.faqItems;
        if (items.length > 0 && Array.isArray(rawFaq)) {
          resultFaq = rawFaq
            .filter((t: unknown, i: number) => t && items[i])
            .map((t: unknown, i: number) => {
              const tt = t as { question?: string; answer?: string };
              return {
                question: String(tt?.question ?? items[i]!.question).trim(),
                answer: String(tt?.answer ?? items[i]!.answer).trim(),
              };
            })
            .filter((f) => f.question && f.answer);
        } else if (items.length > 0) {
          resultFaq = items.map((f) => ({ question: f.question, answer: f.answer }));
        }
      }
      return NextResponse.json({
        content: mergedBody,
        title: resultTitle || undefined,
        displayTitle: resultDisplayTitle || undefined,
        description: resultDescription,
        faqItems: resultFaq,
        locale: targetLocale,
      });
    }

    const detectEnglishCopyLocales = (candidate: Record<string, unknown>): string[] => {
      if (isBatch) {
        return locales.filter((loc) => {
          const inner = candidate[loc];
          const obj = (inner && typeof inner === 'object' && !Array.isArray(inner)) ? inner as Record<string, unknown> : {};
          const resultContent = cleanContent(String(obj?.content ?? ''));
          return resultContent ? looksLikeEnglishCopy(content, resultContent, loc) : false;
        });
      }

      const single = candidate as TranslatedItem;
      let rawSingle = String(single.content ?? '');
      if (useChunkEndMarker && contentEndsWithChunkMarker(rawSingle)) {
        rawSingle = stripChunkEndMarker(rawSingle);
      }
      const resultContent = cleanContent(rawSingle);
      const loc0 = locales[0] ?? '';
      return resultContent && looksLikeEnglishCopy(content, resultContent, loc0) ? [loc0] : [];
    };

    let parsed: Record<string, unknown> | null = null;
    let retryLocales: string[] = [];
    for (let outerAttempt = 0; outerAttempt < 3; outerAttempt++) {
      const systemPrompt = buildTranslateSystemPrompt(locales, useChunkEndMarker, retryLocales);
      let raw = await withOllamaSlot(() =>
        ollamaChat(ollamaApiKey, [{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }], useModel)
      );
      let trimmed = (raw || '').trim();
      let parsedCandidate: Record<string, unknown> | null = null;

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          parsedCandidate = parseTranslatedJsonStrict(trimmed);
          break;
        } catch (e) {
          const msg = e instanceof Error ? e.message : '';
          if (msg === TRUNCATED_JSON_MESSAGE) throw e;
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 2000));
            raw = await withOllamaSlot(() =>
              ollamaChat(ollamaApiKey, [{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }], useModel)
            );
            trimmed = (raw || '').trim();
          } else {
            console.error('[Ollama translate] invalid JSON, raw snippet:', (trimmed || '').slice(0, 500));
            throw e instanceof Error ? e : new Error('Ollama returned invalid JSON. Spróbuj ponownie.');
          }
        }
      }

      parsedCandidate = parsedCandidate!;
      const badLocales = detectEnglishCopyLocales(parsedCandidate);
      if (badLocales.length === 0) {
        parsed = parsedCandidate;
        break;
      }
      if (outerAttempt >= 2) {
        throw new Error(
          badLocales.length > 1
            ? `${ENGLISH_COPY_MESSAGE} (${badLocales.join(', ')})`
            : ENGLISH_COPY_MESSAGE
        );
      }
      retryLocales = badLocales;
      await new Promise((r) => setTimeout(r, 2000));
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
        if (looksLikeEnglishCopy(content, resultContent, loc)) {
          throw new Error(`${ENGLISH_COPY_MESSAGE} (${loc})`);
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
    let rawSingle = String(single.content ?? '');
    if (useChunkEndMarker) {
      if (!contentEndsWithChunkMarker(rawSingle)) {
        throw new Error(TRUNCATED_MARKER_MESSAGE);
      }
      rawSingle = stripChunkEndMarker(rawSingle);
    }
    let resultContent = cleanContent(rawSingle);
    if (!resultContent) {
      throw new Error('Empty content translation from Ollama Cloud');
    }
    if (looksLikeEnglishCopy(content, resultContent, locales[0] ?? '')) {
      throw new Error(ENGLISH_COPY_MESSAGE);
    }
    if (!isBatch && typeof content === 'string' && content.trim().length >= 320) {
      if (looksTruncatedBodyChunk(content, resultContent, locales[0] ?? '')) {
        throw new Error(`${TRUNCATED_BODY_RATIO_MESSAGE} Ponów Translate.`);
      }
      // Mid-sentence cut check regardless of length (catches near-complete truncation)
      if (!CJK_LOCALE_PREFIX.test((locales[0] ?? '').trim()) && looksLikeMidSentenceCut(content, resultContent)) {
        throw new Error(`${TRUNCATED_BODY_RATIO_MESSAGE} (Treść urywa się w środku zdania.) Ponów Translate.`);
      }
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
