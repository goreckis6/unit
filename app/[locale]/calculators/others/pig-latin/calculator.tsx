'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U']);

function toPigLatin(text: string): string {
  if (!text.trim()) return '';
  return text
    .split(/(\s+)/)
    .map((token) => {
      if (!/^[a-zA-Z]+$/.test(token)) return token; // keep non-words as-is (spaces, numbers, punctuation)
      if (token.length === 0) return token;
      const lower = token.toLowerCase();
      let firstVowelIndex = -1;
      for (let i = 0; i < lower.length; i++) {
        if (VOWELS.has(lower[i])) {
          firstVowelIndex = i;
          break;
        }
      }
      let result: string;
      if (firstVowelIndex <= 0) {
        result = lower + 'way';
      } else {
        const cluster = lower.slice(0, firstVowelIndex);
        const rest = lower.slice(firstVowelIndex);
        result = rest + cluster + 'ay';
      }
      // Preserve original case: all caps -> all caps, title -> title, else lower
      if (token === token.toUpperCase()) return result.toUpperCase();
      if (token[0] === token[0].toUpperCase()) return result.charAt(0).toUpperCase() + result.slice(1);
      return result;
    })
    .join('');
}

export function PigLatinCalculator() {
  const t = useTranslations('calculators.pigLatin');
  const [text, setText] = useState<string>('');
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    if (text.trim()) {
      setResult(toPigLatin(text));
    } else {
      setResult('');
    }
  }, [text]);

  const handleReset = () => {
    setText('');
    setResult('');
  };

  return (
    <>
      <div className="split-view-container">
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="numbers-to-letters-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="pig-latin-text" className="input-label">
                {t('textInput')}
              </label>
              <textarea
                id="pig-latin-text"
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
          <div className="input-card">
            <label className="input-label">{t('resultLabel')}</label>
            {result ? (
              <div
                className="number-input"
                style={{
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                  minHeight: '160px',
                  padding: '1.25rem',
                }}
              >
                {result}
              </div>
            ) : (
              <div
                className="number-input"
                style={{
                  minHeight: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.25rem',
                  opacity: 0.5,
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>{t('resultPlaceholder')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
