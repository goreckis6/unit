'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

/** Apparent power: kVA = VA / 1000 */
export function vaToKva(va: number): number {
  if (va < 0) return 0;
  return va / 1000;
}

export function VaToKvaCalculator() {
  const t = useTranslations('calculators.vaToKva');
  const [va, setVa] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const vaVal = parseFloat(va);
    if (!isNaN(vaVal) && vaVal >= 0) {
      setResult(vaToKva(vaVal));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setVa('');
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
                    {result.toFixed(4)} kVA
                  </span>
                  <CopyButton text={`${result.toFixed(4)} kVA`} />
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
