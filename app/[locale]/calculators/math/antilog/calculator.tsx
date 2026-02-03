'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

export function calculateAntilog(value: number, base: number = 10): number {
  return Math.pow(base, value);
}

export function AntilogCalculator() {
  const t = useTranslations('calculators.antilog');
  const [value, setValue] = useState<string>('');
  const [base, setBase] = useState<string>('10');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const v = parseFloat(value);
    const b = parseFloat(base);
    
    if (!isNaN(v) && !isNaN(b) && b > 0 && b !== 1) {
      setResult(calculateAntilog(v, b));
    } else {
      setResult(null);
    }
  };

  const handleReset = () => {
    setValue('');
    setBase('10');
    setResult(null);
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="value" className="input-label">
                {t('value')}
              </label>
              <input
                id="value"
                type="number"
                step="any"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="2"
              />
            </div>

            <div className="input-card">
              <label htmlFor="base" className="input-label">
                {t('base')}
              </label>
              <input
                id="base"
                type="number"
                step="any"
                min="0.01"
                value={base}
                onChange={(e) => setBase(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="10"
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
                  {value || base !== '10' ? t('clickCalculate') : t('enterValues')}
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
                <span>{result.toFixed(6)}</span>
                <CopyButton text={String(result.toFixed(6))} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
