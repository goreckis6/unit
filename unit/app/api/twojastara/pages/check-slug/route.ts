import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  buildStaticCalculatorRouteKeys,
  normalizeBulkImportCategory,
  normalizeBulkImportSlug,
} from '@/lib/bulk-import-shared';

// GET /api/twojastara/pages/check-slug?category=X&slug=Y&excludeId=Z
// Returns { exists: boolean } - true if CMS page or built-in static calculator uses this category+slug
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = normalizeBulkImportCategory(searchParams.get('category'));
    const slugNorm = normalizeBulkImportSlug(searchParams.get('slug'));
    const excludeId = searchParams.get('excludeId')?.trim();

    if (!category || !slugNorm) {
      return NextResponse.json({ exists: false });
    }

    const pages = await prisma.page.findMany({
      where: { category },
      select: { id: true, slug: true },
    });
    const existsInDb = pages.some(
      (p) => (!excludeId || p.id !== excludeId) && normalizeBulkImportSlug(p.slug) === slugNorm
    );
    const key = `${category}\0${slugNorm}`;
    const existsStatic = buildStaticCalculatorRouteKeys().has(key);

    return NextResponse.json({ exists: existsInDb || existsStatic });
  } catch (error) {
    console.error('GET /api/twojastara/pages/check-slug:', error);
    return NextResponse.json(
      { error: 'Failed to check slug' },
      { status: 500 }
    );
  }
}
