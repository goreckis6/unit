'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

/** mAh = (Wh × 1000) / V; convert energy to battery capacity */
export function whToMah(wh: number, voltage: number): number {
  if (voltage <= 0 || wh < 0) return 0;
  return (wh * 1000) / voltage;
}

export function WhToMahCalculator() {
  const t = useTranslations('calculators.whToMah');
  const [wh, setWh] = useState<string>('');
  const [voltage, setVoltage] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const w = parseFloat(wh);
    const v = parseFloat(voltage);
    
    if (!isNaN(w) && !isNaN(v) && w >= 0 && v > 0) {
      setResult(whToMah(w, v));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setWh('');
    setVoltage('');
    setResult(null);
  };

  return (
    <>
      <div className="input-section">
        <div className="inputs-grid">
          <div className="input-card">
            <label htmlFor="wh" className="input-label">
              {t('wh')}
            </label>
            <div className="input-with-unit">
              <input
                id="wh"
                type="number"
                value={wh}
                onChange={(e) => setWh(e.target.value)}
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
        <div ref={resultRef} className="result-section">
          <div className="result-header">
            <div className="result-badge">
              {t('result')}
            </div>
          </div>
          <div className="result-display">
            <div className="result-item">
              <div className="result-label">{t('mah')}</div>
              <div className="result-value-box">
                <span className="result-value">{result.toFixed(2)}</span>
                <span className="result-unit">mAh</span>
                <CopyButton text={`${result.toFixed(2)} mAh`} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
