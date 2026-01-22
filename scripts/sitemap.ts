import { writeFile } from 'fs/promises';
import { join } from 'path';
import { getBlogPosts } from '../lib/blog';
import { routing } from '../i18n/routing';

async function generateSitemap() {
  const baseUrl = 'https://unitconverterhub.com';
  const posts = await getBlogPosts();
  
  const urls: string[] = [];

  // Home pages for all locales
  routing.locales.forEach((locale) => {
    urls.push(`${baseUrl}/${locale}`);
    urls.push(`${baseUrl}/${locale}/calculators/math`);
    urls.push(`${baseUrl}/${locale}/calculators/math/addition`);
    urls.push(`${baseUrl}/${locale}/blog`);
    
    // Blog posts
    posts.forEach((post) => {
      urls.push(`${baseUrl}/${locale}/blog/${post.slug}`);
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  const outputPath = join(process.cwd(), 'public', 'sitemap.xml');
  await writeFile(outputPath, sitemap, 'utf-8');
  
  console.log(`✅ Sitemap generated: ${outputPath}`);
  console.log(`   Total URLs: ${urls.length}`);
}

generateSitemap().catch(console.error);
