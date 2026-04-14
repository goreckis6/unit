import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getModernMtApiKey } from '@/lib/admin-api-keys';

const MMT_BASE = 'https://api.modernmt.com';
const MMT_MAX_TEXTS = 128; // ModernMT API limit per request

/**
 * Maps app locale codes → ModernMT language codes.
 * ModernMT supports a very wide range of languages (200+).
 */
const MMT_LANG_MAP: Record<string, string> = {
  en: 'en',
  pl: 'pl',
  de: 'de',
  fr: 'fr',
  es: 'es-ES',
  it: 'it',
  nl: 'nl',
  pt: 'pt-PT',
  cs: 'cs',
  sk: 'sk',
  hu: 'hu',
  sv: 'sv',
  no: 'nb',
  da: 'da',
  fi: 'fi',
  ro: 'ro',
  ru: 'ru',
  ja: 'ja',
  zh: 'zh-CN',
  ko: 'ko',
  ar: 'ar',
  id: 'id',
  tr: 'tr',
  hi: 'hi',
};

function toMmtLang(locale: string): string | null {
  return MMT_LANG_MAP[locale.toLowerCase()] ?? null;
}

async function mmtTranslateBatch(
  apiKey: string,
  texts: string[],
  target: string
): Promise<string[]> {
  const single = texts.length === 1;
  const q = single ? texts[0] : texts;

  const res = await fetch(`${MMT_BASE}/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'MMT-ApiKey': apiKey,
      'X-HTTP-Method-Override': 'GET',
    },
    body: JSON.stringify({ source: 'en', target, q }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ModernMT API error ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    status: number;
    data: { translation: string } | { translation: string }[];
    error?: { type: string; message: string };
  };

  if (data.status !== 200) {
    throw new Error(`ModernMT error: ${data.error?.message ?? JSON.stringify(data)}`);
  }

  if (single) {
    return [(data.data as { translation: string }).translation];
  }
  return (data.data as { translation: string }[]).map((d) => d.translation);
}

async function mmtTranslate(
  apiKey: string,
  texts: string[],
  target: string
): Promise<string[]> {
  if (texts.length <= MMT_MAX_TEXTS) {
    return mmtTranslateBatch(apiKey, texts, target);
  }
  const results: string[] = [];
  for (let i = 0; i < texts.length; i += MMT_MAX_TEXTS) {
    const chunk = texts.slice(i, i + MMT_MAX_TEXTS);
    const translated = await mmtTranslateBatch(apiKey, chunk, target);
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

    const body = (await request.json()) as {
      content?: string;
      title?: string;
      displayTitle?: string;
      description?: string;
      faqItems?: { question: string; answer: string }[];
      targetLocales?: string[];
      targetLocale?: string;
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

    const locales = tls?.length ? tls : tl ? [tl] : [];
    if (!locales.length) {
      return NextResponse.json({ error: 'targetLocale or targetLocales required' }, { status: 400 });
    }

    const locale = locales[0]!;
    const targetLang = toMmtLang(locale);
    if (!targetLang) {
      return NextResponse.json(
        { error: `ModernMT: unsupported locale "${locale}".` },
        { status: 422 }
      );
    }

    const apiKey = await getModernMtApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ModernMT API key not configured. Add it in Admin → API Keys.' },
        { status: 400 }
      );
    }

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

    const translated = await mmtTranslate(apiKey, texts, targetLang);

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
    const msg = error instanceof Error ? error.message : 'ModernMT translation failed';
    console.error('[ModernMT translate]', msg, error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
