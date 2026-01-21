import { component$, useSignal, useTask$, useVisibleTask$, $ } from '@builder.io/qwik';
import { Link, useLocation, type DocumentHead } from '@builder.io/qwik-city';
import { useTranslate } from '../i18n-qwik/useTranslate';
import { getWebAppSchema } from '../utils/webAppSchema';

export default component$(() => {
  const t = useTranslate();
  const loc = useLocation();

  const inputValue = useSignal<string>('');
  const inputMode = useSignal<'decimal' | 'hex'>('decimal');
  const result = useSignal<{ decimal: number; hex: string; binary: string } | null>(null);
  const error = useSignal<string>('');

  const canCalculate = useSignal(false);

  useTask$(({ track }) => {
    track(() => inputValue.value);
    track(() => inputMode.value);
    canCalculate.value = inputValue.value !== null && inputValue.value !== '';
  });

  const calculate = $(() => {
    error.value = '';
    result.value = null;

    if (!canCalculate.value) {
      error.value = t('calculators.hex.error.invalidInput');
      return;
    }

    try {
      if (inputMode.value === 'decimal') {
        // Convert decimal to hex
        const decimal = parseInt(inputValue.value, 10);
        
        if (isNaN(decimal)) {
          error.value = t('calculators.hex.error.invalidDecimal');
          return;
        }

        const hex = decimal.toString(16).toUpperCase();
        const binary = decimal.toString(2);
        
        result.value = {
          decimal,
          hex,
          binary
        };
      } else {
        // Convert hex to decimal
        const hex = inputValue.value.trim().toUpperCase();
        
        // Remove 0x prefix if present
        const cleanHex = hex.startsWith('0X') ? hex.substring(2) : hex;
        
        if (!/^[0-9A-F]+$/.test(cleanHex)) {
          error.value = t('calculators.hex.error.invalidHex');
          return;
        }

        const decimal = parseInt(cleanHex, 16);
        
        if (isNaN(decimal)) {
          error.value = t('calculators.hex.error.invalidHex');
          return;
        }

        const binary = decimal.toString(2);
        
        result.value = {
          decimal,
          hex: cleanHex,
          binary
        };
      }
    } catch (e) {
      error.value = t('calculators.hex.error.calculationError');
    }
  });

  const clear = $(() => {
    inputValue.value = '';
    result.value = null;
    error.value = '';
  });

  const pathParts = loc.url.pathname.split('/').filter(p => p);
  const supportedLocales = ['en', 'pl', 'sv', 'de', 'es', 'fr', 'it', 'nl', 'pt', 'vi', 'tr', 'ru', 'fa', 'th', 'ja', 'zh'];
  const locale = pathParts[0] && supportedLocales.includes(pathParts[0]) ? pathParts[0] : 'en';
  const mathCalcPath = locale === 'en' ? '/calculators/math-calculators' : `/${locale}/calculators/math-calculators`;
  
  // Get calculator name and description for WebApplication schema
  const calculatorName = t('calculators.hex.title');
  const calculatorDescription = t('calculators.hex.seo.description');
  
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
            <div class="title-badge">{t('calculators.hex.badge')}</div>
            <h1 class="page-title">{t('calculators.hex.title')}</h1>
            <p class="page-description">{t('calculators.hex.description')}</p>
          </div>
        </div>

        <div class="calculator-container">
          <div class="calculator-card">
            <div class="input-section">
              <div class="input-card">
                <label class="input-label">{t('calculators.hex.inputLabel')}</label>
                <div class="input-mode-selector">
                  <button 
                    onClick$={() => inputMode.value = 'decimal'}
                    class={`mode-button ${inputMode.value === 'decimal' ? 'active' : ''}`}
                  >
                    {t('calculators.hex.decimal')}
                  </button>
                  <button 
                    onClick$={() => inputMode.value = 'hex'}
                    class={`mode-button ${inputMode.value === 'hex' ? 'active' : ''}`}
                  >
                    {t('calculators.hex.hex')}
                  </button>
                </div>
                <div class="input-wrapper">
                  {inputMode.value === 'hex' && <div class="input-prefix">0x</div>}
                  <input
                    type="text"
                    class="number-input"
                    placeholder={inputMode.value === 'decimal' ? t('calculators.hex.decimalPlaceholder') : t('calculators.hex.hexPlaceholder')}
                    value={inputValue.value}
                    onInput$={(e) => {
                      const target = e.target as HTMLInputElement;
                      inputValue.value = target.value;
                    }}
                    onKeyUp$={(e) => {
                      if (e.key === 'Enter') {
                        calculate();
                      }
                    }}
                  />
                </div>
              </div>

              <div class="action-buttons">
                <button onClick$={calculate} class="btn btn-primary" disabled={!canCalculate.value}>
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{t('calculators.hex.convert')}</span>
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

            {result.value !== null && (
              <div class="result-section">
                <div class="result-header">
                  <div class="result-badge">
                    <svg class="result-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    {t('calculators.hex.result')}
                  </div>
                </div>

                <div class="result-display">
                  <div class="info-section">
                    <div class="info-card">
                      <div class="info-item">
                        <span class="info-label">{t('calculators.hex.decimal')}:</span>
                        <span class="info-value">{result.value.decimal}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">{t('calculators.hex.hex')}:</span>
                        <span class="info-value">0x{result.value.hex}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">{t('calculators.hex.binary')}:</span>
                        <span class="info-value">{result.value.binary}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div class="seo-content-section">
            <div class="seo-content-card">
              <h2 class="seo-heading">{t('calculators.hex.seo.content.heading')}</h2>

              <div class="seo-paragraphs">
                <p class="seo-paragraph">
                  {t('calculators.hex.seo.content.paragraph1')}
                </p>

                <p class="seo-paragraph">
                  {t('calculators.hex.seo.content.paragraph2')}
                </p>

                <p class="seo-paragraph">
                  {t('calculators.hex.seo.content.paragraph3')}
                </p>

                <div class="seo-example">
                  <h3 class="example-heading">{t('calculators.hex.seo.content.exampleHeading')}</h3>
                  <p class="example-text">{t('calculators.hex.seo.content.exampleText')}</p>
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
    title: t('calculators.hex.seo.title'),
    meta: [
      {
        name: 'description',
        content: t('calculators.hex.seo.description'),
      },
      {
        name: 'keywords',
        content: t('calculators.hex.seo.keywords'),
      },
    ],
  };
};

