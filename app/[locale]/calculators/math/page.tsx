import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { CalculatorList } from './list';

export const metadata = {
  title: 'Math Calculators - Unit Converter Hub',
  description: 'Browse our collection of math calculators for all your calculation needs',
};

export default async function MathCalculatorsPage() {
  const t = await getTranslations('calculators');
  const tCommon = await getTranslations('common');

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
          </div>
        </div>
      </div>
    </>
  );
}
