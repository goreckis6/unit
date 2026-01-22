import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from './LanguageSwitcher';

export async function Header() {
  const t = await getTranslations('common');

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link href="/" className="logo">
            <span className="logo-icon">🔢</span>
            <span className="logo-text">{t('siteName')}</span>
          </Link>
          <nav className="nav">
            <Link href="/calculators/math" className="nav-link">
              {t('calculators')}
            </Link>
            <Link href="/blog" className="nav-link">
              {t('blog')}
            </Link>
            <LanguageSwitcher />
          </nav>
        </div>
      </div>
    </header>
  );
}
