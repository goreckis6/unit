import { unstable_cache } from 'next/cache';
import { routing } from '@/i18n/routing';
import { BASE_URL } from '@/lib/hreflang';
import { getAllCalculators } from '@/lib/all-calculators';
import { prisma } from '@/lib/prisma';
import { prismaPublicCalculatorWhere } from '@/lib/calculator-page-public';

/**
 * URLs per sitemap file (flat index = one locale × one route).
 * Keep moderate: each <url> includes many xhtml:link lines → one chunk must stay
 * well under Next.js data cache 2MB limit per cached entry (see getSitemapChunkFullXml).
 * Google allows up to 50k URLs per file.
 */
export const SITEMAP_URLS_PER_CHUNK = 280;

/** revalidatePath upper bound for /sitemapN.xml — raise if chunk count can exceed this */
export const SITEMAP_CHUNK_REVALIDATE_CAP = 2_000;

const categoryIndexes = [
  'calculators/math', 'calculators/electric', 'calculators/biology', 'calculators/conversion',
  'calculators/physics', 'calculators/real-life', 'calculators/finance', 'calculators/others',
  'calculators/health', 'calculators/chemistry', 'calculators/construction', 'calculators/ecology',
  'calculators/food', 'calculators/statistics',
];

async function buildAllRoutes(): Promise<string[]> {
  const calculators = getAllCalculators();
  const calcPaths = calculators.map((c) => c.path.replace(/^\//, ''));

  const staticRoutes = [
    '',
    ...categoryIndexes.map((p) => `/${p}`),
    ...calcPaths.map((p) => `/${p}`),
  ];

  let dbRoutes: string[] = [];
  try {
    const pages = await prisma.page.findMany({
      where: prismaPublicCalculatorWhere(),
      select: { slug: true, category: true },
    });
    dbRoutes = pages
      .filter((p) => p.category?.trim())
      .map((p) => `/calculators/${p.category!.trim()}/${p.slug}`);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[sitemap] Failed to fetch DB pages:', err);
    }
  }

  const staticSet = new Set(staticRoutes);
  return [...staticRoutes, ...dbRoutes.filter((r) => !staticSet.has(r))];
}

/** Compact route list only — small enough for unstable_cache (unlike full XML per all locales). */
const getAllRoutesCached = unstable_cache(buildAllRoutes, ['sitemap-all-routes-v4'], {
  revalidate: 3600,
  tags: ['sitemap'],
});

function getUrlForLocale(locale: string, route: string): string {
  const localePrefix = locale === 'en' ? '' : `/${locale}`;
  return `${BASE_URL}${localePrefix}${route}`;
}

function getAlternateLinks(route: string): string {
  const alternates = routing.locales
    .map(
      (locale) =>
        `    <xhtml:link rel="alternate" hreflang="${locale}" href="${getUrlForLocale(locale, route)}" />`
    )
    .join('\n');

  const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${getUrlForLocale('en', route)}" />`;

  return `${alternates}\n${xDefault}`;
}

async function buildSitemapChunkFullXmlUncached(chunkIndex0Based: number): Promise<string> {
  const allRoutes = await getAllRoutesCached();
  const locales = routing.locales;
  const perChunk = SITEMAP_URLS_PER_CHUNK;
  const total = locales.length * allRoutes.length;
  const start = chunkIndex0Based * perChunk;
  if (start >= total || allRoutes.length === 0) {
    return '';
  }
  const end = Math.min(start + perChunk, total);
  const currentDate = new Date().toISOString();
  const fragments: string[] = [];

  for (let flat = start; flat < end; flat++) {
    const localeIndex = Math.floor(flat / allRoutes.length);
    const routeIndex = flat % allRoutes.length;
    const locale = locales[localeIndex]!;
    const route = allRoutes[routeIndex]!;

    const url = getUrlForLocale(locale, route);

    let priority = '0.8';
    let changefreq = 'weekly';

    if (route === '') {
      priority = '1.0';
      changefreq = 'daily';
    } else if ((route ?? '').includes('/calculators/')) {
      priority = '0.9';
      changefreq = 'weekly';
    }

    fragments.push(`  <url>
    <loc>${url}</loc>
${getAlternateLinks(route)}
    <lastmod>${currentDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${fragments.join('\n')}
</urlset>`;
}

const sitemapChunkCacheFns = new Map<number, () => Promise<string>>();

function getSitemapChunkCacheFn(chunkIndex0Based: number): () => Promise<string> {
  let fn = sitemapChunkCacheFns.get(chunkIndex0Based);
  if (!fn) {
    fn = unstable_cache(
      async () => buildSitemapChunkFullXmlUncached(chunkIndex0Based),
      ['sitemap-chunk-xml-v4', String(chunkIndex0Based), String(SITEMAP_URLS_PER_CHUNK)],
      { revalidate: 3600, tags: ['sitemap'] }
    );
    sitemapChunkCacheFns.set(chunkIndex0Based, fn);
  }
  return fn;
}

/**
 * One sitemap file body — cached per chunk so no single entry exceeds Next.js ~2MB data cache limit.
 */
export async function getSitemapChunkFullXml(chunkIndex0Based: number): Promise<string> {
  return getSitemapChunkCacheFn(chunkIndex0Based)();
}

export async function getSitemapChunkCount(): Promise<number> {
  const routes = await getAllRoutesCached();
  const n = routing.locales.length * routes.length;
  if (n === 0) return 1;
  return Math.ceil(n / SITEMAP_URLS_PER_CHUNK);
}
