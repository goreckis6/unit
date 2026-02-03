'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

interface FactorsResult {
  commonFactors: number[];
  gcf: number;
}

function getFactors(num: number): number[] {
  const factors: number[] = [];
  const absNum = Math.abs(Math.floor(num));
  
  if (absNum === 0) return [];
  
  for (let i = 1; i <= absNum; i++) {
    if (absNum % i === 0) {
      factors.push(i);
    }
  }
  
  return factors;
}

function getCommonFactors(num1: number, num2: number): number[] {
  const factors1 = getFactors(num1);
  const factors2 = getFactors(num2);
  
  return factors1.filter(factor => factors2.includes(factor));
}

function getGCF(num1: number, num2: number): number {
  const commonFactors = getCommonFactors(num1, num2);
  return commonFactors.length > 0 ? Math.max(...commonFactors) : 0;
}

export function CommonFactorsCalculator() {
  const t = useTranslations('calculators.commonFactors');
  const [number1, setNumber1] = useState<string>('');
  const [number2, setNumber2] = useState<string>('');
  const [result, setResult] = useState<FactorsResult | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const num1 = parseInt(number1);
    const num2 = parseInt(number2);

    if (Number.isNaN(num1) || Number.isNaN(num2) || num1 === 0 || num2 === 0) {
      setResult(null);
      return;
    }

    const commonFactors = getCommonFactors(num1, num2);
    const gcf = getGCF(num1, num2);

    setResult({ commonFactors, gcf });
  };

  const handleReset = () => {
    setNumber1('');
    setNumber2('');
    setResult(null);
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="number1" className="input-label">
                {t('number1')}
              </label>
              <div className="input-with-unit">
                <input
                  id="number1"
                  type="number"
                  step="1"
                  value={number1}
                  onChange={(e) => setNumber1(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder="12"
                />
              </div>
            </div>

            <div className="input-card">
              <label htmlFor="number2" className="input-label">
                {t('number2')}
              </label>
              <div className="input-with-unit">
                <input
                  id="number2"
                  type="number"
                  step="1"
                  value={number2}
                  onChange={(e) => setNumber2(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  className="number-input"
                  placeholder="18"
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
                  {number1 || number2 ? t('clickCalculate') : t('enterNumbers')}
                </span>
              </div>
            )}
            {result !== null && (
              <>
                <div className="result-item">
                  <div className="result-label">{t('gcfLabel')}</div>
                  <div className="result-value-large">
                    {result.gcf}
                    <CopyButton text={result.gcf.toString()} />
                  </div>
                </div>

                <div className="result-item" style={{ marginTop: '1rem' }}>
                  <div className="result-label">{t('commonFactorsLabel')}</div>
                  <div className="result-value-large">
                    {result.commonFactors.join(', ')}
                    <CopyButton text={result.commonFactors.join(', ')} />
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
