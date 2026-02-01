'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

export function joulesToWatts(joules: number, seconds: number): number {
  if (seconds <= 0) return 0;
  return joules / seconds;
}

export function JoulesToWattsCalculator() {
  const t = useTranslations('calculators.joulesToWatts');
  const [joules, setJoules] = useState<string>('');
  const [seconds, setSeconds] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const j = parseFloat(joules);
    const s = parseFloat(seconds);
    
    if (!isNaN(j) && !isNaN(s) && j > 0 && s > 0) {
      setResult(joulesToWatts(j, s));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setJoules('');
    setSeconds('');
    setResult(null);
  };

  return (
    <>
      <div className="input-section">
        <div className="inputs-grid">
          <div className="input-card">
            <label htmlFor="joules" className="input-label">
              {t('joules')}
            </label>
            <div className="input-with-unit">
              <input
                id="joules"
                type="number"
                value={joules}
                onChange={(e) => setJoules(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="0"
              />
            </div>
          </div>

          <div className="input-card">
            <label htmlFor="seconds" className="input-label">
              {t('seconds')}
            </label>
            <div className="input-with-unit">
              <input
                id="seconds"
                type="number"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
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
              <div className="result-label">Watts (W)</div>
              <div className="number-input result-value-box">
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
