'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function voltsToWatts(volts: number, amps: number): number {
  if (volts <= 0 || amps <= 0) return 0;
  return volts * amps;
}

export function VoltsToWattsCalculator() {
  const t = useTranslations('calculators.voltsToWatts');
  const [volts, setVolts] = useState<string>('');
  const [amps, setAmps] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const v = parseFloat(volts);
    const a = parseFloat(amps);
    if (!isNaN(v) && !isNaN(a) && v > 0 && a > 0) {
      setResult(voltsToWatts(v, a));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setVolts('');
    setAmps('');
    setResult(null);
  };

  return (
    <>
      <div className="input-section">
        <div className="inputs-grid">
          <div className="input-card">
            <label htmlFor="volts" className="input-label">
              {t('volts')}
            </label>
            <div className="input-with-unit">
              <input
                id="volts"
                type="number"
                value={volts}
                onChange={(e) => setVolts(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="0"
              />
            </div>
          </div>
          <div className="input-card">
            <label htmlFor="amps" className="input-label">
              {t('amps')}
            </label>
            <div className="input-with-unit">
              <input
                id="amps"
                type="number"
                value={amps}
                onChange={(e) => setAmps(e.target.value)}
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
            <div className="result-badge">{t('result')}</div>
          </div>
          <div className="result-display">
            <div className="result-item">
              <div className="result-label">{t('watts')}</div>
              <div className="result-value-box">
                <span className="result-value">{result.toFixed(4)}</span>
                <span className="result-unit">W</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
