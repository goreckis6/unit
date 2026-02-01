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

  const [expression, setExpression] = useState<string>('');

  const [resultFraction, setResultFraction] = useState<Fraction | null>(null);
  const [resultDecimal, setResultDecimal] = useState<number | null>(null);
  const resultRef = useScrollToResult(resultFraction);

  function parseTerm(term: string): Fraction | null {
    const trimmed = term.trim();
    if (!trimmed) return null;

    // Integer only, e.g. "2" or "-3"
    const intMatch = trimmed.match(/^([+-])?\s*(\d+)\s*$/);
    if (intMatch) {
      const sign = intMatch[1] === '-' ? -1 : 1;
      const whole = parseInt(intMatch[2], 10);
      return { numerator: sign * whole, denominator: 1 };
    }

    // Mixed number or simple fraction, e.g. "1/2", "-1/2", "2 1/2", "-2 1/2"
    const fracMatch = trimmed.match(
      /^([+-])?\s*(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)\s*$/
    );
    if (!fracMatch) return null;

    const sign = fracMatch[1] === '-' ? -1 : 1;
    const wholePart = fracMatch[2] ? parseInt(fracMatch[2], 10) : 0;
    const numPart = parseInt(fracMatch[3], 10);
    const denPart = parseInt(fracMatch[4], 10);

    if (!denPart) return null;

    const improperNumerator = wholePart * denPart + numPart;
    return {
      numerator: sign * improperNumerator,
      denominator: denPart,
    };
  }

  const handleCalculate = () => {
    const parts = expression.split('+');

    if (parts.length < 2) {
      setResultFraction(null);
      setResultDecimal(null);
      return;
    }

    const fractions: Fraction[] = [];

    for (const part of parts) {
      const parsed = parseTerm(part);
      if (!parsed) {
        setResultFraction(null);
        setResultDecimal(null);
        return;
      }
      fractions.push(parsed);
    }

    let sum = fractions[0];
    for (let i = 1; i < fractions.length; i++) {
      sum = addFractions(sum, fractions[i]);
    }

    setResultFraction(sum);
    setResultDecimal(sum.numerator / sum.denominator);
  };

  const handleReset = () => {
    setExpression('');
    setResultFraction(null);
    setResultDecimal(null);
  };

  return (
    <>
      <div className="input-section">
        <div className="input-legend">
          <p className="legend-text">{t('inputLegend')}</p>
        </div>
        <div className="inputs-grid">
          <div className="input-card">
            <label htmlFor="expression" className="input-label">
              {t('title')}
            </label>
            <div className="input-with-unit">
              <input
                id="expression"
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="1/2 + 1/3"
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
                <CopyButton text={`${resultFraction.numerator}/${resultFraction.denominator}${resultDecimal !== null ? ` = ${resultDecimal.toFixed(4)}` : ''}`} />
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

