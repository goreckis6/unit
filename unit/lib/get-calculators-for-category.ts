import { prisma } from '@/lib/prisma';
import type { Calculator } from '@/lib/calculators/types';

export interface CalculatorListItem {
  id: string;
  title: string;
  description: string;
  path: string;
  /** Present for CMS pages; used for Edit link in admin */
  pageId?: string;
}

function getNested(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const p of parts) {
    current = current && typeof current === 'object' && p in current ? (current as Record<string, unknown>)[p] : undefined;
  }
  return typeof current === 'string' ? current : '';
}

/**
 * Get calculators for a category: static list + published Prisma pages.
 * Resolves titles/descriptions for the given locale.
 */
export async function getCalculatorsForCategory(
  category: string,
  locale: string,
  staticCalculators: Calculator[]
): Promise<CalculatorListItem[]> {
  let messages: Record<string, unknown> = {};
  try {
    messages = (await import(`@/i18n/${locale}.json`)).default ?? {};
  } catch {
    try {
      messages = (await import('@/i18n/en.json')).default ?? {};
    } catch {}
  }
  const calcMessages = ((messages.calculators as Record<string, unknown>) ?? {}) as Record<string, unknown>;

  const staticItems: CalculatorListItem[] = staticCalculators.map((c) => ({
    id: c.id,
    title: getNested(calcMessages, c.titleKey) || c.id,
    description: getNested(calcMessages, c.descKey) || '',
    path: c.path.startsWith('/') ? c.path : `/${c.path}`,
  }));

  const pages = await prisma.page.findMany({
    where: { category, published: true },
    include: { translations: true },
  });

  const prismaItems: CalculatorListItem[] = pages.map((p) => {
    const t = p.translations.find((x) => x.locale === locale) ?? p.translations.find((x) => x.locale === 'en') ?? p.translations[0];
    return {
      id: p.slug,
      title: (t?.title ?? p.slug).trim() || p.slug,
      description: (t?.description ?? '').trim() || '',
      path: `/calculators/${p.category}/${p.slug}`,
      pageId: p.id,
    };
  });

  const byPath = new Map<string, CalculatorListItem>();
  for (const item of staticItems) {
    byPath.set(item.path, item);
  }
  for (const item of prismaItems) {
    byPath.set(item.path, item);
  }

  function safeLocaleCompare(a: string, b: string): number {
    const sa = String(a ?? '');
    const sb = String(b ?? '');
    try {
      return sa.localeCompare(sb, locale);
    } catch {
      try {
        return sa.localeCompare(sb, 'en');
      } catch {
        return sa < sb ? -1 : sa > sb ? 1 : 0;
      }
    }
  }
  return [...byPath.values()].sort((a, b) => safeLocaleCompare(a.title, b.title));
}
