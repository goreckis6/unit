'use client';

import { useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';

const DECIMAL_PLACES = 5;

function formatResult(value: number, locale: string): string {
  return value.toLocaleString(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: DECIMAL_PLACES,
  });
}

export function SquareRootCalculator() {
  const t = useTranslations('calculators.squareRoot');
  const locale = useLocale();
  const [input, setInput] = useState<string>('16');
  const [result, setResult] = useState<{ positive: string; negative: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setResult(null);
      setError(null);
      return;
    }
    const num = parseFloat(trimmed.replace(/,/g, '.'));
    if (Number.isNaN(num)) {
      setResult(null);
      setError(t('errorInvalid'));
      return;
    }
    if (num < 0) {
      setResult(null);
      setError(t('errorNegative'));
      return;
    }
    setError(null);
    const root = Math.sqrt(num);
    setResult({
      positive: formatResult(root, locale),
      negative: formatResult(-root, locale),
    });
  }, [input, locale, t]);

  const handleReset = useCallback(() => {
    setInput('16');
    setResult(null);
    setError(null);
  }, []);

  const displayValue = result ? `±${result.positive}` : '';

  const handleCopy = useCallback(() => {
    if (!displayValue) return;
    void navigator.clipboard.writeText(displayValue);
  }, [displayValue]);

  return (
    <div className="root-calc-block">
      <p className="root-calc-formula-desc">{t('formulaHeading')}</p>
      <p className="root-calc-formula">{t('formulaText')}</p>

      <div className="root-calc-input-row">
        <span className="root-calc-radical" aria-hidden>√</span>
        <input
          id="number"
          type="text"
          inputMode="decimal"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
          className="number-input"
          placeholder={t('placeholder')}
          aria-label={t('enterNumber')}
        />
      </div>

      {error && (
        <p className="seo-paragraph" style={{ color: 'var(--error)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {error}
        </p>
      )}

      <div className="root-calc-actions">
        <button type="button" onClick={handleCalculate} className="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('calculate')}
        </button>
        <button type="button" onClick={handleReset} className="btn btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('reset')}
        </button>
      </div>

      <div className="root-calc-output-row">
        <output htmlFor="number" className="root-calc-output-field" aria-live="polite">
          {displayValue || '—'}
        </output>
        <button type="button" onClick={handleCopy} className="root-calc-copy-btn" disabled={!displayValue}>
          {t('copyResult')}
        </button>
      </div>
    </div>
  );
}
