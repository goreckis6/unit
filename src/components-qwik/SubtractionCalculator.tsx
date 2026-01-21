import { component$, useSignal, useTask$, useVisibleTask$, $ } from '@builder.io/qwik';
import { Link, useLocation, type DocumentHead } from '@builder.io/qwik-city';
import { useTranslate } from '../i18n-qwik/useTranslate';
import { getWebAppSchema } from '../utils/webAppSchema';

export default component$(() => {
  const number1 = useSignal<number | null>(null);
  const number2 = useSignal<number | null>(null);
  const result = useSignal<number | null>(null);
  const t = useTranslate();
  const loc = useLocation();
  
  const canCalculate = useSignal(false);
  
  useTask$(({ track }) => {
    track(() => number1.value);
    track(() => number2.value);
    canCalculate.value = 
      number1.value !== null && number1.value !== '' &&
      number2.value !== null && number2.value !== '';
  });
  
  const calculate = $(() => {
    if (!canCalculate.value) return;
    
    const num1 = parseFloat(String(number1.value)) || 0;
    const num2 = parseFloat(String(number2.value)) || 0;
    
    result.value = num1 - num2;
  });
  
  const clear = $(() => {
    number1.value = null;
    number2.value = null;
    result.value = null;
  });
  
  const formatNumber = (value: number | null): string => {
    if (value === null || value === undefined || value === '') return '0';
    const num = parseFloat(String(value)) || 0;
    if (Math.abs(num) >= 1000) {
      return num.toLocaleString('en-US', { maximumFractionDigits: 10 });
    }
    return num.toString();
  };
  
  const formatResult = (value: number | null): string => {
    if (value === null || value === undefined) return '0';
    if (Math.abs(value) >= 1000) {
      return value.toLocaleString('en-US', { maximumFractionDigits: 10 });
    }
    return value.toString();
  };
  
  const pathParts = loc.url.pathname.split('/').filter(p => p);
  const supportedLocales = ['en', 'pl', 'sv', 'de', 'es', 'fr', 'it', 'nl', 'pt', 'vi', 'tr', 'ru', 'fa', 'th', 'ja', 'zh'];
  const locale = pathParts[0] && supportedLocales.includes(pathParts[0]) ? pathParts[0] : 'en';
  const mathCalcPath = locale === 'en' ? '/calculators/math-calculators' : `/${locale}/calculators/math-calculators`;
  
  // Get calculator name and description for WebApplication schema
  const calculatorName = t('calculators.subtraction.title');
  const calculatorDescription = t('calculators.subtraction.seo.description');
  
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
            <div class="title-badge">{t('calculators.subtraction.badge')}</div>
            <h1 class="page-title">{t('calculators.subtraction.title')}</h1>
            <p class="page-description">{t('calculators.subtraction.description')}</p>
          </div>
        </div>
        
        <div class="calculator-container">
          <div class="calculator-card">
            <div class="input-section">
              <div class="subtraction-row">
                <div class="number-card">
                  <div class="number-card-header">
                    <div class="number-badge">1</div>
                    <label class="number-label">{t('calculators.subtraction.number1')}</label>
                  </div>
                  <input
                    type="number"
                    class="number-input-large"
                    placeholder={t('calculators.subtraction.enterNumber')}
                    value={number1.value ?? ''}
                    onInput$={(e) => {
                      const target = e.target as HTMLInputElement;
                      number1.value = target.value ? parseFloat(target.value) : null;
                    }}
                    onKeyUp$={(e) => {
                      if (e.key === 'Enter') {
                        calculate();
                      }
                    }}
                    step="any"
                  />
                </div>
                
                <div class="operator-card">
                  <div class="operator-symbol">−</div>
                </div>
                
                <div class="number-card">
                  <div class="number-card-header">
                    <div class="number-badge">2</div>
                    <label class="number-label">{t('calculators.subtraction.number2')}</label>
                  </div>
                  <input
                    type="number"
                    class="number-input-large"
                    placeholder={t('calculators.subtraction.enterNumber')}
                    value={number2.value ?? ''}
                    onInput$={(e) => {
                      const target = e.target as HTMLInputElement;
                      number2.value = target.value ? parseFloat(target.value) : null;
                    }}
                    onKeyUp$={(e) => {
                      if (e.key === 'Enter') {
                        calculate();
                      }
                    }}
                    step="any"
                  />
                </div>
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
            
            {result.value !== null && (
              <div class="result-section">
                <div class="result-header">
                  <div class="result-badge">
                    <svg class="result-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    {t('calculators.subtraction.result')}
                  </div>
                </div>
                
                <div class="result-display">
                  <div class="result-formula-large">
                    <div class="formula-number-box">
                      <span class="formula-number-value">{formatNumber(number1.value)}</span>
                    </div>
                    <div class="formula-operator-box">
                      <span class="formula-operator-symbol">−</span>
                    </div>
                    <div class="formula-number-box">
                      <span class="formula-number-value">{formatNumber(number2.value)}</span>
                    </div>
                    <div class="formula-equals-box">
                      <span class="formula-equals-symbol">=</span>
                    </div>
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
              <h2 class="seo-heading">{t('calculators.subtraction.info.title')}</h2>
              
              <div class="seo-paragraphs">
                <p class="seo-paragraph">
                  {t('calculators.subtraction.info.description')}
                </p>
                
                <div class="seo-example">
                  <h3 class="example-heading">{t('calculators.subtraction.info.example')}</h3>
                  <p class="example-text">{t('calculators.subtraction.info.exampleText')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Subtraction Calculator - Free Online Math Tool | Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'Free online subtraction calculator. Subtract two numbers instantly and accurately.',
    },
    {
      name: 'keywords',
      content: 'subtraction calculator, subtract numbers, math calculator',
    },
  ],
};
