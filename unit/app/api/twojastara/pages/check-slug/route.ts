import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/twojastara/pages/check-slug?category=X&slug=Y&excludeId=Z
// Returns { exists: boolean } - true if another page uses this category+slug
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category')?.trim().toLowerCase();
    const slug = searchParams.get('slug')?.trim().toLowerCase().replace(/\s+/g, '-');
    const excludeId = searchParams.get('excludeId')?.trim();

    if (!category || !slug) {
      return NextResponse.json({ exists: false });
    }

    const existing = await prisma.page.findFirst({
      where: {
        category,
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });

    return NextResponse.json({ exists: !!existing });
  } catch (error) {
    console.error('GET /api/twojastara/pages/check-slug:', error);
    return NextResponse.json(
      { error: 'Failed to check slug' },
      { status: 500 }
    );
  }
}
