'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

export function joulesToVolts(joules: number, coulombs: number): number {
  if (coulombs <= 0) return 0;
  return joules / coulombs;
}

export function JoulesToVoltsCalculator() {
  const t = useTranslations('calculators.joulesToVolts');
  const [joules, setJoules] = useState<string>('');
  const [coulombs, setCoulombs] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const j = parseFloat(joules);
    const c = parseFloat(coulombs);
    
    if (!isNaN(j) && !isNaN(c) && j > 0 && c > 0) {
      setResult(joulesToVolts(j, c));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setJoules('');
    setCoulombs('');
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
            <div className="result-badge">
              {t('result')}
            </div>
          </div>
          <div className="result-display">
            <div className="result-item">
              <div className="result-label">Volts (V)</div>
              <div className="number-input result-value-box">
                <span className="result-value">{result.toFixed(4)}</span>
                <span className="result-unit">V</span>
                <CopyButton text={`${result.toFixed(4)} V`} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
