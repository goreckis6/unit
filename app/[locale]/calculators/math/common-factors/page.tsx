import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CommonFactorsCalculator } from './calculator';
import { BackButton } from '@/components/BackButton';
import { FaqSection } from '@/components/FaqSection';
import { FaqSchema } from '@/components/FaqSchema';
import { SoftwareApplicationSchema } from '@/components/SoftwareApplicationSchema';
import { getHrefLangAlternates } from '@/lib/hreflang';

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

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `/${locale}/calculators/math/common-factors`,
      languages: getHrefLangAlternates('/calculators/math/common-factors'),
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/${locale}/calculators/math/common-factors`,
    },
  };
}

export default async function CommonFactorsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('calculators.commonFactors');

  return (
    <>
      <FaqSchema namespace="calculators.commonFactors" />
      <SoftwareApplicationSchema
        name={t('title')}
        description={t('description')}
        url={`/${locale}/calculators/math/common-factors`}
      />
      <div className="calculator-container">
        <BackButton href={`/${locale}/calculators/math`} />

        <h1 className="calculator-title">{t('title')}</h1>
        <p className="calculator-description">{t('description')}</p>

        <div className="calculator-card">
          <CommonFactorsCalculator />
        </div>

        <div className="seo-content">
          <h2 className="seo-heading">{t('seo.content.heading')}</h2>
          <p className="seo-paragraph">{t('seo.content.paragraph1')}</p>
          <p className="seo-paragraph">{t('seo.content.paragraph2')}</p>
          <p className="seo-paragraph">{t('seo.content.paragraph3')}</p>
          <p className="seo-paragraph">{t('seo.content.paragraph4')}</p>

          <div className="seo-content-card">
            <h3 className="example-heading">{t('seo.content.exampleHeading')}</h3>
            <p className="example-text">{t('seo.content.exampleText')}</p>
          </div>
        </div>

        <div className="related-calculators-section">
          <h2 className="faq-heading">{t('seo.related.heading')}</h2>
          <div className="related-calculators-grid">
            <a href={`/${locale}/calculators/percentage`} className="related-calculator-card">
              <h3 className="related-calculator-title">{t('seo.related.percentage')}</h3>
              <p className="related-calculator-description">{t('seo.related.percentageDesc')}</p>
            </a>
            <a href={`/${locale}/calculators/percentage-increase`} className="related-calculator-card">
              <h3 className="related-calculator-title">{t('seo.related.percentageIncrease')}</h3>
              <p className="related-calculator-description">{t('seo.related.percentageIncreaseDesc')}</p>
            </a>
            <a href={`/${locale}/calculators/math/multiplication`} className="related-calculator-card">
              <h3 className="related-calculator-title">{t('seo.related.multiplication')}</h3>
              <p className="related-calculator-description">{t('seo.related.multiplicationDesc')}</p>
            </a>
          </div>
        </div>

        <FaqSection namespace="calculators.commonFactors" />
      </div>
    </>
  );
}
