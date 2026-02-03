'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScrollToResult } from '@/hooks/useScrollToResult';
import { CopyButton } from '@/components/CopyButton';

type ConversionMode = 'arabicToRoman' | 'romanToArabic';

interface ConversionResult {
  input: string;
  output: string;
  breakdown: string;
  isValid: boolean;
  error?: string;
}

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

function getBreakdown(num: number): string {
  const parts: string[] = [];
  let remaining = num;

  for (const [value, numeral] of romanNumeralMap) {
    while (remaining >= value) {
      if (numeral === 'CM' || numeral === 'CD' || numeral === 'XC' || numeral === 'XL' || numeral === 'IX' || numeral === 'IV') {
        parts.push(`${numeral} (${value})`);
      } else {
        parts.push(`${numeral} (${value})`);
      }
      remaining -= value;
    }
  }

  return parts.join(' + ');
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
  const [results, setResults] = useState<ConversionResult[]>([]);
  const resultRef = useScrollToResult(results.length > 0 ? 'has-results' : null);

  const handleCalculate = () => {
    if (!input.trim()) {
      return;
    }

    // Split input by comma, semicolon, space, or newline
    const inputs = input
      .split(/[,;\s\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const processedResults: ConversionResult[] = [];

    if (mode === 'arabicToRoman') {
      inputs.forEach(numStr => {
        const num = parseInt(numStr, 10);
        
        if (isNaN(num)) {
          processedResults.push({
            input: numStr,
            output: '',
            breakdown: '',
            isValid: false,
            error: t('errorInvalidNumber'),
          });
        } else if (num < 1 || num > 3999) {
          processedResults.push({
            input: numStr,
            output: '',
            breakdown: '',
            isValid: false,
            error: t('errorOutOfRange'),
          });
        } else {
          const roman = arabicToRoman(num);
          processedResults.push({
            input: numStr,
            output: roman,
            breakdown: getBreakdown(num),
            isValid: true,
          });
        }
      });
    } else {
      inputs.forEach(romanStr => {
        const arabic = romanToArabic(romanStr);
        
        if (arabic === null) {
          processedResults.push({
            input: romanStr,
            output: '',
            breakdown: '',
            isValid: false,
            error: t('errorInvalidRoman'),
          });
        } else {
          processedResults.push({
            input: romanStr,
            output: arabic.toString(),
            breakdown: getBreakdown(arabic),
            isValid: true,
          });
        }
      });
    }

    setResults(processedResults);
  };

  const handleReset = () => {
    setInput('');
    setResults([]);
  };

  const handleModeChange = (newMode: ConversionMode) => {
    setMode(newMode);
    setInput('');
    setResults([]);
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
              <textarea
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && handleCalculate()}
                className="number-input"
                placeholder={mode === 'arabicToRoman' ? t('arabicPlaceholder') : t('romanPlaceholder')}
                rows={3}
                style={{
                  resize: 'vertical',
                  minHeight: '80px',
                  fontFamily: 'inherit',
                }}
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
            {results.length === 0 && (
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
            {results.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.95rem',
                }}>
                  <thead>
                    <tr style={{
                      borderBottom: '2px solid var(--border-color, #e5e7eb)',
                      backgroundColor: 'var(--table-header-bg, #f9fafb)',
                    }}>
                      <th style={{
                        padding: '0.75rem',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                      }}>
                        {mode === 'arabicToRoman' ? t('arabicNumber') : t('romanNumeral')}
                      </th>
                      <th style={{
                        padding: '0.75rem',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                      }}>
                        {mode === 'arabicToRoman' ? t('romanNumeral') : t('arabicNumber')}
                      </th>
                      <th style={{
                        padding: '0.75rem',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                      }}>
                        Breakdown
                      </th>
                      <th style={{
                        padding: '0.75rem',
                        textAlign: 'center',
                        fontWeight: '600',
                        width: '60px',
                      }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr
                        key={index}
                        style={{
                          borderBottom: '1px solid var(--border-color, #e5e7eb)',
                          backgroundColor: result.isValid ? 'transparent' : 'rgba(239, 68, 68, 0.05)',
                        }}
                      >
                        <td style={{
                          padding: '0.75rem',
                          fontWeight: '500',
                          color: result.isValid ? 'var(--text-primary)' : 'var(--error-color, #ef4444)',
                        }}>
                          {result.input}
                        </td>
                        <td style={{
                          padding: '0.75rem',
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                          color: result.isValid ? 'var(--text-primary)' : 'var(--error-color, #ef4444)',
                        }}>
                          {result.isValid ? result.output : result.error}
                        </td>
                        <td style={{
                          padding: '0.75rem',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                        }}>
                          {result.isValid ? result.breakdown : '—'}
                        </td>
                        <td style={{
                          padding: '0.75rem',
                          textAlign: 'center',
                        }}>
                          {result.isValid && <CopyButton text={result.output} />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {results.length > 1 && results.every(r => r.isValid) && (
                  <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                    <CopyButton
                      text={results.map(r => `${r.input} = ${r.output}`).join('\n')}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
