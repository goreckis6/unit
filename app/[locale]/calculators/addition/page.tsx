import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
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
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link href="/" className="logo">
              {tCommon('siteName')}
            </Link>
            <nav className="nav">
              <Link href="/calculators/addition" className="nav-link">
                {tCommon('calculators')}
              </Link>
              <Link href="/blog" className="nav-link">
                {tCommon('blog')}
              </Link>
            </nav>
          </div>
        </div>
      </header>

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
