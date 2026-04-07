import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/twojastara/pages/bulk-related-settings
 * Body: { ids: string[], relatedCalculatorsMode: 'manual'|'random'|'both', relatedCalculatorsCount: number }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const ids = Array.isArray(body.ids) ? body.ids.filter((id: unknown) => typeof id === 'string' && id.trim()) : [];
    const mode = body.relatedCalculatorsMode;
    const count = body.relatedCalculatorsCount;

    if (ids.length === 0) {
      return NextResponse.json({ error: 'No page IDs provided.' }, { status: 400 });
    }
    if (mode !== 'manual' && mode !== 'random' && mode !== 'both') {
      return NextResponse.json(
        { error: 'relatedCalculatorsMode must be manual, random, or both.' },
        { status: 400 }
      );
    }
    if (typeof count !== 'number' || count < 1 || count > 12 || !Number.isInteger(count)) {
      return NextResponse.json({ error: 'relatedCalculatorsCount must be an integer from 1 to 12.' }, { status: 400 });
    }

    const result = await prisma.page.updateMany({
      where: { id: { in: ids } },
      data: {
        relatedCalculatorsMode: mode,
        relatedCalculatorsCount: count,
      },
    });

    return NextResponse.json({
      ok: true,
      updated: result.count,
      relatedCalculatorsMode: mode,
      relatedCalculatorsCount: count,
    });
  } catch (error) {
    console.error('POST /api/twojastara/pages/bulk-related-settings:', error);
    return NextResponse.json({ error: 'Bulk related settings failed' }, { status: 500 });
  }
}
