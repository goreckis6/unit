'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

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
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                  {input ? t('clickCalculate') : t('enterNumbers')}
                </span>
              </div>
            )}
            {result !== null && (
              <>
                <div className="result-display">
                  <div className="result-item">
                    <div className="result-label">{t('averageLabel')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{result.average}</span>
                      <CopyButton text={String(result.average)} />
                    </div>
                  </div>
                  <div className="result-item">
                    <div className="result-label">{t('countLabel')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{result.count}</span>
                      <CopyButton text={String(result.count)} />
                    </div>
                  </div>
                  <div className="result-item">
                    <div className="result-label">{t('sumLabel')}</div>
                    <div className="number-input result-value-box">
                      <span className="result-value">{result.sum}</span>
                      <CopyButton text={String(result.sum)} />
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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

