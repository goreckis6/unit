'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';

function calculatePercentError(
  actualValue: number,
  experimentalValue: number
): { percentError: number; absoluteError: number } {
  const absoluteError = Math.abs(experimentalValue - actualValue);
  const percentError = (absoluteError / Math.abs(actualValue)) * 100;
  
  return {
    absoluteError,
    percentError
  };
}

export function PercentErrorCalculator() {
  const t = useTranslations('calculators.percentError');
  const [actualValue, setActualValue] = useState<string>('50');
  const [experimentalValue, setExperimentalValue] = useState<string>('48');
  const [result, setResult] = useState<{ percentError: number; absoluteError: number } | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = () => {
    const actual = parseFloat(actualValue.replace(',', '.'));
    const experimental = parseFloat(experimentalValue.replace(',', '.'));

    if (actualValue && experimentalValue && !isNaN(actual) && !isNaN(experimental)) {
      if (actual === 0) {
        setError(t('errorZero'));
        setResult(null);
      } else {
        setError('');
        const calculated = calculatePercentError(actual, experimental);
        setResult(calculated);
      }
    } else {
      setResult(null);
      setError('');
    }
  };

  const handleReset = () => {
    setActualValue('50');
    setExperimentalValue('48');
    setResult(null);
    setError('');
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="numbers-to-letters-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="actual-value" className="input-label">
                {t('actualValue')}
              </label>
              <input
                id="actual-value"
                type="text"
                inputMode="decimal"
                value={actualValue}
                onChange={(e) => setActualValue(e.target.value)}
                className="number-input"
                placeholder={t('actualPlaceholder')}
                style={{ minHeight: '44px' }}
              />
            </div>

            <div className="input-card">
              <label htmlFor="experimental-value" className="input-label">
                {t('experimentalValue')}
              </label>
              <input
                id="experimental-value"
                type="text"
                inputMode="decimal"
                value={experimentalValue}
                onChange={(e) => setExperimentalValue(e.target.value)}
                className="number-input"
                placeholder={t('experimentalPlaceholder')}
                style={{ minHeight: '44px' }}
              />
            </div>

            {error && (
              <div style={{ 
                color: 'var(--error)', 
                fontSize: '0.9rem',
                padding: '0.75rem',
                background: 'rgba(255, 0, 0, 0.05)',
                borderRadius: '8px'
              }}>
                {error}
              </div>
            )}

            <div className="action-buttons" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem' }}>
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
        <div className="result-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div className="input-card">
            <label className="input-label">
              {t('results')}
            </label>
            {result ? (
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                padding: '1.25rem',
                background: 'var(--card-background)',
                borderRadius: '8px',
                minHeight: '200px'
              }}>
                <div className="result-item">
                  <div className="result-label" style={{ marginBottom: '0.5rem' }}>
                    {t('percentError')}
                  </div>
                  <div className="result-value-box">
                    <span className="result-value" style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                      {result.percentError.toFixed(2)}%
                    </span>
                  </div>
                </div>
                
                <div className="result-item">
                  <div className="result-label" style={{ marginBottom: '0.5rem' }}>
                    {t('absoluteError')}
                  </div>
<div className="result-value-box">
                      <span className="result-value">
                        {result.absoluteError.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                      </span>
                    </div>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <CopyButton text={`${result.percentError.toFixed(2)}% | ${result.absoluteError.toLocaleString(undefined, { maximumFractionDigits: 6 })}`} className="btn btn-secondary" />
                </div>

                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  background: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)'
                }}>
                  <div>{t('formula')}</div>
                  <div style={{ marginTop: '0.25rem', fontFamily: 'monospace' }}>
                    % Error = |Experimental - Actual| / |Actual| × 100
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: '200px',
                padding: '1.25rem',
                opacity: 0.5
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {t('enterValues')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
