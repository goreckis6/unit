import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAllCalculators } from '@/lib/all-calculators';
import { resolveCalculatorPath } from '@/lib/gsc-redirects';

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

/** Internal: fetch from DB + merge. Cached to avoid repeated heavy queries. */
async function fetchSearchableCalculatorsInner(locale: string): Promise<SearchableCalculator[]> {
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
      select: {
        slug: true,
        category: true,
        translations: { select: { locale: true, title: true, description: true } },
      },
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

  // Deduplicate by canonical calculator URL (same as Link href). CMS pages may use
  // alternate slugs (e.g. percent-error-calculator) that redirect to the static route;
  // raw paths differ so Map by path would show duplicate titles in search.
  const byCanonicalPath = new Map<string, SearchableCalculator>();
  for (const item of staticItems) {
    const canon = resolveCalculatorPath(item.path);
    byCanonicalPath.set(canon, { ...item, path: canon });
  }
  for (const item of prismaItems) {
    const canon = resolveCalculatorPath(item.path);
    if (!byCanonicalPath.has(canon)) {
      byCanonicalPath.set(canon, { ...item, path: canon });
    }
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
  return [...byCanonicalPath.values()].sort((a, b) => safeLocaleCompare(a.title, b.title));
}

/**
 * Get all calculators for global search: static + published Prisma pages.
 * Cached 5 min per locale to reduce DB load.
 */
export async function getSearchableCalculators(locale: string): Promise<SearchableCalculator[]> {
  return unstable_cache(
    () => fetchSearchableCalculatorsInner(locale),
    ['searchable-calculators', locale],
    { revalidate: 300 }
  )();
}
