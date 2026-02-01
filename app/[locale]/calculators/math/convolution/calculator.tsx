'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';

function parseSequence(input: string): number[] {
  if (!input.trim()) return [];
  
  // Split by spaces, commas, or semicolons and parse as numbers
  const values = input
    .trim()
    .split(/[\s,;]+/)
    .map(s => parseFloat(s.trim()))
    .filter(n => !isNaN(n));
  
  return values;
}

function convolve(a: number[], b: number[]): number[] {
  if (a.length === 0 || b.length === 0) return [];
  
  const resultLength = a.length + b.length - 1;
  const result: number[] = new Array(resultLength).fill(0);
  
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] += a[i] * b[j];
    }
  }
  
  // Round to avoid floating point errors
  return result.map(v => Math.round(v * 1000000) / 1000000);
}

function formatResult(arr: number[]): string {
  return arr.map(n => {
    // Format to remove trailing zeros
    if (Number.isInteger(n)) {
      return n.toString();
    }
    return n.toFixed(6).replace(/\.?0+$/, '');
  }).join(' ');
}

export function ConvolutionCalculator() {
  const t = useTranslations('calculators.convolution');
  const [sequence1, setSequence1] = useState<string>('');
  const [sequence2, setSequence2] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleCalculate = () => {
    setError('');
    
    const seq1 = parseSequence(sequence1);
    const seq2 = parseSequence(sequence2);
    
    if (seq1.length === 0) {
      setError(t('errorEmptyFirst'));
      setResult('');
      return;
    }
    
    if (seq2.length === 0) {
      setError(t('errorEmptySecond'));
      setResult('');
      return;
    }
    
    const convolved = convolve(seq1, seq2);
    setResult(formatResult(convolved));
  };

  const handleReset = () => {
    setSequence1('');
    setSequence2('');
    setResult('');
    setError('');
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Inputs */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="numbers-to-letters-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="sequence1" className="input-label">
                {t('firstSequence')}
              </label>
              <input
                id="sequence1"
                type="text"
                value={sequence1}
                onChange={(e) => setSequence1(e.target.value)}
                className="number-input"
                placeholder={t('firstPlaceholder')}
                style={{ minHeight: '52px' }}
              />
            </div>

            <div className="input-card">
              <label htmlFor="sequence2" className="input-label">
                {t('secondSequence')}
              </label>
              <input
                id="sequence2"
                type="text"
                value={sequence2}
                onChange={(e) => setSequence2(e.target.value)}
                className="number-input"
                placeholder={t('secondPlaceholder')}
                style={{ minHeight: '52px' }}
              />
            </div>

            <div className="action-buttons" style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
              <button onClick={handleCalculate} className="btn btn-primary" style={{ minHeight: '44px', flex: 1 }}>
                {t('calculate')}
              </button>
              <button onClick={handleReset} className="btn btn-secondary" style={{ minHeight: '44px', minWidth: '100px' }}>
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Output */}
        <div className="result-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div className="input-card">
            <label className="input-label">
              {t('resultSequence')}
            </label>
            {error ? (
              <div className="number-input" style={{ 
                minHeight: '100px',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontFamily: 'monospace',
                fontSize: '0.95em',
                padding: '1.25rem',
                color: 'var(--error-color, #dc3545)'
              }}>
                {error}
              </div>
            ) : result ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="number-input" style={{ 
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap', 
                  minHeight: '100px',
                  fontFamily: 'monospace',
                  fontSize: '1.1em',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {result}
                </div>
                <CopyButton text={result} />
              </div>
            ) : (
              <div className="number-input" style={{ 
                minHeight: '100px',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontFamily: 'monospace',
                fontSize: '0.95em',
                padding: '1.25rem',
                opacity: 0.5
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {t('resultPlaceholder')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
