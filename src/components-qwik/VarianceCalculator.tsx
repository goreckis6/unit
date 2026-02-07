import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { Link, useLocation, type DocumentHead } from '@builder.io/qwik-city';
import { useTranslate } from '../i18n-qwik/useTranslate';

export default component$(() => {
  const t = useTranslate();
  const loc = useLocation();

  const numbersInput = useSignal<string>('');
  const numbers = useSignal<number[]>([]);
  const result = useSignal<{ mean: number; variance: number } | null>(null);
  const errorMessage = useSignal<string | null>(null);

  const canCalculate = useSignal(false);

  useTask$(({ track }) => {
    track(() => numbers.value);
    canCalculate.value = numbers.value.length > 1;
  });

  const parseNumbers = $(() => {
    errorMessage.value = null;
    const input = numbersInput.value;
    const parsedNumbers = input
      .split(/[\s,]+/)
      .filter(s => s.trim() !== '')
      .map(s => parseFloat(s.trim()));

    if (parsedNumbers.some(isNaN)) {
      errorMessage.value = t('calculators.variance.error.invalidInput');
      numbers.value = [];
      return;
    }
    numbers.value = parsedNumbers;
  });

  const calculate = $(() => {
    errorMessage.value = null;
    result.value = null;

    if (!canCalculate.value) {
      errorMessage.value = t('calculators.variance.error.needAtLeastTwo');
      return;
    }

    if (numbers.value.length < 2) {
      errorMessage.value = t('calculators.variance.error.needAtLeastTwo');
      return;
    }

    // Calculate mean
    const mean = numbers.value.reduce((acc, num) => acc + num, 0) / numbers.value.length;

    // Calculate variance
    const variance = numbers.value.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / numbers.value.length;

    result.value = {
      mean,
      variance
    };
  });

  const clear = $(() => {
    numbersInput.value = '';
    numbers.value = [];
    result.value = null;
    errorMessage.value = null;
  });

  const formatResult = (value: number | null): string => {
    if (value === null || value === undefined) return '0';
    if (isNaN(value) || !isFinite(value)) return 'Error';
    return parseFloat(value.toFixed(10)).toString();
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
            <div class="title-badge">{t('calculators.variance.badge')}</div>
            <h1 class="page-title">{t('calculators.variance.title')}</h1>
            <p class="page-description">{t('calculators.variance.description')}</p>
          </div>
        </div>

        <div class="calculator-container">
          <div class="calculator-card">
            <div class="input-section">
              <div class="input-wrapper-large">
                <label class="input-label-large">{t('calculators.variance.numbers')}</label>
                <textarea
                  class="numbers-textarea"
                  placeholder={t('calculators.variance.placeholder')}
                  value={numbersInput.value}
                  onInput$={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    numbersInput.value = target.value;
                    parseNumbers();
                  }}
                  onKeyUp$={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      calculate();
                    }
                  }}
                  rows={4}
                ></textarea>
                <p class="input-hint">{t('calculators.variance.hint')}</p>
              </div>

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

            {errorMessage.value && (
              <div class="error-message">
                <svg class="error-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>{errorMessage.value}</span>
              </div>
            )}

            {result.value !== null && !errorMessage.value && (
              <div class="result-section">
                <div class="result-header">
                  <div class="result-badge">
                    <svg class="result-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    {t('calculators.variance.result')}
                  </div>
                </div>

                <div class="result-display">
                  <div class="info-section">
                    <div class="info-card">
                      <div class="info-item">
                        <span class="info-label">{t('calculators.variance.mean')}:</span>
                        <span class="info-value">{formatResult(result.value.mean)}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">{t('calculators.variance.variance')}:</span>
                        <span class="info-value">{formatResult(result.value.variance)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div class="seo-content-section">
            <div class="seo-content-card">
              <h2 class="seo-heading">{t('calculators.variance.seo.content.heading')}</h2>

              <div class="seo-paragraphs">
                <p class="seo-paragraph">
                  {t('calculators.variance.seo.content.paragraph1')}
                </p>

                <p class="seo-paragraph">
                  {t('calculators.variance.seo.content.paragraph2')}
                </p>

                <p class="seo-paragraph">
                  {t('calculators.variance.seo.content.paragraph3')}
                </p>

                <div class="seo-example">
                  <h3 class="example-heading">{t('calculators.variance.seo.content.exampleHeading')}</h3>
                  <p class="example-text">{t('calculators.variance.seo.content.exampleText')}</p>
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
    title: t('calculators.variance.seo.title'),
    meta: [
      {
        name: 'description',
        content: t('calculators.variance.seo.description'),
      },
      {
        name: 'keywords',
        content: t('calculators.variance.seo.keywords'),
      },
    ],
  };
};

