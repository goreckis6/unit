'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

export function kvaToVa(kva: number): number {
  if (kva <= 0) return 0;
  return kva * 1000;
}

export function KvaToVaCalculator() {
  const t = useTranslations('calculators.kvaToVa');
  const [kva, setKva] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const k = parseFloat(kva);
    
    if (!isNaN(k) && k > 0) {
      setResult(kvaToVa(k));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setKva('');
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
              <div className="result-label">{t('va')}</div>
              <div className="result-value-box">
                <span className="result-value">{result.toFixed(2)}</span>
                <span className="result-unit">VA</span>
                <CopyButton text={`${result.toFixed(2)} VA`} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
