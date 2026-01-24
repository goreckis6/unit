'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

/** Wh = (mAh × V) / 1000; convert battery capacity to energy */
export function mahToWh(mah: number, voltage: number): number {
  if (voltage <= 0 || mah < 0) return 0;
  return (mah * voltage) / 1000;
}

export function MahToWhCalculator() {
  const t = useTranslations('calculators.mahToWh');
  const [mah, setMah] = useState<string>('');
  const [voltage, setVoltage] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const m = parseFloat(mah);
    const v = parseFloat(voltage);
    
    if (!isNaN(m) && !isNaN(v) && m >= 0 && v > 0) {
      setResult(mahToWh(m, v));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setMah('');
    setVoltage('');
    setResult(null);
  };

  return (
    <>
      <div className="input-section">
        <div className="inputs-grid">
          <div className="input-card">
            <label htmlFor="mah" className="input-label">
              {t('mah')}
            </label>
            <div className="input-with-unit">
              <input
                id="mah"
                type="number"
                value={mah}
                onChange={(e) => setMah(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="0"
              />
            </div>
          </div>

          <div className="input-card">
            <label htmlFor="voltage" className="input-label">
              {t('voltage')}
            </label>
            <div className="input-with-unit">
              <input
                id="voltage"
                type="number"
                step="0.1"
                min="0.1"
                value={voltage}
                onChange={(e) => setVoltage(e.target.value)}
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
              <div className="result-label">{t('wh')}</div>
              <div className="result-value-box">
                <span className="result-value">{result.toFixed(4)}</span>
                <span className="result-unit">Wh</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
