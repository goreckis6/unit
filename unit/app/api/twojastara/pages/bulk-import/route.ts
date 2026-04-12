import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeBulkImportItems } from '@/lib/bulk-import-shared';

/**
 * POST /api/twojastara/pages/bulk-import
 * Body: { items: [{ category, slug, title?, displayTitle?, description? }] }
 *
 * JSON template format:
 * - category: required (e.g. math, electric)
 * - slug: required (url slug; normalized: lower, spaces→-, colons stripped, etc.)
 * - title: SEO title (meta, <title>)
 * - displayTitle: H1 on page (optional, falls back to title)
 * - description: meta description
 *
 * Skips: built-in static calculator (repo), already in DB, duplicate rows in the same JSON.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : Array.isArray(body) ? body : [];

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'No items to import. Provide { items: [...] } or a JSON array.' },
        { status: 400 }
      );
    }

    const analyzed = await analyzeBulkImportItems(prisma, items);

    const results: {
      slug: string;
      category: string;
      status: 'created' | 'skipped' | 'error';
      message?: string;
    }[] = [];

    for (const row of analyzed) {
      const slugLabel = row.slugNormalized || row.slugInput || '?';

      if (row.status === 'error') {
        results.push({
          slug: slugLabel,
          category: row.category || '?',
          status: 'error',
          message: row.message,
        });
        continue;
      }

      if (row.status === 'skipped_exists') {
        results.push({
          slug: slugLabel,
          category: row.category,
          status: 'skipped',
          message: row.message ?? 'Already exists',
        });
        continue;
      }

      if (row.status === 'skipped_duplicate_in_file') {
        results.push({
          slug: slugLabel,
          category: row.category,
          status: 'skipped',
          message: row.message ?? 'Duplicate in file',
        });
        continue;
      }

      if (row.status === 'skipped_static_calculator') {
        results.push({
          slug: slugLabel,
          category: row.category,
          status: 'skipped',
          message: row.message ?? 'Static calculator in repo',
        });
        continue;
      }

      if (row.status !== 'import') {
        results.push({
          slug: slugLabel,
          category: row.category || '?',
          status: 'error',
          message: `Unexpected row status: ${row.status}`,
        });
        continue;
      }

      try {
        await prisma.page.create({
          data: {
            slug: row.slugNormalized,
            category: row.category,
            published: false,
            translations: {
              create: {
                locale: 'en',
                title: row.title || row.slugNormalized,
                displayTitle: row.displayTitle || row.title || row.slugNormalized,
                description: row.description || null,
              },
            },
          },
        });
        results.push({ slug: row.slugNormalized, category: row.category, status: 'created' });
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        results.push({ slug: row.slugNormalized, category: row.category, status: 'error', message: msg });
      }
    }

    const created = results.filter((r) => r.status === 'created').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;
    const errors = results.filter((r) => r.status === 'error');

    return NextResponse.json({
      ok: true,
      created,
      skipped,
      errors: errors.length,
      results,
      message: `Created ${created}, skipped ${skipped}${errors.length ? `, ${errors.length} errors` : ''}.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Bulk import failed';
    console.error('POST /api/twojastara/pages/bulk-import:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
