'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

interface PercentageIncreaseResult {
  percentageChange: number;
  difference: number;
}

export function PercentageIncreaseCalculator() {
  const t = useTranslations('calculators.percentageIncrease');
  const [fromValue, setFromValue] = useState<string>('');
  const [toValue, setToValue] = useState<string>('');
  const [result, setResult] = useState<PercentageIncreaseResult | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const from = parseFloat(fromValue);
    const to = parseFloat(toValue);

    if (Number.isNaN(from) || Number.isNaN(to) || from === 0) {
      setResult(null);
      return;
    }

    const difference = to - from;
    const percentageChange = (difference / from) * 100;

    setResult({ percentageChange, difference });
  };

  const handleReset = () => {
    setFromValue('');
    setToValue('');
    setResult(null);
  };

  const from = parseFloat(fromValue);
  const to = parseFloat(toValue);

  const formattedPercent =
    result !== null ? `${result.percentageChange.toFixed(4)} %` : '';
  const formattedDifference =
    result !== null ? result.difference.toFixed(4) : '';

  const isIncrease = result !== null && result.percentageChange > 0;
  const isDecrease = result !== null && result.percentageChange < 0;

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="inputs-grid">
              <div className="input-card">
                <label htmlFor="from" className="input-label">
                  {t('from')}
                </label>
                <div className="input-with-unit">
                  <input
                    id="from"
                    type="number"
                    step="0.0001"
                    value={fromValue}
                    onChange={(e) => setFromValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                    className="number-input"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="input-card">
                <label htmlFor="to" className="input-label">
                  {t('to')}
                </label>
                <div className="input-with-unit">
                  <input
                    id="to"
                    type="number"
                    step="0.0001"
                    value={toValue}
                    onChange={(e) => setToValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                    className="number-input"
                    placeholder="125"
                  />
                </div>
              </div>
            </div>

            <div className="action-buttons" style={{ marginTop: '0.5rem' }}>
              <button
                onClick={handleCalculate}
                className="btn btn-primary"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                {t('calculate')}
              </button>
              <button
                onClick={handleReset}
                className="btn btn-secondary"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
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
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontSize: '1.5em',
                  fontWeight: 500,
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  letterSpacing: '0.02em',
                  lineHeight: 1.6,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '0.7em',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {t('percentageChangeLabel')}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        color: 'var(--primary-color)',
                        fontWeight: 800,
                      }}
                    >
                      {formattedPercent}
                    </span>
                    <CopyButton text={formattedPercent} />
                  </div>
                  {(isIncrease || isDecrease) && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        fontSize: '0.7em',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {isIncrease && t('increaseNote')}
                      {isDecrease && t('decreaseNote')}
                    </div>
                  )}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '0.7em',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {t('differenceLabel')}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        color: 'var(--primary-color)',
                        fontWeight: 800,
                      }}
                    >
                      {formattedDifference}
                    </span>
                    <CopyButton text={formattedDifference} />
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
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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

      {result !== null && !Number.isNaN(from) && !Number.isNaN(to) && from !== 0 && (
        <div className="seo-content-card" style={{ marginTop: '1.5rem' }}>
          <h3 className="example-heading">{t('calculationHeading')}</h3>
          <div className="example-text" style={{ lineHeight: '1.8' }}>
            <p>
              <strong>
                {t('summaryLine', {
                  from: from.toString(),
                  to: to.toString(),
                  percent: result.percentageChange.toFixed(4),
                })}
              </strong>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

