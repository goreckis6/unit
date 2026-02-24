'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

interface ArccosResult {
  radians: number;
  degrees: number;
}

function formatDegreesMinutesSeconds(degrees: number): string {
  const deg = Math.floor(degrees);
  const minutes = Math.floor((degrees - deg) * 60);
  const seconds = Math.round(((degrees - deg) * 60 - minutes) * 60);
  return `${deg}° ${minutes}' ${seconds}"`;
}

export function ArccosCalculator() {
  const t = useTranslations('calculators.arccos');
  const [x, setX] = useState<string>('');
  const [result, setResult] = useState<ArccosResult | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const parsed = parseFloat(x);

    if (Number.isNaN(parsed) || parsed < -1 || parsed > 1) {
      setResult(null);
      return;
    }

    const radians = Math.acos(parsed);
    const degrees = (radians * 180) / Math.PI;

    setResult({ radians, degrees });
  };

  const handleReset = () => {
    setX('');
    setResult(null);
  };

  const xValue = parseFloat(x);

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="inputs-grid">
              <div className="input-card">
                <label htmlFor="x" className="input-label">
                  {t('x')}
                </label>
                <div className="input-with-unit">
                  <input
                    id="x"
                    type="number"
                    step="0.0001"
                    min="-1"
                    max="1"
                    value={x}
                    onChange={(e) => setX(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                    className="number-input"
                    placeholder="0.5"
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
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.7em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    {t('angleDegrees')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ flex: 1, minWidth: 0, color: 'var(--primary-color)', fontWeight: 800 }}>
                      {result.degrees.toFixed(4)}°
                    </span>
                    <CopyButton text={`${result.degrees.toFixed(4)}°`} />
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '0.7em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    {t('angleRadians')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ flex: 1, minWidth: 0, color: 'var(--primary-color)', fontWeight: 800 }}>
                      {result.radians.toFixed(8)} rad
                    </span>
                    <CopyButton text={`${result.radians.toFixed(8)} rad`} />
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

      {result !== null && (
        <div className="seo-content-card" style={{ marginTop: '1.5rem' }}>
          <h3 className="example-heading">{t('calculationHeading')}</h3>
          <div className="example-text" style={{ lineHeight: '1.8' }}>
            <p>
              <strong>arccos({xValue}) = cos⁻¹({xValue}) = {formatDegreesMinutesSeconds(result.degrees)}</strong>
            </p>
            <p>
              = {result.degrees.toFixed(4)}° + k×360° {t('generalSolutionDegrees')}
            </p>
            <p>
              = {result.radians.toFixed(8)} rad + k×2π {t('generalSolutionRadians')}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
