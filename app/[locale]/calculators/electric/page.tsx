import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FaqSchema } from '@/components/FaqSchema';
import { FaqSection } from '@/components/FaqSection';
import { CalculatorList } from './list';
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
    return (messages.default?.calculators?.electricCalculators?.faq?.items as FaqItem[]) || [];
  } catch {
    const messages = await import('@/i18n/en.json');
    return (messages.default?.calculators?.electricCalculators?.faq?.items as FaqItem[]) || [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'calculators.electricCalculators' });
  const tSeo = await getTranslations({ locale, namespace: 'calculators.electricCalculators.seoMeta' });
  const baseUrl = 'https://unitconverterhub.com';
  const path = locale === 'en' ? '/calculators/electric' : `/${locale}/calculators/electric`;
  const canonicalUrl = `${baseUrl}${path}`;
  const hreflangUrls = generateHreflangUrls('/calculators/electric');
  
  return {
    title: `${tSeo('title')} - UnitConverterHub.com`,
    description: tSeo('description'),
    keywords: tSeo('keywords'),
    alternates: {
      canonical: canonicalUrl,
      languages: hreflangUrls,
    },
    openGraph: {
      title: `${tSeo('title')} - UnitConverterHub.com`,
      description: tSeo('description'),
      type: 'website',
      url: canonicalUrl,
    },
  };
}

interface Calculator {
  id: string;
  titleKey: string;
  descKey: string;
  path: string;
}

export default async function ElectricCalculatorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'calculators' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const tFaq = await getTranslations({ locale, namespace: 'calculators.electricCalculators.faq' });
  const tSeo = await getTranslations({ locale, namespace: 'calculators.electricCalculators.seoContent' });
  
  // Get FAQ items from translations
  const faqItems = await getFaqItems(locale);

  const calculators: Calculator[] = [
    {
      id: 'watts-to-kva',
      titleKey: 'wattsToKva.title',
      descKey: 'wattsToKva.description',
      path: '/calculators/electric/watts-to-kva',
    },
    {
      id: 'amp-to-kw',
      titleKey: 'ampToKw.title',
      descKey: 'ampToKw.description',
      path: '/calculators/electric/amp-to-kw',
    },
    {
      id: 'kw-to-amps',
      titleKey: 'kwToAmps.title',
      descKey: 'kwToAmps.description',
      path: '/calculators/electric/kw-to-amps',
    },
    {
      id: 'kw-to-volts',
      titleKey: 'kwToVolts.title',
      descKey: 'kwToVolts.description',
      path: '/calculators/electric/kw-to-volts',
    },
    {
      id: 'kw-to-kwh',
      titleKey: 'kwToKwh.title',
      descKey: 'kwToKwh.description',
      path: '/calculators/electric/kw-to-kwh',
    },
    {
      id: 'kw-to-va',
      titleKey: 'kwToVa.title',
      descKey: 'kwToVa.description',
      path: '/calculators/electric/kw-to-va',
    },
    {
      id: 'kw-to-kva',
      titleKey: 'kwToKva.title',
      descKey: 'kwToKva.description',
      path: '/calculators/electric/kw-to-kva',
    },
    {
      id: 'kwh-to-watts',
      titleKey: 'kwhToWatts.title',
      descKey: 'kwhToWatts.description',
      path: '/calculators/electric/kwh-to-watts',
    },
    {
      id: 'mah-to-wh',
      titleKey: 'mahToWh.title',
      descKey: 'mahToWh.description',
      path: '/calculators/electric/mah-to-wh',
    },
    {
      id: 'va-to-amps',
      titleKey: 'vaToAmps.title',
      descKey: 'vaToAmps.description',
      path: '/calculators/electric/va-to-amps',
    },
    {
      id: 'va-to-watts',
      titleKey: 'vaToWatts.title',
      descKey: 'vaToWatts.description',
      path: '/calculators/electric/va-to-watts',
    },
    {
      id: 'va-to-kw',
      titleKey: 'vaToKw.title',
      descKey: 'vaToKw.description',
      path: '/calculators/electric/va-to-kw',
    },
    {
      id: 'va-to-kva',
      titleKey: 'vaToKva.title',
      descKey: 'vaToKva.description',
      path: '/calculators/electric/va-to-kva',
    },
    {
      id: 'amp-to-kva',
      titleKey: 'ampToKva.title',
      descKey: 'ampToKva.description',
      path: '/calculators/electric/amp-to-kva',
    },
    {
      id: 'amps-to-va',
      titleKey: 'ampToVa.title',
      descKey: 'ampToVa.description',
      path: '/calculators/electric/amps-to-va',
    },
    {
      id: 'amps-to-volt',
      titleKey: 'ampsToVolt.title',
      descKey: 'ampsToVolt.description',
      path: '/calculators/electric/amps-to-volt',
    },
    {
      id: 'volts-to-amps',
      titleKey: 'voltsToAmps.title',
      descKey: 'voltsToAmps.description',
      path: '/calculators/electric/volts-to-amps',
    },
    {
      id: 'volts-to-watts',
      titleKey: 'voltsToWatts.title',
      descKey: 'voltsToWatts.description',
      path: '/calculators/electric/volts-to-watts',
    },
    {
      id: 'volts-to-kw',
      titleKey: 'voltsToKw.title',
      descKey: 'voltsToKw.description',
      path: '/calculators/electric/volts-to-kw',
    },
    {
      id: 'amps-to-watts',
      titleKey: 'ampsToWatts.title',
      descKey: 'ampsToWatts.description',
      path: '/calculators/electric/amps-to-watts',
    },
    {
      id: 'electron-volts-to-volts',
      titleKey: 'electronVoltsToVolts.title',
      descKey: 'electronVoltsToVolts.description',
      path: '/calculators/electric/electron-volts-to-volts',
    },
    {
      id: 'joules-to-watts',
      titleKey: 'joulesToWatts.title',
      descKey: 'joulesToWatts.description',
      path: '/calculators/electric/joules-to-watts',
    },
    {
      id: 'joules-to-volts',
      titleKey: 'joulesToVolts.title',
      descKey: 'joulesToVolts.description',
      path: '/calculators/electric/joules-to-volts',
    },
    {
      id: 'kva-to-amps',
      titleKey: 'kvaToAmps.title',
      descKey: 'kvaToAmps.description',
      path: '/calculators/electric/kva-to-amps',
    },
    {
      id: 'kva-to-watts',
      titleKey: 'kvaToWatts.title',
      descKey: 'kvaToWatts.description',
      path: '/calculators/electric/kva-to-watts',
    },
    {
      id: 'kva-to-kw',
      titleKey: 'kvaToKw.title',
      descKey: 'kvaToKw.description',
      path: '/calculators/electric/kva-to-kw',
    },
    {
      id: 'kva-to-va',
      titleKey: 'kvaToVa.title',
      descKey: 'kvaToVa.description',
      path: '/calculators/electric/kva-to-va',
    },
  ];

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
              <div className="title-badge">{t('electricCalculators.badge') || 'Electric'}</div>
              <h1 className="page-title">{t('electricCalculators.title')}</h1>
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
