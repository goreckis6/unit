'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

type Fraction = {
  numerator: number;
  denominator: number;
};

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function subtractFractions(a: Fraction, b: Fraction): Fraction {
  const numerator = a.numerator * b.denominator - b.numerator * a.denominator;
  const denominator = a.denominator * b.denominator;
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}

export function SubtractingFractionsCalculator() {
  const t = useTranslations('calculators.subtractingFractions');

  const [formType, setFormType] = useState<'simple' | 'mixed'>('simple');

  // Simple form
  const [n1, setN1] = useState<string>('11');
  const [d1, setD1] = useState<string>('11');
  const [n2, setN2] = useState<string>('11');
  const [d2, setD2] = useState<string>('11');

  // Mixed form
  const [w1, setW1] = useState<string>('0');
  const [w2, setW2] = useState<string>('0');

  const [resultFraction, setResultFraction] = useState<Fraction | null>(null);
  const [resultDecimal, setResultDecimal] = useState<number | null>(null);
  const resultRef = useScrollToResult(resultFraction);

  const getFraction1 = (): Fraction | null => {
    if (formType === 'simple') {
      const num = parseInt(n1, 10);
      const den = parseInt(d1, 10);
      if (Number.isNaN(num) || Number.isNaN(den) || den === 0) return null;
      return { numerator: num, denominator: den };
    }
    const whole = parseInt(w1, 10);
    const num = parseInt(n1, 10);
    const den = parseInt(d1, 10);
    if (Number.isNaN(whole) || Number.isNaN(num) || Number.isNaN(den) || den === 0) return null;
    return { numerator: whole * den + num, denominator: den };
  };

  const getFraction2 = (): Fraction | null => {
    if (formType === 'simple') {
      const num = parseInt(n2, 10);
      const den = parseInt(d2, 10);
      if (Number.isNaN(num) || Number.isNaN(den) || den === 0) return null;
      return { numerator: num, denominator: den };
    }
    const whole = parseInt(w2, 10);
    const num = parseInt(n2, 10);
    const den = parseInt(d2, 10);
    if (Number.isNaN(whole) || Number.isNaN(num) || Number.isNaN(den) || den === 0) return null;
    return { numerator: whole * den + num, denominator: den };
  };

  const handleCalculate = () => {
    const f1 = getFraction1();
    const f2 = getFraction2();
    if (!f1 || !f2) {
      setResultFraction(null);
      setResultDecimal(null);
      return;
    }
    const result = subtractFractions(f1, f2);
    setResultFraction(result);
    setResultDecimal(result.numerator / result.denominator);
  };

  const handleReset = () => {
    setN1('11');
    setD1('11');
    setN2('11');
    setD2('11');
    setW1('0');
    setW2('0');
    setResultFraction(null);
    setResultDecimal(null);
  };

  const f1 = getFraction1();
  const f2 = getFraction2();
  const canCalculate = f1 !== null && f2 !== null;

  const formatDisplayFraction = (f: Fraction) => {
    if (f.denominator === 1) return String(f.numerator);
    return `${f.numerator}/${f.denominator}`;
  };

  return (
    <div>
      <div className="input-section">
        <div className="options-grid options-grid-dropdowns" style={{ marginBottom: '1rem' }}>
          <div className="input-card numbers-to-letters-compact">
            <label htmlFor="formType" className="input-label">
              {t('formTypeLabel')}
            </label>
            <select
              id="formType"
              value={formType}
              onChange={(e) => setFormType(e.target.value as 'simple' | 'mixed')}
              className="number-input select-dropdown"
              style={{ cursor: 'pointer' }}
            >
              <option value="simple">{t('simpleFractionForm')}</option>
              <option value="mixed">{t('mixedNumberForm')}</option>
            </select>
          </div>
        </div>

        <div className="inputs-grid">
          <div className="input-card">
            <div className="input-label" style={{ marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>{t('firstFraction')}</div>
            {formType === 'mixed' && (
              <div style={{ display: 'contents' }}>
                <label htmlFor="w1" className="input-label">
                  {t('wholeNumberW1')}
                </label>
                <input
                  id="w1"
                  type="number"
                  min="0"
                  value={w1}
                  onChange={(e) => setW1(e.target.value)}
                  className="number-input"
                  style={{ marginBottom: '0.75rem' }}
                />
              </div>
            )}
            <label htmlFor="n1" className="input-label">
              {t('numeratorN1')}
            </label>
            <input
              id="n1"
              type="number"
              value={n1}
              onChange={(e) => setN1(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
              className="number-input"
              style={{ marginBottom: '0.75rem' }}
            />
            <label htmlFor="d1" className="input-label">
              {t('denominatorD1')}
            </label>
            <input
              id="d1"
              type="number"
              value={d1}
              onChange={(e) => setD1(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
              className="number-input"
            />
          </div>

          <div className="input-card">
            <div className="input-label" style={{ marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>{t('secondFraction')}</div>
            {formType === 'mixed' && (
              <div style={{ display: 'contents' }}>
                <label htmlFor="w2" className="input-label">
                  {t('wholeNumberW2')}
                </label>
                <input
                  id="w2"
                  type="number"
                  min="0"
                  value={w2}
                  onChange={(e) => setW2(e.target.value)}
                  className="number-input"
                  style={{ marginBottom: '0.75rem' }}
                />
              </div>
            )}
            <label htmlFor="n2" className="input-label">
              {t('numeratorN2')}
            </label>
            <input
              id="n2"
              type="number"
              value={n2}
              onChange={(e) => setN2(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
              className="number-input"
              style={{ marginBottom: '0.75rem' }}
            />
            <label htmlFor="d2" className="input-label">
              {t('denominatorD2')}
            </label>
            <input
              id="d2"
              type="number"
              value={d2}
              onChange={(e) => setD2(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
              className="number-input"
              style={formType === 'mixed' ? { marginBottom: 0 } : undefined}
            />
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={handleCalculate} className="btn btn-primary" disabled={!canCalculate}>
          {t('calculate')}
        </button>
        <button onClick={handleReset} className="btn btn-secondary">
          {t('reset')}
        </button>
      </div>

      {resultFraction !== null && f1 !== null && f2 !== null && (
        <div ref={resultRef} className="result-section">
          <div className="result-header">
            <div className="result-badge">
              {t('result')}
            </div>
          </div>
          <div className="result-display">
            <div className="result-item">
              <div className="result-label">{t('resultEquation')}</div>
              <div className="number-input result-value-box">
                <span className="result-value">
                  {formatDisplayFraction(f1)} - {formatDisplayFraction(f2)} = {formatDisplayFraction(resultFraction)}
                </span>
                <CopyButton text={`${formatDisplayFraction(f1)} - ${formatDisplayFraction(f2)} = ${formatDisplayFraction(resultFraction)}${resultDecimal !== null ? ` (${resultDecimal.toFixed(6).replace(/\.?0+$/, '')})` : ''}`} />
              </div>
            </div>
            {resultDecimal !== null && (
              <div className="result-item">
                <div className="result-label">{t('resultDecimal')}</div>
                <div className="number-input result-value-box">
                  <span className="result-value">
                    {resultDecimal.toFixed(6).replace(/\.?0+$/, '')}
                  </span>
                  <CopyButton text={resultDecimal.toFixed(6).replace(/\.?0+$/, '')} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
