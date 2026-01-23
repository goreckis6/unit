import { NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';
import { getBlogPosts } from '@/lib/blog';

export async function GET() {
  const baseUrl = 'https://unitconverterhub.com';
  const currentDate = new Date().toISOString();
  
  const staticRoutes = [
    '',
    '/calculators/math',
    '/calculators/math/addition',
    '/calculators/electric',
    '/calculators/electric/watts-to-kva',
    '/calculators/electric/amp-to-kw',
    '/calculators/electric/amp-to-kva',
    '/calculators/electric/amps-to-va',
    '/calculators/electric/amps-to-volt',
    '/calculators/electric/amps-to-watts',
    '/calculators/electric/electron-volts-to-volts',
    '/calculators/electric/joules-to-watts',
    '/calculators/electric/joules-to-volts',
    '/calculators/electric/kva-to-amps',
    '/calculators/electric/kva-to-watts',
    '/calculators/electric/kva-to-kw',
    '/blog',
  ];

  const urls: string[] = [];
  const blogPosts = await getBlogPosts();

  // Generate URLs for all locales
  routing.locales.forEach((locale) => {
    const localePrefix = locale === 'en' ? '' : `/${locale}`;
    
    // Add static routes
    staticRoutes.forEach((route) => {
      const url = `${baseUrl}${localePrefix}${route}`;
      
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
      const url = `${baseUrl}${localePrefix}/blog/${post.slug}`;
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
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
