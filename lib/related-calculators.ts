import { prisma } from '@/lib/prisma';
import { getAllCalculators } from '@/lib/all-calculators';

export type RelatedCalculator = { title: string; description: string; path: string };

/** Shuffle array (Fisher-Yates) and return new array. */
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Get nested value from object by dot path, e.g. "addition.title" from calculators obj. */
function getNested(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    cur = typeof cur === 'object' && cur !== null && p in (cur as object)
      ? (cur as Record<string, unknown>)[p]
      : undefined;
  }
  return typeof cur === 'string' ? cur : '';
}

/** Get all available calculators (static + Prisma pages) as RelatedCalculator for a locale. */
async function getAllAvailableCalculators(locale: string): Promise<RelatedCalculator[]> {
  let messages: Record<string, unknown> = {};
  try {
    messages = (await import(`@/i18n/${locale}.json`)).default ?? {};
  } catch {
    try {
      messages = (await import('@/i18n/en.json')).default ?? {};
    } catch {}
  }
  const calcMessages = (messages.calculators as Record<string, unknown>) ?? {};

  const staticCalcs = getAllCalculators();
  const staticItems: RelatedCalculator[] = staticCalcs.map((c) => {
    const path = c.path.replace(/^\//, '').replace(/^calculators\//, '');
    const title = getNested(calcMessages as Record<string, unknown>, c.titleKey) || c.id;
    const description = getNested(calcMessages as Record<string, unknown>, c.descKey) || '';
    return { title, description, path };
  });

  const pages = await prisma.page.findMany({
    where: { published: true },
    include: { translations: true },
  });

  const prismaItems: RelatedCalculator[] = pages.map((p) => {
    const t = p.translations.find((x) => x.locale === locale) ?? p.translations.find((x) => x.locale === 'en') ?? p.translations[0];
    return {
      title: t?.title ?? p.slug,
      description: t?.description ?? '',
      path: `${p.category}/${p.slug}`,
    };
  });

  const byPath = new Map<string, RelatedCalculator>();
  for (const item of staticItems) {
    byPath.set(item.path, item);
  }
  for (const item of prismaItems) {
    byPath.set(item.path, item);
  }
  return Array.from(byPath.values());
}

/**
 * Get related calculators for display on a page.
 * @param category - current page category
 * @param slug - current page slug
 * @param locale - locale for titles/descriptions
 * @param manualList - manually chosen related calcs from PageTranslation
 * @param mode - manual | random | both
 * @param maxCount - max items to show (default 6)
 */
export async function getRelatedCalculatorsForPage(
  category: string,
  slug: string,
  locale: string,
  manualList: RelatedCalculator[],
  mode: 'manual' | 'random' | 'both',
  maxCount = 6
): Promise<RelatedCalculator[]> {
  const currentPath = `${category}/${slug}`;

  if (mode === 'manual') {
    return manualList.filter((r) => r.path && r.title).slice(0, maxCount);
  }

  const all = await getAllAvailableCalculators(locale);
  const available = all.filter((a) => a.path !== currentPath);

  if (mode === 'random') {
    const shuffled = shuffle(available);
    return shuffled.slice(0, maxCount);
  }

  if (mode === 'both') {
    const manualPaths = new Set(manualList.filter((r) => r.path).map((r) => r.path));
    const manualFiltered = manualList.filter((r) => r.path && r.title).slice(0, maxCount);
    const remaining = available.filter((a) => !manualPaths.has(a.path));
    const shuffled = shuffle(remaining);
    const toAdd = maxCount - manualFiltered.length;
    return [...manualFiltered, ...shuffled.slice(0, Math.max(0, toAdd))];
  }

  return manualList.slice(0, maxCount);
}
