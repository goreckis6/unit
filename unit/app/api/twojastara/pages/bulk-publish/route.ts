import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/twojastara/pages/bulk-publish
 * Body: { ids: string[], published: boolean } — page IDs and publish state
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ids = Array.isArray(body.ids) ? body.ids.filter((id: unknown) => typeof id === 'string' && id.trim()) : [];
    const published = body.published === true;

    if (ids.length === 0) {
      return NextResponse.json({ error: 'No page IDs provided. Pass { ids: [...], published: true }.' }, { status: 400 });
    }

    const result = await prisma.page.updateMany({
      where: { id: { in: ids } },
      data: { published },
    });

    return NextResponse.json({
      ok: true,
      updated: result.count,
      published,
      message: `${published ? 'Published' : 'Unpublished'} ${result.count} page(s).`,
    });
  } catch (error) {
    console.error('POST /api/twojastara/pages/bulk-publish:', error);
    const message = error instanceof Error ? error.message : 'Bulk publish failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
