import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { Link, useLocation, type DocumentHead } from '@builder.io/qwik-city';
import { useTranslate } from '../i18n-qwik/useTranslate';

export default component$(() => {
  const t = useTranslate();
  const loc = useLocation();

  const inputValue = useSignal<string>('');
  const result = useSignal<{ scientific: string; decimal: number } | null>(null);
  const error = useSignal<string>('');

  const canCalculate = useSignal(false);

  useTask$(({ track }) => {
    track(() => inputValue.value);
    canCalculate.value = inputValue.value !== null && inputValue.value !== '';
  });

  const calculate = $(() => {
    error.value = '';
    result.value = null;

    if (!canCalculate.value) {
      error.value = t('calculators.scientificNotation.error.invalidInput');
      return;
    }

    const input = inputValue.value.trim();
    
    // Check if input is already in scientific notation (e.g., "1.23e5" or "1.23E5")
    const scientificNotationRegex = /^([+-]?\d*\.?\d+)[eE]([+-]?\d+)$/;
    const scientificMatch = input.match(scientificNotationRegex);

    if (scientificMatch) {
      // Convert from scientific notation to decimal
      const coefficient = parseFloat(scientificMatch[1]);
      const exponent = parseInt(scientificMatch[2]);
      const decimal = coefficient * Math.pow(10, exponent);
      
      if (!isFinite(decimal)) {
        error.value = t('calculators.scientificNotation.error.numberTooLarge');
        return;
      }

      result.value = {
        scientific: input,
        decimal
      };
    } else {
      // Convert from decimal to scientific notation
      const decimal = parseFloat(input);
      
      if (isNaN(decimal)) {
        error.value = t('calculators.scientificNotation.error.invalidInput');
        return;
      }

      if (!isFinite(decimal)) {
        error.value = t('calculators.scientificNotation.error.numberTooLarge');
        return;
      }

      const scientific = decimal.toExponential();
      result.value = {
        scientific,
        decimal
      };
    }
  });

  const clear = $(() => {
    inputValue.value = '';
    result.value = null;
    error.value = '';
  });

  const formatNumber = (value: number): string => {
    if (Math.abs(value) >= 1e15 || (Math.abs(value) < 1e-6 && value !== 0)) {
      return value.toExponential(6);
    }
    if (Math.abs(value) >= 1000) {
      return value.toLocaleString('en-US', { maximumFractionDigits: 10 });
    }
    return value.toString();
  };

  const pathParts = loc.url.pathname.split('/').filter(p => p);
  const supportedLocales = ['en', 'pl', 'sv', 'de', 'es', 'fr', 'it', 'nl', 'pt', 'vi', 'tr', 'ru', 'fa', 'th', 'ja', 'zh'];
  const locale = pathParts[0] && supportedLocales.includes(pathParts[0]) ? pathParts[0] : 'en';
  const mathCalcPath = locale === 'en' ? '/calculators/math-calculators' : `/${locale}/calculators/math-calculators`;

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
            <div class="title-badge">{t('calculators.scientificNotation.badge')}</div>
            <h1 class="page-title">{t('calculators.scientificNotation.title')}</h1>
            <p class="page-description">{t('calculators.scientificNotation.description')}</p>
          </div>
        </div>

        <div class="calculator-container">
          <div class="calculator-card">
            <div class="input-section">
              <div class="input-card">
                <label class="input-label">{t('calculators.scientificNotation.inputLabel')}</label>
                <div class="input-wrapper">
                  <input
                    type="text"
                    class="number-input"
                    placeholder={t('calculators.scientificNotation.placeholder')}
                    value={inputValue.value}
                    onInput$={(e) => {
                      const target = e.target as HTMLInputElement;
                      inputValue.value = target.value;
                    }}
                    onKeyUp$={(e) => {
                      if (e.key === 'Enter') {
                        calculate();
                      }
                    }}
                  />
                </div>
                <p class="input-hint">{t('calculators.scientificNotation.hint')}</p>
              </div>

              <div class="action-buttons">
                <button onClick$={calculate} class="btn btn-primary" disabled={!canCalculate.value}>
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{t('calculators.scientificNotation.convert')}</span>
                </button>
                <button onClick$={clear} class="btn btn-secondary">
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{t('common.clear')}</span>
                </button>
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

            {result.value !== null && (
              <div class="result-section">
                <div class="result-header">
                  <div class="result-badge">
                    <svg class="result-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    {t('calculators.scientificNotation.result')}
                  </div>
                </div>

                <div class="result-display">
                  <div class="info-section">
                    <div class="info-card">
                      <div class="info-item">
                        <span class="info-label">{t('calculators.scientificNotation.scientificNotation')}:</span>
                        <span class="info-value">{result.value.scientific}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">{t('calculators.scientificNotation.decimal')}:</span>
                        <span class="info-value">{formatNumber(result.value.decimal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div class="seo-content-section">
            <div class="seo-content-card">
              <h2 class="seo-heading">{t('calculators.scientificNotation.seo.content.heading')}</h2>

              <div class="seo-paragraphs">
                <p class="seo-paragraph">
                  {t('calculators.scientificNotation.seo.content.paragraph1')}
                </p>

                <p class="seo-paragraph">
                  {t('calculators.scientificNotation.seo.content.paragraph2')}
                </p>

                <p class="seo-paragraph">
                  {t('calculators.scientificNotation.seo.content.paragraph3')}
                </p>

                <div class="seo-example">
                  <h3 class="example-heading">{t('calculators.scientificNotation.seo.content.exampleHeading')}</h3>
                  <p class="example-text">{t('calculators.scientificNotation.seo.content.exampleText')}</p>
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
    title: t('calculators.scientificNotation.seo.title'),
    meta: [
      {
        name: 'description',
        content: t('calculators.scientificNotation.seo.description'),
      },
      {
        name: 'keywords',
        content: t('calculators.scientificNotation.seo.keywords'),
      },
    ],
  };
};


