'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

/** Real power: W = VA × PF */
export function vaToWatts(va: number, powerFactor: number): number {
  if (powerFactor <= 0 || powerFactor > 1 || va < 0) return 0;
  return va * powerFactor;
}

export function VaToWattsCalculator() {
  const t = useTranslations('calculators.vaToWatts');
  const [va, setVa] = useState<string>('');
  const [powerFactor, setPowerFactor] = useState<string>('0.8');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const vaVal = parseFloat(va);
    const pf = parseFloat(powerFactor);

    if (!isNaN(vaVal) && !isNaN(pf) && vaVal >= 0 && pf > 0 && pf <= 1) {
      setResult(vaToWatts(vaVal, pf));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setVa('');
    setPowerFactor('0.8');
    setResult(null);
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="inputs-grid">
              <div className="input-card">
                <label htmlFor="va" className="input-label">
                  {t('va')}
                </label>
                <div className="input-with-unit">
                  <input
                    id="va"
                    type="number"
                    value={va}
                    onChange={(e) => setVa(e.target.value)}
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

            <div className="action-buttons" style={{ marginTop: '0.5rem' }}>
              <button onClick={handleCalculate} className="btn btn-primary" style={{ minHeight: '44px', minWidth: '44px' }}>
                {t('calculate')}
              </button>
              <button onClick={handleReset} className="btn btn-secondary" style={{ minHeight: '44px', minWidth: '44px' }}>
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Output */}
        <div
          ref={resultRef}
          className="result-section"
          style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}
        >
          <div className="input-card">
            <label className="input-label">
              {t('result')}
            </label>
            {result !== null ? (
              <div
                className="number-input"
                style={{
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  minHeight: '264px',
                  resize: 'vertical',
                  overflowY: 'auto',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontSize: '1.5em',
                  fontWeight: '500',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  letterSpacing: '0.02em',
                  lineHeight: '1.6',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ flex: 1, minWidth: 0, color: 'var(--primary-color)', fontWeight: 800 }}>
                    {result.toFixed(4)} W
                  </span>
                  <CopyButton text={`${result.toFixed(4)} W`} />
                </div>
              </div>
            ) : (
              <div
                className="number-input"
                style={{
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  minHeight: '264px',
                  resize: 'vertical',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontSize: '1.1em',
                  padding: '1.5rem',
                  opacity: 0.5,
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>
                  {t('calculate')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
