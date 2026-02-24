import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/pages/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const page = await prisma.page.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    return NextResponse.json(page);
  } catch (error) {
    console.error('GET /api/admin/pages/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/pages/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { slug, category, published, translations, calculatorCode, linkedCalculatorPath, relatedCalculatorsMode, relatedCalculatorsCount } = body;

    const updateData: Record<string, unknown> = {};
    if (slug !== undefined) updateData.slug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    if (category !== undefined) updateData.category = category ? category.trim().toLowerCase() : undefined;
    if (published !== undefined) updateData.published = published;
    if (calculatorCode !== undefined) updateData.calculatorCode = calculatorCode || null;
    if (linkedCalculatorPath !== undefined) updateData.linkedCalculatorPath = linkedCalculatorPath || null;
    if (relatedCalculatorsMode !== undefined && ['manual', 'random', 'both'].includes(relatedCalculatorsMode)) {
      updateData.relatedCalculatorsMode = relatedCalculatorsMode;
    }
    if (relatedCalculatorsCount !== undefined && typeof relatedCalculatorsCount === 'number' && relatedCalculatorsCount >= 1 && relatedCalculatorsCount <= 12) {
      updateData.relatedCalculatorsCount = relatedCalculatorsCount;
    }

    if (translations?.length) {
      await prisma.pageTranslation.deleteMany({ where: { pageId: id } });
      updateData.translations = {
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
      };
    }

    const page = await prisma.page.update({
      where: { id },
      data: updateData,
      include: { translations: true },
    });

    return NextResponse.json(page);
  } catch (error: unknown) {
    console.error('PATCH /api/admin/pages/[id]:', error);
    let message = 'Failed to update page';
    if (error instanceof Error) {
      message = error.message;
      // Prisma unique constraint (e.g. duplicate category/slug)
      if ('code' in error && (error as { code?: string }).code === 'P2002') {
        message = 'A page with this category and slug already exists.';
      }
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/pages/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.page.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/pages/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}
