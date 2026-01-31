'use client';

import { useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';

const DECIMAL_PLACES = 8;

function formatResult(value: number, locale: string): string {
  return value.toLocaleString(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: DECIMAL_PLACES,
  });
}

function nthRoot(x: number, n: number): number | null {
  if (n <= 0 || !Number.isInteger(n)) return null;
  if (x >= 0) return Math.pow(x, 1 / n);
  if (n % 2 === 0) return null;
  return -Math.pow(-x, 1 / n);
}

export function RootsCalculator() {
  const t = useTranslations('calculators.roots');
  const locale = useLocale();
  const [numberInput, setNumberInput] = useState<string>('16');
  const [degreeInput, setDegreeInput] = useState<string>('2');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = useCallback(() => {
    const x = parseFloat(numberInput.replace(/,/g, '.'));
    const n = parseInt(degreeInput, 10);
    if (Number.isNaN(x)) {
      setResult(null);
      setError(t('errorInvalidNumber'));
      return;
    }
    if (Number.isNaN(n) || n < 2 || !Number.isInteger(n)) {
      setResult(null);
      setError(t('errorInvalidDegree'));
      return;
    }
    const root = nthRoot(x, n);
    if (root === null) {
      setResult(null);
      setError(t('errorNoRealRoot'));
      return;
    }
    setError(null);
    setResult(root);
  }, [numberInput, degreeInput, t]);

  const handleReset = useCallback(() => {
    setNumberInput('16');
    setDegreeInput('2');
    setResult(null);
    setError(null);
  }, []);

  const displayValue =
    result !== null
      ? result >= 0
        ? `±${formatResult(result, locale)}`
        : formatResult(result, locale)
      : '';

  const handleCopy = useCallback(() => {
    if (!displayValue) return;
    void navigator.clipboard.writeText(displayValue);
  }, [displayValue]);

  return (
    <div className="root-calc-block" ref={resultRef}>
      <div className="root-calc-input-row">
        <input
          id="degree"
          type="text"
          inputMode="numeric"
          value={degreeInput}
          onChange={(e) => setDegreeInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
          className="root-calc-radical-index"
          placeholder="2"
          aria-label={t('rootDegree')}
        />
        <span className="root-calc-radical" aria-hidden>
          √
        </span>
        <div className="root-calc-radicand">
          <input
            id="number"
            type="text"
            inputMode="decimal"
            value={numberInput}
            onChange={(e) => setNumberInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
            className="number-input"
            placeholder="16"
            aria-label={t('number')}
          />
        </div>
      </div>

      {error && (
        <p
          className="seo-paragraph"
          style={{
            color: 'var(--error-color)',
            marginBottom: '1rem',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </p>
      )}

      <div className="root-calc-actions">
        <button
          type="button"
          onClick={handleCalculate}
          className="btn btn-primary"
        >
          <span aria-hidden>=</span>
          {t('calculate')}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="btn btn-secondary"
        >
          <span aria-hidden>×</span>
          {t('reset')}
        </button>
      </div>

      <div className="root-calc-output-row">
        <output
          htmlFor="number degree"
          className="root-calc-output-field"
          aria-live="polite"
        >
          {displayValue || '—'}
        </output>
        <button
          type="button"
          onClick={handleCopy}
          className="root-calc-copy-btn"
          disabled={!displayValue}
        >
          {t('copyResult')}
        </button>
      </div>
    </div>
  );
}
