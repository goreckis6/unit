import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { Link, useLocation, type DocumentHead } from '@builder.io/qwik-city';
import { useTranslate } from '../i18n-qwik/useTranslate';

export default component$(() => {
  const sideA = useSignal<number | null>(null);
  const sideB = useSignal<number | null>(null);
  const sideC = useSignal<number | null>(null);
  const result = useSignal<{ value: number; side: string } | null>(null);
  const error = useSignal<string | null>(null);
  const loc = useLocation();
  const t = useTranslate();
  
  const canCalculate = useSignal(false);
  
  useTask$(({ track }) => {
    track(() => sideA.value);
    track(() => sideB.value);
    track(() => sideC.value);
    // Can calculate if exactly 2 sides are filled
    const filled = [sideA.value, sideB.value, sideC.value].filter(v => v !== null && v !== '').length;
    canCalculate.value = filled === 2;
  });
  
  const calculate = $(() => {
    error.value = null;
    result.value = null;
    
    if (!canCalculate.value) {
      return;
    }
    
    const a = sideA.value !== null && sideA.value !== '' ? parseFloat(String(sideA.value)) : null;
    const b = sideB.value !== null && sideB.value !== '' ? parseFloat(String(sideB.value)) : null;
    const c = sideC.value !== null && sideC.value !== '' ? parseFloat(String(sideC.value)) : null;
    
    const filled = [a, b, c].filter(v => v !== null);
    if (filled.length !== 2) {
      error.value = t('calculators.pythagoreanTheorem.error.exactlyTwoSides');
      return;
    }
    
    try {
      // Pythagorean theorem: a² + b² = c²
      if (a !== null && b !== null && c === null) {
        // Calculate c
        const calculated = Math.sqrt(a * a + b * b);
        if (!isFinite(calculated)) {
          error.value = t('calculators.pythagoreanTheorem.error.invalidResult');
          return;
        }
        result.value = { value: calculated, side: 'c' };
        sideC.value = calculated;
      } else if (a !== null && c !== null && b === null) {
        // Calculate b
        if (c <= a) {
          error.value = t('calculators.pythagoreanTheorem.error.sideTooShort');
          return;
        }
        const calculated = Math.sqrt(c * c - a * a);
        if (!isFinite(calculated)) {
          error.value = t('calculators.pythagoreanTheorem.error.invalidResult');
          return;
        }
        result.value = { value: calculated, side: 'b' };
        sideB.value = calculated;
      } else if (b !== null && c !== null && a === null) {
        // Calculate a
        if (c <= b) {
          error.value = t('calculators.pythagoreanTheorem.error.sideTooShort');
          return;
        }
        const calculated = Math.sqrt(c * c - b * b);
        if (!isFinite(calculated)) {
          error.value = t('calculators.pythagoreanTheorem.error.invalidResult');
          return;
        }
        result.value = { value: calculated, side: 'a' };
        sideA.value = calculated;
      }
    } catch (e) {
      error.value = t('calculators.pythagoreanTheorem.error.calculationError');
    }
  });
  
  const clear = $(() => {
    sideA.value = null;
    sideB.value = null;
    sideC.value = null;
    result.value = null;
    error.value = null;
  });
  
  const formatNumber = (value: number | null): string => {
    if (value === null || value === undefined || value === '') return '';
    const num = parseFloat(String(value)) || 0;
    if (Math.abs(num) >= 1000) {
      return num.toLocaleString('en-US', { maximumFractionDigits: 10 });
    }
    return num.toString();
  };
  
  const formatResult = (value: number | null): string => {
    if (value === null || value === undefined) return '0';
    if (!isFinite(value)) return '∞';
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
            <div class="title-badge">{t('calculators.pythagoreanTheorem.badge')}</div>
            <h1 class="page-title">{t('calculators.pythagoreanTheorem.title')}</h1>
            <p class="page-description">{t('calculators.pythagoreanTheorem.description')}</p>
          </div>
        </div>
        
        <div class="calculator-container">
          <div class="calculator-card">
            <div class="input-section">
              <div class="input-card">
                <label class="input-label">{t('calculators.pythagoreanTheorem.inputLabel')}</label>
                <div class="pythagorean-inputs">
                  <div class="pythagorean-input-group">
                    <label class="pythagorean-label">a</label>
                    <input
                      type="number"
                      class="number-input"
                      placeholder={t('calculators.pythagoreanTheorem.enterSideA')}
                      value={sideA.value ?? ''}
                      onInput$={(e) => {
                        const target = e.target as HTMLInputElement;
                        sideA.value = target.value ? parseFloat(target.value) : null;
                      }}
                      onKeyUp$={(e) => {
                        if (e.key === 'Enter') {
                          calculate();
                        }
                      }}
                      step="any"
                      min="0"
                    />
                  </div>
                  <span class="pythagorean-operator">² +</span>
                  <div class="pythagorean-input-group">
                    <label class="pythagorean-label">b</label>
                    <input
                      type="number"
                      class="number-input"
                      placeholder={t('calculators.pythagoreanTheorem.enterSideB')}
                      value={sideB.value ?? ''}
                      onInput$={(e) => {
                        const target = e.target as HTMLInputElement;
                        sideB.value = target.value ? parseFloat(target.value) : null;
                      }}
                      onKeyUp$={(e) => {
                        if (e.key === 'Enter') {
                          calculate();
                        }
                      }}
                      step="any"
                      min="0"
                    />
                  </div>
                  <span class="pythagorean-operator">= c²</span>
                  <div class="pythagorean-input-group">
                    <label class="pythagorean-label">c</label>
                    <input
                      type="number"
                      class="number-input"
                      placeholder={t('calculators.pythagoreanTheorem.enterSideC')}
                      value={sideC.value ?? ''}
                      onInput$={(e) => {
                        const target = e.target as HTMLInputElement;
                        sideC.value = target.value ? parseFloat(target.value) : null;
                      }}
                      onKeyUp$={(e) => {
                        if (e.key === 'Enter') {
                          calculate();
                        }
                      }}
                      step="any"
                      min="0"
                    />
                  </div>
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
                    {t('calculators.pythagoreanTheorem.result')}
                  </div>
                </div>
                
                <div class="result-display">
                  <div class="result-formula-large">
                    <div class="result-value-box-large">
                      <span class="result-value-large">{result.value.side.toUpperCase()} = {formatResult(result.value.value)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div class="seo-content-section">
            <div class="seo-content-card">
              <h2 class="seo-heading">{t('calculators.pythagoreanTheorem.seo.content.heading')}</h2>
              
              <div class="seo-paragraphs">
                <p class="seo-paragraph">
                  {t('calculators.pythagoreanTheorem.seo.content.paragraph1')}
                </p>
                
                <p class="seo-paragraph">
                  {t('calculators.pythagoreanTheorem.seo.content.paragraph2')}
                </p>
                
                <p class="seo-paragraph">
                  {t('calculators.pythagoreanTheorem.seo.content.paragraph3')}
                </p>
                
                <div class="seo-example">
                  <h3 class="example-heading">{t('calculators.pythagoreanTheorem.seo.content.exampleHeading')}</h3>
                  <p class="example-text">{t('calculators.pythagoreanTheorem.seo.content.exampleText')}</p>
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
    title: t('calculators.pythagoreanTheorem.seo.title'),
    meta: [
      {
        name: 'description',
        content: t('calculators.pythagoreanTheorem.seo.description'),
      },
      {
        name: 'keywords',
        content: t('calculators.pythagoreanTheorem.seo.keywords'),
      },
    ],
  };
};
