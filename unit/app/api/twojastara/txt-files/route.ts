import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BASE_URL } from '@/lib/hreflang';
import { createHash, randomBytes } from 'crypto';

/**
 * GET /api/twojastara/txt-files
 * List all TXT files (admin only)
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const files = await prisma.txtFile.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, hash: true, displayName: true, createdAt: true },
    });
    return NextResponse.json(files);
  } catch (error) {
    console.error('GET /api/twojastara/txt-files:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}

/**
 * POST /api/twojastara/txt-files
 * Body: { displayName: string, content: string }
 * Create a new TXT file. Returns { hash, url }.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : '';
    const content = typeof body.content === 'string' ? body.content : '';
    if (!displayName) {
      return NextResponse.json({ error: 'displayName is required (e.g. site.txt)' }, { status: 400 });
    }
    if (!displayName.endsWith('.txt')) {
      return NextResponse.json({ error: 'displayName must end with .txt' }, { status: 400 });
    }
    const hash = createHash('sha256')
      .update(content + displayName + randomBytes(16).toString('hex'))
      .digest('hex');
    await prisma.txtFile.create({
      data: { hash, displayName, content },
    });
    const url = `${BASE_URL}/${hash}.txt`;
    return NextResponse.json({ hash, url, displayName });
  } catch (error) {
    console.error('POST /api/twojastara/txt-files:', error);
    return NextResponse.json({ error: 'Failed to create file' }, { status: 500 });
  }
}
