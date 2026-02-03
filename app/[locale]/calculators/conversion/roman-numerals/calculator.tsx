'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

type ConversionMode = 'arabicToRoman' | 'romanToArabic';

// Roman numeral conversion mappings
const romanNumeralMap: [number, string][] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

function arabicToRoman(num: number): string {
  if (num <= 0 || num > 3999) {
    return '';
  }

  let result = '';
  let remaining = num;

  for (const [value, numeral] of romanNumeralMap) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }

  return result;
}

function romanToArabic(roman: string): number | null {
  const romanUpper = roman.toUpperCase().trim();
  
  // Validate Roman numeral format
  const validPattern = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
  if (!validPattern.test(romanUpper)) {
    return null;
  }

  const romanValues: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  let result = 0;
  let prevValue = 0;

  for (let i = romanUpper.length - 1; i >= 0; i--) {
    const currentValue = romanValues[romanUpper[i]];
    
    if (currentValue < prevValue) {
      result -= currentValue;
    } else {
      result += currentValue;
    }
    
    prevValue = currentValue;
  }

  return result;
}

export function RomanNumeralsCalculator() {
  const t = useTranslations('calculators.romanNumerals');
  const [mode, setMode] = useState<ConversionMode>('arabicToRoman');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useScrollToResult(result);

  const handleCalculate = () => {
    setError(null);
    setResult(null);

    if (!input.trim()) {
      return;
    }

    if (mode === 'arabicToRoman') {
      const num = parseInt(input, 10);
      
      if (isNaN(num)) {
        setError(t('errorInvalidNumber'));
        return;
      }
      
      if (num < 1 || num > 3999) {
        setError(t('errorOutOfRange'));
        return;
      }

      const roman = arabicToRoman(num);
      setResult(roman);
    } else {
      const arabic = romanToArabic(input);
      
      if (arabic === null) {
        setError(t('errorInvalidRoman'));
        return;
      }

      setResult(arabic.toString());
    }
  };

  const handleReset = () => {
    setInput('');
    setResult(null);
    setError(null);
  };

  const handleModeChange = (newMode: ConversionMode) => {
    setMode(newMode);
    setInput('');
    setResult(null);
    setError(null);
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="mode" className="input-label">
                {t('conversionDirection')}
              </label>
              <select
                id="mode"
                value={mode}
                onChange={(e) => handleModeChange(e.target.value as ConversionMode)}
                className="number-input select-dropdown"
                style={{ cursor: 'pointer' }}
              >
                <option value="arabicToRoman">{t('arabicToRoman')}</option>
                <option value="romanToArabic">{t('romanToArabic')}</option>
              </select>
            </div>

            <div className="input-card">
              <label htmlFor="input" className="input-label">
                {mode === 'arabicToRoman' ? t('arabicNumber') : t('romanNumeral')}
              </label>
              <input
                id="input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="number-input"
                placeholder={mode === 'arabicToRoman' ? t('arabicPlaceholder') : t('romanPlaceholder')}
              />
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
            {error && (
              <div
                className="number-input"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '52px',
                  padding: '0.75rem 1rem',
                  color: 'var(--error-color, #ef4444)',
                }}
              >
                <span>{error}</span>
              </div>
            )}
            {!error && result === null && (
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
                  {input ? t('clickCalculate') : t('enterValue')}
                </span>
              </div>
            )}
            {!error && result !== null && (
              <div className="result-display">
                <div className="result-item">
                  <div className="result-label">
                    {mode === 'arabicToRoman' ? t('romanNumeral') : t('arabicNumber')}
                  </div>
                  <div className="number-input result-value-box">
                    <span className="result-value" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {result}
                    </span>
                    <CopyButton text={result} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
