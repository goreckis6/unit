'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

export function kvaToWatts(kva: number, powerFactor: number): number {
  if (powerFactor <= 0 || powerFactor > 1) return 0;
  return kva * 1000 * powerFactor;
}

export function KvaToWattsCalculator() {
  const t = useTranslations('calculators.kvaToWatts');
  const [kva, setKva] = useState<string>('');
  const [powerFactor, setPowerFactor] = useState<string>('0.8');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const k = parseFloat(kva);
    const pf = parseFloat(powerFactor);
    
    if (!isNaN(k) && !isNaN(pf) && k > 0 && pf > 0 && pf <= 1) {
      setResult(kvaToWatts(k, pf));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setKva('');
    setPowerFactor('0.8');
    setResult(null);
  };

  return (
    <>
      <div className="input-section">
        <div className="inputs-grid">
          <div className="input-card">
            <label htmlFor="kva" className="input-label">
              {t('kva')}
            </label>
            <div className="input-with-unit">
              <input
                id="kva"
                type="number"
                value={kva}
                onChange={(e) => setKva(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="0"
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
        <div ref={resultRef} className="result-section">
          <div className="result-header">
            <div className="result-badge">
              {t('result')}
            </div>
          </div>
          <div className="result-display">
            <div className="result-item">
              <div className="result-label">Watts (W)</div>
              <div className="result-value-box">
                <span className="result-value">{result.toFixed(4)}</span>
                <span className="result-unit">W</span>
                <CopyButton text={`${result.toFixed(4)} W`} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
