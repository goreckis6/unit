import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { AdditionCalculator } from './calculator';

export const metadata = {
  title: 'Addition Calculator',
  description: 'Add two numbers together',
};

export default async function AdditionPage() {
  const t = await getTranslations('calculators.addition');
  const tCommon = await getTranslations('common');

  return (
    <>
      <Header />

      <div className="calculator-header">
        <div className="container">
          <div className="title-badge">Math Calculator</div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-description">{t('description')}</p>
        </div>
      </div>

      <div className="calculator-container">
        <div className="container">
          <div className="calculator-card">
            <AdditionCalculator />
          </div>
        </div>
      </div>
    </>
  );
}
