'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';
import { useScrollToResult } from '@/hooks/useScrollToResult';

export function UppercaseToLowercaseCalculator() {
  const t = useTranslations('calculators.uppercaseToLowercase');

  const [text, setText] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const resultRef = useScrollToResult(result || null);

  const handleConvert = () => {
    setResult(text ? text.toLowerCase() : '');
  };

  const handleReset = () => {
    setText('');
    setResult('');
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Input */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="text" className="input-label">
                {t('textLabel')}
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="number-input"
                placeholder={t('textPlaceholder')}
                rows={8}
                style={{
                  resize: 'vertical',
                  minHeight: '200px',
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleConvert();
                  }
                }}
              />
            </div>

            <div className="action-buttons" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleConvert}
                className="btn btn-primary"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                {t('convert')}
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

        {/* Right Column - Result */}
        <div
          ref={resultRef}
          className="result-section"
          style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}
        >
          <div className="input-card">
            <label className="input-label">{t('resultLabel')}</label>

            {(!result && !text) && (
              <div
                className="number-input"
                style={{
                  minHeight: '220px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.6,
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>{t('resultPlaceholder')}</span>
              </div>
            )}

            {(text && !result) && (
              <div
                className="number-input"
                style={{
                  minHeight: '220px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.6,
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>{t('pendingMessage')}</span>
              </div>
            )}

            {result && (
              <div
                className="number-input"
                style={{
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  minHeight: '220px',
                  resize: 'vertical',
                  overflowY: 'auto',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ flex: 1, minWidth: 0 }}>{result}</span>
                  <CopyButton text={result} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

