'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

export function add(a: number, b: number): number {
  return a + b;
}

export function AdditionCalculator() {
  const t = useTranslations('calculators.addition');
  const [first, setFirst] = useState<string>('');
  const [second, setSecond] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const a = parseFloat(first);
    const b = parseFloat(second);
    
    if (!isNaN(a) && !isNaN(b)) {
      setResult(add(a, b));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setFirst('');
    setSecond('');
    setResult(null);
  };

  return (
    <>
      <div className="input-section">
        <div className="inputs-grid">
          <div className="input-card">
            <label htmlFor="first" className="input-label">
              {t('firstNumber')}
            </label>
            <div className="input-with-unit">
              <input
                id="first"
                type="number"
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="0"
              />
            </div>
          </div>

          <div className="input-card">
            <label htmlFor="second" className="input-label">
              {t('secondNumber')}
            </label>
            <div className="input-with-unit">
              <input
                id="second"
                type="number"
                value={second}
                onChange={(e) => setSecond(e.target.value)}
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
          Reset
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
              <div className="result-label">Result</div>
              <div className="number-input result-value-box">
                <span className="result-value">{result}</span>
                <CopyButton text={String(result)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
