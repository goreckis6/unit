import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { Link, useLocation, type DocumentHead } from '@builder.io/qwik-city';
import { useTranslate } from '../i18n-qwik/useTranslate';

export default component$(() => {
  const t = useTranslate();
  const loc = useLocation();
  
  const inputValue = useSignal<number | null>(null);
  const angleMode = useSignal<'degrees' | 'radians'>('degrees');
  const result = useSignal<number | null>(null);
  const error = useSignal<string>('');
  
  const canCalculate = useSignal(false);
  const angleInfo = useSignal<{ angleDegrees: number; angleRadians: number } | null>(null);
  
  useTask$(({ track }) => {
    track(() => inputValue.value);
    canCalculate.value = inputValue.value !== null && inputValue.value !== '' && 
                         inputValue.value >= -1 && inputValue.value <= 1;
  });
  
  useTask$(({ track }) => {
    track(() => result.value);
    track(() => inputValue.value);
    track(() => angleMode.value);
    
    if (result.value === null || inputValue.value === null) {
      angleInfo.value = null;
      return;
    }
    
    const angleRadians = result.value;
    const angleDegrees = angleRadians * 180 / Math.PI;
    
    angleInfo.value = {
      angleDegrees,
      angleRadians
    };
  });
  
  const validateInput = $(() => {
    error.value = '';
    if (inputValue.value !== null && (inputValue.value < -1 || inputValue.value > 1)) {
      error.value = t('calculators.arccos.error.invalidRange');
    }
  });
  
  const calculate = $(() => {
    error.value = '';
    
    if (inputValue.value === null || inputValue.value === '') {
      error.value = t('calculators.arccos.error.invalidInput');
      return;
    }

    if (inputValue.value < -1 || inputValue.value > 1) {
      error.value = t('calculators.arccos.error.invalidRange');
      result.value = null;
      return;
    }

    // Arccos: Math.acos(x) returns result in radians
    const angleInRadians = Math.acos(inputValue.value);
    
    if (angleMode.value === 'degrees') {
      result.value = angleInRadians * 180 / Math.PI;
    } else {
      result.value = angleInRadians;
    }
  });
  
  const clear = $(() => {
    inputValue.value = null;
    result.value = null;
    error.value = '';
  });
  
  const formatResult = (value: number | null): string => {
    if (value === null || value === undefined) return '0';
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
            <div class="title-badge">{t('calculators.arccos.badge')}</div>
            <h1 class="page-title">{t('calculators.arccos.title')}</h1>
            <p class="page-description">{t('calculators.arccos.description')}</p>
          </div>
        </div>
        
        <div class="calculator-container">
          <div class="calculator-card">
            <div class="input-section">
              <div class="input-card">
                <label class="input-label">{t('calculators.arccos.inputLabel')}</label>
                <div class="input-wrapper">
                  <div class="input-prefix">arccos(</div>
                  <input
                    type="number"
                    class="number-input"
                    placeholder={t('calculators.arccos.placeholder')}
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
                    min="-1"
                    max="1"
                  />
                  <div class="input-suffix">)</div>
                </div>
                <div class="angle-mode-selector">
                  <button 
                    onClick$={() => angleMode.value = 'degrees'}
                    class={`mode-button ${angleMode.value === 'degrees' ? 'active' : ''}`}
                  >
                    {t('calculators.arccos.degrees')}
                  </button>
                  <button 
                    onClick$={() => angleMode.value = 'radians'}
                    class={`mode-button ${angleMode.value === 'radians' ? 'active' : ''}`}
                  >
                    {t('calculators.arccos.radians')}
                  </button>
                </div>
              </div>

              <div class="action-buttons">
                <button onClick$={calculate} class="btn btn-primary" disabled={!canCalculate.value}>
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{t('calculators.arccos.calculate')}</span>
                </button>
                <button onClick$={clear} class="btn btn-secondary">
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{t('calculators.arccos.clear')}</span>
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
                    {t('calculators.arccos.result')}
                  </div>
                </div>

                <div class="result-display">
                  <div class="sin-result">
                    <div class="result-formula">
                      <span class="formula-text">
                        arccos({inputValue.value}) = {formatResult(result.value)}{angleMode.value === 'degrees' ? '°' : ' rad'}
                      </span>
                    </div>
                    <div class="result-value-box">
                      <span class="result-value">{formatResult(result.value)}{angleMode.value === 'degrees' ? '°' : ' rad'}</span>
                    </div>
                  </div>
                  {angleInfo.value && (
                    <div class="angle-info-box">
                      <div class="info-row">
                        <span class="info-label">{t('calculators.arccos.angle')}:</span>
                        <span class="info-value">{angleInfo.value.angleDegrees.toFixed(2)}°</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">{t('calculators.arccos.radians')}:</span>
                        <span class="info-value">{angleInfo.value.angleRadians.toFixed(6)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {result.value !== null && (
                  <div class="info-section">
                    <div class="info-card">
                      <div class="info-item">
                        <span class="info-label">{t('calculators.arccos.inputValue')}:</span>
                        <span class="info-value">{inputValue.value}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">{t('calculators.arccos.resultValue')}:</span>
                        <span class="info-value">{formatResult(result.value)}{angleMode.value === 'degrees' ? '°' : ' rad'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div class="seo-content-section">
            <div class="seo-content-card">
              <h2 class="seo-heading">{t('calculators.arccos.seo.content.heading')}</h2>
              
              <div class="seo-paragraphs">
                <p class="seo-paragraph">
                  {t('calculators.arccos.seo.content.paragraph1')}
                </p>
                
                <p class="seo-paragraph">
                  {t('calculators.arccos.seo.content.paragraph2')}
                </p>
                
                <p class="seo-paragraph">
                  {t('calculators.arccos.seo.content.paragraph3')}
                </p>
                
                <div class="seo-example">
                  <h3 class="example-heading">{t('calculators.arccos.seo.content.exampleHeading')}</h3>
                  <p class="example-text">{t('calculators.arccos.seo.content.exampleText')}</p>
                </div>
                
                <p class="seo-paragraph">
                  {t('calculators.arccos.seo.content.paragraph4')}
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
    title: t('calculators.arccos.seo.title'),
    meta: [
      {
        name: 'description',
        content: t('calculators.arccos.seo.description'),
      },
      {
        name: 'keywords',
        content: t('calculators.arccos.seo.keywords'),
      },
    ],
  };
};

