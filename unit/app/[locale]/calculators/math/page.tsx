import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FaqSchema } from '@/components/FaqSchema';
import { FaqSection } from '@/components/FaqSection';
import { CalculatorList } from './list';
import { generateHreflangUrls, BASE_URL } from '@/lib/hreflang';
import { mathCalculators } from '@/lib/calculators/math';
import { getCalculatorsForCategory } from '@/lib/get-calculators-for-category';

interface FaqItem {
  question: string;
  answer: string;
}

async function getFaqItems(locale: string): Promise<FaqItem[]> {
  try {
    const messages = await import(`@/i18n/${locale}.json`);
    return (messages.default?.calculators?.mathCalculators?.faq?.items as FaqItem[]) || [];
  } catch {
    const messages = await import('@/i18n/en.json');
    return (messages.default?.calculators?.mathCalculators?.faq?.items as FaqItem[]) || [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const tSeo = await getTranslations({ locale, namespace: 'calculators.mathCalculators.seoMeta' });
  const path = '/calculators/math';
  const canonicalUrl = locale === 'en' ? `${BASE_URL}${path}` : `${BASE_URL}/${locale}${path}`;
  const title = tSeo('title');

  return {
    title,
    description: tSeo('description'),
    keywords: tSeo('keywords'),
    alternates: {
      canonical: canonicalUrl,
      languages: generateHreflangUrls(path),
    },
    openGraph: {
      title,
      description: tSeo('description'),
      type: 'website',
      url: canonicalUrl,
    },
  };
}

export default async function MathCalculatorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'calculators' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const tFaq = await getTranslations({ locale, namespace: 'calculators.mathCalculators.faq' });
  const tSeo = await getTranslations({ locale, namespace: 'calculators.mathCalculators.seoContent' });
  
  // Get FAQ items from translations
  const faqItems = await getFaqItems(locale);

  const calculators = await getCalculatorsForCategory('math', locale, mathCalculators);

  return (
    <>
      <FaqSchema items={faqItems} />
      <Header />

      <div className="calculator-page">
        <div className="page-background">
          <div className="bg-gradient"></div>
        </div>

        <div className="container">
          <div className="calculator-header">
            <Link href="/" className="back-button">
              <svg className="back-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{tCommon('home')}</span>
            </Link>
            <div className="header-content">
              <div className="title-badge">{t('mathCalculators.badge') || 'Math'}</div>
              <h1 className="page-title">{t('mathCalculators.title')}</h1>
            </div>
          </div>

          <div className="calculators-container">
            <CalculatorList calculators={calculators} />
            
            {/* SEO Content Section */}
            <div className="seo-content-section">
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
                  
                  <div className="seo-example">
                    <h3 className="example-heading">{tSeo('exampleHeading')}</h3>
                    <p className="example-text">
                      {tSeo('exampleText')}
                    </p>
                  </div>
                  
                  <p className="seo-paragraph">
                    {tSeo('paragraph4')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* FAQ Section */}
            <FaqSection heading={tFaq('heading')} items={faqItems} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
