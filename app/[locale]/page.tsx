import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SoftwareApplicationSchema } from '@/components/SoftwareApplicationSchema';
import { GlobalSearch } from '@/components/GlobalSearch';
import { generateHreflangUrls, BASE_URL } from '@/lib/hreflang';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const tHome = await getTranslations({ locale, namespace: 'common.homePage' });
  const path = '';
  const canonicalUrl = locale === 'en' ? `${BASE_URL}${path}` : `${BASE_URL}/${locale}${path}`;

  return {
    title: tHome('seoTitle'),
    description: tHome('seoDescription'),
    alternates: {
      canonical: canonicalUrl,
      languages: generateHreflangUrls(path),
    },
    openGraph: {
      title: tHome('seoTitle'),
      description: tHome('seoDescription'),
      type: 'website',
      url: canonicalUrl,
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const tHome = await getTranslations({ locale, namespace: 'common.homePage' });
  const siteUrl = BASE_URL;

  return (
    <div className="home">
      <SoftwareApplicationSchema
        locale={locale}
        siteName={t('siteName')}
        description={t('homePage.seoDescription')}
        url={siteUrl}
      />
      <Header />

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">{t('siteName')}</h1>
            <p className="hero-subtitle">{t('description')}</p>
            <p className="hero-description">
              {tHome('heroDescription')}
            </p>
            <div className="hero-search">
              <GlobalSearch />
            </div>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">{t('calculators')}</h2>
          <p className="section-subtitle">
            {tHome('calculatorsSubtitle')}
          </p>
          <div className="categories-grid">
            <Link href="/calculators/math" className="category-card">
              <div className="category-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="category-name">{tHome('mathCalculators.title')}</h3>
              <p className="category-description">
                {tHome('mathCalculators.description')}
              </p>
              <span className="category-link">{tHome('mathCalculators.viewAll')}</span>
            </Link>
            
            <Link href="/calculators/electric" className="category-card">
              <div className="category-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="category-name">{tHome('electricCalculators.title')}</h3>
              <p className="category-description">
                {tHome('electricCalculators.description')}
              </p>
              <span className="category-link">{tHome('electricCalculators.viewAll')}</span>
            </Link>
            
            <Link href="/calculators/others" className="category-card">
              <div className="category-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="category-name">{tHome('otherCalculators.title')}</h3>
              <p className="category-description">
                {tHome('otherCalculators.description')}
              </p>
              <span className="category-link">{tHome('otherCalculators.viewAll')}</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">{t('features')}</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="feature-title">{tHome('features.fast.title')}</h3>
              <p className="feature-description">{tHome('features.fast.description')}</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="feature-title">{tHome('features.free.title')}</h3>
              <p className="feature-description">{tHome('features.free.description')}</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="feature-title">{tHome('features.easy.title')}</h3>
              <p className="feature-description">{tHome('features.easy.description')}</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
