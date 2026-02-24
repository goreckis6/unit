import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { Link, useLocation, type DocumentHead } from '@builder.io/qwik-city';
import { useTranslate } from '../i18n-qwik/useTranslate';

export default component$(() => {
  const a = useSignal<number | null>(null);
  const b = useSignal<number | null>(null);
  const c = useSignal<number | null>(null);
  const result = useSignal<{ x1: number | null; x2: number | null; discriminant: number; hasSolution: boolean } | null>(null);
  const error = useSignal<string | null>(null);
  const loc = useLocation();
  const t = useTranslate();
  
  const canCalculate = useSignal(false);
  
  useTask$(({ track }) => {
    track(() => a.value);
    track(() => b.value);
    track(() => c.value);
    canCalculate.value = 
      a.value !== null && a.value !== '' &&
      b.value !== null && b.value !== '' &&
      c.value !== null && c.value !== '' &&
      a.value !== 0;
  });
  
  const calculate = $(() => {
    error.value = null;
    result.value = null;
    
    if (!canCalculate.value) {
      return;
    }
    
    const aVal = parseFloat(String(a.value)) || 0;
    const bVal = parseFloat(String(b.value)) || 0;
    const cVal = parseFloat(String(c.value)) || 0;
    
    if (isNaN(aVal) || isNaN(bVal) || isNaN(cVal)) {
      error.value = t('calculators.quadraticEquation.error.invalidInput');
      return;
    }
    
    if (aVal === 0) {
      error.value = t('calculators.quadraticEquation.error.aCannotBeZero');
      result.value = null;
      return;
    }
    
    try {
      // Quadratic formula: x = (-b ± √(b² - 4ac)) / 2a
      const discriminant = bVal * bVal - 4 * aVal * cVal;
      
      if (discriminant < 0) {
        result.value = {
          x1: null,
          x2: null,
          discriminant,
          hasSolution: false
        };
        return;
      }
      
      const sqrtDiscriminant = Math.sqrt(discriminant);
      const x1 = (-bVal + sqrtDiscriminant) / (2 * aVal);
      const x2 = (-bVal - sqrtDiscriminant) / (2 * aVal);
      
      result.value = {
        x1,
        x2,
        discriminant,
        hasSolution: true
      };
    } catch (e) {
      error.value = t('calculators.quadraticEquation.error.calculationError');
    }
  });
  
  const clear = $(() => {
    a.value = null;
    b.value = null;
    c.value = null;
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
  
  const formatResult = (value: number | null): string => {
    if (value === null || value === undefined) return 'N/A';
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
            <div class="title-badge">{t('calculators.quadraticEquation.badge')}</div>
            <h1 class="page-title">{t('calculators.quadraticEquation.title')}</h1>
            <p class="page-description">{t('calculators.quadraticEquation.description')}</p>
          </div>
        </div>
        
        <div class="calculator-container">
          <div class="calculator-card">
            <div class="input-section">
              <div class="input-card">
                <label class="input-label">{t('calculators.quadraticEquation.inputLabel')}</label>
                <div class="quadratic-inputs">
                  <div class="quadratic-input-group">
                    <label class="quadratic-label">a</label>
                    <input
                      type="number"
                      class="number-input"
                      placeholder={t('calculators.quadraticEquation.enterA')}
                      value={a.value ?? ''}
                      onInput$={(e) => {
                        const target = e.target as HTMLInputElement;
                        a.value = target.value ? parseFloat(target.value) : null;
                      }}
                      onKeyUp$={(e) => {
                        if (e.key === 'Enter') {
                          calculate();
                        }
                      }}
                      step="any"
                    />
                  </div>
                  <span class="quadratic-operator">x² +</span>
                  <div class="quadratic-input-group">
                    <label class="quadratic-label">b</label>
                    <input
                      type="number"
                      class="number-input"
                      placeholder={t('calculators.quadraticEquation.enterB')}
                      value={b.value ?? ''}
                      onInput$={(e) => {
                        const target = e.target as HTMLInputElement;
                        b.value = target.value ? parseFloat(target.value) : null;
                      }}
                      onKeyUp$={(e) => {
                        if (e.key === 'Enter') {
                          calculate();
                        }
                      }}
                      step="any"
                    />
                  </div>
                  <span class="quadratic-operator">x +</span>
                  <div class="quadratic-input-group">
                    <label class="quadratic-label">c</label>
                    <input
                      type="number"
                      class="number-input"
                      placeholder={t('calculators.quadraticEquation.enterC')}
                      value={c.value ?? ''}
                      onInput$={(e) => {
                        const target = e.target as HTMLInputElement;
                        c.value = target.value ? parseFloat(target.value) : null;
                      }}
                      onKeyUp$={(e) => {
                        if (e.key === 'Enter') {
                          calculate();
                        }
                      }}
                      step="any"
                    />
                  </div>
                  <span class="quadratic-operator">= 0</span>
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
                    {t('calculators.quadraticEquation.result')}
                  </div>
                </div>
                
                <div class="result-display">
                  {!result.value.hasSolution ? (
                    <div class="result-message">
                      <p>{t('calculators.quadraticEquation.noRealSolutions')}</p>
                      <p>{t('calculators.quadraticEquation.discriminant')}: {result.value.discriminant.toFixed(2)}</p>
                    </div>
                  ) : (
                    <div class="result-formula-large">
                      <div class="formula-number-box">
                        <span class="formula-number-value">x₁ = {formatResult(result.value.x1)}</span>
                      </div>
                      <div class="formula-number-box">
                        <span class="formula-number-value">x₂ = {formatResult(result.value.x2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div class="seo-content-section">
            <div class="seo-content-card">
              <h2 class="seo-heading">{t('calculators.quadraticEquation.seo.content.heading')}</h2>
              
              <div class="seo-paragraphs">
                <p class="seo-paragraph">
                  {t('calculators.quadraticEquation.seo.content.paragraph1')}
                </p>
                
                <p class="seo-paragraph">
                  {t('calculators.quadraticEquation.seo.content.paragraph2')}
                </p>
                
                <p class="seo-paragraph">
                  {t('calculators.quadraticEquation.seo.content.paragraph3')}
                </p>
                
                <div class="seo-example">
                  <h3 class="example-heading">{t('calculators.quadraticEquation.seo.content.exampleHeading')}</h3>
                  <p class="example-text">{t('calculators.quadraticEquation.seo.content.exampleText')}</p>
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
    title: t('calculators.quadraticEquation.seo.title'),
    meta: [
      {
        name: 'description',
        content: t('calculators.quadraticEquation.seo.description'),
      },
      {
        name: 'keywords',
        content: t('calculators.quadraticEquation.seo.keywords'),
      },
    ],
  };
};
