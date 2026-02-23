import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/pages - List all pages
export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      include: { translations: true },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(pages);
  } catch (error) {
    console.error('GET /api/admin/pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
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
        relatedCalculatorsMode: ['manual', 'random', 'both'].includes(relatedCalculatorsMode) ? relatedCalculatorsMode : 'manual',
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

    return NextResponse.json(page);
  } catch (error) {
    console.error('POST /api/admin/pages:', error);
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
  }
}
