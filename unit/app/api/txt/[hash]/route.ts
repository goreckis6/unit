import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/txt/[hash]
 * Served via rewrite from /{hash}.txt
 * Returns TXT file content (public).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;
    if (!/^[a-f0-9]{64}$/.test(hash)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const file = await prisma.txtFile.findUnique({
      where: { hash },
      select: { content: true },
    });
    if (!file) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return new NextResponse(file.content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('GET /api/txt/[hash]:', error);
    return NextResponse.json({ error: 'Not found' }, { status: 500 });
  }
}
