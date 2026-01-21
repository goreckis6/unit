import { component$ } from '@builder.io/qwik';
import type { DocumentHead, RequestEvent } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import Layout from '../components/layout';
import { useTranslate } from '../i18n/useTranslate';
import { getLocaleFromUrl } from '../i18n/i18n';

export const useLocale = routeLoader$(({ url }: RequestEvent) => {
  return getLocaleFromUrl(url);
});

export const head: DocumentHead = ({ resolveValue, url }) => {
  const locale = resolveValue(useLocale);
  const t = useTranslate(locale);
  const baseUrl = url.origin;
  
  return {
    title: t('og.title'),
    htmlAttributes: {
      lang: locale,
    },
    meta: [
      {
        name: 'description',
        content: t('og.description'),
      },
      {
        name: 'keywords',
        content: t('keywords'),
      },
      // Open Graph
      {
        property: 'og:title',
        content: t('og.title'),
      },
      {
        property: 'og:description',
        content: t('og.description'),
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:url',
        content: baseUrl + url.pathname,
      },
      {
        property: 'og:site_name',
        content: t('og.siteName'),
      },
      {
        property: 'og:locale',
        content: locale === 'pl' ? 'pl_PL' : 'en_US',
      },
      // Twitter Card
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: t('og.title'),
      },
      {
        name: 'twitter:description',
        content: t('og.description'),
      },
    ],
    links: [
      {
        rel: 'alternate',
        hreflang: 'en',
        href: baseUrl + '/',
      },
      {
        rel: 'alternate',
        hreflang: 'pl',
        href: baseUrl + '/pl',
      },
      {
        rel: 'alternate',
        hreflang: 'x-default',
        href: baseUrl + '/',
      },
    ],
  };
};

export default component$(() => {
  const locale = useLocale();
  const t = useTranslate(locale.value);

  const converters = [
    {
      href: '/length',
      key: 'length' as const,
      icon: '📏',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      href: '/weight',
      key: 'weight' as const,
      icon: '⚖️',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      href: '/temperature',
      key: 'temperature' as const,
      icon: '🌡️',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      href: '/volume',
      key: 'volume' as const,
      icon: '🧪',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
  ];

  return (
    <Layout locale={locale.value}>
      <div class="home-page">
        <div class="hero-section">
          <div class="container">
            <div class="hero-content">
              <div class="hero-badge">✨ {t('badge') || 'Free & Fast'}</div>
              <h1 class="hero-title">{t('title')}</h1>
              <p class="hero-description">{t('description')}</p>
              <div class="hero-stats">
                <div class="stat-item">
                  <div class="stat-number">4+</div>
                  <div class="stat-label">{t('stats.converters') || 'Converters'}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">100%</div>
                  <div class="stat-label">{t('stats.free') || 'Free'}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">∞</div>
                  <div class="stat-label">{t('stats.conversions') || 'Conversions'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="converters-section">
          <div class="container">
            <h2 class="section-title">{t('choose') || 'Choose Your Converter'}</h2>
            <div class="converter-grid-modern">
              {converters.map((converter) => (
                <a key={converter.href} href={converter.href} class="converter-card-modern">
                  <div class="card-icon" style={`background: ${converter.gradient}`}>
                    <span class="icon-emoji">{converter.icon}</span>
                  </div>
                  <h3 class="card-title">{t(`converters.${converter.key}.title`)}</h3>
                  <p class="card-description">{t(`converters.${converter.key}.description`)}</p>
                  <div class="card-arrow">→</div>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div class="features-section">
          <div class="container">
            <div class="features-grid">
              <div class="feature-item">
                <div class="feature-icon">⚡</div>
                <h3>{t('features.fast') || 'Lightning Fast'}</h3>
                <p>{t('features.fastDesc') || 'Instant conversions without page reload'}</p>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🎯</div>
                <h3>{t('features.accurate') || 'Precise & Accurate'}</h3>
                <p>{t('features.accurateDesc') || 'Professional-grade conversion formulas'}</p>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📱</div>
                <h3>{t('features.responsive') || 'Mobile Friendly'}</h3>
                <p>{t('features.responsiveDesc') || 'Works perfectly on all devices'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
});
