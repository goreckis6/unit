import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SoftwareApplicationSchema } from '@/components/SoftwareApplicationSchema';
import { GlobalSearch } from '@/components/GlobalSearch';
import { generateHreflangUrls, BASE_URL } from '@/lib/hreflang';
import { getSearchableCalculators } from '@/lib/get-searchable-calculators';

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
  const calculators = await getSearchableCalculators(locale);

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
            <p className="hero-description">{tHome('heroDescription')}</p>
            <div className="hero-search">
              <GlobalSearch calculators={calculators} />
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

            <Link href="/calculators/biology" className="category-card">
              <div className="category-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="category-name">{tHome('biologyCalculators.title')}</h3>
              <p className="category-description">
                {tHome('biologyCalculators.description')}
              </p>
              <span className="category-link">{tHome('biologyCalculators.viewAll')}</span>
            </Link>

            <Link href="/calculators/conversion" className="category-card">
              <div className="category-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 20L17 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 20L7 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="category-name">{tHome('conversionCalculators.title')}</h3>
              <p className="category-description">
                {tHome('conversionCalculators.description')}
              </p>
              <span className="category-link">{tHome('conversionCalculators.viewAll')}</span>
            </Link>

            <Link href="/calculators/physics" className="category-card">
              <div className="category-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V4M12 20V22M4 12H2M22 12H20M19.07 4.93L17.66 6.34M6.34 17.66L4.93 19.07M19.07 19.07L17.66 17.66M6.34 6.34L4.93 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8V12L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="category-name">{tHome('physicsCalculators.title')}</h3>
              <p className="category-description">
                {tHome('physicsCalculators.description')}
              </p>
              <span className="category-link">{tHome('physicsCalculators.viewAll')}</span>
            </Link>

            <Link href="/calculators/real-life" className="category-card">
              <div className="category-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9L12 2L21 9V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="category-name">{tHome('realLifeCalculators.title')}</h3>
              <p className="category-description">
                {tHome('realLifeCalculators.description')}
              </p>
              <span className="category-link">{tHome('realLifeCalculators.viewAll')}</span>
            </Link>

            <Link href="/calculators/finance" className="category-card">
              <div className="category-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V22M17 5H9.5C8.11929 5 7 6.11929 7 7.5C7 8.88071 8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5C17 13.8807 15.8807 15 14.5 15H7M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="category-name">{tHome('financeCalculators.title')}</h3>
              <p className="category-description">
                {tHome('financeCalculators.description')}
              </p>
              <span className="category-link">{tHome('financeCalculators.viewAll')}</span>
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

            <Link href="/calculators/health" className="category-card">
              <div className="category-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="category-name">{tHome('healthCalculators.title')}</h3>
              <p className="category-description">
                {tHome('healthCalculators.description')}
              </p>
              <span className="category-link">{tHome('healthCalculators.viewAll')}</span>
            </Link>

            <Link href="/calculators/chemistry" className="category-card">
              <div className="category-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3H15M10 3V8.4C10 8.96005 10 9.24008 9.89101 9.45399C9.79513 9.64215 9.64215 9.79513 9.45399 9.89101C9.24008 10 8.96005 10 8.4 10H6.6C6.03995 10 5.75992 10 5.54601 10.109C5.35785 10.2049 5.20487 10.3578 5.10899 10.546C5 10.7599 5 11.0399 5 11.6V19.4C5 19.9601 5 20.2401 5.10899 20.454C5.20487 20.6422 5.35785 20.7951 5.54601 20.891C5.75992 21 6.03995 21 6.6 21H17.4C17.9601 21 18.2401 21 18.454 20.891C18.6422 20.7951 18.7951 20.6422 18.891 20.454C19 20.2401 19 19.9601 19 19.4V11.6C19 11.0399 19 10.7599 18.891 10.546C18.7951 10.3578 18.6422 10.2049 18.454 10.109C18.2401 10 17.9601 10 17.4 10H15.6C15.0399 10 14.7599 10 14.546 9.89101C14.3578 9.79513 14.2049 9.64215 14.109 9.45399C14 9.24008 14 8.96005 14 8.4V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="category-name">{tHome('chemistryCalculators.title')}</h3>
              <p className="category-description">
                {tHome('chemistryCalculators.description')}
              </p>
              <span className="category-link">{tHome('chemistryCalculators.viewAll')}</span>
            </Link>

            <Link href="/calculators/construction" className="category-card">
              <div className="category-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9L12 2L21 9V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 2V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="category-name">{tHome('constructionCalculators.title')}</h3>
              <p className="category-description">
                {tHome('constructionCalculators.description')}
              </p>
              <span className="category-link">{tHome('constructionCalculators.viewAll')}</span>
            </Link>

            <Link href="/calculators/ecology" className="category-card">
              <div className="category-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="category-name">{tHome('ecologyCalculators.title')}</h3>
              <p className="category-description">
                {tHome('ecologyCalculators.description')}
              </p>
              <span className="category-link">{tHome('ecologyCalculators.viewAll')}</span>
            </Link>

            <Link href="/calculators/food" className="category-card">
              <div className="category-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 2L5 6M5 6L7 10L12 8L17 10L19 6M5 6V20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22H17C17.5304 22 18.0391 21.7893 18.4142 21.4142C18.7893 21.0391 19 20.5304 19 20V6M21 2L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 10V16M15 10V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="category-name">{tHome('foodCalculators.title')}</h3>
              <p className="category-description">
                {tHome('foodCalculators.description')}
              </p>
              <span className="category-link">{tHome('foodCalculators.viewAll')}</span>
            </Link>

            <Link href="/calculators/statistics" className="category-card">
              <div className="category-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 16L12 11L16 15L21 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 14V10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="category-name">{tHome('statisticsCalculators.title')}</h3>
              <p className="category-description">
                {tHome('statisticsCalculators.description')}
              </p>
              <span className="category-link">{tHome('statisticsCalculators.viewAll')}</span>
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
