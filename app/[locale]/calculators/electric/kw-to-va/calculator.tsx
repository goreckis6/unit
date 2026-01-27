'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';

/** VA = (kW × 1000) / PF; apparent power from real power and power factor */
export function kwToVa(kw: number, powerFactor: number): number {
  if (powerFactor <= 0 || powerFactor > 1) return 0;
  return (kw * 1000) / powerFactor;
}

export function KwToVaCalculator() {
  const t = useTranslations('calculators.kwToVa');
  const [kw, setKw] = useState<string>('');
  const [powerFactor, setPowerFactor] = useState<string>('0.8');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const k = parseFloat(kw);
    const pf = parseFloat(powerFactor);
    if (!isNaN(k) && !isNaN(pf) && pf > 0 && pf <= 1 && k >= 0) {
      setResult(kwToVa(k, pf));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setKw('');
    setPowerFactor('0.8');
    setResult(null);
  };

  return (
    <>
      <div className="input-section">
        <div className="inputs-grid">
          <div className="input-card">
            <label htmlFor="kw" className="input-label">
              {t('kw')}
            </label>
            <div className="input-with-unit">
              <input
                id="kw"
                type="number"
                value={kw}
                onChange={(e) => setKw(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="0"
              />
            </div>
          </div>

          <div className="input-card">
            <label htmlFor="powerFactor" className="input-label">
              {t('powerFactor')}
            </label>
            <div className="input-with-unit">
              <input
                id="powerFactor"
                type="number"
                step="0.01"
                min="0.01"
                max="1"
                value={powerFactor}
                onChange={(e) => setPowerFactor(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="0.8"
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
              <div className="result-label">{t('va')}</div>
              <div className="result-value-box">
                <span className="result-value">{result.toFixed(4)}</span>
                <span className="result-unit">VA</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
