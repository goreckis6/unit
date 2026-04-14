import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDeeplApiKey, deeplBaseUrl } from '@/lib/admin-api-keys';

/**
 * Maps app locale codes → DeepL target language codes.
 * DeepL free/pro supports ~30 languages. Unsupported locales return null.
 * https://developers.deepl.com/docs/resources/supported-languages
 */
const DEEPL_LANG_MAP: Record<string, string> = {
  en: 'EN-US',
  pl: 'PL',
  de: 'DE',
  fr: 'FR',
  es: 'ES',
  it: 'IT',
  nl: 'NL',
  pt: 'PT-PT',
  cs: 'CS',
  sk: 'SK',
  hu: 'HU',
  sv: 'SV',
  no: 'NB',
  da: 'DA',
  fi: 'FI',
  ro: 'RO',
  ru: 'RU',
  ja: 'JA',
  zh: 'ZH-HANS',
  ko: 'KO',
  ar: 'AR',
  id: 'ID',
  tr: 'TR',
  // hi is not supported by DeepL
};

function toDeeplLang(locale: string): string | null {
  return DEEPL_LANG_MAP[locale.toLowerCase()] ?? null;
}

const DEEPL_MAX_TEXTS = 50; // DeepL API limit per request

async function deeplTranslateBatch(
  apiKey: string,
  texts: string[],
  targetLang: string,
  base: string
): Promise<string[]> {
  const res = await fetch(`${base}/v2/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `DeepL-Auth-Key ${apiKey}`,
    },
    body: JSON.stringify({
      text: texts,
      source_lang: 'EN',
      target_lang: targetLang,
      preserve_formatting: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepL API error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as { translations: { text: string }[] };
  return data.translations.map((t) => t.text);
}

async function deeplTranslate(
  apiKey: string,
  texts: string[],
  targetLang: string
): Promise<string[]> {
  const base = deeplBaseUrl(apiKey);
  if (texts.length <= DEEPL_MAX_TEXTS) {
    return deeplTranslateBatch(apiKey, texts, targetLang, base);
  }
  // Split into chunks of DEEPL_MAX_TEXTS and reassemble in order
  const results: string[] = [];
  for (let i = 0; i < texts.length; i += DEEPL_MAX_TEXTS) {
    const chunk = texts.slice(i, i + DEEPL_MAX_TEXTS);
    const translated = await deeplTranslateBatch(apiKey, chunk, targetLang, base);
    results.push(...translated);
  }
  return results;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      content?: string;
      title?: string;
      displayTitle?: string;
      description?: string;
      faqItems?: { question: string; answer: string }[];
      targetLocales?: string[];
      targetLocale?: string; // single-locale shorthand (page edit)
    };

    const {
      content = '',
      title = '',
      displayTitle = '',
      description = '',
      faqItems = [],
      targetLocale: tl,
      targetLocales: tls,
    } = body;

    // Accept both `targetLocale` (singular, from page-edit) and `targetLocales` (array, from bulk)
    const locales = tls?.length ? tls : tl ? [tl] : [];
    if (!locales.length) {
      return NextResponse.json({ error: 'targetLocale or targetLocales required' }, { status: 400 });
    }

    const locale = locales[0]!;
    const targetLang = toDeeplLang(locale);
    if (!targetLang) {
      return NextResponse.json(
        { error: `DeepL does not support locale "${locale}". Use Ollama for this language.` },
        { status: 422 }
      );
    }

    const apiKey = await getDeeplApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'DeepL API key not configured. Add it in Admin → API Keys.' },
        { status: 400 }
      );
    }

    // Build a flat list of strings to translate in one API call.
    // Order: [content, title, displayTitle, description, q0, a0, q1, a1, ...]
    const texts: string[] = [];
    const idx = { content: -1, title: -1, displayTitle: -1, description: -1, faqStart: -1 };

    if (content.trim()) { idx.content = texts.length; texts.push(content); }
    if (title.trim()) { idx.title = texts.length; texts.push(title); }
    if (displayTitle.trim()) { idx.displayTitle = texts.length; texts.push(displayTitle); }
    if (description.trim()) { idx.description = texts.length; texts.push(description); }

    const validFaq = faqItems.filter((f) => f.question?.trim() && f.answer?.trim());
    if (validFaq.length) {
      idx.faqStart = texts.length;
      for (const f of validFaq) {
        texts.push(f.question);
        texts.push(f.answer);
      }
    }

    if (!texts.length) {
      return NextResponse.json({ error: 'Nothing to translate' }, { status: 400 });
    }

    const translated = await deeplTranslate(apiKey, texts, targetLang);

    const resultContent = idx.content >= 0 ? (translated[idx.content] ?? content) : content;
    const resultTitle = idx.title >= 0 ? (translated[idx.title] ?? title) : title;
    const resultDisplayTitle = idx.displayTitle >= 0 ? (translated[idx.displayTitle] ?? displayTitle) : displayTitle;
    const resultDescription = idx.description >= 0 ? (translated[idx.description] ?? description) : description;

    let resultFaq: { question: string; answer: string }[] | undefined;
    if (idx.faqStart >= 0 && validFaq.length) {
      resultFaq = validFaq.map((f, i) => ({
        question: translated[idx.faqStart + i * 2] ?? f.question,
        answer: translated[idx.faqStart + i * 2 + 1] ?? f.answer,
      }));
    } else if (faqItems.length) {
      resultFaq = faqItems;
    }

    return NextResponse.json({
      content: resultContent,
      title: resultTitle || undefined,
      displayTitle: resultDisplayTitle || undefined,
      description: resultDescription || undefined,
      faqItems: resultFaq,
      locale,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'DeepL translation failed';
    console.error('[DeepL translate]', msg, error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
