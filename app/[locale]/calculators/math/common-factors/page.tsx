import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { CommonFactorsCalculator } from './calculator';
import { FaqSection } from '@/components/FaqSection';
import { FaqSchema } from '@/components/FaqSchema';
import { SoftwareApplicationSchema } from '@/components/SoftwareApplicationSchema';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { generateHreflangUrls, BASE_URL } from '@/lib/hreflang';

interface FaqItem {
  question: string;
  answer: string;
}

async function getFaqItems(locale: string): Promise<FaqItem[]> {
  try {
    const messages = await import(`@/i18n/${locale}.json`);
    return (messages.default?.calculators?.commonFactors?.seo?.faq?.items as FaqItem[]) || [];
  } catch {
    const messages = await import('@/i18n/en.json');
    return (messages.default?.calculators?.commonFactors?.seo?.faq?.items as FaqItem[]) || [];
  }
}

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'calculators.commonFactors',
  });

  const description = t('seo.description');
  const title = t('seo.title');
  const keywords = t('seo.keywords');
  const path = '/calculators/math/common-factors';
  const canonicalUrl = locale === 'en' ? `${BASE_URL}${path}` : `${BASE_URL}/${locale}${path}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: generateHreflangUrls(path),
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
    },
  };
}

export default async function CommonFactorsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('calculators.commonFactors');
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const faqItems = await getFaqItems(locale);
  const path = '/calculators/math/common-factors';
  const canonicalUrl = locale === 'en' ? `${BASE_URL}${path}` : `${BASE_URL}/${locale}${path}`;

  return (
    <>
      <FaqSchema items={faqItems} />
      <SoftwareApplicationSchema
        locale={locale}
        siteName={tCommon('siteName')}
        description={t('description')}
        url={canonicalUrl}
      />
      <Header />

      <div className="calculator-header">
        <div className="container">
          <Link href="/calculators/math" className="back-button">
            <svg className="back-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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
            <CommonFactorsCalculator />
          </div>
        </div>
      </div>

      {/* SEO Content Section */}
      <div className="seo-content-section">
        <div className="container">
          <div className="seo-content-card">
            <h2 className="seo-heading">{t('seo.content.heading')}</h2>

            <div className="seo-paragraphs">
              <p className="seo-paragraph">{t('seo.content.paragraph1')}</p>
              <p className="seo-paragraph">{t('seo.content.paragraph2')}</p>
              <p className="seo-paragraph">{t('seo.content.paragraph3')}</p>

              <div className="seo-example">
                <h3 className="example-heading">{t('seo.content.exampleHeading')}</h3>
                <p className="example-text">{t('seo.content.exampleText')}</p>
              </div>

              <p className="seo-paragraph">{t('seo.content.paragraph4')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Calculators Section */}
      <div className="related-calculators-section">
        <div className="container">
          <h2 className="faq-heading">{t('seo.related.heading')}</h2>
          <div className="related-calculators-grid">
            <Link href="/calculators/percentage" className="related-calculator-card">
              <h3 className="related-calculator-title">{t('seo.related.percentage')}</h3>
              <p className="related-calculator-description">{t('seo.related.percentageDesc')}</p>
            </Link>
            <Link href="/calculators/math/percentage-increase" className="related-calculator-card">
              <h3 className="related-calculator-title">{t('seo.related.percentageIncrease')}</h3>
              <p className="related-calculator-description">{t('seo.related.percentageIncreaseDesc')}</p>
            </Link>
            <Link href="/calculators/math/multiplication" className="related-calculator-card">
              <h3 className="related-calculator-title">{t('seo.related.multiplication')}</h3>
              <p className="related-calculator-description">{t('seo.related.multiplicationDesc')}</p>
            </Link>
          </div>
        </div>
      </div>

      <FaqSection namespace="calculators.commonFactors" />
      
      <Footer />
    </>
  );
}
