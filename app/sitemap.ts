import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getBlogPosts } from '@/lib/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://unitconverterhub.com';
  const currentDate = new Date();
  
  // Define all static routes
  const staticRoutes = [
    '',
    '/calculators/math',
    '/calculators/math/addition',
    '/calculators/electric',
    '/calculators/electric/watts-to-kva',
    '/blog',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Get blog posts
  const blogPosts = await getBlogPosts();

  // Generate entries for all locales
  routing.locales.forEach((locale) => {
    const localePrefix = locale === 'en' ? '' : `/${locale}`;
    
    // Add static routes
    staticRoutes.forEach((route) => {
      const url = `${baseUrl}${localePrefix}${route}`;
      
      // Determine priority and changefreq based on route
      let priority = 0.8;
      let changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'weekly';
      
      if (route === '') {
        priority = 1.0;
        changefreq = 'daily';
      } else if (route.includes('/calculators/')) {
        priority = 0.9;
        changefreq = 'weekly';
      } else if (route === '/blog') {
        priority = 0.7;
        changefreq = 'daily';
      }

      sitemapEntries.push({
        url,
        lastModified: currentDate,
        changeFrequency: changefreq,
        priority,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((loc) => {
              const locPrefix = loc === 'en' ? '' : `/${loc}`;
              return [loc, `${baseUrl}${locPrefix}${route}`];
            })
          ),
        },
      });
    });

    // Add blog posts
    blogPosts.forEach((post) => {
      const url = `${baseUrl}${localePrefix}/blog/${post.slug}`;
      sitemapEntries.push({
        url,
        lastModified: post.date ? new Date(post.date) : currentDate,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((loc) => {
              const locPrefix = loc === 'en' ? '' : `/${loc}`;
              return [loc, `${baseUrl}${locPrefix}/blog/${post.slug}`];
            })
          ),
        },
      });
    });
  });

  return sitemapEntries;
}
