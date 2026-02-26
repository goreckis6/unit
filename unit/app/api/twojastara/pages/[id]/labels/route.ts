import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/twojastara/pages/[id]/labels
 * Body: { updates: { locale: string; calculatorLabels: Record<string, string> }[] }
 *
 * Updates ONLY calculatorLabels for the given locales. Does not touch content,
 * title, description, faqItems, etc. Allows parallel Translate content + Translate
 * labels without overwriting each other.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pageId } = await params;
    const body = await request.json();
    const updates = Array.isArray(body.updates)
      ? (body.updates as { locale: string; calculatorLabels?: Record<string, string> }[]).filter(
          (u) => u?.locale && typeof u.locale === 'string' && u.calculatorLabels && typeof u.calculatorLabels === 'object'
        )
      : [];

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided. Pass { updates: [{ locale, calculatorLabels }] }.' }, { status: 400 });
    }

    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    for (const { locale, calculatorLabels } of updates) {
      const labelsStr =
        calculatorLabels && Object.keys(calculatorLabels).length > 0
          ? JSON.stringify(calculatorLabels)
          : null;
      await prisma.pageTranslation.updateMany({
        where: { pageId, locale },
        data: { calculatorLabels: labelsStr },
      });
    }

    const updated = await prisma.page.findUnique({
      where: { id: pageId },
      include: { translations: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/twojastara/pages/[id]/labels:', error);
    const message = error instanceof Error ? error.message : 'Labels update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
