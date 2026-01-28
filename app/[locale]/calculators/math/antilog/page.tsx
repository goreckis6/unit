import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AntilogCalculator } from './calculator';
import { FaqSchema } from '@/components/FaqSchema';
import { FaqSection } from '@/components/FaqSection';
import { routing } from '@/i18n/routing';

function generateHreflangUrls(path: string) {
  const baseUrl = 'https://unitconverterhub.com';
  const languages: Record<string, string> = {};
  
  routing.locales.forEach((loc) => {
    const url = loc === 'en' 
      ? `${baseUrl}${path}` 
      : `${baseUrl}/${loc}${path}`;
    languages[loc] = url;
  });
  
  return languages;
}

interface FaqItem {
  question: string;
  answer: string;
}

async function getFaqItems(locale: string): Promise<FaqItem[]> {
  try {
    const messages = await import(`@/i18n/${locale}.json`);
    return (messages.default?.calculators?.antilog?.seo?.faq?.items as FaqItem[]) || [];
  } catch {
    // Fallback to English if locale file doesn't exist
    const messages = await import('@/i18n/en.json');
    return (messages.default?.calculators?.antilog?.seo?.faq?.items as FaqItem[]) || [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'calculators.antilog.seo' });
  const baseUrl = 'https://unitconverterhub.com';
  const path = locale === 'en' ? '/calculators/math/antilog' : `/${locale}/calculators/math/antilog`;
  const canonicalUrl = `${baseUrl}${path}`;
  const hreflangUrls = generateHreflangUrls('/calculators/math/antilog');
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    alternates: {
      canonical: canonicalUrl,
      languages: hreflangUrls,
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      url: canonicalUrl,
    },
  };
}

export default async function AntilogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'calculators.antilog' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  
  // Get FAQ items from translations - direct import from JSON
  const faqItems = await getFaqItems(locale);
  
  // Get SEO content translations
  const tSeo = await getTranslations({ locale, namespace: 'calculators.antilog.seo.content' });
  const tFaq = await getTranslations({ locale, namespace: 'calculators.antilog.seo.faq' });
  const tRelated = await getTranslations({ locale, namespace: 'calculators.antilog.seo.related' });

  return (
    <>
      <FaqSchema items={faqItems} />
      <Header />

      <div className="calculator-header">
        <div className="container">
          <Link href="/calculators/math" className="back-button">
            <svg className="back-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{tCommon('calculators')}</span>
          </Link>
          <div className="header-content">
            <div className="title-badge">Math Calculator</div>
            <h1 className="page-title">{t('title')}</h1>
            <p className="page-description">{t('description')}</p>
          </div>
        </div>
      </div>

      <div className="calculator-container">
        <div className="container">
          <div className="calculator-card">
            <AntilogCalculator />
          </div>
        </div>
      </div>

      {/* SEO Content Section */}
      <div className="seo-content-section">
        <div className="container">
          <div className="seo-content-card">
            <h2 className="seo-heading">{tSeo('heading')}</h2>
            
            <div className="seo-paragraphs">
              <p className="seo-paragraph">
                {tSeo('paragraph1')}
              </p>
              
              <p className="seo-paragraph">
                {tSeo('paragraph2')}
              </p>
              
              <p className="seo-paragraph">
                {tSeo('paragraph3')}
              </p>
              
              <p className="seo-paragraph">
                {tSeo('paragraph4')}
              </p>
              
              <div className="seo-example">
                <h3 className="example-heading">{tSeo('exampleHeading')}</h3>
                <p className="example-text">
                  {tSeo('exampleText')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Calculators Section */}
      <div className="related-calculators-section">
        <div className="related-content-card">
          <h2 className="related-heading">{tRelated('heading')}</h2>
          <div className="related-grid">
            <Link href="/calculators/math/addition" className="related-card">
              <h3 className="related-title">{tRelated('addition')}</h3>
              <p className="related-desc">{tRelated('additionDesc')}</p>
            </Link>
            <Link href="/calculators/math/percentage" className="related-card">
              <h3 className="related-title">{tRelated('percentage')}</h3>
              <p className="related-desc">{tRelated('percentageDesc')}</p>
            </Link>
            <Link href="/calculators/math/adding-fractions" className="related-card">
              <h3 className="related-title">{tRelated('addingFractions')}</h3>
              <p className="related-desc">{tRelated('addingFractionsDesc')}</p>
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      {faqItems.length > 0 && (
        <FaqSection heading={tFaq('heading')} items={faqItems} />
      )}

      <Footer />
    </>
  );
}
