'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function PercentageCalculator() {
  const t = useTranslations('calculators.percentage');
  
  // Section 1: What is X% of Y?
  const [section1Percent, setSection1Percent] = useState<string>('');
  const [section1Number, setSection1Number] = useState<string>('');
  const [section1Result, setSection1Result] = useState<number | null>(null);

  // Section 2: X is what percentage of Y?
  const [section2Number1, setSection2Number1] = useState<string>('');
  const [section2Number2, setSection2Number2] = useState<string>('');
  const [section2Result, setSection2Result] = useState<number | null>(null);

  // Section 3: Percentage increase/decrease from X to Y?
  const [section3From, setSection3From] = useState<string>('');
  const [section3To, setSection3To] = useState<string>('');
  const [section3Result, setSection3Result] = useState<number | null>(null);

  const handleCalculate1 = () => {
    const percent = parseFloat(section1Percent);
    const number = parseFloat(section1Number);
    
    if (!isNaN(percent) && !isNaN(number)) {
      setSection1Result((percent / 100) * number);
    } else {
      setSection1Result(null);
    }
  };

  const handleCalculate2 = () => {
    const num1 = parseFloat(section2Number1);
    const num2 = parseFloat(section2Number2);
    
    if (!isNaN(num1) && !isNaN(num2) && num2 !== 0) {
      setSection2Result((num1 / num2) * 100);
    } else {
      setSection2Result(null);
    }
  };

  const handleCalculate3 = () => {
    const from = parseFloat(section3From);
    const to = parseFloat(section3To);
    
    if (!isNaN(from) && !isNaN(to) && from !== 0) {
      setSection3Result(((to - from) / from) * 100);
    } else {
      setSection3Result(null);
    }
  };

  const handleReset1 = () => {
    setSection1Percent('');
    setSection1Number('');
    setSection1Result(null);
  };

  const handleReset2 = () => {
    setSection2Number1('');
    setSection2Number2('');
    setSection2Result(null);
  };

  const handleReset3 = () => {
    setSection3From('');
    setSection3To('');
    setSection3Result(null);
  };

  return (
    <>
      {/* Section 1: What is X% of Y? */}
      <div className="calculator-section">
        <div className="section-header">
          <h3 className="section-title">{t('type1.label')}</h3>
        </div>
        
        <div className="input-section">
          <div className="inputs-grid inputs-grid-3">
            <div className="input-card">
              <label htmlFor="section1-percent" className="input-label">
                {t('type1.value1')}
              </label>
              <div className="input-with-unit">
                <input
                  id="section1-percent"
                  type="number"
                  value={section1Percent}
                  onChange={(e) => setSection1Percent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate1()}
                  className="number-input"
                  placeholder="0"
                />
                <span className="input-unit">%</span>
              </div>
            </div>

            <div className="input-card">
              <label htmlFor="section1-number" className="input-label">
                {t('type1.value2')}
              </label>
              <div className="input-with-unit">
                <input
                  id="section1-number"
                  type="number"
                  value={section1Number}
                  onChange={(e) => setSection1Number(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate1()}
                  className="number-input"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="input-card">
              <label className="input-label">{t('result')}</label>
              <div className="input-with-unit">
                <div className="result-input-display">
                  {section1Result !== null ? (
                    <span className="result-value-inline">{section1Result.toFixed(4)}</span>
                  ) : (
                    <span className="result-placeholder">—</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={handleCalculate1} className="btn btn-primary">
            {t('calculate')}
          </button>
          <button onClick={handleReset1} className="btn btn-secondary">
            {t('reset')}
          </button>
        </div>
      </div>

      {/* Section 2: X is what percentage of Y? */}
      <div className="calculator-section">
        <div className="section-header">
          <h3 className="section-title">{t('type2.label')}</h3>
        </div>
        
        <div className="input-section">
          <div className="inputs-grid inputs-grid-3">
            <div className="input-card">
              <label htmlFor="section2-number1" className="input-label">
                {t('type2.value1')}
              </label>
              <div className="input-with-unit">
                <input
                  id="section2-number1"
                  type="number"
                  value={section2Number1}
                  onChange={(e) => setSection2Number1(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate2()}
                  className="number-input"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="input-card">
              <label htmlFor="section2-number2" className="input-label">
                {t('type2.value2')}
              </label>
              <div className="input-with-unit">
                <input
                  id="section2-number2"
                  type="number"
                  value={section2Number2}
                  onChange={(e) => setSection2Number2(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate2()}
                  className="number-input"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="input-card">
              <label className="input-label">{t('type2.result')}</label>
              <div className="input-with-unit">
                <div className="result-input-display">
                  {section2Result !== null ? (
                    <>
                      <span className="result-value-inline">{section2Result.toFixed(2)}</span>
                      <span className="result-unit">%</span>
                    </>
                  ) : (
                    <span className="result-placeholder">—</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={handleCalculate2} className="btn btn-primary">
            {t('calculate')}
          </button>
          <button onClick={handleReset2} className="btn btn-secondary">
            {t('reset')}
          </button>
        </div>
      </div>

      {/* Section 3: Percentage increase/decrease from X to Y? */}
      <div className="calculator-section">
        <div className="section-header">
          <h3 className="section-title">{t('type3.label')}</h3>
        </div>
        
        <div className="input-section">
          <div className="inputs-grid inputs-grid-3">
            <div className="input-card">
              <label htmlFor="section3-from" className="input-label">
                {t('type3.value1')}
              </label>
              <div className="input-with-unit">
                <input
                  id="section3-from"
                  type="number"
                  value={section3From}
                  onChange={(e) => setSection3From(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate3()}
                  className="number-input"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="input-card">
              <label htmlFor="section3-to" className="input-label">
                {t('type3.value2')}
              </label>
              <div className="input-with-unit">
                <input
                  id="section3-to"
                  type="number"
                  value={section3To}
                  onChange={(e) => setSection3To(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculate3()}
                  className="number-input"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="input-card">
              <label className="input-label">
                {section3Result !== null && section3Result >= 0 
                  ? t('type3.resultIncrease') 
                  : section3Result !== null 
                    ? t('type3.resultDecrease')
                    : t('type3.resultIncrease')}
              </label>
              <div className="input-with-unit">
                <div className="result-input-display">
                  {section3Result !== null ? (
                    <>
                      <span className="result-value-inline">{section3Result.toFixed(2)}</span>
                      <span className="result-unit">%</span>
                    </>
                  ) : (
                    <span className="result-placeholder">—</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={handleCalculate3} className="btn btn-primary">
            {t('calculate')}
          </button>
          <button onClick={handleReset3} className="btn btn-secondary">
            {t('reset')}
          </button>
        </div>
      </div>
    </>
  );
}
