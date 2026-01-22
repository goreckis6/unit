import { useTranslations } from 'next-intl';
import { AdditionCalculator } from './calculator';

export const metadata = {
  title: 'Addition Calculator',
  description: 'Add two numbers together',
};

export default function AdditionPage() {
  const t = useTranslations('calculators.addition');

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <AdditionCalculator />
    </div>
  );
}
