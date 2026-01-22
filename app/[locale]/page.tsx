import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function HomePage() {
  const t = await getTranslations('common');

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link href="/" className="logo">
              {t('siteName')}
            </Link>
            <nav className="nav">
              <Link href="/calculators/addition" className="nav-link">
                {t('calculators')}
              </Link>
              <Link href="/blog" className="nav-link">
                {t('blog')}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <h1>{t('siteName')}</h1>
              <p>{t('description')}</p>
              <Link href="/calculators/addition" className="cta-button">
                {t('calculators')} →
              </Link>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="container">
            <h2 className="section-title">{t('features')}</h2>
            <p className="section-subtitle">
              {t('featuresSubtitle')}
            </p>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🧮</div>
                <h3>{t('calculators')}</h3>
                <p>
                  {t('calculatorsDescription')}
                </p>
                <Link href="/calculators/addition" className="feature-link">
                  {t('exploreCalculators')} →
                </Link>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🌍</div>
                <h3>{t('languagesTitle')}</h3>
                <p>
                  {t('languagesDescription')}
                </p>
                <Link href="/blog" className="feature-link">
                  {t('learnMore')} →
                </Link>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📝</div>
                <h3>{t('blog')}</h3>
                <p>
                  {t('blogDescription')}
                </p>
                <Link href="/blog" className="feature-link">
                  {t('readBlog')} →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <p>&copy; {new Date().getFullYear()} {t('siteName')}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
