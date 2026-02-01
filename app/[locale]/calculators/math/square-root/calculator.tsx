'use client';

import { useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';

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

  return (
    <div className="root-calc-block">
      <div className="root-calc-input-row">
        <div className="root-calc-radical-group">
          <span className="root-calc-radical" aria-hidden>√</span>
          <div className="root-calc-radicand">
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
        </div>
      </div>

      {error && (
        <p className="seo-paragraph" style={{ color: 'var(--error)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {error}
        </p>
      )}

      <div className="root-calc-actions">
        <button type="button" onClick={handleCalculate} className="btn btn-primary">
          <span aria-hidden>=</span>
          {t('calculate')}
        </button>
        <button type="button" onClick={handleReset} className="btn btn-secondary">
          <span aria-hidden>×</span>
          {t('reset')}
        </button>
      </div>

      <div className="root-calc-output-row">
        <output htmlFor="number" className="root-calc-output-field" aria-live="polite">
          {displayValue || '—'}
        </output>
        <CopyButton text={displayValue} className="root-calc-copy-btn" />
      </div>
    </div>
  );
}
