import { component$, useSignal, useTask$, useVisibleTask$, $ } from '@builder.io/qwik';
import { Link, useLocation, type DocumentHead } from '@builder.io/qwik-city';
import { useTranslate } from '../i18n-qwik/useTranslate';
import { getWebAppSchema } from '../utils/webAppSchema';

export default component$(() => {
  const t = useTranslate();
  const loc = useLocation();

  const valuesInput = useSignal<string>('');
  const weightsInput = useSignal<string>('');
  const values = useSignal<number[]>([]);
  const weights = useSignal<number[]>([]);
  const result = useSignal<number | null>(null);
  const errorMessage = useSignal<string | null>(null);

  const canCalculate = useSignal(false);

  useTask$(({ track }) => {
    track(() => values.value);
    track(() => weights.value);
    canCalculate.value = values.value.length > 0 && 
                         weights.value.length > 0 && 
                         values.value.length === weights.value.length;
  });

  const parseNumbers = $(() => {
    errorMessage.value = null;
    
    // Parse values
    const valuesStr = valuesInput.value;
    const parsedValues = valuesStr
      .split(/[\s,]+/)
      .filter(s => s.trim() !== '')
      .map(s => parseFloat(s.trim()));

    if (parsedValues.some(isNaN)) {
      errorMessage.value = t('calculators.weightedAverage.error.invalidValues');
      values.value = [];
      return;
    }
    values.value = parsedValues;

    // Parse weights
    const weightsStr = weightsInput.value;
    const parsedWeights = weightsStr
      .split(/[\s,]+/)
      .filter(s => s.trim() !== '')
      .map(s => parseFloat(s.trim()));

    if (parsedWeights.some(isNaN)) {
      errorMessage.value = t('calculators.weightedAverage.error.invalidWeights');
      weights.value = [];
      return;
    }
    
    if (parsedWeights.some(w => w < 0)) {
      errorMessage.value = t('calculators.weightedAverage.error.negativeWeights');
      weights.value = [];
      return;
    }
    
    weights.value = parsedWeights;

    // Check if lengths match
    if (parsedValues.length !== parsedWeights.length) {
      errorMessage.value = t('calculators.weightedAverage.error.lengthMismatch');
    }
  });

  const calculate = $(() => {
    errorMessage.value = null;
    result.value = null;

    if (!canCalculate.value) {
      errorMessage.value = t('calculators.weightedAverage.error.noData');
      return;
    }

    if (values.value.length === 0 || weights.value.length === 0) {
      errorMessage.value = t('calculators.weightedAverage.error.noData');
      return;
    }

    if (values.value.length !== weights.value.length) {
      errorMessage.value = t('calculators.weightedAverage.error.lengthMismatch');
      return;
    }

    const sumWeights = weights.value.reduce((acc, w) => acc + w, 0);
    if (sumWeights === 0) {
      errorMessage.value = t('calculators.weightedAverage.error.zeroSumWeights');
      return;
    }

    const weightedSum = values.value.reduce((acc, val, idx) => acc + val * weights.value[idx], 0);
    result.value = weightedSum / sumWeights;
  });

  const clear = $(() => {
    valuesInput.value = '';
    weightsInput.value = '';
    values.value = [];
    weights.value = [];
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
  
  // Get calculator name and description for WebApplication schema
  const calculatorName = t('calculators.weighted-average.title');
  const calculatorDescription = t('calculators.weighted-average.seo.description');
  
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
            <div class="title-badge">{t('calculators.weightedAverage.badge')}</div>
            <h1 class="page-title">{t('calculators.weightedAverage.title')}</h1>
            <p class="page-description">{t('calculators.weightedAverage.description')}</p>
          </div>
        </div>

        <div class="calculator-container">
          <div class="calculator-card">
            <div class="input-section">
              <div class="input-wrapper-large">
                <label class="input-label-large">{t('calculators.weightedAverage.values')}</label>
                <textarea
                  class="numbers-textarea"
                  placeholder={t('calculators.weightedAverage.valuesPlaceholder')}
                  value={valuesInput.value}
                  onInput$={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    valuesInput.value = target.value;
                    parseNumbers();
                  }}
                  onKeyUp$={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      calculate();
                    }
                  }}
                  rows={3}
                ></textarea>
                <p class="input-hint">{t('calculators.weightedAverage.valuesHint')}</p>
              </div>

              <div class="input-wrapper-large">
                <label class="input-label-large">{t('calculators.weightedAverage.weights')}</label>
                <textarea
                  class="numbers-textarea"
                  placeholder={t('calculators.weightedAverage.weightsPlaceholder')}
                  value={weightsInput.value}
                  onInput$={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    weightsInput.value = target.value;
                    parseNumbers();
                  }}
                  onKeyUp$={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      calculate();
                    }
                  }}
                  rows={3}
                ></textarea>
                <p class="input-hint">{t('calculators.weightedAverage.weightsHint')}</p>
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
                    {t('calculators.weightedAverage.result')}
                  </div>
                </div>

                <div class="result-display">
                  <div class="result-formula-large">
                    <div class="result-value-box-large">
                      <span class="result-value-large">{formatResult(result.value)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div class="seo-content-section">
            <div class="seo-content-card">
              <h2 class="seo-heading">{t('calculators.weightedAverage.seo.content.heading')}</h2>

              <div class="seo-paragraphs">
                <p class="seo-paragraph">
                  {t('calculators.weightedAverage.seo.content.paragraph1')}
                </p>

                <p class="seo-paragraph">
                  {t('calculators.weightedAverage.seo.content.paragraph2')}
                </p>

                <p class="seo-paragraph">
                  {t('calculators.weightedAverage.seo.content.paragraph3')}
                </p>

                <div class="seo-example">
                  <h3 class="example-heading">{t('calculators.weightedAverage.seo.content.exampleHeading')}</h3>
                  <p class="example-text">{t('calculators.weightedAverage.seo.content.exampleText')}</p>
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
    title: t('calculators.weightedAverage.seo.title'),
    meta: [
      {
        name: 'description',
        content: t('calculators.weightedAverage.seo.description'),
      },
      {
        name: 'keywords',
        content: t('calculators.weightedAverage.seo.keywords'),
      },
    ],
  };
};

