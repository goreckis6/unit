import { NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';
import { getBlogPosts } from '@/lib/blog';
import { BASE_URL } from '@/lib/hreflang';

export async function GET() {
  const currentDate = new Date().toISOString();
  
  const staticRoutes = [
    '',
    '/calculators/math',
    '/calculators/math/addition',
    '/calculators/math/adding-fractions',
    '/calculators/math/subtracting-fractions',
    '/calculators/math/antilog',
    '/calculators/math/arccos',
    '/calculators/math/cosine',
    '/calculators/math/sine',
    '/calculators/math/arcsin',
    '/calculators/math/arctan',
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
    '/calculators/others/text-to-binary',
    '/calculators/others/ascii-converter',
    '/calculators/others/caesar-cipher',
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
    '/calculators/electric',
    '/calculators/biology',
    '/calculators/conversion',
    '/calculators/conversion/kelvin-to-celsius',
    '/calculators/physics',
    '/calculators/real-life',
    '/calculators/real-life/reverse-text-generator',
    '/calculators/finance',
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
    '/blog',
  ];

  const urls: string[] = [];
  const blogPosts = await getBlogPosts();

  // Generate URLs for all locales
  routing.locales.forEach((locale) => {
    const localePrefix = locale === 'en' ? '' : `/${locale}`;
    
    // Add static routes
    staticRoutes.forEach((route) => {
      const url = `${BASE_URL}${localePrefix}${route}`;
      
      let priority = '0.8';
      let changefreq = 'weekly';
      
      if (route === '') {
        priority = '1.0';
        changefreq = 'daily';
      } else if (route.includes('/calculators/')) {
        priority = '0.9';
        changefreq = 'weekly';
      } else if (route === '/blog') {
        priority = '0.7';
        changefreq = 'daily';
      }

      urls.push(`  <url>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
    });

    // Add blog posts
    blogPosts.forEach((post) => {
      const url = `${BASE_URL}${localePrefix}/blog/${post.slug}`;
      const lastmod = post.date ? new Date(post.date).toISOString() : currentDate;
      urls.push(`  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
