'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function ampToKw(amps: number, volts: number, powerFactor: number): number {
  if (volts <= 0 || powerFactor <= 0 || powerFactor > 1) return 0;
  return (amps * volts * powerFactor) / 1000;
}

export function AmpToKwCalculator() {
  const t = useTranslations('calculators.ampToKw');
  const [amps, setAmps] = useState<string>('');
  const [volts, setVolts] = useState<string>('230');
  const [powerFactor, setPowerFactor] = useState<string>('0.8');
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const a = parseFloat(amps);
    const v = parseFloat(volts);
    const pf = parseFloat(powerFactor);
    
    if (!isNaN(a) && !isNaN(v) && !isNaN(pf) && v > 0 && pf > 0 && pf <= 1) {
      setResult(ampToKw(a, v, pf));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setAmps('');
    setVolts('230');
    setPowerFactor('0.8');
    setResult(null);
  };

  return (
    <>
      <div className="input-section">
        <div className="inputs-grid">
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
                placeholder="230"
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
              <div className="result-label">kW</div>
              <div className="result-value-box">
                <span className="result-value">{result.toFixed(4)}</span>
                <span className="result-unit">kW</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
