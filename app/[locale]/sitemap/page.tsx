import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { routing } from '@/i18n/routing';
import { getBlogPosts } from '@/lib/blog';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  pl: 'Polski',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  nl: 'Nederlands',
  pt: 'Português',
  cs: 'Čeština',
  sk: 'Slovenčina',
  hu: 'Magyar',
  sv: 'Svenska',
  no: 'Norsk',
  da: 'Dansk',
  fi: 'Suomi',
  ro: 'Română',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  
  return {
    title: `Sitemap - ${t('siteName')}`,
    description: `Complete sitemap of ${t('siteName')} - Browse all pages, calculators, and blog posts`,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function SitemapPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const baseUrl = 'https://unitconverterhub.com';
  const blogPosts = await getBlogPosts();

  const staticRoutes = [
    { path: '', name: t('home'), category: 'main' },
    { path: '/calculators/math', name: 'Math Calculators', category: 'calculators' },
    { path: '/calculators/math/addition', name: 'Addition Calculator', category: 'calculators' },
    { path: '/calculators/electric', name: 'Electric Calculators', category: 'calculators' },
    { path: '/calculators/electric/watts-to-kva', name: 'Watts to kVA Calculator', category: 'calculators' },
    { path: '/blog', name: t('blog'), category: 'blog' },
  ];

  return (
    <>
      <Header />
      <div className="sitemap-page">
        <div className="container">
          <div className="sitemap-header">
            <h1 className="sitemap-title">Sitemap</h1>
            <p className="sitemap-description">
              Browse all pages and content available on {t('siteName')}
            </p>
            <div className="sitemap-xml-link">
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="xml-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                View XML Sitemap
              </a>
            </div>
          </div>

          <div className="sitemap-content">
            {/* Main Pages */}
            <section className="sitemap-section">
              <h2 className="sitemap-section-title">Main Pages</h2>
              <div className="sitemap-links-grid">
                {staticRoutes
                  .filter((route) => route.category === 'main')
                  .map((route) => (
                    <div key={route.path} className="sitemap-link-group">
                      <Link href={route.path} className="sitemap-link-main">
                        {route.name}
                      </Link>
                      <div className="sitemap-languages">
                        {routing.locales.map((loc) => {
                          const locPrefix = loc === 'en' ? '' : `/${loc}`;
                          const url = `${baseUrl}${locPrefix}${route.path}`;
                          return (
                            <a
                              key={loc}
                              href={url}
                              className={`sitemap-lang-link ${locale === loc ? 'active' : ''}`}
                              title={LANGUAGE_NAMES[loc] || loc}
                            >
                              {loc.toUpperCase()}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            {/* Calculators */}
            <section className="sitemap-section">
              <h2 className="sitemap-section-title">Calculators</h2>
              <div className="sitemap-links-grid">
                {staticRoutes
                  .filter((route) => route.category === 'calculators')
                  .map((route) => (
                    <div key={route.path} className="sitemap-link-group">
                      <Link href={route.path} className="sitemap-link">
                        {route.name}
                      </Link>
                      <div className="sitemap-languages">
                        {routing.locales.map((loc) => {
                          const locPrefix = loc === 'en' ? '' : `/${loc}`;
                          const url = `${baseUrl}${locPrefix}${route.path}`;
                          return (
                            <a
                              key={loc}
                              href={url}
                              className={`sitemap-lang-link ${locale === loc ? 'active' : ''}`}
                              title={LANGUAGE_NAMES[loc] || loc}
                            >
                              {loc.toUpperCase()}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            {/* Blog */}
            <section className="sitemap-section">
              <h2 className="sitemap-section-title">Blog</h2>
              <div className="sitemap-links-grid">
                <div className="sitemap-link-group">
                  <Link href="/blog" className="sitemap-link">
                    {t('blog')}
                  </Link>
                  <div className="sitemap-languages">
                    {routing.locales.map((loc) => {
                      const locPrefix = loc === 'en' ? '' : `/${loc}`;
                      const url = `${baseUrl}${locPrefix}/blog`;
                      return (
                        <a
                          key={loc}
                          href={url}
                          className={`sitemap-lang-link ${locale === loc ? 'active' : ''}`}
                          title={LANGUAGE_NAMES[loc] || loc}
                        >
                          {loc.toUpperCase()}
                        </a>
                      );
                    })}
                  </div>
                </div>
                {blogPosts.length > 0 && (
                  <div className="sitemap-blog-posts">
                    <h3 className="sitemap-subsection-title">Blog Posts</h3>
                    <div className="sitemap-blog-list">
                      {blogPosts.map((post) => (
                        <div key={post.slug} className="sitemap-link-group">
                          <Link href={`/blog/${post.slug}`} className="sitemap-link">
                            {post.title}
                          </Link>
                          <div className="sitemap-languages">
                            {routing.locales.map((loc) => {
                              const locPrefix = loc === 'en' ? '' : `/${loc}`;
                              const url = `${baseUrl}${locPrefix}/blog/${post.slug}`;
                              return (
                                <a
                                  key={loc}
                                  href={url}
                                  className={`sitemap-lang-link ${locale === loc ? 'active' : ''}`}
                                  title={LANGUAGE_NAMES[loc] || loc}
                                >
                                  {loc.toUpperCase()}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
