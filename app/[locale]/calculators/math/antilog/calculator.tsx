'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';

export function calculateAntilog(value: number, base: number = 10): number {
  return Math.pow(base, value);
}

export function AntilogCalculator() {
  const t = useTranslations('calculators.antilog');
  const [value, setValue] = useState<string>('');
  const [base, setBase] = useState<string>('10');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const v = parseFloat(value);
    const b = parseFloat(base);
    
    if (!isNaN(v) && !isNaN(b) && b > 0 && b !== 1) {
      setResult(calculateAntilog(v, b));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setValue('');
    setBase('10');
    setResult(null);
  };

  return (
    <>
      <div className="input-section">
        <div className="inputs-grid">
          <div className="input-card">
            <label htmlFor="value" className="input-label">
              {t('value')}
            </label>
            <div className="input-with-unit">
              <input
                id="value"
                type="number"
                step="any"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="2"
              />
            </div>
          </div>

          <div className="input-card">
            <label htmlFor="base" className="input-label">
              {t('base')}
            </label>
            <div className="input-with-unit">
              <input
                id="base"
                type="number"
                step="any"
                min="0.01"
                value={base}
                onChange={(e) => setBase(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="10"
              />
            </div>
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

      {result !== null && (
        <div ref={resultRef} className="result-section">
          <div className="result-header">
            <div className="result-badge">
              {t('result')}
            </div>
          </div>
          <div className="result-display">
            <div className="result-item">
              <div className="result-label">{t('antilog')}</div>
              <div className="result-value-box">
                <span className="result-value">{result.toFixed(6)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
