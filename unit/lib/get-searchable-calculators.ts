import { prisma } from '@/lib/prisma';
import { getAllCalculators } from '@/lib/all-calculators';

export interface SearchableCalculator {
  id: string;
  title: string;
  description: string;
  path: string;
  categoryLabel: string;
}

function getNested(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const p of parts) {
    current = current && typeof current === 'object' && p in current ? (current as Record<string, unknown>)[p] : undefined;
  }
  return typeof current === 'string' ? current : '';
}

const CATEGORY_BADGE_KEYS: Record<string, string> = {
  math: 'mathCalculators.badge',
  electric: 'electricCalculators.badge',
  biology: 'biologyCalculators.badge',
  conversion: 'conversionCalculators.badge',
  physics: 'physicsCalculators.badge',
  'real-life': 'realLifeCalculators.badge',
  finance: 'financeCalculators.badge',
  others: 'otherCalculators.badge',
  health: 'healthCalculators.badge',
  chemistry: 'chemistryCalculators.badge',
  construction: 'constructionCalculators.badge',
  ecology: 'ecologyCalculators.badge',
  food: 'foodCalculators.badge',
  statistics: 'statisticsCalculators.badge',
};

function getCategoryLabel(category: string, calcMessages: Record<string, unknown>): string {
  const key = CATEGORY_BADGE_KEYS[category];
  if (key) return getNested(calcMessages, key) || category;
  return category;
}

/**
 * Get all calculators for global search: static + published Prisma pages.
 * Returns pre-translated title, description, path, categoryLabel.
 */
export async function getSearchableCalculators(locale: string): Promise<SearchableCalculator[]> {
  let messages: Record<string, unknown> = {};
  try {
    messages = (await import(`@/i18n/${locale}.json`)).default ?? {};
  } catch {
    try {
      messages = (await import('@/i18n/en.json')).default ?? {};
    } catch {}
  }
  const calcMessages = ((messages.calculators as Record<string, unknown>) ?? {}) as Record<string, unknown>;

  const staticCalcs = getAllCalculators();
  const staticItems: SearchableCalculator[] = staticCalcs.map((c) => ({
    id: c.id,
    title: getNested(calcMessages, c.titleKey) || c.id,
    description: getNested(calcMessages, c.descKey) || '',
    path: c.path.startsWith('/') ? c.path : `/${c.path}`,
    categoryLabel: getCategoryLabel(c.category, calcMessages),
  }));

  let prismaItems: SearchableCalculator[] = [];
  try {
    const pages = await prisma.page.findMany({
      where: { published: true },
      include: { translations: true },
    });
    prismaItems = pages.map((p) => {
      const t = p.translations.find((x) => x.locale === locale) ?? p.translations.find((x) => x.locale === 'en') ?? p.translations[0];
      const cat = (p.category ?? '').trim();
      return {
        id: p.slug,
        title: (t?.title ?? p.slug).trim() || p.slug,
        description: (t?.description ?? '').trim() || '',
        path: `/calculators/${cat || 'others'}/${p.slug}`,
        categoryLabel: getCategoryLabel(cat, calcMessages),
      };
    });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getSearchableCalculators] Failed to fetch Prisma pages:', err);
    }
  }

  const byPath = new Map<string, SearchableCalculator>();
  for (const item of staticItems) byPath.set(item.path, item);
  for (const item of prismaItems) byPath.set(item.path, item);

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
