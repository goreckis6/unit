'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

/** Energy (kWh) = Power (W) × Time (hours) / 1000 */
export function wattsToKwh(watts: number, hours: number): number {
  if (watts < 0 || hours < 0) return 0;
  return (watts * hours) / 1000;
}

export function WattsToKwhCalculator() {
  const t = useTranslations('calculators.wattsToKwh');
  const [watts, setWatts] = useState<string>('');
  const [hours, setHours] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const w = parseFloat(watts);
    const h = parseFloat(hours);
    
    if (!isNaN(w) && !isNaN(h) && w >= 0 && h >= 0) {
      setResult(wattsToKwh(w, h));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setWatts('');
    setHours('');
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
                <CopyButton text={`${result.toFixed(4)} kWh`} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
