import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { WattsToKvaCalculator } from './calculator';

export const metadata = {
  title: 'Watts to kVA Calculator - Unit Converter Hub',
  description: 'Convert watts to kilovolt-amperes using power factor',
};

export default async function WattsToKvaPage() {
  const t = await getTranslations('calculators.wattsToKva');
  const tCommon = await getTranslations('common');

  return (
    <>
      <Header />

      <div className="calculator-header">
        <div className="container">
          <Link href="/calculators/electric" className="back-button">
            <svg className="back-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{tCommon('calculators')}</span>
          </Link>
          <div className="header-content">
            <div className="title-badge">Electric Calculator</div>
            <h1 className="page-title">{t('title')}</h1>
            <p className="page-description">{t('description')}</p>
          </div>
        </div>
      </div>

      <div className="calculator-container">
        <div className="container">
          <div className="calculator-card">
            <WattsToKvaCalculator />
          </div>
        </div>
      </div>
    </>
  );
}
