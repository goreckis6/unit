'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';

interface ArccosResult {
  radians: number;
  degrees: number;
}

function clampToDomain(x: number): number | null {
  if (Number.isNaN(x)) return null;
  if (x < -1 || x > 1) return null;
  return x;
}

export function ArccosCalculator() {
  const t = useTranslations('calculators.arccos');
  const [x, setX] = useState<string>('');
  const [result, setResult] = useState<ArccosResult | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const parsed = parseFloat(x);
    const clamped = clampToDomain(parsed);

    if (clamped === null) {
      setResult(null);
      return;
    }

    const radians = Math.acos(clamped);
    const degrees = (radians * 180) / Math.PI;

    setResult({ radians, degrees });
  };

  const handleReset = () => {
    setX('');
    setResult(null);
  };

  return (
    <>
      <div className="input-section">
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
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={handleCalculate} className="btn btn-primary">
          {t('calculate')}
        </button>
        <button onClick={handleReset} className="btn btn-secondary">
          {t('reset')}
        </button>
      </div>

      {result !== null && (
        <div ref={resultRef} className="result-section">
          <div className="result-header">
            <div className="result-badge">{t('result')}</div>
          </div>
          <div className="result-display">
            <div className="result-item">
              <div className="result-label">{t('angleDegrees')}</div>
              <div className="result-value-box">
                <span className="result-value">{result.degrees.toFixed(4)}</span>
                <span className="result-unit">°</span>
              </div>
            </div>
            <div className="result-item">
              <div className="result-label">{t('angleRadians')}</div>
              <div className="result-value-box">
                <span className="result-value">{result.radians.toFixed(6)}</span>
                <span className="result-unit">rad</span>
              </div>
            </div>
          </div>

          <div className="seo-content-card" style={{ marginTop: '1.5rem' }}>
            <h3 className="example-heading">{t('calculationHeading')}</h3>
            <p className="example-text">
              {t('calculationIntro')}{' '}
              <strong>x = {parseFloat(x).toString()}</strong>.{' '}
              {t('calculationStepRadians', {
                radians: result.radians.toFixed(6),
              })}{' '}
              {t('calculationStepDegrees', {
                degrees: result.degrees.toFixed(4),
              })}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

