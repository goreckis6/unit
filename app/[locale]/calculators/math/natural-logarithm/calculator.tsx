'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';

// Function to calculate natural logarithm
function calculateNaturalLog(x: number): {
  result: number;
  isValid: boolean;
  errorType?: 'negative' | 'zero' | 'invalid';
} {
  if (isNaN(x)) {
    return { result: 0, isValid: false, errorType: 'invalid' };
  }
  
  if (x === 0) {
    return { result: 0, isValid: false, errorType: 'zero' };
  }
  
  if (x < 0) {
    return { result: 0, isValid: false, errorType: 'negative' };
  }
  
  const result = Math.log(x);
  return { result, isValid: true };
}

export function NaturalLogarithmCalculator() {
  const t = useTranslations('calculators.naturalLogarithm');
  const [inputValue, setInputValue] = useState<string>('');
  const [result, setResult] = useState<{
    ln: number;
    input: number;
  } | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = () => {
    const x = parseFloat(inputValue.replace(',', '.'));
    
    if (!inputValue) {
      setError('');
      setResult(null);
      return;
    }

    const calculation = calculateNaturalLog(x);
    
    if (!calculation.isValid) {
      if (calculation.errorType === 'zero') {
        setError(t('errorZero'));
      } else if (calculation.errorType === 'negative') {
        setError(t('errorNegative'));
      } else {
        setError(t('errorInvalid'));
      }
      setResult(null);
      return;
    }
    
    setError('');
    setResult({
      ln: calculation.result,
      input: x
    });
  };

  const handleReset = () => {
    setInputValue('');
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
              <label htmlFor="input-value" className="input-label">
                {t('inputLabel')}
              </label>
              <input
                id="input-value"
                type="text"
                inputMode="decimal"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="number-input"
                placeholder={t('inputPlaceholder')}
                style={{ minHeight: '44px' }}
              />
              <div style={{ 
                marginTop: '0.5rem', 
                fontSize: '0.85rem', 
                color: 'var(--text-secondary)',
                lineHeight: '1.4'
              }}>
                {t('inputHint')}
              </div>
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
                {/* Main Result */}
                <div className="result-item">
                  <div className="result-label" style={{ marginBottom: '0.5rem' }}>
                    {t('naturalLog')}
                  </div>
                  <div className="number-input result-value-box">
                    <span className="result-value" style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                      {result.ln.toLocaleString(undefined, { maximumFractionDigits: 10 })}
                    </span>
                    <CopyButton text={result.ln.toLocaleString(undefined, { maximumFractionDigits: 10 })} />
                  </div>
                </div>

                {/* Formula */}
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
                    ln({result.input}) = {result.ln.toLocaleString(undefined, { maximumFractionDigits: 10 })}
                  </div>
                </div>

                {/* Common Values Reference */}
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  background: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>{t('commonValues')}</div>
                  <div style={{ fontFamily: 'monospace', lineHeight: '1.6' }}>
                    <div>ln(1) = 0</div>
                    <div>ln(e) ≈ 1</div>
                    <div>ln(10) ≈ 2.302585</div>
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
                  {t('enterValue')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
