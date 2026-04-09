import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { revalidateSitemapAll } from '@/lib/sitemap-revalidate';
import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { submitIndexNowForUrls, urlsForCalculatorPage } from '@/lib/indexnow';

/** List view only needs a short prefix of `content` (stage tabs + translation heuristics use ≤400 chars). Omitting full body keeps JSON small and avoids proxy timeouts/502 on large sites. */
const LIST_CONTENT_PREFIX_LEN = 500;

// GET /api/admin/pages - List all pages
export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      include: {
        translations: {
          select: {
            id: true,
            locale: true,
            title: true,
            displayTitle: true,
            description: true,
            relatedCalculators: true,
            faqItems: true,
            calculatorLabels: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const pageIds = pages.map((p) => p.id);
    if (pageIds.length > 0) {
      const rows = await prisma.$queryRaw<
        { pageId: string; locale: string; hc: bigint | number; pref: string | null }[]
      >(Prisma.sql`
        SELECT "pageId", "locale",
          CASE WHEN "content" IS NOT NULL AND TRIM("content") != '' THEN 1 ELSE 0 END AS hc,
          SUBSTR(TRIM("content"), 1, ${LIST_CONTENT_PREFIX_LEN}) AS pref
        FROM "PageTranslation"
        WHERE "pageId" IN (${Prisma.join(pageIds)})
      `);
      const contentByPageLocale = new Map<string, string | null>();
      for (const r of rows) {
        const n = typeof r.hc === 'bigint' ? Number(r.hc) : r.hc;
        const text = n ? (r.pref ?? '') : null;
        contentByPageLocale.set(`${r.pageId}\0${r.locale}`, text);
      }
      for (const page of pages) {
        for (const t of page.translations) {
          Object.assign(t, { content: contentByPageLocale.get(`${page.id}\0${t.locale}`) ?? null });
        }
      }
    }

    return NextResponse.json(pages);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('GET /api/admin/pages:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch pages',
        ...(process.env.NODE_ENV === 'development' && { detail: msg, stack }),
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/pages - Create new page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, category, published, translations, calculatorCode, linkedCalculatorPath, relatedCalculatorsMode, relatedCalculatorsCount } = body;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }
    if (!category || typeof category !== 'string' || !category.trim()) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    const page = await prisma.page.create({
      data: {
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        category: category.trim().toLowerCase(),
        published: published ?? false,
        calculatorCode: calculatorCode ?? null,
        linkedCalculatorPath: linkedCalculatorPath ?? null,
        relatedCalculatorsMode: ['manual', 'random', 'both'].includes(relatedCalculatorsMode) ? relatedCalculatorsMode : 'random',
        relatedCalculatorsCount: typeof relatedCalculatorsCount === 'number' && relatedCalculatorsCount >= 1 && relatedCalculatorsCount <= 12 ? relatedCalculatorsCount : 6,
        translations: translations?.length
          ? {
              create: translations.map((t: {
                locale: string;
                title: string;
                displayTitle?: string;
                description?: string;
                content?: string;
                relatedCalculators?: { title: string; description: string; path: string }[];
                faqItems?: { question: string; answer: string }[];
                calculatorLabels?: Record<string, string>;
              }) => ({
                locale: t.locale,
                title: t.title,
                displayTitle: t.displayTitle?.trim() || null,
                description: t.description ?? null,
                content: t.content ?? null,
                relatedCalculators: t.relatedCalculators?.length ? JSON.stringify(t.relatedCalculators) : null,
                faqItems: t.faqItems?.length ? JSON.stringify(t.faqItems) : null,
                calculatorLabels: t.calculatorLabels && Object.keys(t.calculatorLabels).length ? JSON.stringify(t.calculatorLabels) : null,
              })),
            }
          : undefined,
      },
      include: { translations: true },
    });

    if (page.published) {
      revalidateSitemapAll();
      if (page.category?.trim()) {
        void submitIndexNowForUrls(urlsForCalculatorPage(page.category, page.slug)).catch((err) =>
          console.error('[IndexNow] POST page:', err)
        );
      }
    }

    return NextResponse.json(page);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create page';
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('POST /api/admin/pages:', error);
    return NextResponse.json(
      {
        error: message,
        ...(process.env.NODE_ENV === 'development' && { detail: message, stack }),
      },
      { status: 500 }
    );
  }
}
