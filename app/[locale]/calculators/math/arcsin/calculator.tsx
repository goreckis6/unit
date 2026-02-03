'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

interface ArcsinResult {
  radians: number;
  degrees: number;
}

function clampToDomain(x: number): number | null {
  if (Number.isNaN(x)) return null;
  if (x < -1 || x > 1) return null;
  return x;
}

function formatDegreesMinutesSeconds(degrees: number): string {
  const deg = Math.floor(degrees);
  const minutes = Math.floor((degrees - deg) * 60);
  const seconds = Math.round(((degrees - deg) * 60 - minutes) * 60);
  return `${deg}° ${minutes}' ${seconds}"`;
}

export function ArcsinCalculator() {
  const t = useTranslations('calculators.arcsin');
  const [x, setX] = useState<string>('');
  const [result, setResult] = useState<ArcsinResult | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const parsed = parseFloat(x);
    const clamped = clampToDomain(parsed);

    if (clamped === null) {
      setResult(null);
      return;
    }

    const radians = Math.asin(clamped);
    const degrees = (radians * 180) / Math.PI;

    setResult({ radians, degrees });
  };

  const handleReset = () => {
    setX('');
    setResult(null);
  };

  const xValue = parseFloat(x);
  const isInteger = !isNaN(xValue) && Number.isInteger(xValue);

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="x" className="input-label">
                {t('x')}
              </label>
              <div className="input-with-unit">
                <input
                  id="x"
                  type="number"
                  step="0.0001"
                  min={-1}
                  max={1}
                  value={x}
                  onChange={(e) => setX(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder="0.5"
                />
              </div>
            </div>

            <div className="action-buttons" style={{ minHeight: '44px', minWidth: '140px', gap: '0.75rem' }}>
              <button onClick={handleCalculate} className="btn btn-primary">
                {t('calculate')}
              </button>
              <button onClick={handleReset} className="btn btn-secondary">
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '52px',
                  padding: '0.75rem 1rem',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>
                  {x ? t('clickCalculate') : t('enterValue')}
                </span>
              </div>
            )}
            {result !== null && (
              <>
                <div className="result-display">
                  <div className="result-item">
                    <div className="result-label">{t('angleDegrees')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{result.degrees.toFixed(4)}</span>
                      <span className="result-unit">°</span>
                      <CopyButton text={`${result.degrees.toFixed(4)} °`} />
                    </div>
                  </div>
                  <div className="result-item">
                    <div className="result-label">{t('angleRadians')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{result.radians.toFixed(6)}</span>
                      <span className="result-unit">rad</span>
                      <CopyButton text={`${result.radians.toFixed(6)} rad`} />
                    </div>
                  </div>
                </div>

                <div className="seo-content-card" style={{ marginTop: '1.5rem' }}>
                  <h3 className="example-heading">{t('calculationHeading')}</h3>
                  <div className="example-text" style={{ lineHeight: '1.8' }}>
                    <p>
                      <strong>arcsin {xValue} = sin⁻¹ {xValue} = {formatDegreesMinutesSeconds(result.degrees)}</strong>
                    </p>
                    <p>
                      = {result.degrees.toFixed(4)}° + k×360° {t('generalSolutionDegrees')}
                    </p>
                    <p>
                      = {result.radians.toFixed(6)} rad + k×2π {t('generalSolutionRadians')}
                    </p>
                    {result.radians % (Math.PI / 2) < 0.0001 && (
                      <p>
                        = {(result.radians / Math.PI).toFixed(1)}π rad + k×2π {t('generalSolutionRadians')}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
