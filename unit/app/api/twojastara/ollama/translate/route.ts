import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { LOCALE_NAMES } from '@/lib/admin-locales';

const MODEL = process.env.OLLAMA_MODEL || 'glm-4.6:cloud';

const OLLAMA_TIMEOUT_MS = 5_400_000; // 90 min

async function ollamaChat(messages: { role: string; content: string }[]) {
  const apiKey = process.env.OLLAMA_API_KEY;
  if (!apiKey) {
    throw new Error('OLLAMA_API_KEY environment variable is not set');
  }
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
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || `Ollama API error: ${res.status}`);
    }
    const data = (await res.json()) as { message?: { content?: string } };
    return data?.message?.content ?? '';
  } catch (e) {
    clearTimeout(timeoutId);
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error(`Ollama API timeout (limit ~90 min) — spróbuj ponownie lub skróć treść`);
    }
    throw e;
  }
}

/** POST /api/twojastara/ollama/translate — single API call for title, content, FAQ */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, faqItems, targetLocale, title, displayTitle, description } = body;
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    if (!targetLocale || typeof targetLocale !== 'string') {
      return NextResponse.json({ error: 'targetLocale is required (e.g. pl, de, fr)' }, { status: 400 });
    }

    const targetLanguage = LOCALE_NAMES[targetLocale] || targetLocale;
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

    const systemPrompt = `Translate from English to ${targetLanguage}. Source is ALWAYS English. Output ONLY valid JSON, no markdown or extra text.

CRITICAL RULES:
- 1:1 faithful translation: translate exactly what is given, no omissions, no additions, no extra sections
- "content" = ONLY the main article/body text. NEVER include FAQ, Q&A, "FAQ (translate...)", or any question-answer blocks in content. The page has a separate FAQ Schema below — FAQ goes ONLY in "faqItems"
- Preserve Markdown: # H1, ## H2, **bold**, *italic*, code blocks, bullets
- "faqItems" = array of {"question","answer"} — only if FAQ was provided in the input. Put translated Q&A here, NOT in content
- Do NOT add "## Markdown content", "## FAQ", or similar headers to content`;

    const userContent = [
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

    const raw = await ollamaChat([{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }]);
    const trimmed = (raw || '').trim();

    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : trimmed;
    let parsed: {
      content?: string;
      title?: string;
      displayTitle?: string;
      description?: string;
      faqItems?: { question?: string; answer?: string }[];
    };
    try {
      parsed = JSON.parse(jsonStr) as typeof parsed;
    } catch {
      throw new Error('Ollama returned invalid JSON. Spróbuj ponownie.');
    }

    // Strip accidental headers and FAQ block that may leak from model into content
    let resultContent = (parsed.content ?? '')
      .replace(/^##\s*Markdown\s+content\s*\n*/gi, '')
      .replace(/^content:\s*\n*/i, '')
      .replace(/\n*---\s*\n*FAQ\s*\([^\n)]*\)[^\n]*\n*/gi, '\n')
      .replace(/\n*FAQ\s*\([^\n)]*\)[^\n]*\n*/gi, '\n')
      .replace(/(\n\n)Q:\s+[^\n]+\nA:\s+[^\n]+(?=\n\n|$)/g, '$1')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    if (!resultContent) {
      throw new Error('Empty content translation from Ollama Cloud');
    }

    const resultTitle = enTitle && parsed.title ? String(parsed.title).trim() : enTitle;
    const resultDisplayTitle = enDisplayTitle && parsed.displayTitle ? String(parsed.displayTitle).trim() : enDisplayTitle;
    const resultDescription =
      enDescription && parsed.description ? String(parsed.description).trim() : enDescription || undefined;
    const resultFaq =
      items.length > 0 && Array.isArray(parsed.faqItems)
        ? parsed.faqItems
            .filter((t, i) => t && items[i])
            .map((t, i) => ({
              question: String(t?.question ?? items[i].question).trim(),
              answer: String(t?.answer ?? items[i].answer).trim(),
            }))
            .filter((f) => f.question && f.answer)
        : items.length > 0
          ? items.map((f: { question: string; answer: string }) => ({ question: f.question, answer: f.answer }))
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
    console.error('Ollama translate error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to translate';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
