'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';

/** Energy (kWh) = Power (kW) × Time (hours) */
export function kwToKwh(kw: number, hours: number): number {
  if (hours < 0) return 0;
  return kw * hours;
}

export function KwToKwhCalculator() {
  const t = useTranslations('calculators.kwToKwh');
  const [kw, setKw] = useState<string>('');
  const [hours, setHours] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const k = parseFloat(kw);
    const h = parseFloat(hours);
    if (!isNaN(k) && !isNaN(h) && h >= 0 && k >= 0) {
      setResult(kwToKwh(k, h));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setKw('');
    setHours('');
    setResult(null);
  };

  return (
    <>
      <div className="input-section">
        <div className="inputs-grid">
          <div className="input-card">
            <label htmlFor="kw" className="input-label">
              {t('kw')}
            </label>
            <div className="input-with-unit">
              <input
                id="kw"
                type="number"
                value={kw}
                onChange={(e) => setKw(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="0"
              />
            </div>
          </div>

          <div className="input-card">
            <label htmlFor="hours" className="input-label">
              {t('hours')}
            </label>
            <div className="input-with-unit">
              <input
                id="hours"
                type="number"
                step="0.01"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="1"
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
              <div className="result-label">{t('kwh')}</div>
              <div className="result-value-box">
                <span className="result-value">{result.toFixed(4)}</span>
                <span className="result-unit">kWh</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
