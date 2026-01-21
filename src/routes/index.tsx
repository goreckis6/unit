import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link, useLocation } from '@builder.io/qwik-city';
import { useTranslate } from '../i18n-qwik/useTranslate';

export default component$(() => {
  const loc = useLocation();
  const t = useTranslate();
  
  const pathParts = loc.url.pathname.split('/').filter(p => p);
  const supportedLocales = ['en', 'pl', 'sv', 'de', 'es', 'fr', 'it', 'nl', 'pt', 'vi', 'tr', 'ru', 'fa', 'th', 'ja', 'zh'];
  const locale = pathParts[0] && supportedLocales.includes(pathParts[0]) ? pathParts[0] : 'en';
  
  const mathCalcPath = locale === 'en' ? '/calculators/math-calculators' : `/${locale}/calculators/math-calculators`;
  const electricalCalcPath = locale === 'en' ? '/calculators/electrical-calculator' : `/${locale}/calculators/electrical-calculator`;

  return (
    <div class="home">
      <section class="hero">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">{t('home.title')}</h1>
            <p class="hero-subtitle">{t('home.subtitle')}</p>
            <p class="hero-description">{t('home.description')}</p>
          </div>
        </div>
      </section>

      <section class="categories-section">
        <div class="container">
          <h2 class="section-title">{t('home.categories.title')}</h2>
          <p class="section-subtitle">{t('home.categories.subtitle')}</p>
          <div class="categories-grid">
            <Link href={mathCalcPath} class="category-card">
              <div class="category-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h3 class="category-name">{t('calculators.mathCalculators.title')}</h3>
              <p class="category-description">
                {t('calculators.mathCalculators.description')}
              </p>
              <span class="category-link">{t('home.viewAll') || 'View All'}</span>
            </Link>
            
            <Link href={electricalCalcPath} class="category-card">
              <div class="category-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h3 class="category-name">{t('calculators.electrical.title')}</h3>
              <p class="category-description">
                {t('calculators.electrical.description')}
              </p>
              <span class="category-link">{t('home.viewAll') || 'View All'}</span>
            </Link>
          </div>
        </div>
      </section>

      <section class="features-section">
        <div class="container">
          <h2 class="section-title">{t('home.features.title')}</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h3 class="feature-title">{t('home.features.fast.title')}</h3>
              <p class="feature-description">{t('home.features.fast.description')}</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h3 class="feature-title">{t('home.features.free.title')}</h3>
              <p class="feature-description">{t('home.features.free.description')}</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h3 class="feature-title">{t('home.features.easy.title')}</h3>
              <p class="feature-description">{t('home.features.easy.description')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  // This will be resolved at runtime with proper locale
  return {
    title: 'Unit Converter Hub - Free Online Calculators',
    meta: [
      {
        name: 'description',
        content: 'Free online calculators and unit converters for math, electrical, and more. Fast, accurate, and easy to use.',
      },
      {
        name: 'keywords',
        content: 'calculator, unit converter, math calculator, electrical calculator, online calculator',
      },
    ],
  };
};
