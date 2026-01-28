'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';

interface AverageResult {
  count: number;
  sum: number;
  average: number;
  numbers: number[];
}

function parseNumbers(input: string): number[] {
  return input
    .split(/[\s,]+/)
    .map((value) => parseFloat(value))
    .filter((value) => !Number.isNaN(value));
}

export function AverageCalculator() {
  const t = useTranslations('calculators.average');
  const [input, setInput] = useState<string>('1 2 5 2 6 6');
  const [result, setResult] = useState<AverageResult | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const numbers = parseNumbers(input);

    if (numbers.length === 0) {
      setResult(null);
      return;
    }

    const sum = numbers.reduce((acc, value) => acc + value, 0);
    const average = sum / numbers.length;

    setResult({
      count: numbers.length,
      sum,
      average,
      numbers,
    });
  };

  const handleReset = () => {
    setInput('');
    setResult(null);
  };

  return (
    <>
      <div className="input-section">
        <div className="inputs-grid">
          <div className="input-card">
            <label htmlFor="numbers" className="input-label">
              {t('enterData')}
            </label>
            <div className="input-with-unit">
              <textarea
                id="numbers"
                className="number-input"
                rows={3}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.ctrlKey || e.metaKey) && handleCalculate()}
                placeholder="1 2 5 2 6 6"
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
              <div className="result-label">{t('averageLabel')}</div>
              <div className="result-value-box">
                <span className="result-value">{result.average}</span>
              </div>
            </div>
            <div className="result-item">
              <div className="result-label">{t('countLabel')}</div>
              <div className="result-value-box">
                <span className="result-value">{result.count}</span>
              </div>
            </div>
            <div className="result-item">
              <div className="result-label">{t('sumLabel')}</div>
              <div className="result-value-box">
                <span className="result-value">{result.sum}</span>
              </div>
            </div>
          </div>

          <div className="seo-content-card" style={{ marginTop: '1.5rem' }}>
            <h3 className="example-heading">{t('stepsHeading')}</h3>
            <div className="example-text" style={{ lineHeight: '1.8' }}>
              <p>{t('stepsFormula')}</p>
              <p>
                {t('stepsExpanded', {
                  numbers: result.numbers.join(' + '),
                  count: result.count,
                })}
              </p>
              <p>
                {t('stepsFraction', {
                  sum: result.sum,
                  count: result.count,
                })}
              </p>
              <p>
                {t('stepsResult', {
                  average: result.average,
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

