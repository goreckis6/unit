import { component$, useSignal, useTask$, useVisibleTask$, $ } from '@builder.io/qwik';
import { Link, useLocation, type DocumentHead } from '@builder.io/qwik-city';
import { useTranslate } from '../i18n-qwik/useTranslate';
import { getWebAppSchema } from '../utils/webAppSchema';

export default component$(() => {
  const inputValue = useSignal<number | null>(null);
  const result = useSignal<{ isPrime: boolean; factors: number[] } | null>(null);
  const error = useSignal<string | null>(null);
  const loc = useLocation();
  const t = useTranslate();
  
  const canCalculate = useSignal(false);
  
  useTask$(({ track }) => {
    track(() => inputValue.value);
    canCalculate.value = inputValue.value !== null && inputValue.value !== '' && inputValue.value >= 2;
  });
  
  const isPrime = (num: number): boolean => {
    if (num < 2) return false;
    if (num === 2) return true;
    if (num % 2 === 0) return false;
    
    for (let i = 3; i * i <= num; i += 2) {
      if (num % i === 0) return false;
    }
    return true;
  };
  
  const getFactors = (num: number): number[] => {
    const factors: number[] = [];
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) {
        factors.push(i);
        if (i !== num / i) {
          factors.push(num / i);
        }
      }
    }
    return factors.sort((a, b) => a - b);
  };
  
  const calculate = $(() => {
    error.value = null;
    result.value = null;
    
    if (!canCalculate.value) {
      return;
    }
    
    const num = parseFloat(String(inputValue.value)) || 0;
    const intNum = Math.floor(num);
    
    if (isNaN(num)) {
      error.value = t('calculators.primeNumber.error.invalidInput');
      return;
    }
    
    if (intNum < 2) {
      error.value = t('calculators.primeNumber.error.numberTooSmall');
      result.value = null;
      return;
    }
    
    if (intNum !== num) {
      error.value = t('calculators.primeNumber.error.mustBeInteger');
      result.value = null;
      return;
    }
    
    try {
      const prime = isPrime(intNum);
      const factors = prime ? [] : getFactors(intNum);
      
      result.value = {
        isPrime: prime,
        factors
      };
    } catch (e) {
      error.value = t('calculators.primeNumber.error.calculationError');
    }
  });
  
  const clear = $(() => {
    inputValue.value = null;
    result.value = null;
    error.value = null;
  });
  
  const formatNumber = (value: number | null): string => {
    if (value === null || value === undefined || value === '') return '0';
    const num = parseFloat(String(value)) || 0;
    if (Math.abs(num) >= 1000) {
      return num.toLocaleString('en-US', { maximumFractionDigits: 10 });
    }
    return num.toString();
  };
  
  const pathParts = loc.url.pathname.split('/').filter(p => p);
  const supportedLocales = ['en', 'pl', 'sv', 'de', 'es', 'fr', 'it', 'nl', 'pt', 'vi', 'tr', 'ru', 'fa', 'th', 'ja', 'zh'];
  const locale = pathParts[0] && supportedLocales.includes(pathParts[0]) ? pathParts[0] : 'en';
  const mathCalcPath = locale === 'en' ? '/calculators/math-calculators' : `/${locale}/calculators/math-calculators`;
  
  // Get calculator name and description for WebApplication schema
  const calculatorName = t('calculators.prime-number.title');
  const calculatorDescription = t('calculators.prime-number.seo.description');
  
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
            <div class="title-badge">{t('calculators.primeNumber.badge')}</div>
            <h1 class="page-title">{t('calculators.primeNumber.title')}</h1>
            <p class="page-description">{t('calculators.primeNumber.description')}</p>
          </div>
        </div>
        
        <div class="calculator-container">
          <div class="calculator-card">
            <div class="input-section">
              <div class="input-card">
                <label class="input-label">{t('calculators.primeNumber.inputLabel')}</label>
                <div class="input-wrapper">
                  <input
                    type="number"
                    class="number-input"
                    placeholder={t('calculators.primeNumber.placeholder')}
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
                    step="1"
                    min="2"
                  />
                </div>
              </div>

              <div class="action-buttons">
                <button onClick$={calculate} class="btn btn-primary" disabled={!canCalculate.value}>
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{t('calculators.primeNumber.check')}</span>
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

            {result.value !== null && !error.value && (
              <div class="result-section">
                <div class="result-header">
                  <div class="result-badge">
                    <svg class="result-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    {t('calculators.primeNumber.result')}
                  </div>
                </div>

                <div class="result-display">
                  <div class="result-formula-large">
                    <div class="result-value-box-large">
                      <span class="result-value-large">
                        {formatNumber(inputValue.value)} {result.value.isPrime ? t('calculators.primeNumber.isPrime') : t('calculators.primeNumber.isNotPrime')}
                      </span>
                    </div>
                  </div>
                  {!result.value.isPrime && result.value.factors.length > 0 && (
                    <div class="info-section">
                      <div class="info-card">
                        <div class="info-item">
                          <span class="info-label">{t('calculators.primeNumber.factors')}:</span>
                          <span class="info-value">{result.value.factors.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div class="seo-content-section">
            <div class="seo-content-card">
              <h2 class="seo-heading">{t('calculators.primeNumber.seo.content.heading')}</h2>
              
              <div class="seo-paragraphs">
                <p class="seo-paragraph">
                  {t('calculators.primeNumber.seo.content.paragraph1')}
                </p>
                
                <p class="seo-paragraph">
                  {t('calculators.primeNumber.seo.content.paragraph2')}
                </p>
                
                <p class="seo-paragraph">
                  {t('calculators.primeNumber.seo.content.paragraph3')}
                </p>
                
                <div class="seo-example">
                  <h3 class="example-heading">{t('calculators.primeNumber.seo.content.exampleHeading')}</h3>
                  <p class="example-text">{t('calculators.primeNumber.seo.content.exampleText')}</p>
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
    title: t('calculators.primeNumber.seo.title'),
    meta: [
      {
        name: 'description',
        content: t('calculators.primeNumber.seo.description'),
      },
      {
        name: 'keywords',
        content: t('calculators.primeNumber.seo.keywords'),
      },
    ],
  };
};

