'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';

type CalculationType = 'percentageOf' | 'whatPercent' | 'increaseDecrease';

export function PercentageCalculator() {
  const t = useTranslations('calculators.percentage');
  const [calcType, setCalcType] = useState<CalculationType>('percentageOf');
  const [value1, setValue1] = useState<string>('');
  const [value2, setValue2] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    const v1 = parseFloat(value1);
    const v2 = parseFloat(value2);
    
    if (isNaN(v1) || isNaN(v2)) {
      setResult(null);
      return;
    }

    let calculatedResult: number | null = null;

    switch (calcType) {
      case 'percentageOf':
        // What is X% of Y?
        calculatedResult = (v1 / 100) * v2;
        break;
      case 'whatPercent':
        // X is what percent of Y?
        if (v2 === 0) {
          calculatedResult = null;
        } else {
          calculatedResult = (v1 / v2) * 100;
        }
        break;
      case 'increaseDecrease':
        // What is the percentage increase/decrease from X to Y?
        if (v1 === 0) {
          calculatedResult = null;
        } else {
          calculatedResult = ((v2 - v1) / v1) * 100;
        }
        break;
    }

    setResult(calculatedResult);
  };

  const handleReset = () => {
    setValue1('');
    setValue2('');
    setResult(null);
  };

  return (
    <>
      <div className="input-section">
        <div className="calc-type-selector">
          <button
            className={`calc-type-btn ${calcType === 'percentageOf' ? 'active' : ''}`}
            onClick={() => {
              setCalcType('percentageOf');
              setValue1('');
              setValue2('');
              setResult(null);
            }}
          >
            {t('type1.label')}
          </button>
          <button
            className={`calc-type-btn ${calcType === 'whatPercent' ? 'active' : ''}`}
            onClick={() => {
              setCalcType('whatPercent');
              setValue1('');
              setValue2('');
              setResult(null);
            }}
          >
            {t('type2.label')}
          </button>
          <button
            className={`calc-type-btn ${calcType === 'increaseDecrease' ? 'active' : ''}`}
            onClick={() => {
              setCalcType('increaseDecrease');
              setValue1('');
              setValue2('');
              setResult(null);
            }}
          >
            {t('type3.label')}
          </button>
        </div>

        <div className="inputs-grid">
          <div className="input-card">
            <label htmlFor="value1" className="input-label">
              {calcType === 'percentageOf' && t('type1.value1')}
              {calcType === 'whatPercent' && t('type2.value1')}
              {calcType === 'increaseDecrease' && t('type3.value1')}
            </label>
            <div className="input-with-unit">
              <input
                id="value1"
                type="number"
                value={value1}
                onChange={(e) => setValue1(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="0"
              />
              {calcType === 'percentageOf' && <span className="input-unit">%</span>}
            </div>
          </div>

          <div className="input-card">
            <label htmlFor="value2" className="input-label">
              {calcType === 'percentageOf' && t('type1.value2')}
              {calcType === 'whatPercent' && t('type2.value2')}
              {calcType === 'increaseDecrease' && t('type3.value2')}
            </label>
            <div className="input-with-unit">
              <input
                id="value2"
                type="number"
                value={value2}
                onChange={(e) => setValue2(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder="0"
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
            <div className="result-badge">
              {t('result')}
            </div>
          </div>
          <div className="result-display">
            <div className="result-item">
              <div className="result-label">
                {calcType === 'percentageOf' && t('type1.result')}
                {calcType === 'whatPercent' && t('type2.result')}
                {calcType === 'increaseDecrease' && (
                  result >= 0 ? t('type3.resultIncrease') : t('type3.resultDecrease')
                )}
              </div>
              <div className="result-value-box">
                <span className="result-value">
                  {calcType === 'whatPercent' || calcType === 'increaseDecrease'
                    ? result.toFixed(2)
                    : result.toFixed(4)}
                </span>
                <span className="result-unit">
                  {calcType === 'whatPercent' || calcType === 'increaseDecrease' ? '%' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
