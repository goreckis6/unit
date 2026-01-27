'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';

export function voltsToJoules(volts: number, coulombs: number): number {
  if (volts < 0 || coulombs <= 0) return 0;
  return volts * coulombs;
}

export function VoltsToJoulesCalculator() {
  const t = useTranslations('calculators.voltsToJoules');
  const [volts, setVolts] = useState<string>('');
  const [coulombs, setCoulombs] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const v = parseFloat(volts);
    const c = parseFloat(coulombs);
    if (!isNaN(v) && !isNaN(c) && v >= 0 && c > 0) {
      setResult(voltsToJoules(v, c));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setVolts('');
    setCoulombs('');
    setResult(null);
  };

  return (
    <>
      <div className="input-section">
        <div className="inputs-grid">
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
          <div className="input-card">
            <label htmlFor="coulombs" className="input-label">
              {t('coulombs')}
            </label>
            <div className="input-with-unit">
              <input
                id="coulombs"
                type="number"
                value={coulombs}
                onChange={(e) => setCoulombs(e.target.value)}
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
            <div className="result-badge">{t('result')}</div>
          </div>
          <div className="result-display">
            <div className="result-item">
              <div className="result-label">{t('joules')}</div>
              <div className="result-value-box">
                <span className="result-value">{result.toFixed(4)}</span>
                <span className="result-unit">J</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
