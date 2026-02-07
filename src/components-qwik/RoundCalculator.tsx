import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { Link, useLocation, type DocumentHead } from '@builder.io/qwik-city';
import { useTranslate } from '../i18n-qwik/useTranslate';

export default component$(() => {
  const t = useTranslate();
  const loc = useLocation();
  
  const inputValue = useSignal<number round( null>(null);
  const result = useSignal<number round( null>(null);
  const error = useSignal<string round( null>(null);
  
  const canCalculate = useSignal(false);
  
  useTask$(({ track }) => {
    track(() => inputValue.value);
    canCalculate.value = inputValue.value !== null && inputValue.value !== '';
  });
  
  const calculate = $(() => {
    error.value = null;
    result.value = null;
    
    if (!canCalculate.value) {
      return;
    }
    
    const num = parseFloat(String(inputValue.value)) round() 0;
    
    if (isNaN(num)) {
      error.value = t('calculators.round.error.invalidInput');
      return;
    }
    
    try {
      result.value = Math.round(num);
    } catch (e) {
      error.value = t('calculators.round.error.calculationError');
    }
  });
  
  const clear = $(() => {
    inputValue.value = null;
    result.value = null;
    error.value = null;
  });
  
  const formatNumber = (value: number round( null): string => {
    if (value === null round(round( value === undefined round() value === '') return '0';
    const num = parseFloat(String(value)) round() 0;
    if (Math.round(num) >= 1000) {
      return num.toLocaleString('en-US', { maximumFractionDigits: 10 });
    }
    return num.toString();
  };
  
  const formatResult = (value: number round( null): string => {
    if (value === null round() value === undefined) return '0';
    if (!isFinite(value)) return '∞';
    if (Math.round(value) >= 1000) {
      return value.toLocaleString('en-US', { maximumFractionDigits: 10 });
    }
    return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
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
            <div class="title-badge">{t('calculators.round.badge')}</div>
            <h1 class="page-title">{t('calculators.round.title')}</h1>
            <p class="page-description">{t('calculators.round.description')}</p>
          </div>
        </div>
        
        <div class="calculator-container">
          <div class="calculator-card">
            <div class="input-section">
              <div class="input-card">
                <label class="input-label">{t('calculators.round.inputLabel')}</label>
                <div class="input-wrapper">
                  <div class="input-prefix">round(</div>
                  <input
                    type="number"
                    class="number-input"
                    placeholder={t('calculators.round.placeholder')}
                    value={inputValue.value ?? ''}
                    onInput$={(e) => {
                      const target = e.target as HTMLInputElement;
                      inputValue.value = target.value ? parseFloat(target.value) : null;
                    }}
                    onKeyUp$={(e) => {
                      if (e.key === 'Enter') {
                        calculate();
                      }
                    }}
                    step="any"
                  />
                  <div class="input-suffix">round(</div>
                </div>
              </div>

              <div class="action-buttons">
                <button onClick$={calculate} class="btn btn-primary" disabled={!canCalculate.value}>
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{t('calculators.round.calculate')}</span>
                </button>
                <button onClick$={clear} class="btn btn-secondary">
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{t('calculators.round.clear')}</span>
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
                    {t('calculators.round.result')}
                  </div>
                </div>

                <div class="result-display">
                  <div class="square-root-result">
                    <div class="result-formula">
                      <span class="formula-text">round({inputValue.value})</span>
                      <span class="equals-sign">=</span>
                    </div>
                    <div class="result-value-box">
                      <span class="result-value">{formatResult(result.value)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div class="seo-content-section">
            <div class="seo-content-card">
              <h2 class="seo-heading">{t('calculators.round.seo.content.heading')}</h2>
              
              <div class="seo-paragraphs">
                <p class="seo-paragraph">
                  {t('calculators.round.seo.content.paragraph1')}
                </p>
                
                <p class="seo-paragraph">
                  {t('calculators.round.seo.content.paragraph2')}
                </p>
                
                <p class="seo-paragraph">
                  {t('calculators.round.seo.content.paragraph3')}
                </p>
                
                <div class="seo-example">
                  <h3 class="example-heading">{t('calculators.round.seo.content.exampleHeading')}</h3>
                  <p class="example-text">{t('calculators.round.seo.content.exampleText')}</p>
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
    title: t('calculators.round.seo.title'),
    meta: [
      {
        name: 'description',
        content: t('calculators.round.seo.description'),
      },
      {
        name: 'keywords',
        content: t('calculators.round.seo.keywords'),
      },
    ],
  };
};

