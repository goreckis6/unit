'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function ampToKva(amps: number, volts: number): number {
  if (amps <= 0 || volts <= 0) return 0;
  return (amps * volts) / 1000;
}

export function AmpToKvaCalculator() {
  const t = useTranslations('calculators.ampToKva');
  const [amps, setAmps] = useState<string>('');
  const [volts, setVolts] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const a = parseFloat(amps);
    const v = parseFloat(volts);
    
    if (!isNaN(a) && !isNaN(v) && a > 0 && v > 0) {
      setResult(ampToKva(a, v));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setAmps('');
    setVolts('');
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
              <div className="result-label">kVA</div>
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
