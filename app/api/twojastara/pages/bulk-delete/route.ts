import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/twojastara/pages/bulk-delete
 * Body: { ids: string[] } — page IDs to delete
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ids = Array.isArray(body.ids) ? body.ids.filter((id: unknown) => typeof id === 'string' && id.trim()) : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: 'No page IDs provided. Pass { ids: [...] }.' }, { status: 400 });
    }

    const result = await prisma.page.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({
      ok: true,
      deleted: result.count,
      message: `Deleted ${result.count} page(s).`,
    });
  } catch (error) {
    console.error('POST /api/twojastara/pages/bulk-delete:', error);
    const message = error instanceof Error ? error.message : 'Bulk delete failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
