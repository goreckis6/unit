'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

interface IntegersResult {
  sum: number;
  difference: number;
}

export function AddingSubtractingIntegersCalculator() {
  const t = useTranslations('calculators.addingSubtractingIntegers');
  const [integer1, setInteger1] = useState<string>('');
  const [integer2, setInteger2] = useState<string>('');
  const [result, setResult] = useState<IntegersResult | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const num1 = parseFloat(integer1);
    const num2 = parseFloat(integer2);

    if (Number.isNaN(num1) || Number.isNaN(num2)) {
      setResult(null);
      return;
    }

    const sum = num1 + num2;
    const difference = num1 - num2;

    setResult({ sum, difference });
  };

  const handleReset = () => {
    setInteger1('');
    setInteger2('');
    setResult(null);
  };

  const formattedSum = result !== null ? result.sum.toString() : '';
  const formattedDifference = result !== null ? result.difference.toString() : '';

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="inputs-grid">
              <div className="input-card">
                <label htmlFor="integer1" className="input-label">
                  {t('integer1')}
                </label>
                <div className="input-with-unit">
                  <input
                    id="integer1"
                    type="number"
                    step="1"
                    value={integer1}
                    onChange={(e) => setInteger1(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                    className="number-input"
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="input-card">
                <label htmlFor="integer2" className="input-label">
                  {t('integer2')}
                </label>
                <div className="input-with-unit">
                  <input
                    id="integer2"
                    type="number"
                    step="1"
                    value={integer2}
                    onChange={(e) => setInteger2(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                    className="number-input"
                    placeholder="3"
                  />
                </div>
              </div>
            </div>

            <div className="action-buttons" style={{ marginTop: '0.5rem' }}>
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
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontSize: '1.5em',
                  fontWeight: 500,
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  letterSpacing: '0.02em',
                  lineHeight: 1.6,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '0.7em',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {t('sumLabel')}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        color: 'var(--primary-color)',
                        fontWeight: 800,
                      }}
                    >
                      {formattedSum}
                    </span>
                    <CopyButton text={formattedSum} />
                  </div>
                </div>

                <div style={{ 
                  height: '1px', 
                  backgroundColor: 'var(--border-color)',
                  margin: '0.5rem 0'
                }} />

                <div>
                  <div
                    style={{
                      fontSize: '0.7em',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {t('differenceLabel')}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        color: 'var(--primary-color)',
                        fontWeight: 800,
                      }}
                    >
                      {formattedDifference}
                    </span>
                    <CopyButton text={formattedDifference} />
                  </div>
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
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
