import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { Link, useLocation, type DocumentHead } from '@builder.io/qwik-city';
import { useTranslate } from '../i18n-qwik/useTranslate';

export default component$(() => {
  const t = useTranslate();
  const loc = useLocation();

  const fraction1Num = useSignal<number | null>(null);
  const fraction1Den = useSignal<number | null>(null);
  const fraction2Num = useSignal<number | null>(null);
  const fraction2Den = useSignal<number | null>(null);
  const result = useSignal<{ numerator: number; denominator: number; decimal: number } | null>(null);
  const error = useSignal<string>('');

  const canCalculate = useSignal(false);

  useTask$(({ track }) => {
    track(() => fraction1Num.value);
    track(() => fraction1Den.value);
    track(() => fraction2Num.value);
    track(() => fraction2Den.value);
    canCalculate.value =
      fraction1Num.value !== null && fraction1Den.value !== null &&
      fraction2Num.value !== null && fraction2Den.value !== null &&
      fraction1Den.value !== 0 && fraction2Den.value !== 0;
  });

  const gcd = (a: number, b: number): number => {
    a = Math.abs(a);
    b = Math.abs(b);
    return b === 0 ? a : gcd(b, a % b);
  };

  const simplifyFraction = (num: number, den: number): { numerator: number; denominator: number } => {
    const divisor = gcd(num, den);
    return {
      numerator: num / divisor,
      denominator: den / divisor
    };
  };

  const calculate = $(() => {
    error.value = '';
    result.value = null;

    if (!canCalculate.value) {
      error.value = t('calculators.multiplyingFractions.error.invalidInput');
      return;
    }

    const num1 = parseFloat(String(fraction1Num.value)) || 0;
    const den1 = parseFloat(String(fraction1Den.value)) || 1;
    const num2 = parseFloat(String(fraction2Num.value)) || 0;
    const den2 = parseFloat(String(fraction2Den.value)) || 1;

    if (isNaN(num1) || isNaN(den1) || isNaN(num2) || isNaN(den2)) {
      error.value = t('calculators.multiplyingFractions.error.invalidInput');
      return;
    }

    if (den1 === 0 || den2 === 0) {
      error.value = t('calculators.multiplyingFractions.error.denominatorCannotBeZero');
      return;
    }

    try {
      // Multiply fractions: (a/b) * (c/d) = (a*c)/(b*d)
      const resultNum = num1 * num2;
      const resultDen = den1 * den2;

      const simplified = simplifyFraction(resultNum, resultDen);
      const decimal = simplified.numerator / simplified.denominator;

      result.value = {
        numerator: simplified.numerator,
        denominator: simplified.denominator,
        decimal
      };
    } catch (e) {
      error.value = t('calculators.multiplyingFractions.error.calculationError');
    }
  });

  const clear = $(() => {
    fraction1Num.value = null;
    fraction1Den.value = null;
    fraction2Num.value = null;
    fraction2Den.value = null;
    result.value = null;
    error.value = '';
  });

  const formatNumber = (value: number | null): string => {
    if (value === null || value === undefined || value === '') return '0';
    const num = parseFloat(String(value)) || 0;
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
            <div class="title-badge">{t('calculators.multiplyingFractions.badge')}</div>
            <h1 class="page-title">{t('calculators.multiplyingFractions.title')}</h1>
            <p class="page-description">{t('calculators.multiplyingFractions.description')}</p>
          </div>
        </div>

        <div class="calculator-container">
          <div class="calculator-card">
            <div class="input-section">
              <div class="fractions-input">
                <div class="fraction-input-group">
                  <label class="fraction-label">{t('calculators.multiplyingFractions.fraction1')}</label>
                  <div class="fraction-inputs">
                    <div class="fraction-numerator">
                      <input
                        type="number"
                        class="number-input"
                        placeholder={t('calculators.multiplyingFractions.numerator')}
                        value={fraction1Num.value ?? ''}
                        onInput$={(e) => {
                          const target = e.target as HTMLInputElement;
                          fraction1Num.value = target.value ? parseFloat(target.value) : null;
                        }}
                        onKeyUp$={(e) => {
                          if (e.key === 'Enter') {
                            calculate();
                          }
                        }}
                        step="any"
                      />
                    </div>
                    <div class="fraction-divider"></div>
                    <div class="fraction-denominator">
                      <input
                        type="number"
                        class="number-input"
                        placeholder={t('calculators.multiplyingFractions.denominator')}
                        value={fraction1Den.value ?? ''}
                        onInput$={(e) => {
                          const target = e.target as HTMLInputElement;
                          fraction1Den.value = target.value ? parseFloat(target.value) : null;
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
                </div>

                <div class="fraction-operator">×</div>

                <div class="fraction-input-group">
                  <label class="fraction-label">{t('calculators.multiplyingFractions.fraction2')}</label>
                  <div class="fraction-inputs">
                    <div class="fraction-numerator">
                      <input
                        type="number"
                        class="number-input"
                        placeholder={t('calculators.multiplyingFractions.numerator')}
                        value={fraction2Num.value ?? ''}
                        onInput$={(e) => {
                          const target = e.target as HTMLInputElement;
                          fraction2Num.value = target.value ? parseFloat(target.value) : null;
                        }}
                        onKeyUp$={(e) => {
                          if (e.key === 'Enter') {
                            calculate();
                          }
                        }}
                        step="any"
                      />
                    </div>
                    <div class="fraction-divider"></div>
                    <div class="fraction-denominator">
                      <input
                        type="number"
                        class="number-input"
                        placeholder={t('calculators.multiplyingFractions.denominator')}
                        value={fraction2Den.value ?? ''}
                        onInput$={(e) => {
                          const target = e.target as HTMLInputElement;
                          fraction2Den.value = target.value ? parseFloat(target.value) : null;
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

              <div class="action-buttons">
                <button onClick$={calculate} class="btn btn-primary" disabled={!canCalculate.value}>
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{t('calculators.multiplyingFractions.calculate')}</span>
                </button>
                <button onClick$={clear} class="btn btn-secondary">
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{t('calculators.multiplyingFractions.clear')}</span>
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
                    {t('calculators.multiplyingFractions.result')}
                  </div>
                </div>

                <div class="result-display">
                  <div class="fraction-result">
                    <div class="result-fraction">
                      <div class="result-numerator">{result.value.numerator}</div>
                      <div class="result-divider"></div>
                      <div class="result-denominator">{result.value.denominator}</div>
                    </div>
                    <div class="result-decimal">
                      = {result.value.decimal.toFixed(10).replace(/\.?0+$/, '')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div class="seo-content-section">
            <div class="seo-content-card">
              <h2 class="seo-heading">{t('calculators.multiplyingFractions.seo.content.heading')}</h2>

              <div class="seo-paragraphs">
                <p class="seo-paragraph">
                  {t('calculators.multiplyingFractions.seo.content.paragraph1')}
                </p>

                <p class="seo-paragraph">
                  {t('calculators.multiplyingFractions.seo.content.paragraph2')}
                </p>

                <p class="seo-paragraph">
                  {t('calculators.multiplyingFractions.seo.content.paragraph3')}
                </p>

                <div class="seo-example">
                  <h3 class="example-heading">{t('calculators.multiplyingFractions.seo.content.exampleHeading')}</h3>
                  <p class="example-text">{t('calculators.multiplyingFractions.seo.content.exampleText')}</p>
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
    title: t('calculators.multiplyingFractions.seo.title'),
    meta: [
      {
        name: 'description',
        content: t('calculators.multiplyingFractions.seo.description'),
      },
      {
        name: 'keywords',
        content: t('calculators.multiplyingFractions.seo.keywords'),
      },
    ],
  };
};
