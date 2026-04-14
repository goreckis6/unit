import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const SETTINGS_ID = 'default';

/**
 * GET — status only (never expose full keys)
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const row = await prisma.adminSettings.findUnique({
      where: { id: SETTINGS_ID },
      select: { ollamaApiKey: true, anthropicApiKey: true, deeplApiKey: true, updatedAt: true },
    });

    const ollamaDb = !!row?.ollamaApiKey?.trim();
    const anthropicDb = !!row?.anthropicApiKey?.trim();
    const deeplDb = !!row?.deeplApiKey?.trim();
    const ollamaEnv = !!process.env.OLLAMA_API_KEY?.trim();
    const anthropicEnv = !!process.env.ANTHROPIC_API_KEY?.trim();
    const deeplEnv = !!process.env.DEEPL_API_KEY?.trim();

    return NextResponse.json({
      ollama: {
        storedInDatabase: ollamaDb,
        environmentFallbackAvailable: ollamaEnv,
        effectiveConfigured: ollamaDb || ollamaEnv,
      },
      anthropic: {
        storedInDatabase: anthropicDb,
        environmentFallbackAvailable: anthropicEnv,
        effectiveConfigured: anthropicDb || anthropicEnv,
      },
      deepl: {
        storedInDatabase: deeplDb,
        environmentFallbackAvailable: deeplEnv,
        effectiveConfigured: deeplDb || deeplEnv,
      },
      updatedAt: row?.updatedAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error('GET /api/twojastara/settings/api-keys:', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

type PutBody = {
  ollamaApiKey?: string;
  anthropicApiKey?: string;
  deeplApiKey?: string;
  clearOllama?: boolean;
  clearAnthropic?: boolean;
  clearDeepl?: boolean;
};

/**
 * PUT — update stored keys (admin only). Empty string + no clear flag = no change.
 * clearOllama / clearAnthropic removes DB value so env is used again.
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as PutBody;

    const patch: { ollamaApiKey?: string | null; anthropicApiKey?: string | null; deeplApiKey?: string | null } = {};

    if (body.clearOllama === true) {
      patch.ollamaApiKey = null;
    } else if (typeof body.ollamaApiKey === 'string' && body.ollamaApiKey.trim()) {
      patch.ollamaApiKey = body.ollamaApiKey.trim();
    }

    if (body.clearAnthropic === true) {
      patch.anthropicApiKey = null;
    } else if (typeof body.anthropicApiKey === 'string' && body.anthropicApiKey.trim()) {
      patch.anthropicApiKey = body.anthropicApiKey.trim();
    }

    if (body.clearDeepl === true) {
      patch.deeplApiKey = null;
    } else if (typeof body.deeplApiKey === 'string' && body.deeplApiKey.trim()) {
      patch.deeplApiKey = body.deeplApiKey.trim();
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: true, message: 'No changes submitted' });
    }

    await prisma.adminSettings.upsert({
      where: { id: SETTINGS_ID },
      create: {
        id: SETTINGS_ID,
        ollamaApiKey: patch.ollamaApiKey !== undefined ? patch.ollamaApiKey : null,
        anthropicApiKey: patch.anthropicApiKey !== undefined ? patch.anthropicApiKey : null,
        deeplApiKey: patch.deeplApiKey !== undefined ? patch.deeplApiKey : null,
      },
      update: patch,
    });

    return NextResponse.json({ ok: true, message: 'API keys updated' });
  } catch (error) {
    console.error('PUT /api/twojastara/settings/api-keys:', error);
    const message = error instanceof Error ? error.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
