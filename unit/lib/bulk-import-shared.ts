import type { PrismaClient } from '../generated/prisma/client';
import { getAllCalculators } from './all-calculators';

/** Canonical slug for bulk import + duplicate detection (trim, lower, safe URL segment). */
export function normalizeBulkImportSlug(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  let s = raw.trim().toLowerCase();
  if (!s) return '';
  s = s.replace(/\s+/g, '-');
  s = s.replace(/[:_]+/g, '-');
  s = s.replace(/[^a-z0-9-]+/g, '-');
  s = s.replace(/-+/g, '-');
  s = s.replace(/^-+|-+$/g, '');
  return s;
}

export function normalizeBulkImportCategory(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.trim().toLowerCase();
}

export type BulkImportRowStatus =
  | 'import'
  | 'skipped_exists'
  | 'skipped_duplicate_in_file'
  | 'skipped_static_calculator'
  | 'error';

let staticCalculatorRouteKeysCache: Set<string> | null = null;

/** category\0normalizedSlug for each file-based calculator route in the repo (getAllCalculators). Cached per process. */
export function buildStaticCalculatorRouteKeys(): Set<string> {
  if (staticCalculatorRouteKeysCache) return staticCalculatorRouteKeysCache;
  const keys = new Set<string>();
  for (const c of getAllCalculators()) {
    const path = (c.path ?? '').replace(/^\/+/, '');
    const segments = path.split('/').filter(Boolean);
    if (segments.length < 3 || segments[0] !== 'calculators') continue;
    const pathCategory = normalizeBulkImportCategory(segments[1]);
    const slugPart = segments.slice(2).join('/');
    const slugNorm = normalizeBulkImportSlug(slugPart);
    if (!pathCategory || !slugNorm) continue;
    keys.add(`${pathCategory}\0${slugNorm}`);
  }
  staticCalculatorRouteKeysCache = keys;
  return keys;
}

export type BulkImportAnalyzedRow = {
  category: string;
  slugInput: string;
  slugNormalized: string;
  title: string;
  displayTitle: string;
  description: string | null;
  status: BulkImportRowStatus;
  message?: string;
};

function parseItem(item: unknown): {
  category: string;
  slugInput: string;
  slugNormalized: string;
  title: string;
  displayTitle: string;
  description: string | null;
} | null {
  if (!item || typeof item !== 'object') return null;
  const o = item as Record<string, unknown>;
  const category = normalizeBulkImportCategory(o.category);
  const slugRaw = typeof o.slug === 'string' ? o.slug : '';
  const slugNormalized = normalizeBulkImportSlug(slugRaw);
  const title =
    typeof o.title === 'string'
      ? o.title.trim()
      : typeof o.seoTitle === 'string'
        ? o.seoTitle.trim()
        : slugNormalized;
  const displayTitle =
    (typeof o.displayTitle === 'string' ? o.displayTitle.trim() : null) ||
    (typeof o.h1 === 'string' ? o.h1.trim() : null) ||
    title;
  const description =
    (typeof o.description === 'string' ? o.description.trim() : null) ||
    (typeof o.metaDescription === 'string' ? o.metaDescription.trim() : null);
  return { category, slugInput: slugRaw.trim(), slugNormalized, title, displayTitle, description };
}

/**
 * Resolves each JSON row: invalid, duplicate within file, built-in static calculator route,
 * or already in DB (by normalized slug per category). Does not write to the database.
 */
export async function analyzeBulkImportItems(
  prisma: PrismaClient,
  items: unknown[]
): Promise<BulkImportAnalyzedRow[]> {
  const seenInFile = new Set<string>();
  const staticRouteKeys = buildStaticCalculatorRouteKeys();
  const dbNormByCategory = new Map<string, Set<string>>();

  async function dbNormalizedSlugsForCategory(category: string): Promise<Set<string>> {
    let set = dbNormByCategory.get(category);
    if (!set) {
      const rows = await prisma.page.findMany({
        where: { category },
        select: { slug: true },
      });
      set = new Set(rows.map((r) => normalizeBulkImportSlug(r.slug)));
      dbNormByCategory.set(category, set);
    }
    return set;
  }

  const rows: BulkImportAnalyzedRow[] = [];

  for (const item of items) {
    const parsed = parseItem(item);
    if (!parsed) {
      rows.push({
        category: '',
        slugInput: '',
        slugNormalized: '',
        title: '',
        displayTitle: '',
        description: null,
        status: 'error',
        message: 'Invalid item (not an object)',
      });
      continue;
    }

    const { category, slugInput, slugNormalized, title, displayTitle, description } = parsed;

    if (!slugNormalized) {
      rows.push({
        category,
        slugInput: slugInput || '?',
        slugNormalized: '',
        title,
        displayTitle,
        description,
        status: 'error',
        message: 'Slug is empty or invalid after normalization',
      });
      continue;
    }

    if (!category) {
      rows.push({
        category: '',
        slugInput,
        slugNormalized,
        title,
        displayTitle,
        description,
        status: 'error',
        message: 'Category is required',
      });
      continue;
    }

    const fileKey = `${category}\0${slugNormalized}`;
    if (seenInFile.has(fileKey)) {
      rows.push({
        category,
        slugInput,
        slugNormalized,
        title,
        displayTitle,
        description,
        status: 'skipped_duplicate_in_file',
        message: `Duplicate in JSON: same category+slug as earlier row (normalized "${slugNormalized}")`,
      });
      continue;
    }
    seenInFile.add(fileKey);

    if (staticRouteKeys.has(fileKey)) {
      rows.push({
        category,
        slugInput,
        slugNormalized,
        title,
        displayTitle,
        description,
        status: 'skipped_static_calculator',
        message: `Built-in static route already exists: /calculators/${category}/${slugNormalized} (repo)`,
      });
      continue;
    }

    const dbSet = await dbNormalizedSlugsForCategory(category);
    if (dbSet.has(slugNormalized)) {
      rows.push({
        category,
        slugInput,
        slugNormalized,
        title,
        displayTitle,
        description,
        status: 'skipped_exists',
        message: `Already exists (category "${category}", slug "${slugNormalized}")`,
      });
      continue;
    }

    rows.push({
      category,
      slugInput,
      slugNormalized,
      title,
      displayTitle,
      description,
      status: 'import',
    });
  }

  return rows;
}
