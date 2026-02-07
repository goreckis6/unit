import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { Link, useLocation, type DocumentHead } from '@builder.io/qwik-city';
import { useTranslate } from '../i18n-qwik/useTranslate';

export default component$(() => {
  const firstNumber = useSignal<number | null>(null);
  const secondNumber = useSignal<number | null>(null);
  const result = useSignal<{ ratio: string; simplified: string } | null>(null);
  const error = useSignal<string | null>(null);
  const loc = useLocation();
  const t = useTranslate();
  
  const canCalculate = useSignal(false);
  
  useTask$(({ track }) => {
    track(() => firstNumber.value);
    track(() => secondNumber.value);
    canCalculate.value = 
      firstNumber.value !== null && firstNumber.value !== '' &&
      secondNumber.value !== null && secondNumber.value !== '' && secondNumber.value !== 0;
  });
  
  const gcd = (a: number, b: number): number => {
    a = Math.abs(a);
    b = Math.abs(b);
    return b === 0 ? a : gcd(b, a % b);
  };
  
  const calculate = $(() => {
    error.value = null;
    result.value = null;
    
    if (!canCalculate.value) {
      return;
    }
    
    const a = parseFloat(String(firstNumber.value)) || 0;
    const b = parseFloat(String(secondNumber.value)) || 0;
    
    if (isNaN(a) || isNaN(b)) {
      error.value = t('calculators.ratio.error.invalidInput');
      return;
    }
    
    if (b === 0) {
      error.value = t('calculators.ratio.error.divideByZero');
      result.value = null;
      return;
    }
    
    try {
      const divisor = gcd(a, b);
      const simplifiedA = a / divisor;
      const simplifiedB = b / divisor;
      
      result.value = {
        ratio: `${a}:${b}`,
        simplified: `${simplifiedA}:${simplifiedB}`
      };
    } catch (e) {
      error.value = t('calculators.ratio.error.calculationError');
    }
  });
  
  const clear = $(() => {
    firstNumber.value = null;
    secondNumber.value = null;
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
            <div class="title-badge">{t('calculators.ratio.badge')}</div>
            <h1 class="page-title">{t('calculators.ratio.title')}</h1>
            <p class="page-description">{t('calculators.ratio.description')}</p>
          </div>
        </div>
        
        <div class="calculator-container">
          <div class="calculator-card">
            <div class="input-section">
              <div class="addition-row">
                <div class="number-card">
                  <div class="number-card-header">
                    <div class="number-badge">a</div>
                    <label class="number-label">{t('calculators.ratio.firstNumber')}</label>
                  </div>
                  <input
                    type="number"
                    class="number-input-large"
                    placeholder={t('calculators.ratio.enterFirstNumber')}
                    value={firstNumber.value ?? ''}
                    onInput$={(e) => {
                      const target = e.target as HTMLInputElement;
                      firstNumber.value = target.value ? parseFloat(target.value) : null;
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
                  <div class="operator-symbol">:</div>
                </div>
                
                <div class="number-card">
                  <div class="number-card-header">
                    <div class="number-badge">b</div>
                    <label class="number-label">{t('calculators.ratio.secondNumber')}</label>
                  </div>
                  <input
                    type="number"
                    class="number-input-large"
                    placeholder={t('calculators.ratio.enterSecondNumber')}
                    value={secondNumber.value ?? ''}
                    onInput$={(e) => {
                      const target = e.target as HTMLInputElement;
                      secondNumber.value = target.value ? parseFloat(target.value) : null;
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
              
              {error.value && (
                <div class="error-message">
                  <svg class="error-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
            
            {result.value !== null && !error.value && (
              <div class="result-section">
                <div class="result-header">
                  <div class="result-badge">
                    <svg class="result-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    {t('calculators.ratio.result')}
                  </div>
                </div>
                
                <div class="result-display">
                  <div class="result-formula-large">
                    <div class="formula-number-box">
                      <span class="formula-number-value">{result.value.ratio}</span>
                    </div>
                    <div class="formula-equals-box">
                      <span class="formula-equals-symbol">=</span>
                    </div>
                    <div class="result-value-box-large">
                      <span class="result-value-large">{result.value.simplified}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div class="seo-content-section">
            <div class="seo-content-card">
              <h2 class="seo-heading">{t('calculators.ratio.seo.content.heading')}</h2>
              
              <div class="seo-paragraphs">
                <p class="seo-paragraph">
                  {t('calculators.ratio.seo.content.paragraph1')}
                </p>
                
                <p class="seo-paragraph">
                  {t('calculators.ratio.seo.content.paragraph2')}
                </p>
                
                <p class="seo-paragraph">
                  {t('calculators.ratio.seo.content.paragraph3')}
                </p>
                
                <div class="seo-example">
                  <h3 class="example-heading">{t('calculators.ratio.seo.content.exampleHeading')}</h3>
                  <p class="example-text">{t('calculators.ratio.seo.content.exampleText')}</p>
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
    title: t('calculators.ratio.seo.title'),
    meta: [
      {
        name: 'description',
        content: t('calculators.ratio.seo.description'),
      },
      {
        name: 'keywords',
        content: t('calculators.ratio.seo.keywords'),
      },
    ],
  };
};
