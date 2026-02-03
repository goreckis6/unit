'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';

export function LowercaseToUppercaseCalculator() {
  const t = useTranslations('calculators.lowercaseToUppercase');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const handleConvert = () => {
    setResult(input.toUpperCase());
  };

  const handleReset = () => {
    setInput('');
    setResult('');
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Input */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="input-text" className="input-label">
                {t('inputLabel')}
              </label>
              <textarea
                id="input-text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="number-input"
                rows={6}
                placeholder={t('inputPlaceholder')}
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div className="action-buttons" style={{ minHeight: '44px', minWidth: '140px', gap: '0.75rem' }}>
              <button onClick={handleConvert} className="btn btn-primary">
                {t('convert')}
              </button>
              <button onClick={handleReset} className="btn btn-secondary">
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Result */}
        <div className="result-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div className="input-card">
            <div className="result-header">
              <h3 className="result-title">{t('resultLabel')}</h3>
              {result && <CopyButton text={result} />}
            </div>

            {result ? (
              <div
                className="number-input"
                style={{
                  minHeight: '200px',
                  padding: '1rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'inherit',
                  lineHeight: '1.6',
                }}
              >
                {result}
              </div>
            ) : (
              <div
                className="number-input"
                style={{
                  minHeight: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                }}
              >
                {input ? t('clickConvert') : t('enterText')}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
