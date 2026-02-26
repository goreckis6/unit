import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/twojastara/pages/clean-translations
 * Body: { ids: string[] }
 *
 * Clears content and labels for all non-EN locales.
 * Keeps only the original EN translation (content, description, faqItems, calculatorLabels).
 * Non-EN translations are removed entirely so only EN remains.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ids = Array.isArray(body.ids)
      ? (body.ids as unknown[]).filter((id): id is string => typeof id === 'string' && !!id.trim())
      : [];

    if (ids.length === 0) {
      return NextResponse.json(
        { error: 'No page IDs provided. Pass { ids: [...], }.' },
        { status: 400 }
      );
    }

    const pages = await prisma.page.findMany({
      where: { id: { in: ids } },
      include: { translations: true },
    });

    let cleaned = 0;
    const errors: string[] = [];

    for (const page of pages) {
      const enTrans = page.translations.find((t) => t.locale === 'en');
      if (!enTrans) {
        errors.push(`${page.slug}: no EN translation, skipped`);
        continue;
      }

      const relatedCalc = enTrans.relatedCalculators
        ? (JSON.parse(enTrans.relatedCalculators) as { title: string; description: string; path: string }[])
        : [];
      const faq = enTrans.faqItems
        ? (JSON.parse(enTrans.faqItems) as { question: string; answer: string }[])
        : [];
      const labels = enTrans.calculatorLabels
        ? (JSON.parse(enTrans.calculatorLabels) as Record<string, string>)
        : null;

      const translations = [
        {
          locale: 'en',
          title: enTrans.title,
          displayTitle: enTrans.displayTitle?.trim() || null,
          description: enTrans.description ?? null,
          content: enTrans.content ?? null,
          relatedCalculators: relatedCalc,
          faqItems: faq,
          calculatorLabels: labels && Object.keys(labels).length ? labels : null,
        },
      ];

      await prisma.pageTranslation.deleteMany({ where: { pageId: page.id } });
      await prisma.pageTranslation.createMany({
        data: translations.map((t) => ({
          pageId: page.id,
          locale: t.locale,
          title: t.title,
          displayTitle: t.displayTitle,
          description: t.description,
          content: t.content,
          relatedCalculators: t.relatedCalculators?.length ? JSON.stringify(t.relatedCalculators) : null,
          faqItems: t.faqItems?.length ? JSON.stringify(t.faqItems) : null,
          calculatorLabels: t.calculatorLabels && Object.keys(t.calculatorLabels).length ? JSON.stringify(t.calculatorLabels) : null,
        })),
      });
      cleaned++;
    }

    return NextResponse.json({
      ok: true,
      cleaned,
      total: ids.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Cleaned ${cleaned}/${ids.length} page(s). Only EN content remains.`,
    });
  } catch (error) {
    console.error('POST /api/twojastara/pages/clean-translations:', error);
    const message = error instanceof Error ? error.message : 'Clean translations failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
