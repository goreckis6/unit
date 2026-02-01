'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

function calculateLCM(numbers: number[]): {
  result: number;
  steps: string[];
  isValid: boolean;
  error?: string;
} {
  if (numbers.length === 0) {
    return { result: 0, steps: [], isValid: false, error: 'empty' };
  }

  if (numbers.length === 1) {
    return { 
      result: Math.abs(numbers[0]), 
      steps: [`LCM(${numbers[0]}) = ${Math.abs(numbers[0])}`], 
      isValid: true 
    };
  }

  const steps: string[] = [];
  let result = Math.abs(numbers[0]);
  
  for (let i = 1; i < numbers.length; i++) {
    const prev = result;
    const current = Math.abs(numbers[i]);
    result = lcm(result, current);
    
    if (i === 1) {
      steps.push(`LCM(${Math.abs(numbers[0])}, ${current}) = ${result}`);
    } else {
      steps.push(`LCM(${prev}, ${current}) = ${result}`);
    }
  }

  return { result, steps, isValid: true };
}

export function LCMCalculator() {
  const t = useTranslations('calculators.lcm');
  const [inputValue, setInputValue] = useState<string>('');
  const [result, setResult] = useState<{
    lcm: number;
    numbers: number[];
    steps: string[];
  } | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = () => {
    if (!inputValue.trim()) {
      setError('');
      setResult(null);
      return;
    }

    // Parse input - support comma, space, semicolon separators
    const parts = inputValue.split(/[,;\s]+/).filter(part => part.trim() !== '');
    const numbers: number[] = [];
    
    for (const part of parts) {
      const num = parseInt(part.trim(), 10);
      if (isNaN(num)) {
        setError(t('errorInvalid'));
        setResult(null);
        return;
      }
      if (num === 0) {
        setError(t('errorZero'));
        setResult(null);
        return;
      }
      numbers.push(num);
    }

    if (numbers.length < 2) {
      setError(t('errorMinTwo'));
      setResult(null);
      return;
    }

    const calculation = calculateLCM(numbers);
    
    if (!calculation.isValid) {
      setError(t('errorInvalid'));
      setResult(null);
      return;
    }

    setError('');
    setResult({
      lcm: calculation.result,
      numbers: numbers,
      steps: calculation.steps
    });
  };

  const handleReset = () => {
    setInputValue('');
    setResult(null);
    setError('');
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="numbers-to-letters-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="numbers-input" className="input-label">
                {t('inputLabel')}
              </label>
              <textarea
                id="numbers-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="number-input"
                placeholder={t('inputPlaceholder')}
                rows={6}
                style={{ 
                  resize: 'vertical', 
                  minHeight: '120px',
                  fontFamily: 'monospace'
                }}
              />
              <div style={{ 
                marginTop: '0.5rem', 
                fontSize: '0.85rem', 
                color: 'var(--text-secondary)',
                lineHeight: '1.4'
              }}>
                {t('inputHint')}
              </div>
            </div>

            {error && (
              <div style={{ 
                color: 'var(--error)', 
                fontSize: '0.9rem',
                padding: '0.75rem',
                background: 'rgba(255, 0, 0, 0.05)',
                borderRadius: '8px'
              }}>
                {error}
              </div>
            )}

            <div className="action-buttons" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleCalculate} className="btn btn-primary" style={{ minHeight: '44px', minWidth: '44px' }}>
                {t('calculate')}
              </button>
              <button onClick={handleReset} className="btn btn-secondary" style={{ minHeight: '44px', minWidth: '44px' }}>
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Output */}
        <div className="result-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div className="input-card">
            <label className="input-label">
              {t('results')}
            </label>
            {result ? (
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                padding: '1.25rem',
                background: 'var(--card-background)',
                borderRadius: '8px',
                minHeight: '200px'
              }}>
                {/* Numbers */}
                <div className="result-item">
                  <div className="result-label" style={{ marginBottom: '0.5rem' }}>
                    {t('numbers')}
                  </div>
                  <div className="number-input result-value-box">
                    <span className="result-value" style={{ fontFamily: 'monospace' }}>
                      {result.numbers.join(', ')}
                    </span>
                    <CopyButton text={result.numbers.join(', ')} />
                  </div>
                </div>

                {/* LCM Result */}
                <div className="result-item">
                  <div className="result-label" style={{ marginBottom: '0.5rem' }}>
                    {t('lcmResult')}
                  </div>
                  <div className="number-input result-value-box">
                    <span className="result-value" style={{ fontSize: '1.75rem', fontWeight: '600' }}>
                      {result.lcm.toLocaleString()}
                    </span>
                    <CopyButton text={result.lcm.toLocaleString()} />
                  </div>
                </div>

                {/* Calculation Steps */}
                {result.steps.length > 0 && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    background: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>{t('steps')}</div>
                    <div style={{ fontFamily: 'monospace', lineHeight: '1.8' }}>
                      {result.steps.map((step, idx) => (
                        <div key={idx}>{step}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formula */}
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  background: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{t('formula')}</div>
                  <div style={{ fontFamily: 'monospace' }}>
                    LCM(a, b) = |a × b| / GCD(a, b)
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: '200px',
                padding: '1.25rem',
                opacity: 0.5
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {t('enterNumbers')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
