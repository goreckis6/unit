import { NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';
import { BASE_URL } from '@/lib/hreflang';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const currentDate = new Date().toISOString();
  
  const staticRoutes = [
    '',
    '/calculators/math',
    '/calculators/math/addition',
    '/calculators/math/adding-fractions',
    '/calculators/math/adding-subtracting-integers',
    '/calculators/math/subtracting-fractions',
    '/calculators/math/complex-fractions',
    '/calculators/math/equivalent-fractions',
    '/calculators/math/decimal-to-percent',
    '/calculators/math/fraction-to-decimal',
    '/calculators/math/fraction-to-percent',
    '/calculators/math/antilog',
    '/calculators/math/arccos',
    '/calculators/math/cosine',
    '/calculators/math/sine',
    '/calculators/math/arcsin',
    '/calculators/math/arctan',
    '/calculators/math/common-factors',
    '/calculators/math/average',
    '/calculators/math/quadratic-equation',
    '/calculators/math/pythagorean-theorem',
    '/calculators/math/square-root',
    '/calculators/math/roots',
    '/calculators/math/polynomial-remainder',
    '/calculators/math/remainder',
    '/calculators/math/long-division',
    '/calculators/math/ratio',
    '/calculators/math/percentage-increase',
    '/calculators/health',
    '/calculators/health/army-body-fat-calculator',
    '/calculators/others/text-to-binary',
    '/calculators/conversion/days-to-weeks',
    '/calculators/others/ascii-converter',
    '/calculators/others/caesar-cipher',
    '/calculators/others/vigenere-cipher',
    '/calculators/others/minecraft-circle-generator',
    '/calculators/others/mulch-calculator',
    '/calculators/others/pig-latin',
    '/calculators/others/bold-text',
    '/calculators/others/small-caps',
    '/calculators/others/mirror-text',
    '/calculators/others/nato-phonetic',
    '/calculators/others/numbers-to-letters',
    '/calculators/others/letters-to-numbers',
    '/calculators/others/italic-text',
    '/calculators/others/upside-down-text',
    '/calculators/biology/dna-to-mrna',
    '/calculators/biology/cat-pregnancy-calculator',
    '/calculators/biology/dog-raisin-toxicity',
    '/calculators/biology/dog-size-calculator',
    '/calculators/biology/c1v1-calculator',
    '/calculators/electric',
    '/calculators/biology',
    '/calculators/conversion',
    '/calculators/conversion/kelvin-to-celsius',
    '/calculators/conversion/uppercase-to-lowercase',
    '/calculators/conversion/lowercase-to-uppercase',
    '/calculators/conversion/leet-speak-translator',
    '/calculators/physics',
    '/calculators/real-life',
    '/calculators/real-life/age-in-days',
    '/calculators/real-life/reverse-text-generator',
    '/calculators/finance',
    '/calculators/finance/real-house-price',
    '/calculators/others',
    '/calculators/electric/watts-to-kva',
    '/calculators/electric/watts-to-va',
    '/calculators/electric/amp-to-kw',
    '/calculators/electric/kw-to-amps',
    '/calculators/electric/kw-to-volts',
    '/calculators/electric/kw-to-kwh',
    '/calculators/electric/kwh-to-kw',
    '/calculators/electric/kw-to-va',
    '/calculators/electric/kw-to-kva',
    '/calculators/electric/kwh-to-watts',
    '/calculators/electric/mah-to-wh',
    '/calculators/electric/wh-to-mah',
    '/calculators/electric/va-to-amps',
    '/calculators/electric/va-to-watts',
    '/calculators/electric/va-to-kw',
    '/calculators/electric/va-to-kva',
    '/calculators/electric/amp-to-kva',
    '/calculators/electric/amps-to-va',
    '/calculators/electric/amps-to-volt',
    '/calculators/electric/volts-to-amps',
    '/calculators/electric/volts-to-watts',
    '/calculators/electric/volts-to-kw',
    '/calculators/electric/amps-to-watts',
    '/calculators/electric/watts-to-amps',
    '/calculators/electric/electron-volts-to-volts',
    '/calculators/electric/volts-to-electron-volts',
    '/calculators/electric/joules-to-watts',
    '/calculators/electric/watts-to-joules',
    '/calculators/electric/watts-to-kwh',
    '/calculators/electric/watts-to-volts',
    '/calculators/electric/joules-to-volts',
    '/calculators/electric/volts-to-joules',
    '/calculators/electric/kva-to-amps',
    '/calculators/electric/kva-to-watts',
    '/calculators/electric/kva-to-kw',
    '/calculators/electric/kva-to-va',
    '/calculators/math/percentage',
    '/calculators/math/convolution',
  ];

  const urls: string[] = [];

  // DB pages (admin-created, published) - added dynamically, static routes above stay unchanged
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

    // x-default should point to the default (English) version
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
