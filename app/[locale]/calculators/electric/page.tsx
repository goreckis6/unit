import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { CalculatorList } from './list';

export const metadata = {
  title: 'Electric Calculators - Unit Converter Hub',
  description: 'Browse our collection of electric calculators for all your electrical calculation needs',
};

interface Calculator {
  id: string;
  titleKey: string;
  descKey: string;
  path: string;
}

export default async function ElectricCalculatorsPage() {
  const t = await getTranslations('calculators');
  const tCommon = await getTranslations('common');

  const calculators: Calculator[] = [
    {
      id: 'watts-to-kva',
      titleKey: 'wattsToKva.title',
      descKey: 'wattsToKva.description',
      path: '/calculators/electric/watts-to-kva',
    },
  ];

  return (
    <>
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
                <h2 className="seo-heading">Electric Calculators - Free Online Tools</h2>
                
                <div className="seo-paragraphs">
                  <p className="seo-paragraph">
                    Our collection of electric calculators provides quick and accurate solutions for a wide range of electrical problems. Whether you need to calculate voltage, current, resistance, power, or work with electrical circuits, our calculators are designed to help you get the answers you need instantly.
                  </p>
                  
                  <p className="seo-paragraph">
                    All our electric calculators are completely free to use and require no registration. Simply select the calculator you need, enter your values, and get instant results. Our calculators work on all devices - desktop, tablet, and mobile - so you can use them anywhere, anytime.
                  </p>
                  
                  <p className="seo-paragraph">
                    Each calculator is designed with user-friendliness in mind, featuring clear input fields, intuitive interfaces, and detailed result displays. We continuously add new calculators to our collection to meet your electrical calculation needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
