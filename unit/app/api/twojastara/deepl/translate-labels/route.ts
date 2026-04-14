import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDeeplApiKey, deeplBaseUrl } from '@/lib/admin-api-keys';

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
  hi: 'HI',
};

function toDeeplLang(locale: string): string | null {
  return DEEPL_LANG_MAP[locale.toLowerCase()] ?? null;
}

async function deeplTranslateTexts(
  apiKey: string,
  texts: string[],
  targetLang: string
): Promise<string[]> {
  const base = deeplBaseUrl(apiKey);
  const BATCH = 50;
  const results: string[] = [];

  for (let i = 0; i < texts.length; i += BATCH) {
    const chunk = texts.slice(i, i + BATCH);
    const res = await fetch(`${base}/v2/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `DeepL-Auth-Key ${apiKey}`,
      },
      body: JSON.stringify({
        text: chunk,
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
    results.push(...data.translations.map((t) => t.text));
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

    const targetLang = toDeeplLang(targetLocale);
    if (!targetLang) {
      return NextResponse.json(
        { error: `DeepL does not support locale "${targetLocale}". Use Ollama for this language.` },
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

    const translated = await deeplTranslateTexts(apiKey, textsToTranslate, targetLang);

    const result: Record<string, string> = { ...labels };
    for (let j = 0; j < nonEmptyIndices.length; j++) {
      const origKey = keys[nonEmptyIndices[j]];
      result[origKey] = translated[j] ?? labels[origKey];
    }

    return NextResponse.json({ labels: result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'DeepL translate-labels failed';
    console.error('[DeepL translate-labels]', msg, error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
