'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

/** Watts = (kWh × 1000) / hours; convert energy to power given time */
export function kwhToWatts(kwh: number, hours: number): number {
  if (hours <= 0) return 0;
  return (kwh * 1000) / hours;
}

export function KwhToWattsCalculator() {
  const t = useTranslations('calculators.kwhToWatts');
  const [kwh, setKwh] = useState<string>('');
  const [hours, setHours] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const k = parseFloat(kwh);
    const h = parseFloat(hours);
    
    if (!isNaN(k) && !isNaN(h) && h > 0 && k >= 0) {
      setResult(kwhToWatts(k, h));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setKwh('');
    setHours('');
    setResult(null);
  };

  return (
    <>
      <div className="input-section">
        <div className="inputs-grid">
          <div className="input-card">
            <label htmlFor="kwh" className="input-label">
              {t('kwh')}
            </label>
            <div className="input-with-unit">
              <input
                id="kwh"
                type="number"
                value={kwh}
                onChange={(e) => setKwh(e.target.value)}
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
                step="0.1"
                min="0.01"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
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
              <div className="result-label">{t('watts')}</div>
              <div className="number-input result-value-box">
                <span className="result-value">{result.toFixed(2)}</span>
                <span className="result-unit">W</span>
                <CopyButton text={`${result.toFixed(2)} W`} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
