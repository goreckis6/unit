import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FaqSchema } from '@/components/FaqSchema';
import { FaqSection } from '@/components/FaqSection';
import { CalculatorList } from './list';

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
  const t = await getTranslations({ locale, namespace: 'calculators.mathCalculators' });
  
  return {
    title: `${t('title')} - UnitConverterHub.com`,
    description: t('description'),
    openGraph: {
      title: `${t('title')} - UnitConverterHub.com`,
      description: t('description'),
      type: 'website',
    },
  };
}

export default async function MathCalculatorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'calculators' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const tFaq = await getTranslations({ locale, namespace: 'calculators.mathCalculators.faq' });
  
  // Get FAQ items from translations
  const faqItems = await getFaqItems(locale);

  const calculators = [
    {
      id: 'addition',
      titleKey: 'addition.title',
      descKey: 'addition.description',
      path: '/calculators/math/addition',
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
              <div className="title-badge">{t('mathCalculators.badge') || 'Math'}</div>
              <h1 className="page-title">{t('mathCalculators.title')}</h1>
            </div>
          </div>

          <div className="calculators-container">
            <CalculatorList calculators={calculators} />
            
            {/* SEO Content Section */}
            <div className="seo-content-section">
              <div className="seo-content-card">
                <h2 className="seo-heading">Math Calculators - Free Online Tools</h2>
                
                <div className="seo-paragraphs">
                  <p className="seo-paragraph">
                    Our collection of math calculators provides quick and accurate solutions for a wide range of mathematical problems. Whether you need to perform basic arithmetic operations, solve complex equations, or work with fractions and percentages, our calculators are designed to help you get the answers you need instantly.
                  </p>
                  
                  <p className="seo-paragraph">
                    All our math calculators are completely free to use and require no registration. Simply select the calculator you need, enter your values, and get instant results. Our calculators work on all devices - desktop, tablet, and mobile - so you can use them anywhere, anytime.
                  </p>
                  
                  <p className="seo-paragraph">
                    Each calculator is designed with user-friendliness in mind, featuring clear input fields, intuitive interfaces, and detailed result displays. We continuously add new calculators to our collection to meet your mathematical calculation needs.
                  </p>
                  
                  <div className="seo-example">
                    <h3 className="example-heading">Example: Addition Calculator</h3>
                    <p className="example-text">
                      To add two numbers, simply enter the first number and the second number in the input fields, then click calculate. The result will be displayed instantly, showing the sum of the two numbers.
                    </p>
                  </div>
                  
                  <p className="seo-paragraph">
                    Browse through our math calculators above to find the tool you need. Each calculator includes detailed descriptions and examples to help you understand how to use it effectively.
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
