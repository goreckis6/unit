import { NextIntlClientProvider } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BackButton } from '@/components/BackButton';

export async function generateMetadata() {
  const t = await getTranslations({ locale: 'en', namespace: 'notFound' });

  return {
    title: t('title'),
  };
}

export default async function NotFound() {
  const t = await getTranslations({ locale: 'en', namespace: 'notFound' });
  const messages = (await import('@/i18n/en.json')).default as AbstractIntlMessages;

  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <div className="not-found-page">
        <Header />

        <div className="not-found-container">
          <div className="container">
            <div className="not-found-content">
              {/* Animated 404 Number */}
              <div className="not-found-number">
                <span className="number-4">4</span>
                <span className="number-0">
                  <svg viewBox="0 0 100 100" className="zero-icon">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="4" />
                  </svg>
                </span>
                <span className="number-4">4</span>
              </div>

              {/* Main Heading */}
              <h1 className="not-found-heading">{t('heading')}</h1>

              {/* Description */}
              <p className="not-found-description">{t('description')}</p>

              {/* Message */}
              <p className="not-found-message">{t('message')}</p>

              {/* Suggestions */}
              <div className="not-found-suggestions">
                <h2 className="suggestions-title">{t('suggestions')}</h2>
                <ul className="suggestions-list">
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4" />
                      <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
                      <path d="M3 12c1 0 3-1 3-3s-2-3-3-3 3 1 3 3 2 3 3 3" />
                      <path d="M12 21c0-1-1-3-3-3s-3 2-3 3 1 3 3 3 3-2 3-3" />
                      <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1 3 3 3 3 2 3 3" />
                    </svg>
                    {t('suggestion1')}
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    {t('suggestion2')}
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                      <line x1="15" y1="3" x2="15" y2="21" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="3" y1="15" x2="21" y2="15" />
                    </svg>
                    {t('suggestion3')}
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    {t('suggestion4')}
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="not-found-actions">
                <Link href="/" className="btn-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  {t('goHome')}
                </Link>
                <BackButton label={t('goBack')} />
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
