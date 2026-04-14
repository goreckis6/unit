import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { getAnthropicApiKey, getDeeplApiKey, getOllamaApiKey, deeplBaseUrl } from '@/lib/admin-api-keys';

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'glm-4.6:cloud';
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-opus-4-6';
const TEST_TIMEOUT_MS = 30_000;

type Body = {
  provider?: string;
  /** If set, test this value only (e.g. from form before save). Otherwise DB → env. */
  ollamaApiKey?: string | null;
  anthropicApiKey?: string | null;
  deeplApiKey?: string | null;
};

/**
 * POST /api/twojastara/settings/api-keys/test
 * Body: { provider: "ollama" | "anthropic", ollamaApiKey?: string, anthropicApiKey?: string }
 * Optional key fields: when non-empty, test that string instead of stored/env key.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: Body = {};
    try {
      body = (await request.json()) as Body;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const provider = body.provider === 'anthropic' ? 'anthropic' : body.provider === 'ollama' ? 'ollama' : body.provider === 'deepl' ? 'deepl' : null;
    if (!provider) {
      return NextResponse.json({ error: 'provider must be "ollama", "anthropic", or "deepl"' }, { status: 400 });
    }

    if (provider === 'ollama') {
      const override =
        typeof body.ollamaApiKey === 'string' && body.ollamaApiKey.trim() ? body.ollamaApiKey.trim() : null;
      const apiKey = override ?? (await getOllamaApiKey());
      if (!apiKey) {
        return NextResponse.json(
          { ok: false, error: 'No Ollama API key configured. Paste a key or set OLLAMA_API_KEY / save in Admin.' },
          { status: 400 }
        );
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TEST_TIMEOUT_MS);
      try {
        const res = await fetch('https://ollama.com/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: OLLAMA_MODEL,
            messages: [{ role: 'user', content: 'Reply with the single word OK.' }],
            stream: false,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          const errText = await res.text();
          let msg = errText;
          try {
            const j = JSON.parse(errText) as { error?: string };
            if (j?.error) msg = j.error;
          } catch {
            /* keep errText */
          }
          return NextResponse.json({
            ok: false,
            error: msg || `Ollama HTTP ${res.status}`,
            status: res.status,
          });
        }

        const data = (await res.json()) as { message?: { content?: string } };
        const preview = (data?.message?.content ?? '').trim().slice(0, 80);
        return NextResponse.json({
          ok: true,
          message: 'Ollama API key is valid.',
          model: OLLAMA_MODEL,
          responsePreview: preview || undefined,
        });
      } catch (e) {
        clearTimeout(timeoutId);
        if (e instanceof Error && e.name === 'AbortError') {
          return NextResponse.json({ ok: false, error: `Request timed out after ${TEST_TIMEOUT_MS / 1000}s` }, { status: 504 });
        }
        const msg = e instanceof Error ? e.message : 'Ollama request failed';
        return NextResponse.json({ ok: false, error: msg }, { status: 502 });
      }
    }

    if (provider === 'deepl') {
      const override = typeof body.deeplApiKey === 'string' && body.deeplApiKey.trim() ? body.deeplApiKey.trim() : null;
      const apiKey = override ?? (await getDeeplApiKey());
      if (!apiKey) {
        return NextResponse.json({ ok: false, error: 'No DeepL API key configured. Paste a key or set DEEPL_API_KEY.' }, { status: 400 });
      }
      const base = deeplBaseUrl(apiKey);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TEST_TIMEOUT_MS);
      try {
        const res = await fetch(`${base}/v2/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `DeepL-Auth-Key ${apiKey}` },
          body: JSON.stringify({ text: ['Hello'], target_lang: 'DE', source_lang: 'EN' }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!res.ok) {
          const t = await res.text();
          return NextResponse.json({ ok: false, error: t || `DeepL HTTP ${res.status}`, status: res.status });
        }
        const data = (await res.json()) as { translations?: { text: string }[] };
        const preview = data?.translations?.[0]?.text ?? '';
        return NextResponse.json({ ok: true, message: 'DeepL API key is valid.', model: 'deepl', responsePreview: preview });
      } catch (e) {
        clearTimeout(timeoutId);
        if (e instanceof Error && e.name === 'AbortError') {
          return NextResponse.json({ ok: false, error: `Request timed out after ${TEST_TIMEOUT_MS / 1000}s` }, { status: 504 });
        }
        return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'DeepL request failed' }, { status: 502 });
      }
    }

    // anthropic
    const override =
      typeof body.anthropicApiKey === 'string' && body.anthropicApiKey.trim()
        ? body.anthropicApiKey.trim()
        : null;
    const apiKey = override ?? (await getAnthropicApiKey());
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: 'No Anthropic API key configured. Paste a key or set ANTHROPIC_API_KEY / save in Admin.' },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TEST_TIMEOUT_MS);

    try {
      const response = await client.messages.create(
        {
          model: CLAUDE_MODEL,
          max_tokens: 16,
          messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
        },
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      const textBlock = response.content.find((b) => b.type === 'text');
      const preview =
        textBlock && textBlock.type === 'text' ? textBlock.text.trim().slice(0, 80) : '';
      return NextResponse.json({
        ok: true,
        message: 'Anthropic API key is valid.',
        model: CLAUDE_MODEL,
        responsePreview: preview || undefined,
      });
    } catch (e) {
      clearTimeout(timeoutId);
      if (e instanceof Error && e.name === 'AbortError') {
        return NextResponse.json({ ok: false, error: `Request timed out after ${TEST_TIMEOUT_MS / 1000}s` }, { status: 504 });
      }
      let msg = e instanceof Error ? e.message : 'Anthropic request failed';
      if (typeof e === 'object' && e !== null && 'status' in e) {
        const st = (e as { status?: number }).status;
        if (st === 401) msg = 'Invalid API key (401)';
      }
      return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }
  } catch (error) {
    console.error('POST /api/twojastara/settings/api-keys/test:', error);
    return NextResponse.json({ ok: false, error: 'Test failed' }, { status: 500 });
  }
}
