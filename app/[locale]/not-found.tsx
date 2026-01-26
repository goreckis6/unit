import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BackButton } from '@/components/BackButton';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'notFound' });
  
  return {
    title: t('title'),
  };
}

export default async function NotFound({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'notFound' });

  return (
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
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="4"/>
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
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                    <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                    <path d="M12 21c0-1-1-3-3-3s-3 2-3 3 1 3 3 3 3-2 3-3"/>
                    <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
                  </svg>
                  {t('suggestion1')}
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  {t('suggestion2')}
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="9" y1="3" x2="9" y2="21"/>
                    <line x1="15" y1="3" x2="15" y2="21"/>
                    <line x1="3" y1="9" x2="21" y2="9"/>
                    <line x1="3" y1="15" x2="21" y2="15"/>
                  </svg>
                  {t('suggestion3')}
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  {t('suggestion4')}
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="not-found-actions">
              <Link href="/" className="btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                {t('goHome')}
              </Link>
              <BackButton label={t('goBack')} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
      
      <style jsx>{`
        .not-found-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .not-found-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem 0;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
        }

        .not-found-content {
          text-align: center;
          max-width: 700px;
          margin: 0 auto;
        }

        .not-found-number {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
          font-size: 8rem;
          font-weight: 900;
          line-height: 1;
          color: var(--primary-color);
          text-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
        }

        .number-4,
        .number-0 {
          display: inline-block;
          animation: float 3s ease-in-out infinite;
        }

        .number-4:nth-child(1) {
          animation-delay: 0s;
        }

        .number-0 {
          animation-delay: 0.5s;
          position: relative;
          width: 120px;
          height: 120px;
        }

        .zero-icon {
          width: 100%;
          height: 100%;
          color: var(--primary-color);
        }

        .number-4:nth-child(3) {
          animation-delay: 1s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .not-found-heading {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 1rem;
          letter-spacing: -0.5px;
        }

        .not-found-description {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .not-found-message {
          font-size: 1rem;
          color: var(--text-tertiary);
          margin-bottom: 3rem;
          line-height: 1.6;
        }

        .not-found-suggestions {
          background: var(--bg-primary);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 3rem;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
        }

        .suggestions-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .suggestions-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .suggestions-list li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
          color: var(--text-secondary);
          text-align: left;
        }

        .suggestions-list li svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          color: var(--primary-color);
        }

        .not-found-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary,
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 12px;
          transition: all 0.3s ease;
          cursor: pointer;
          text-decoration: none;
          border: 2px solid transparent;
        }

        .btn-primary {
          background: var(--primary-color);
          color: white;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
        }

        .btn-primary:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
        }

        .btn-primary svg {
          width: 18px;
          height: 18px;
        }

        .btn-secondary {
          background: var(--bg-primary);
          color: var(--text-primary);
          border-color: var(--border-color);
        }

        .btn-secondary:hover {
          background: var(--bg-secondary);
          border-color: var(--primary-color);
          color: var(--primary-color);
          transform: translateY(-2px);
        }

        .btn-secondary svg {
          width: 18px;
          height: 18px;
        }

        @media (max-width: 768px) {
          .not-found-number {
            font-size: 5rem;
            gap: 0.5rem;
          }

          .number-0 {
            width: 80px;
            height: 80px;
          }

          .not-found-heading {
            font-size: 2rem;
          }

          .not-found-description {
            font-size: 1.1rem;
          }

          .not-found-suggestions {
            padding: 1.5rem;
          }

          .suggestions-list {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .not-found-actions {
            flex-direction: column;
          }

          .btn-primary,
          .btn-secondary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
