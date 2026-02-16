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
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="first" className="input-label">
                {t('firstNumber')}
              </label>
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

            <div className="input-card">
              <label htmlFor="second" className="input-label">
                {t('secondNumber')}
              </label>
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

            <div className="action-buttons" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleCalculate}
                className="btn btn-primary"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                {t('calculate')}
              </button>
              <button
                onClick={handleReset}
                className="btn btn-secondary"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Result */}
        <div
          ref={resultRef}
          className="result-section"
          style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}
        >
          <div className="input-card">
            <label className="input-label">{t('result')}</label>

            {result === null && (
              <div
                className="number-input"
                style={{
                  minHeight: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.6,
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>
                  {first || second ? t('clickCalculate') : t('enterNumbers')}
                </span>
              </div>
            )}

            {result !== null && (
              <div
                className="number-input"
                style={{
                  minHeight: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                }}
              >
                <span>{result}</span>
                <CopyButton text={String(result)} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
