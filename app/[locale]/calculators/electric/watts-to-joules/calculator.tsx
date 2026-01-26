'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function wattsToJoules(watts: number, seconds: number): number {
  if (watts < 0 || seconds < 0) return 0;
  return watts * seconds;
}

export function WattsToJoulesCalculator() {
  const t = useTranslations('calculators.wattsToJoules');
  const [watts, setWatts] = useState<string>('');
  const [seconds, setSeconds] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const w = parseFloat(watts);
    const s = parseFloat(seconds);
    
    if (!isNaN(w) && !isNaN(s) && w >= 0 && s >= 0) {
      setResult(wattsToJoules(w, s));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setWatts('');
    setSeconds('');
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
            <label htmlFor="seconds" className="input-label">
              {t('seconds')}
            </label>
            <div className="input-with-unit">
              <input
                id="seconds"
                type="number"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
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
        <div className="result-section">
          <div className="result-header">
            <div className="result-badge">
              {t('result')}
            </div>
          </div>
          <div className="result-display">
            <div className="result-item">
              <div className="result-label">{t('joules')}</div>
              <div className="result-value-box">
                <span className="result-value">{result.toFixed(4)}</span>
                <span className="result-unit">J</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
