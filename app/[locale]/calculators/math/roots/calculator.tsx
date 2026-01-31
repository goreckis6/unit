'use client';

import { useState } from 'react';
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

  const handleCalculate = () => {
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
  };

  const handleReset = () => {
    setNumberInput('16');
    setDegreeInput('2');
    setResult(null);
    setError(null);
  };

  return (
    <div>
      <div className="input-section">
        <div className="inputs-grid">
          <div className="input-card">
            <label htmlFor="number" className="input-label">
              {t('number')}
            </label>
            <input
              id="number"
              type="text"
              inputMode="decimal"
              value={numberInput}
              onChange={(e) => setNumberInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
              className="number-input"
              placeholder="16"
            />
          </div>
          <div className="input-card">
            <label htmlFor="degree" className="input-label">
              {t('rootDegree')}
            </label>
            <input
              id="degree"
              type="number"
              min={2}
              step={1}
              value={degreeInput}
              onChange={(e) => setDegreeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
              className="number-input"
              placeholder="2"
            />
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={handleCalculate} className="btn btn-primary">
          {t('calculate')}
        </button>
        <button onClick={handleReset} className="btn btn-secondary">
          {t('reset')}
        </button>
      </div>

      {(result !== null || error) && (
        <div ref={resultRef} className="result-section">
          <div className="result-header">
            <div className="result-badge">{t('result')}</div>
          </div>
          <div className="result-display">
            {error ? (
              <p className="seo-paragraph" style={{ color: 'var(--error)', margin: 0 }}>
                {error}
              </p>
            ) : (
              <div className="result-item">
                <div className="result-label">{t('nthRootResult')}</div>
                <div className="result-value-box">
                  <span className="result-value">{result !== null ? formatResult(result, locale) : '—'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
