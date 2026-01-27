'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';

export function electronVoltsToVolts(electronVolts: number): number {
  return electronVolts;
}

export function ElectronVoltsToVoltsCalculator() {
  const t = useTranslations('calculators.electronVoltsToVolts');
  const [electronVolts, setElectronVolts] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const ev = parseFloat(electronVolts);
    
    if (!isNaN(ev) && ev > 0) {
      setResult(electronVoltsToVolts(ev));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setElectronVolts('');
    setResult(null);
  };

  return (
    <>
      <div className="input-section">
        <div className="inputs-grid">
          <div className="input-card">
            <label htmlFor="electronVolts" className="input-label">
              {t('electronVolts')}
            </label>
            <div className="input-with-unit">
              <input
                id="electronVolts"
                type="number"
                value={electronVolts}
                onChange={(e) => setElectronVolts(e.target.value)}
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
            <div className="result-badge">
              {t('result')}
            </div>
          </div>
          <div className="result-display">
            <div className="result-item">
              <div className="result-label">Volts (V)</div>
              <div className="result-value-box">
                <span className="result-value">{result.toFixed(6)}</span>
                <span className="result-unit">V</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
