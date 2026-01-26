'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function voltsToElectronVolts(volts: number): number {
  return volts;
}

export function VoltsToElectronVoltsCalculator() {
  const t = useTranslations('calculators.voltsToElectronVolts');
  const [volts, setVolts] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const v = parseFloat(volts);
    if (!isNaN(v) && v >= 0) {
      setResult(voltsToElectronVolts(v));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setVolts('');
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
              <div className="result-label">{t('electronVolts')}</div>
              <div className="result-value-box">
                <span className="result-value">{result.toFixed(6)}</span>
                <span className="result-unit">eV</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
