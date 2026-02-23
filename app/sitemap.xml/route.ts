import { NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';
import { BASE_URL } from '@/lib/hreflang';
import { getAllCalculators } from '@/lib/all-calculators';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const currentDate = new Date().toISOString();

  // Static routes: home + category index pages + all calculators from lib (single source of truth)
  const calculators = getAllCalculators();
  const categoryIndexes = [
    'calculators/math', 'calculators/electric', 'calculators/biology', 'calculators/conversion',
    'calculators/physics', 'calculators/real-life', 'calculators/finance', 'calculators/others',
    'calculators/health', 'calculators/chemistry', 'calculators/construction', 'calculators/ecology',
    'calculators/food', 'calculators/statistics',
  ];
  const calcPaths = calculators.map((c) => c.path.replace(/^\//, ''));

  const staticRoutes = [
    '',
    ...categoryIndexes.map((p) => `/${p}`),
    ...calcPaths.map((p) => `/${p}`),
  ];

  const urls: string[] = [];

  // DB pages (admin-created, published) - added dynamically
  let dbRoutes: string[] = [];
  try {
    const pages = await prisma.page.findMany({
      where: { published: true, category: { not: null } },
      select: { slug: true, category: true },
    });
    dbRoutes = pages
      .filter((p) => p.category)
      .map((p) => `/calculators/${p.category}/${p.slug}`);
  } catch {
    // ignore DB errors (e.g. during build)
  }

  const getUrlForLocale = (locale: string, route: string) => {
    const localePrefix = locale === 'en' ? '' : `/${locale}`;
    return `${BASE_URL}${localePrefix}${route}`;
  };

  const getAlternateLinks = (route: string) => {
    const alternates = routing.locales
      .map((locale) => `    <xhtml:link rel="alternate" hreflang="${locale}" href="${getUrlForLocale(locale, route)}" />`)
      .join('\n');

    const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${getUrlForLocale('en', route)}" />`;

    return `${alternates}\n${xDefault}`;
  };

  // Combine static routes with DB pages (avoid duplicates)
  const staticSet = new Set(staticRoutes);
  const allRoutes = [...staticRoutes, ...dbRoutes.filter((r) => !staticSet.has(r))];

  // Generate URLs for all locales
  routing.locales.forEach((locale) => {
    allRoutes.forEach((route) => {
      const url = getUrlForLocale(locale, route);

      let priority = '0.8';
      let changefreq = 'weekly';

      if (route === '') {
        priority = '1.0';
        changefreq = 'daily';
      } else if (route.includes('/calculators/')) {
        priority = '0.9';
        changefreq = 'weekly';
      }

      urls.push(`  <url>
    <loc>${url}</loc>
${getAlternateLinks(route)}
    <lastmod>${currentDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
