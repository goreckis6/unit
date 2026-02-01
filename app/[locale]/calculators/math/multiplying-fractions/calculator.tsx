'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

// Function to find GCD (Greatest Common Divisor)
function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

// Function to simplify a fraction
function simplifyFraction(numerator: number, denominator: number): { num: number; den: number } {
  if (denominator === 0) {
    return { num: 0, den: 1 };
  }
  
  const divisor = gcd(numerator, denominator);
  let num = numerator / divisor;
  let den = denominator / divisor;
  
  // Keep denominator positive
  if (den < 0) {
    num = -num;
    den = -den;
  }
  
  return { num, den };
}

// Function to multiply fractions
function multiplyFractions(
  num1: number,
  den1: number,
  num2: number,
  den2: number
): { numerator: number; denominator: number; simplified: { num: number; den: number }; decimal: number } {
  const numerator = num1 * num2;
  const denominator = den1 * den2;
  const simplified = simplifyFraction(numerator, denominator);
  const decimal = denominator !== 0 ? numerator / denominator : 0;
  
  return { numerator, denominator, simplified, decimal };
}

export function MultiplyingFractionsCalculator() {
  const t = useTranslations('calculators.multiplyingFractions');
  const [num1, setNum1] = useState<string>('1');
  const [den1, setDen1] = useState<string>('2');
  const [num2, setNum2] = useState<string>('3');
  const [den2, setDen2] = useState<string>('4');
  const [result, setResult] = useState<{
    numerator: number;
    denominator: number;
    simplified: { num: number; den: number };
    decimal: number;
  } | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = () => {
    const n1 = parseInt(num1);
    const d1 = parseInt(den1);
    const n2 = parseInt(num2);
    const d2 = parseInt(den2);

    if (isNaN(n1) || isNaN(d1) || isNaN(n2) || isNaN(d2)) {
      setError(t('errorInvalidInput'));
      setResult(null);
      return;
    }

    if (d1 === 0 || d2 === 0) {
      setError(t('errorZeroDenominator'));
      setResult(null);
      return;
    }

    setError('');
    const calculated = multiplyFractions(n1, d1, n2, d2);
    setResult(calculated);
  };

  const handleReset = () => {
    setNum1('1');
    setDen1('2');
    setNum2('3');
    setDen2('4');
    setResult(null);
    setError('');
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="numbers-to-letters-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* First Fraction */}
            <div className="input-card">
              <label className="input-label">
                {t('firstFraction')}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="number"
                  inputMode="numeric"
                  value={num1}
                  onChange={(e) => setNum1(e.target.value)}
                  className="number-input"
                  placeholder={t('numerator')}
                  style={{ minHeight: '44px', flex: 1 }}
                />
                <span style={{ fontSize: '1.5rem', fontWeight: '300', color: 'var(--text-secondary)' }}>/</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={den1}
                  onChange={(e) => setDen1(e.target.value)}
                  className="number-input"
                  placeholder={t('denominator')}
                  style={{ minHeight: '44px', flex: 1 }}
                />
              </div>
            </div>

            {/* Second Fraction */}
            <div className="input-card">
              <label className="input-label">
                {t('secondFraction')}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="number"
                  inputMode="numeric"
                  value={num2}
                  onChange={(e) => setNum2(e.target.value)}
                  className="number-input"
                  placeholder={t('numerator')}
                  style={{ minHeight: '44px', flex: 1 }}
                />
                <span style={{ fontSize: '1.5rem', fontWeight: '300', color: 'var(--text-secondary)' }}>/</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={den2}
                  onChange={(e) => setDen2(e.target.value)}
                  className="number-input"
                  placeholder={t('denominator')}
                  style={{ minHeight: '44px', flex: 1 }}
                />
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
                {/* Original Result */}
                <div className="result-item">
                  <div className="result-label" style={{ marginBottom: '0.5rem' }}>
                    {t('product')}
                  </div>
                  <div className="result-value-box">
                    <span className="result-value" style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                      {result.numerator}/{result.denominator}
                    </span>
                  </div>
                </div>

                {/* Simplified Result */}
                {(result.simplified.num !== result.numerator || result.simplified.den !== result.denominator) && (
                  <div className="result-item">
                    <div className="result-label" style={{ marginBottom: '0.5rem' }}>
                      {t('simplified')}
                    </div>
                    <div className="result-value-box">
                      <span className="result-value" style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                        {result.simplified.num}/{result.simplified.den}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Decimal Result */}
                <div className="result-item">
                  <div className="result-label" style={{ marginBottom: '0.5rem' }}>
                    {t('decimal')}
                  </div>
                  <div className="result-value-box">
                    <span className="result-value">
                      {result.decimal.toLocaleString(undefined, { maximumFractionDigits: 10 })}
                    </span>
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
                    ({parseInt(num1)}/{parseInt(den1)}) × ({parseInt(num2)}/{parseInt(den2)}) = {result.numerator}/{result.denominator}
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
                  {t('enterFractions')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
