'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function wattsToKva(watts: number, powerFactor: number): number {
  if (powerFactor <= 0 || powerFactor > 1) return 0;
  return watts / (1000 * powerFactor);
}

export function WattsToKvaCalculator() {
  const t = useTranslations('calculators.wattsToKva');
  const [watts, setWatts] = useState<string>('');
  const [powerFactor, setPowerFactor] = useState<string>('0.8');
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const w = parseFloat(watts);
    const pf = parseFloat(powerFactor);
    
    if (!isNaN(w) && !isNaN(pf) && pf > 0 && pf <= 1) {
      setResult(wattsToKva(w, pf));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setWatts('');
    setPowerFactor('0.8');
    setResult(null);
  };

  return (
    <>
      <div className="input-section">
        <div className="inputs-grid">
          <div className="input-card">
            <label htmlFor="watts" className="input-label">
              {t('watts')}
            </label>
            <div className="input-with-unit">
              <input
                id="watts"
                type="number"
                value={watts}
                onChange={(e) => setWatts(e.target.value)}
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
        <div className="result-section">
          <div className="result-header">
            <div className="result-badge">
              {t('result')}
            </div>
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
