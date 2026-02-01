'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

/** Real power in kW: kW = VA × PF / 1000 */
export function vaToKw(va: number, powerFactor: number): number {
  if (powerFactor <= 0 || powerFactor > 1 || va < 0) return 0;
  return (va * powerFactor) / 1000;
}

export function VaToKwCalculator() {
  const t = useTranslations('calculators.vaToKw');
  const [va, setVa] = useState<string>('');
  const [powerFactor, setPowerFactor] = useState<string>('0.8');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const vaVal = parseFloat(va);
    const pf = parseFloat(powerFactor);

    if (!isNaN(vaVal) && !isNaN(pf) && vaVal >= 0 && pf > 0 && pf <= 1) {
      setResult(vaToKw(vaVal, pf));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setVa('');
    setPowerFactor('0.8');
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
            <div className="result-badge">{t('result')}</div>
          </div>
          <div className="result-display">
            <div className="result-item">
              <div className="result-label">{t('kw')}</div>
              <div className="result-value-box">
                <span className="result-value">{result.toFixed(4)}</span>
                <span className="result-unit">kW</span>
                <CopyButton text={`${result.toFixed(4)} kW`} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
