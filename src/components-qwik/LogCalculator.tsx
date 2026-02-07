import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { Link, useLocation, type DocumentHead } from '@builder.io/qwik-city';
import { useTranslate } from '../i18n-qwik/useTranslate';

export default component$(() => {
  const t = useTranslate();
  const loc = useLocation();
  
  const inputValue = useSignal<number | null>(null);
  const result = useSignal<number | null>(null);
  const error = useSignal<string>('');
  
  const canCalculate = useSignal(false);
  
  useTask$(({ track }) => {
    track(() => inputValue.value);
    canCalculate.value = inputValue.value !== null && inputValue.value !== '' && inputValue.value > 0;
  });
  
  const validateInput = $(() => {
    error.value = '';
    if (inputValue.value !== null && inputValue.value <= 0) {
      error.value = t('calculators.log.error.invalidInput');
    }
  });
  
  const calculate = $(() => {
    error.value = '';
    
    if (inputValue.value === null || inputValue.value === '') {
      error.value = t('calculators.log.error.invalidInput');
      return;
    }

    if (inputValue.value <= 0) {
      error.value = t('calculators.log.error.invalidInput');
      result.value = null;
      return;
    }

    // Log base 10: Math.log10(x)
    result.value = Math.log10(inputValue.value);
  });
  
  const clear = $(() => {
    inputValue.value = null;
    result.value = null;
    error.value = '';
  });
  
  const formatResult = (value: number | null): string => {
    if (value === null || value === undefined) return '0';
    if (Math.abs(value) > 1e10 || (Math.abs(value) < 1e-10 && value !== 0)) {
      return value.toExponential(6);
    }
    return value.toFixed(10);
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
            <div class="title-badge">{t('calculators.log.badge')}</div>
            <h1 class="page-title">{t('calculators.log.title')}</h1>
            <p class="page-description">{t('calculators.log.description')}</p>
          </div>
        </div>
        
        <div class="calculator-container">
          <div class="calculator-card">
            <div class="input-section">
              <div class="input-card">
                <label class="input-label">{t('calculators.log.inputLabel')}</label>
                <div class="input-wrapper">
                  <div class="input-prefix">log₁₀(</div>
                  <input
                    type="number"
                    class="number-input"
                    placeholder={t('calculators.log.placeholder')}
                    value={inputValue.value ?? ''}
                    onInput$={(e) => {
                      const target = e.target as HTMLInputElement;
                      inputValue.value = target.value ? parseFloat(target.value) : null;
                      validateInput();
                    }}
                    onKeyUp$={(e) => {
                      if (e.key === 'Enter') {
                        calculate();
                      }
                    }}
                    step="any"
                    min="0.0001"
                  />
                  <div class="input-suffix">)</div>
                </div>
              </div>

              <div class="action-buttons">
                <button onClick$={calculate} class="btn btn-primary" disabled={!canCalculate.value}>
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{t('calculators.log.calculate')}</span>
                </button>
                <button onClick$={clear} class="btn btn-secondary">
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{t('calculators.log.clear')}</span>
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
                    {t('calculators.log.result')}
                  </div>
                </div>

                <div class="result-display">
                  <div class="logarithm-result">
                    <div class="result-formula">
                      <span class="formula-text">log₁₀({inputValue.value})</span>
                      <span class="equals-sign">=</span>
                    </div>
                    <div class="result-value-box">
                      <span class="result-value">{formatResult(result.value)}</span>
                    </div>
                  </div>
                  {result.value !== null && (
                    <div class="result-exact">
                      <span class="exact-label">{t('calculators.log.approximate')}:</span>
                      <span class="exact-value">{result.value.toFixed(10)}</span>
                    </div>
                  )}
                </div>

                {result.value !== null && (
                  <div class="info-section">
                    <div class="info-card">
                      <div class="info-item">
                        <span class="info-label">{t('calculators.log.inputNumber')}:</span>
                        <span class="info-value">{inputValue.value}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">{t('calculators.log.resultNumber')}:</span>
                        <span class="info-value">{formatResult(result.value)}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">{t('calculators.log.exponential')}:</span>
                        <span class="info-value">10<sup>{formatResult(result.value)}</sup> ≈ {Math.pow(10, result.value!).toFixed(6)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div class="seo-content-section">
            <div class="seo-content-card">
              <h2 class="seo-heading">{t('calculators.log.seo.content.heading')}</h2>
              
              <div class="seo-paragraphs">
                <p class="seo-paragraph">
                  {t('calculators.log.seo.content.paragraph1')}
                </p>
                
                <p class="seo-paragraph">
                  {t('calculators.log.seo.content.paragraph2')}
                </p>
                
                <p class="seo-paragraph">
                  {t('calculators.log.seo.content.paragraph3')}
                </p>
                
                <div class="seo-example">
                  <h3 class="example-heading">{t('calculators.log.seo.content.exampleHeading')}</h3>
                  <p class="example-text">{t('calculators.log.seo.content.exampleText')}</p>
                </div>
                
                <p class="seo-paragraph">
                  {t('calculators.log.seo.content.paragraph4')}
                </p>
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
    title: t('calculators.log.seo.title'),
    meta: [
      {
        name: 'description',
        content: t('calculators.log.seo.description'),
      },
      {
        name: 'keywords',
        content: t('calculators.log.seo.keywords'),
      },
    ],
  };
};
