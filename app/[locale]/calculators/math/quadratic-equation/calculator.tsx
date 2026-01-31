'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';

const MAX_FRACTION_DIGITS = 6;
const EPSILON = 1e-12;

type ResultKind = 'quadratic' | 'linear' | 'none' | 'infinite';

interface ResultData {
  kind: ResultKind;
  discriminant?: number;
  roots?: { label: string; value: string }[];
  message?: string;
}

function parseNumber(value: string): number | null {
  const normalized = value.trim().replace(/,/g, '.');
  if (!normalized) return null;
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

function formatNumber(value: number, locale: string): string {
  return value.toLocaleString(locale, {
    maximumFractionDigits: MAX_FRACTION_DIGITS,
  });
}

function formatComplex(real: number, imaginary: number, locale: string): string {
  const realText = formatNumber(real, locale);
  const imagText = formatNumber(Math.abs(imaginary), locale);
  const sign = imaginary >= 0 ? '+' : '-';
  return `${realText} ${sign} ${imagText}i`;
}

export function QuadraticEquationCalculator() {
  const t = useTranslations('calculators.quadraticEquation');
  const locale = useLocale();
  const [aValue, setAValue] = useState<string>('1');
  const [bValue, setBValue] = useState<string>('-3');
  const [cValue, setCValue] = useState<string>('2');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const a = parseNumber(aValue);
    const b = parseNumber(bValue);
    const c = parseNumber(cValue);

    if (a === null || b === null || c === null) {
      setError(t('errorInvalid'));
      setResult(null);
      return;
    }

    setError(null);

    if (Math.abs(a) < EPSILON) {
      if (Math.abs(b) < EPSILON) {
        if (Math.abs(c) < EPSILON) {
          setResult({ kind: 'infinite', message: t('infiniteSolutions') });
        } else {
          setResult({ kind: 'none', message: t('noSolution') });
        }
        return;
      }

      const root = -c / b;
      setResult({
        kind: 'linear',
        message: t('linearEquation'),
        roots: [{ label: t('root'), value: formatNumber(root, locale) }],
      });
      return;
    }

    const discriminant = b * b - 4 * a * c;
    const twoA = 2 * a;

    if (discriminant >= 0) {
      const sqrtD = Math.sqrt(discriminant);
      const root1 = (-b + sqrtD) / twoA;
      const root2 = (-b - sqrtD) / twoA;
      setResult({
        kind: 'quadratic',
        discriminant,
        message: t('realRoots'),
        roots: [
          { label: t('root1'), value: formatNumber(root1, locale) },
          { label: t('root2'), value: formatNumber(root2, locale) },
        ],
      });
      return;
    }

    const sqrtAbs = Math.sqrt(-discriminant);
    const realPart = -b / twoA;
    const imagPart = sqrtAbs / twoA;
    setResult({
      kind: 'quadratic',
      discriminant,
      message: t('complexRoots'),
      roots: [
        { label: t('root1'), value: formatComplex(realPart, imagPart, locale) },
        { label: t('root2'), value: formatComplex(realPart, -imagPart, locale) },
      ],
    });
  };

  const handleReset = () => {
    setAValue('1');
    setBValue('-3');
    setCValue('2');
    setError(null);
    setResult(null);
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="inputs-grid">
            <div className="input-card">
              <label htmlFor="coefficient-a" className="input-label">
                {t('coefficientA')}
              </label>
              <div className="input-with-unit">
                <input
                  id="coefficient-a"
                  type="text"
                  inputMode="decimal"
                  value={aValue}
                  onChange={(e) => setAValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder="1"
                />
              </div>
            </div>

            <div className="input-card">
              <label htmlFor="coefficient-b" className="input-label">
                {t('coefficientB')}
              </label>
              <div className="input-with-unit">
                <input
                  id="coefficient-b"
                  type="text"
                  inputMode="decimal"
                  value={bValue}
                  onChange={(e) => setBValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="input-card">
              <label htmlFor="coefficient-c" className="input-label">
                {t('coefficientC')}
              </label>
              <div className="input-with-unit">
                <input
                  id="coefficient-c"
                  type="text"
                  inputMode="decimal"
                  value={cValue}
                  onChange={(e) => setCValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="seo-paragraph" style={{ color: 'var(--error)', marginTop: '1rem', marginBottom: '0', fontSize: '0.9rem' }}>
              {error}
            </p>
          )}

          <div className="action-buttons" style={{ marginTop: '1.5rem' }}>
            <button onClick={handleCalculate} className="btn btn-primary" style={{ minHeight: '44px', minWidth: '44px' }}>
              {t('calculate')}
            </button>
            <button onClick={handleReset} className="btn btn-secondary" style={{ minHeight: '44px', minWidth: '44px' }}>
              {t('reset')}
            </button>
          </div>
        </div>

        {/* Right Column - Output */}
        <div className="result-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          {result ? (
            <div ref={resultRef}>
              <div className="result-header">
                <div className="result-badge">{t('result')}</div>
              </div>
              <div className="result-display">
                {result.message && (
                  <div className="result-item">
                    <div className="result-label">{t('status')}</div>
                    <div className="result-value-box">
                      <span className="result-value">{result.message}</span>
                    </div>
                  </div>
                )}
                {typeof result.discriminant === 'number' && (
                  <div className="result-item">
                    <div className="result-label">{t('discriminant')}</div>
                    <div className="result-value-box">
                      <span className="result-value">{formatNumber(result.discriminant, locale)}</span>
                    </div>
                  </div>
                )}
                {result.roots?.map((root) => (
                  <div key={root.label} className="result-item">
                    <div className="result-label">{root.label}</div>
                    <div className="result-value-box">
                      <span className="result-value">{root.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: '200px',
              opacity: 0.5
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {t('calculate')}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
