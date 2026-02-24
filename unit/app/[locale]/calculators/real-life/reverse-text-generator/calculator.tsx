'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';

function reverseEntireText(text: string): string {
  if (!text) return '';
  return [...text].reverse().join('');
}

function reverseWordOrder(text: string): string {
  if (!text.trim()) return '';
  return text.trim().split(/\s+/).reverse().join(' ');
}

function reverseLettersInWords(text: string): string {
  if (!text.trim()) return '';
  return text
    .trim()
    .split(/(\s+)/)
    .map((part) => (/\s/.test(part) ? part : [...part].reverse().join('')))
    .join('');
}

export function ReverseTextGeneratorCalculator() {
  const t = useTranslations('calculators.reverseTextGenerator');
  const [text, setText] = useState<string>('');
  const [reverseText, setReverseText] = useState<string>('');
  const [reverseWording, setReverseWording] = useState<string>('');
  const [reverseLetters, setReverseLetters] = useState<string>('');

  useEffect(() => {
    if (text) {
      setReverseText(reverseEntireText(text));
      setReverseWording(reverseWordOrder(text));
      setReverseLetters(reverseLettersInWords(text));
    } else {
      setReverseText('');
      setReverseWording('');
      setReverseLetters('');
    }
  }, [text]);

  const handleReset = () => {
    setText('');
    setReverseText('');
    setReverseWording('');
    setReverseLetters('');
  };

  const outputStyle = {
    wordWrap: 'break-word' as const,
    wordBreak: 'break-word' as const,
    overflowWrap: 'break-word' as const,
    whiteSpace: 'pre-wrap' as const,
    minHeight: '80px',
    padding: '1rem 1.25rem',
    fontFamily: 'monospace',
    fontSize: '0.95em',
  };

  const emptyStyle = {
    ...outputStyle,
    display: 'flex',
    alignItems: 'center',
    opacity: 0.5,
  };

  return (
    <>
      <div className="split-view-container">
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="numbers-to-letters-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="text" className="input-label">
                {t('textToReverse')}
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="number-input"
                placeholder={t('textPlaceholder')}
                rows={6}
                style={{
                  resize: 'vertical',
                  minHeight: '160px',
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              />
            </div>

            <div className="action-buttons" style={{ marginTop: '0.5rem' }}>
              <button onClick={handleReset} className="btn btn-secondary" style={{ minHeight: '44px', minWidth: '44px' }}>
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        <div className="result-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div className="input-card" style={{ marginBottom: '1rem' }}>
            <label className="input-label">{t('reverseTextLabel')}</label>
            {reverseText ? (
              <div className="number-input" style={{ ...outputStyle, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ flex: 1, minWidth: 0 }}>{reverseText}</span>
                  <CopyButton text={reverseText} />
                </div>
              </div>
            ) : (
              <div className="number-input" style={emptyStyle}>
                <span style={{ color: 'var(--text-secondary)' }}>{t('textPlaceholder')}</span>
              </div>
            )}
          </div>

          <div className="input-card" style={{ marginBottom: '1rem' }}>
            <label className="input-label">{t('reverseWordingLabel')}</label>
            {reverseWording ? (
              <div className="number-input" style={{ ...outputStyle, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ flex: 1, minWidth: 0 }}>{reverseWording}</span>
                  <CopyButton text={reverseWording} />
                </div>
              </div>
            ) : (
              <div className="number-input" style={emptyStyle}>
                <span style={{ color: 'var(--text-secondary)' }}>{t('textPlaceholder')}</span>
              </div>
            )}
          </div>

          <div className="input-card">
            <label className="input-label">{t('reverseLettersLabel')}</label>
            {reverseLetters ? (
              <div className="number-input" style={{ ...outputStyle, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ flex: 1, minWidth: 0 }}>{reverseLetters}</span>
                  <CopyButton text={reverseLetters} />
                </div>
              </div>
            ) : (
              <div className="number-input" style={emptyStyle}>
                <span style={{ color: 'var(--text-secondary)' }}>{t('textPlaceholder')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
