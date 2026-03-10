import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const VALID_BOOKMARKS = ['in-progress', 'translate-label', 'completed', 'completed-alive', 'done'];

/**
 * POST /api/twojastara/pages/bulk-bookmark
 * Body: { ids: string[], manualBookmark: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { ids, manualBookmark } = body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids array required' }, { status: 400 });
    }
    if (!VALID_BOOKMARKS.includes(manualBookmark)) {
      return NextResponse.json({ error: 'Invalid manualBookmark' }, { status: 400 });
    }
    await prisma.page.updateMany({
      where: { id: { in: ids } },
      data: { manualBookmark },
    });
    const pages = await prisma.page.findMany({
      where: { id: { in: ids } },
      include: { translations: true },
    });
    return NextResponse.json(pages);
  } catch (error) {
    console.error('POST /api/twojastara/pages/bulk-bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to update bookmarks' },
      { status: 500 }
    );
  }
}
