'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function ampsToVolt(amps: number, ohms: number): number {
  if (amps <= 0 || ohms <= 0) return 0;
  return amps * ohms;
}

export function AmpsToVoltCalculator() {
  const t = useTranslations('calculators.ampsToVolt');
  const [amps, setAmps] = useState<string>('');
  const [ohms, setOhms] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const a = parseFloat(amps);
    const r = parseFloat(ohms);

    if (!isNaN(a) && !isNaN(r) && a > 0 && r > 0) {
      setResult(ampsToVolt(a, r));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setAmps('');
    setOhms('');
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
            <label htmlFor="ohms" className="input-label">
              {t('ohms')}
            </label>
            <div className="input-with-unit">
              <input
                id="ohms"
                type="number"
                value={ohms}
                onChange={(e) => setOhms(e.target.value)}
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
              <div className="result-label">V</div>
              <div className="result-value-box">
                <span className="result-value">{result.toFixed(4)}</span>
                <span className="result-unit">V</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
