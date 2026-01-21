import { component$, useSignal, useTask$, useVisibleTask$, $ } from '@builder.io/qwik';
import { Link, useLocation, type DocumentHead } from '@builder.io/qwik-city';
import { useTranslate } from '../i18n-qwik/useTranslate';
import { getWebAppSchema } from '../utils/webAppSchema';

export default component$(() => {
  const t = useTranslate();
  const loc = useLocation();

  const real1 = useSignal<number | null>(null);
  const imag1 = useSignal<number | null>(null);
  const real2 = useSignal<number | null>(null);
  const imag2 = useSignal<number | null>(null);
  const operation = useSignal<'add' | 'subtract' | 'multiply' | 'divide'>('add');
  const result = useSignal<{ real: number; imag: number } | null>(null);
  const error = useSignal<string>('');

  const canCalculate = useSignal(false);

  useTask$(({ track }) => {
    track(() => real1.value);
    track(() => imag1.value);
    track(() => real2.value);
    track(() => imag2.value);
    canCalculate.value =
      real1.value !== null && imag1.value !== null &&
      real2.value !== null && imag2.value !== null;
  });

  const calculate = $(() => {
    error.value = '';
    result.value = null;

    if (!canCalculate.value) {
      error.value = t('calculators.complexNumbers.error.invalidInput');
      return;
    }

    const r1 = parseFloat(String(real1.value)) || 0;
    const i1 = parseFloat(String(imag1.value)) || 0;
    const r2 = parseFloat(String(real2.value)) || 0;
    const i2 = parseFloat(String(imag2.value)) || 0;

    if (isNaN(r1) || isNaN(i1) || isNaN(r2) || isNaN(i2)) {
      error.value = t('calculators.complexNumbers.error.invalidInput');
      return;
    }

    try {
      let real: number, imag: number;

      switch (operation.value) {
        case 'add':
          real = r1 + r2;
          imag = i1 + i2;
          break;
        case 'subtract':
          real = r1 - r2;
          imag = i1 - i2;
          break;
        case 'multiply':
          // (a+bi)(c+di) = ac + adi + bci + bdi² = (ac - bd) + (ad + bc)i
          real = r1 * r2 - i1 * i2;
          imag = r1 * i2 + i1 * r2;
          break;
        case 'divide':
          // (a+bi)/(c+di) = [(a+bi)(c-di)]/[(c+di)(c-di)] = [(ac+bd) + (bc-ad)i]/(c²+d²)
          const denominator = r2 * r2 + i2 * i2;
          if (denominator === 0) {
            error.value = t('calculators.complexNumbers.error.divideByZero');
            return;
          }
          real = (r1 * r2 + i1 * i2) / denominator;
          imag = (i1 * r2 - r1 * i2) / denominator;
          break;
      }

      if (!isFinite(real) || !isFinite(imag)) {
        error.value = t('calculators.complexNumbers.error.invalidResult');
        return;
      }

      result.value = { real, imag };
    } catch (e) {
      error.value = t('calculators.complexNumbers.error.calculationError');
    }
  });

  const clear = $(() => {
    real1.value = null;
    imag1.value = null;
    real2.value = null;
    imag2.value = null;
    result.value = null;
    error.value = '';
  });

  const formatNumber = (value: number | null): string => {
    if (value === null || value === undefined || value === '') return '0';
    const num = parseFloat(String(value)) || 0;
    if (Math.abs(num) >= 1000) {
      return num.toLocaleString('en-US', { maximumFractionDigits: 10 });
    }
    return num.toString();
  };

  const formatComplex = (real: number, imag: number): string => {
    if (imag === 0) return formatNumber(real);
    if (real === 0) {
      if (imag === 1) return 'i';
      if (imag === -1) return '-i';
      return `${formatNumber(imag)}i`;
    }
    const imagStr = imag > 0 
      ? `+ ${imag === 1 ? '' : formatNumber(imag)}i`
      : `- ${imag === -1 ? '' : formatNumber(Math.abs(imag))}i`;
    return `${formatNumber(real)} ${imagStr}`;
  };

  const pathParts = loc.url.pathname.split('/').filter(p => p);
  const supportedLocales = ['en', 'pl', 'sv', 'de', 'es', 'fr', 'it', 'nl', 'pt', 'vi', 'tr', 'ru', 'fa', 'th', 'ja', 'zh'];
  const locale = pathParts[0] && supportedLocales.includes(pathParts[0]) ? pathParts[0] : 'en';
  const mathCalcPath = locale === 'en' ? '/calculators/math-calculators' : `/${locale}/calculators/math-calculators`;
  
  // Get calculator name and description for WebApplication schema
  const calculatorName = t('calculators.complex-numbers.title');
  const calculatorDescription = t('calculators.complex-numbers.seo.description');
  
  // Add WebApplication schema JSON-LD to head
  useVisibleTask$(() => {
    const webAppSchema = getWebAppSchema(locale, loc.url.href, calculatorName, calculatorDescription);
    
    const existingWebAppScript = document.querySelector('script[data-webapp-schema]');
    if (existingWebAppScript) {
      existingWebAppScript.remove();
    }
    
    const webAppScript = document.createElement('script');
    webAppScript.type = 'application/ld+json';
    webAppScript.setAttribute('data-webapp-schema', 'true');
    webAppScript.textContent = JSON.stringify(webAppSchema);
    document.head.appendChild(webAppScript);
  });

  return (
    <div class="calculator-page">
      <div class="page-background">
        <div class="bg-gradient"></div>
      </div>

      <div class="container">
        <div class="calculator-header">
          <Link href={mathCalcPath} class="back-button">
            <svg class="back-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{t('common.back')}</span>
          </Link>
          <div class="header-content">
            <div class="title-badge">{t('calculators.complexNumbers.badge')}</div>
            <h1 class="page-title">{t('calculators.complexNumbers.title')}</h1>
            <p class="page-description">{t('calculators.complexNumbers.description')}</p>
          </div>
        </div>

        <div class="calculator-container">
          <div class="calculator-card">
            <div class="input-section">
              <div class="operation-selector">
                <button 
                  onClick$={() => operation.value = 'add'}
                  class={`mode-button ${operation.value === 'add' ? 'active' : ''}`}
                >
                  +
                </button>
                <button 
                  onClick$={() => operation.value = 'subtract'}
                  class={`mode-button ${operation.value === 'subtract' ? 'active' : ''}`}
                >
                  −
                </button>
                <button 
                  onClick$={() => operation.value = 'multiply'}
                  class={`mode-button ${operation.value === 'multiply' ? 'active' : ''}`}
                >
                  ×
                </button>
                <button 
                  onClick$={() => operation.value = 'divide'}
                  class={`mode-button ${operation.value === 'divide' ? 'active' : ''}`}
                >
                  ÷
                </button>
              </div>

              <div class="complex-inputs">
                <div class="complex-number-group">
                  <label class="complex-label">{t('calculators.complexNumbers.number1')}</label>
                  <div class="complex-input-row">
                    <input
                      type="number"
                      class="number-input"
                      placeholder={t('calculators.complexNumbers.real')}
                      value={real1.value ?? ''}
                      onInput$={(e) => {
                        const target = e.target as HTMLInputElement;
                        real1.value = target.value ? parseFloat(target.value) : null;
                      }}
                      step="any"
                    />
                    <span class="complex-plus">+</span>
                    <input
                      type="number"
                      class="number-input"
                      placeholder={t('calculators.complexNumbers.imaginary')}
                      value={imag1.value ?? ''}
                      onInput$={(e) => {
                        const target = e.target as HTMLInputElement;
                        imag1.value = target.value ? parseFloat(target.value) : null;
                      }}
                      step="any"
                    />
                    <span class="complex-i">i</span>
                  </div>
                </div>

                <div class="complex-number-group">
                  <label class="complex-label">{t('calculators.complexNumbers.number2')}</label>
                  <div class="complex-input-row">
                    <input
                      type="number"
                      class="number-input"
                      placeholder={t('calculators.complexNumbers.real')}
                      value={real2.value ?? ''}
                      onInput$={(e) => {
                        const target = e.target as HTMLInputElement;
                        real2.value = target.value ? parseFloat(target.value) : null;
                      }}
                      step="any"
                    />
                    <span class="complex-plus">+</span>
                    <input
                      type="number"
                      class="number-input"
                      placeholder={t('calculators.complexNumbers.imaginary')}
                      value={imag2.value ?? ''}
                      onInput$={(e) => {
                        const target = e.target as HTMLInputElement;
                        imag2.value = target.value ? parseFloat(target.value) : null;
                      }}
                      step="any"
                    />
                    <span class="complex-i">i</span>
                  </div>
                </div>
              </div>

              {error.value && (
                <div class="error-message">
                  <svg class="error-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <span>{error.value}</span>
                </div>
              )}

              <div class="action-buttons">
                <button onClick$={calculate} class="btn btn-primary" disabled={!canCalculate.value}>
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{t('common.calculate')}</span>
                </button>
                <button onClick$={clear} class="btn btn-secondary">
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{t('common.clear')}</span>
                </button>
              </div>
            </div>

            {result.value !== null && (
              <div class="result-section">
                <div class="result-header">
                  <div class="result-badge">
                    <svg class="result-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    {t('calculators.complexNumbers.result')}
                  </div>
                </div>

                <div class="result-display">
                  <div class="result-formula-large">
                    <div class="result-value-box-large">
                      <span class="result-value-large">{formatComplex(result.value.real, result.value.imag)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div class="seo-content-section">
            <div class="seo-content-card">
              <h2 class="seo-heading">{t('calculators.complexNumbers.seo.content.heading')}</h2>

              <div class="seo-paragraphs">
                <p class="seo-paragraph">
                  {t('calculators.complexNumbers.seo.content.paragraph1')}
                </p>

                <p class="seo-paragraph">
                  {t('calculators.complexNumbers.seo.content.paragraph2')}
                </p>

                <p class="seo-paragraph">
                  {t('calculators.complexNumbers.seo.content.paragraph3')}
                </p>

                <div class="seo-example">
                  <h3 class="example-heading">{t('calculators.complexNumbers.seo.content.exampleHeading')}</h3>
                  <p class="example-text">{t('calculators.complexNumbers.seo.content.exampleText')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const t = resolveValue(useTranslate);
  return {
    title: t('calculators.complexNumbers.seo.title'),
    meta: [
      {
        name: 'description',
        content: t('calculators.complexNumbers.seo.description'),
      },
      {
        name: 'keywords',
        content: t('calculators.complexNumbers.seo.keywords'),
      },
    ],
  };
};

