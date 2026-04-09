import { unstable_cache } from 'next/cache';
import { routing } from '@/i18n/routing';
import { BASE_URL } from '@/lib/hreflang';
import { getAllCalculators } from '@/lib/all-calculators';
import { prisma } from '@/lib/prisma';
import { prismaPublicCalculatorWhere } from '@/lib/calculator-page-public';

/** Google recommends ≤50k URLs per file; 10k keeps XML well under size limits */
export const SITEMAP_URLS_PER_CHUNK = 10_000;

/** Upper bound for revalidatePath on chunk routes (10k × 200 = 2M URLs) */
export const SITEMAP_CHUNK_REVALIDATE_CAP = 200;

const categoryIndexes = [
  'calculators/math', 'calculators/electric', 'calculators/biology', 'calculators/conversion',
  'calculators/physics', 'calculators/real-life', 'calculators/finance', 'calculators/others',
  'calculators/health', 'calculators/chemistry', 'calculators/construction', 'calculators/ecology',
  'calculators/food', 'calculators/statistics',
];

async function buildSitemapUrlXmlFragments(): Promise<string[]> {
  const currentDate = new Date().toISOString();

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
  const allRoutes = [...staticRoutes, ...dbRoutes.filter((r) => !staticSet.has(r))];

  const getUrlForLocale = (locale: string, route: string) => {
    const localePrefix = locale === 'en' ? '' : `/${locale}`;
    return `${BASE_URL}${localePrefix}${route}`;
  };

  const getAlternateLinks = (route: string) => {
    const alternates = routing.locales
      .map(
        (locale) =>
          `    <xhtml:link rel="alternate" hreflang="${locale}" href="${getUrlForLocale(locale, route)}" />`
      )
      .join('\n');

    const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${getUrlForLocale('en', route)}" />`;

    return `${alternates}\n${xDefault}`;
  };

  const fragments: string[] = [];

  for (const locale of routing.locales) {
    for (const route of allRoutes) {
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
  }

  return fragments;
}

export const getSitemapUrlXmlFragments = unstable_cache(buildSitemapUrlXmlFragments, ['sitemap-xml-fragments-v1'], {
  revalidate: 3600,
  tags: ['sitemap'],
});

export async function getSitemapChunkCount(): Promise<number> {
  const fragments = await getSitemapUrlXmlFragments();
  const n = fragments.length;
  if (n === 0) return 1;
  return Math.ceil(n / SITEMAP_URLS_PER_CHUNK);
}
