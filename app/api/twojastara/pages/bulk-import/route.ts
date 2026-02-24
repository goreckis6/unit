import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/twojastara/pages/bulk-import
 * Body: { items: [{ category, slug, title?, displayTitle?, description? }] }
 *
 * JSON template format:
 * - category: required (e.g. math, electric)
 * - slug: required (url slug, e.g. fractions-averaging)
 * - title: SEO title (meta, <title>)
 * - displayTitle: H1 on page (optional, falls back to title)
 * - description: meta description
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

    const results: { slug: string; category: string; status: 'created' | 'skipped' | 'error'; message?: string }[] = [];

    for (const item of items) {
      const category = typeof item.category === 'string' ? item.category.trim().toLowerCase() : '';
      const slugRaw = typeof item.slug === 'string' ? item.slug.trim() : '';
      const slug = slugRaw.toLowerCase().replace(/\s+/g, '-');
      const title = typeof item.title === 'string' ? item.title.trim() : (typeof item.seoTitle === 'string' ? item.seoTitle.trim() : slug);
      const displayTitle = typeof item.displayTitle === 'string' ? item.displayTitle.trim() : (typeof item.h1 === 'string' ? item.h1.trim() : null) || title;
      const description = typeof item.description === 'string' ? item.description.trim() : (typeof item.metaDescription === 'string' ? item.metaDescription.trim() : null);

      if (!slug) {
        results.push({ slug: slugRaw || '?', category, status: 'error', message: 'Slug is required' });
        continue;
      }
      if (!category) {
        results.push({ slug, category: '?', status: 'error', message: 'Category is required' });
        continue;
      }

      try {
        const existing = await prisma.page.findUnique({
          where: { category_slug: { category, slug } },
        });
        if (existing) {
          results.push({ slug, category, status: 'skipped', message: 'Already exists' });
          continue;
        }

        await prisma.page.create({
          data: {
            slug,
            category,
            published: false,
            translations: {
              create: {
                locale: 'en',
                title: title || slug,
                displayTitle: displayTitle || title || slug,
                description: description || null,
              },
            },
          },
        });
        results.push({ slug, category, status: 'created' });
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        results.push({ slug, category, status: 'error', message: msg });
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
