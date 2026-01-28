'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';

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

export function addFractions(a: Fraction, b: Fraction): Fraction {
  const numerator = a.numerator * b.denominator + b.numerator * a.denominator;
  const denominator = a.denominator * b.denominator;
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}

export function AddingFractionsCalculator() {
  const t = useTranslations('calculators.addingFractions');

  const [num1, setNum1] = useState<string>('');
  const [den1, setDen1] = useState<string>('');
  const [num2, setNum2] = useState<string>('');
  const [den2, setDen2] = useState<string>('');

  const [resultFraction, setResultFraction] = useState<Fraction | null>(null);
  const [resultDecimal, setResultDecimal] = useState<number | null>(null);
  const resultRef = useScrollToResult(resultFraction);

  const handleCalculate = () => {
    const n1 = parseFloat(num1);
    const d1 = parseFloat(den1);
    const n2 = parseFloat(num2);
    const d2 = parseFloat(den2);

    if (
      !isNaN(n1) &&
      !isNaN(d1) &&
      !isNaN(n2) &&
      !isNaN(d2) &&
      d1 !== 0 &&
      d2 !== 0
    ) {
      const sum = addFractions(
        { numerator: n1, denominator: d1 },
        { numerator: n2, denominator: d2 }
      );
      setResultFraction(sum);
      setResultDecimal(sum.numerator / sum.denominator);
    } else {
      setResultFraction(null);
      setResultDecimal(null);
    }
  };

  const handleReset = () => {
    setNum1('');
    setDen1('');
    setNum2('');
    setDen2('');
    setResultFraction(null);
    setResultDecimal(null);
  };

  return (
    <>
      <div className="input-section">
        <div className="inputs-grid">
          <div className="input-card">
            <label htmlFor="num1" className="input-label">
              {t('firstNumerator')}
            </label>
            <div className="input-with-unit">
              <input
                id="num1"
                type="number"
                value={num1}
                onChange={(e) => setNum1(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="1"
              />
            </div>
          </div>

          <div className="input-card">
            <label htmlFor="den1" className="input-label">
              {t('firstDenominator')}
            </label>
            <div className="input-with-unit">
              <input
                id="den1"
                type="number"
                value={den1}
                onChange={(e) => setDen1(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="2"
              />
            </div>
          </div>

          <div className="input-card">
            <label htmlFor="num2" className="input-label">
              {t('secondNumerator')}
            </label>
            <div className="input-with-unit">
              <input
                id="num2"
                type="number"
                value={num2}
                onChange={(e) => setNum2(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="1"
              />
            </div>
          </div>

          <div className="input-card">
            <label htmlFor="den2" className="input-label">
              {t('secondDenominator')}
            </label>
            <div className="input-with-unit">
              <input
                id="den2"
                type="number"
                value={den2}
                onChange={(e) => setDen2(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="3"
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

      {resultFraction && (
        <div ref={resultRef} className="result-section">
          <div className="result-header">
            <div className="result-badge">
              {t('result')}
            </div>
          </div>
          <div className="result-display">
            <div className="result-item">
              <div className="result-label">{t('resultFraction')}</div>
              <div className="result-value-box">
                <span className="result-value">
                  {resultFraction.numerator}/{resultFraction.denominator}
                </span>
              </div>
            </div>
            {resultDecimal !== null && (
              <div className="result-item">
                <div className="result-label">{t('resultDecimal')}</div>
                <div className="result-value-box">
                  <span className="result-value">
                    {resultDecimal.toFixed(4)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

