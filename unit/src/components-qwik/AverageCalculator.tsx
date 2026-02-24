import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { Link, useLocation, type DocumentHead } from '@builder.io/qwik-city';
import { useTranslate } from '../i18n-qwik/useTranslate';

export default component$(() => {
  const numbers = useSignal<number[]>([]);
  const inputValue = useSignal<string>('');
  const result = useSignal<number | null>(null);
  const error = useSignal<string | null>(null);
  const loc = useLocation();
  const t = useTranslate();
  
  const canCalculate = useSignal(false);
  
  useTask$(({ track }) => {
    track(() => numbers.value);
    canCalculate.value = numbers.value.length > 0;
  });
  
  const addNumber = $(() => {
    error.value = null;
    const value = inputValue.value.trim();
    
    if (value === '') {
      return;
    }
    
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      error.value = t('calculators.average.error.invalidNumber');
      return;
    }
    
    numbers.value = [...numbers.value, num];
    inputValue.value = '';
    calculate();
  });
  
  const removeNumber = $((index: number) => {
    numbers.value = numbers.value.filter((_, i) => i !== index);
    calculate();
  });
  
  const calculate = $(() => {
    error.value = null;
    
    if (numbers.value.length === 0) {
      result.value = null;
      return;
    }
    
    try {
      const sum = numbers.value.reduce((acc, num) => acc + num, 0);
      const calculated = sum / numbers.value.length;
      
      if (!isFinite(calculated)) {
        error.value = t('calculators.average.error.invalidResult');
        return;
      }
      
      result.value = calculated;
    } catch (e) {
      error.value = t('calculators.average.error.calculationError');
    }
  });
  
  const clear = $(() => {
    numbers.value = [];
    inputValue.value = '';
    result.value = null;
    error.value = null;
  });
  
  const formatResult = (value: number | null): string => {
    if (value === null || value === undefined) return '0';
    if (!isFinite(value)) return 'Error';
    if (Math.abs(value) >= 1000) {
      return value.toLocaleString('en-US', { maximumFractionDigits: 10 });
    }
    const formatted = value.toFixed(10).replace(/\.?0+$/, '');
    return formatted;
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
            <div class="title-badge">{t('calculators.average.badge')}</div>
            <h1 class="page-title">{t('calculators.average.title')}</h1>
            <p class="page-description">{t('calculators.average.description')}</p>
          </div>
        </div>
        
        <div class="calculator-container">
          <div class="calculator-card">
            <div class="input-section">
              <div class="input-card">
                <label class="input-label">{t('calculators.average.inputLabel')}</label>
                <div class="input-wrapper">
                  <input
                    type="number"
                    class="number-input"
                    placeholder={t('calculators.average.placeholder')}
                    value={inputValue.value}
                    onInput$={(e) => {
                      const target = e.target as HTMLInputElement;
                      inputValue.value = target.value;
                      error.value = null;
                    }}
                    onKeyUp$={(e) => {
                      if (e.key === 'Enter') {
                        addNumber();
                      }
                    }}
                    step="any"
                  />
                  <button onClick$={addNumber} class="btn-add">
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
                
                {numbers.value.length > 0 && (
                  <div class="numbers-list">
                    {numbers.value.map((num, index) => (
                      <div key={index} class="number-tag">
                        <span class="tag-value">{num}</span>
                        <button onClick$={() => removeNumber(index)} class="tag-remove">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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

            {error.value && (
              <div class="error-message">
                <svg class="error-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
                    {t('calculators.average.result')}
                  </div>
                </div>
                
                <div class="result-display">
                  <div class="result-formula-large">
                    <div class="formula-number-box">
                      <span class="formula-number-value">
                        ({numbers.value.join(' + ')}) / {numbers.value.length}
                      </span>
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
              <h2 class="seo-heading">{t('calculators.average.seo.content.heading')}</h2>
              
              <div class="seo-paragraphs">
                <p class="seo-paragraph">
                  {t('calculators.average.seo.content.paragraph1')}
                </p>
                
                <p class="seo-paragraph">
                  {t('calculators.average.seo.content.paragraph2')}
                </p>
                
                <p class="seo-paragraph">
                  {t('calculators.average.seo.content.paragraph3')}
                </p>
                
                <div class="seo-example">
                  <h3 class="example-heading">{t('calculators.average.seo.content.exampleHeading')}</h3>
                  <p class="example-text">{t('calculators.average.seo.content.exampleText')}</p>
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
    title: t('calculators.average.seo.title'),
    meta: [
      {
        name: 'description',
        content: t('calculators.average.seo.description'),
      },
      {
        name: 'keywords',
        content: t('calculators.average.seo.keywords'),
      },
    ],
  };
};
