'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

interface KelvinToCelsiusResult {
  celsius: number;
}

export function KelvinToCelsiusCalculator() {
  const t = useTranslations('calculators.kelvinToCelsius');
  const [kelvin, setKelvin] = useState<string>('');
  const [result, setResult] = useState<KelvinToCelsiusResult | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const k = parseFloat(kelvin);

    if (Number.isNaN(k)) {
      setResult(null);
      return;
    }

    const celsius = k - 273.15;

    setResult({ celsius });
  };

  const handleReset = () => {
    setKelvin('');
    setResult(null);
  };

  const formattedCelsius =
    result !== null ? `${result.celsius.toFixed(2)} °C` : '';

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="inputs-grid">
              <div className="input-card">
                <label htmlFor="kelvin" className="input-label">
                  {t('kelvin')}
                </label>
                <div className="input-with-unit">
                  <input
                    id="kelvin"
                    type="number"
                    step="0.01"
                    value={kelvin}
                    onChange={(e) => setKelvin(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                    className="number-input"
                    placeholder="273.15"
                  />
                  <span className="unit-label">K</span>
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
                    {t('celsiusLabel')}
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
                      {formattedCelsius}
                    </span>
                    <CopyButton text={formattedCelsius} />
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
