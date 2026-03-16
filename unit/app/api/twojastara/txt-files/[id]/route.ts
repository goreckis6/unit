import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/twojastara/txt-files/[id]
 * Delete a TXT file by id (cuid) or hash. Admin only.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    if (!id?.trim()) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    const deleted = await prisma.txtFile.deleteMany({
      where: {
        OR: [{ id }, { hash: id }],
      },
    });
    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/twojastara/txt-files/[id]:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
