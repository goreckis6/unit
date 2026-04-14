import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDeeplApiKey, deeplBaseUrl } from '@/lib/admin-api-keys';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = await getDeeplApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'DeepL API key not configured.' }, { status: 400 });
    }

    const base = deeplBaseUrl(apiKey);
    const res = await fetch(`${base}/v2/usage`, {
      headers: { Authorization: `DeepL-Auth-Key ${apiKey}` },
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `DeepL API error ${res.status}: ${errText.slice(0, 200)}` },
        { status: res.status }
      );
    }

    const data = (await res.json()) as {
      character_count: number;
      character_limit: number;
    };

    return NextResponse.json({
      used: data.character_count,
      limit: data.character_limit,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch DeepL usage';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
