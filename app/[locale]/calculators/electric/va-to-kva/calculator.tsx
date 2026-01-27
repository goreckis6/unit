'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';

/** Apparent power: kVA = VA / 1000 */
export function vaToKva(va: number): number {
  if (va < 0) return 0;
  return va / 1000;
}

export function VaToKvaCalculator() {
  const t = useTranslations('calculators.vaToKva');
  const [va, setVa] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const vaVal = parseFloat(va);
    if (!isNaN(vaVal) && vaVal >= 0) {
      setResult(vaToKva(vaVal));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setVa('');
    setResult(null);
  };

  return (
    <>
      <div className="input-section">
        <div className="inputs-grid">
          <div className="input-card">
            <label htmlFor="va" className="input-label">
              {t('va')}
            </label>
            <div className="input-with-unit">
              <input
                id="va"
                type="number"
                value={va}
                onChange={(e) => setVa(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="0"
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
            <div className="result-badge">{t('result')}</div>
          </div>
          <div className="result-display">
            <div className="result-item">
              <div className="result-label">{t('kva')}</div>
              <div className="result-value-box">
                <span className="result-value">{result.toFixed(4)}</span>
                <span className="result-unit">kVA</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
