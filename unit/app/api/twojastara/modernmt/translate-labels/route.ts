import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getModernMtApiKey } from '@/lib/admin-api-keys';

const MMT_BASE = 'https://api.modernmt.com';

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

async function mmtTranslateTexts(
  apiKey: string,
  texts: string[],
  target: string
): Promise<string[]> {
  const BATCH = 128;
  const results: string[] = [];

  for (let i = 0; i < texts.length; i += BATCH) {
    const chunk = texts.slice(i, i + BATCH);
    const single = chunk.length === 1;
    const q = single ? chunk[0] : chunk;

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
      results.push((data.data as { translation: string }).translation);
    } else {
      results.push(...(data.data as { translation: string }[]).map((d) => d.translation));
    }
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
      labels: Record<string, string>;
      targetLocale: string;
    };

    const { labels, targetLocale } = body;

    if (!labels || typeof labels !== 'object' || Array.isArray(labels)) {
      return NextResponse.json({ error: 'labels must be a key-value object' }, { status: 400 });
    }

    const targetLang = toMmtLang(targetLocale);
    if (!targetLang) {
      return NextResponse.json(
        { error: `ModernMT: unsupported locale "${targetLocale}".` },
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

    const keys = Object.keys(labels);
    const nonEmptyIndices: number[] = [];
    const textsToTranslate: string[] = [];

    for (let i = 0; i < keys.length; i++) {
      const v = labels[keys[i]];
      if (v?.trim()) {
        nonEmptyIndices.push(i);
        textsToTranslate.push(v);
      }
    }

    if (!textsToTranslate.length) {
      return NextResponse.json({ labels: {} });
    }

    const translated = await mmtTranslateTexts(apiKey, textsToTranslate, targetLang);

    const result: Record<string, string> = { ...labels };
    for (let j = 0; j < nonEmptyIndices.length; j++) {
      const origKey = keys[nonEmptyIndices[j]];
      result[origKey] = translated[j] ?? labels[origKey];
    }

    return NextResponse.json({ labels: result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'ModernMT translate-labels failed';
    console.error('[ModernMT translate-labels]', msg, error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
