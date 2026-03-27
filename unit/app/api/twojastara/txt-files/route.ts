import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BASE_URL } from '@/lib/hreflang';
import { hashForDisplayName } from '@/lib/txt-file-hash';

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
 * Named *.txt (not 64 hex): hash = SHA256("txt:"+lower(displayName)) — stable URL per filename, content updates keep same hash.
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
      return NextResponse.json({ error: 'displayName is required (e.g. site.txt or 64-char hex)' }, { status: 400 });
    }
    // 64 hex alone, or 64 hex + ".txt" → hash is that hex (URL = /{hash}.txt exactly; e.g. IndexNow key file)
    const hashOnlyMatch = displayName.match(/^([a-f0-9]{64})$/i);
    const hashWithTxtMatch = displayName.match(/^([a-f0-9]{64})\.txt$/i);
    const customHash = hashOnlyMatch ? hashOnlyMatch[1] : hashWithTxtMatch ? hashWithTxtMatch[1] : null;
    if (!customHash && !displayName.endsWith('.txt')) {
      return NextResponse.json({ error: 'displayName must end with .txt or be 64 hex chars (hash)' }, { status: 400 });
    }
    const hash = customHash ? customHash.toLowerCase() : hashForDisplayName(displayName);
    const effectiveDisplayName = customHash ? `${hash}.txt` : displayName;
    // Remove outdated rows for this filename (e.g. old random-hash URL); keep row if hash already matches
    await prisma.txtFile.deleteMany({
      where: { displayName: effectiveDisplayName, hash: { not: hash } },
    });
    const created = await prisma.txtFile.upsert({
      where: { hash },
      create: { hash, displayName: effectiveDisplayName, content },
      update: { displayName: effectiveDisplayName, content },
      select: { id: true },
    });
    const url = `${BASE_URL}/${hash}.txt`;
    return NextResponse.json({ id: created.id, hash, url, displayName: effectiveDisplayName });
  } catch (error) {
    console.error('POST /api/twojastara/txt-files:', error);
    return NextResponse.json({ error: 'Failed to create file' }, { status: 500 });
  }
}
