import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ReverseTextGeneratorCalculator } from './calculator';
import { FaqSchema } from '@/components/FaqSchema';
import { FaqSection } from '@/components/FaqSection';
import { generateHreflangUrls, BASE_URL } from '@/lib/hreflang';

interface FaqItem {
  question: string;
  answer: string;
}

async function getFaqItems(locale: string): Promise<FaqItem[]> {
  try {
    const messages = await import(`@/i18n/${locale}.json`);
    return (messages.default?.calculators?.reverseTextGenerator?.seo?.faq?.items as FaqItem[]) || [];
  } catch {
    const messages = await import('@/i18n/en.json');
    return (messages.default?.calculators?.reverseTextGenerator?.seo?.faq?.items as FaqItem[]) || [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'calculators.reverseTextGenerator.seo' });
  const path = '/calculators/real-life/reverse-text-generator';
  const canonicalUrl = locale === 'en' ? `${BASE_URL}${path}` : `${BASE_URL}/${locale}${path}`;
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    alternates: {
      canonical: canonicalUrl,
      languages: generateHreflangUrls(path),
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      url: canonicalUrl,
    },
  };
}

export default async function ReverseTextGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'calculators.reverseTextGenerator' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const faqItems = await getFaqItems(locale);
  const tSeo = await getTranslations({ locale, namespace: 'calculators.reverseTextGenerator.seo.content' });
  const tFaq = await getTranslations({ locale, namespace: 'calculators.reverseTextGenerator.seo.faq' });
  const tRelated = await getTranslations({ locale, namespace: 'calculators.reverseTextGenerator.seo.related' });

  return (
    <>
      <FaqSchema items={faqItems} />
      <Header />

      <div className="calculator-header">
        <div className="container">
          <Link href="/calculators/real-life" className="back-button">
            <svg className="back-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{tCommon('calculators')}</span>
          </Link>
          <div className="header-content">
            <div className="title-badge">Real-life</div>
            <h1 className="page-title">{t('title')}</h1>
            <p className="page-description">{t('description')}</p>
          </div>
        </div>
      </div>

      <div className="calculator-container">
        <div className="container">
          <div className="calculator-card">
            <ReverseTextGeneratorCalculator />
          </div>

          <div className="seo-content-section">
            <div className="seo-content-card">
              <h2 className="seo-heading">{tSeo('heading')}</h2>

              <div className="seo-paragraphs">
                <p className="seo-paragraph">{tSeo('paragraph1')}</p>
                <p className="seo-paragraph">{tSeo('paragraph2')}</p>
                <p className="seo-paragraph">{tSeo('paragraph3')}</p>
                <div className="seo-example">
                  <h3 className="example-heading">{tSeo('exampleHeading')}</h3>
                  <p className="example-text">{tSeo('exampleText')}</p>
                </div>
                <p className="seo-paragraph">{tSeo('paragraph4')}</p>
              </div>
            </div>
          </div>

          <FaqSection heading={tFaq('heading')} items={faqItems} />
        </div>
      </div>

      <div className="related-calculators-section">
        <div className="container">
          <h2 className="related-heading">{tRelated('heading')}</h2>
          <div className="related-grid">
            <Link href="/calculators/others/text-to-binary" className="related-card">
              <h3 className="related-title">{tRelated('textToBinary')}</h3>
            </Link>
            <Link href="/calculators/others/mirror-text" className="related-card">
              <h3 className="related-title">{tRelated('mirrorText')}</h3>
            </Link>
            <Link href="/calculators/others/upside-down-text" className="related-card">
              <h3 className="related-title">{tRelated('upsideDownText')}</h3>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
