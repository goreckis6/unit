'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

type TextOrder = 'normal' | 'reversed';

// Unicode mappings for upside-down characters
const upsideDownMap: Record<string, string> = {
  'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ',
  'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd',
  'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x',
  'y': 'ʎ', 'z': 'z',
  'A': '∀', 'B': 'ᗺ', 'C': 'Ɔ', 'D': 'ᗡ', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': 'פ', 'H': 'H',
  'I': 'I', 'J': 'ſ', 'K': 'ʞ', 'L': '˥', 'M': 'W', 'N': 'N', 'O': 'O', 'P': 'Ԁ',
  'Q': 'Q', 'R': 'ᴿ', 'S': 'S', 'T': '┴', 'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X',
  'Y': '⅄', 'Z': 'Z',
  '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
  '.': '˙', ',': '\'', '?': '¿', '!': '¡', "'": ',', '"': ',,', ';': '؛', ':': ':',
  '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<',
  '/': '\\', '\\': '/', '_': '‾', '-': '-', '=': '=', '+': '+', '*': '*', '&': '⅋', '%': '%'
};

function convertToUpsideDown(text: string, order: TextOrder): string {
  if (!text) return '';
  
  // Convert each character to upside-down
  const converted = text
    .split('')
    .map(char => upsideDownMap[char] || char)
    .join('');
  
  // Reverse the order if needed
  if (order === 'reversed') {
    return converted.split('').reverse().join('');
  }
  
  return converted;
}

export function UpsideDownTextGenerator() {
  const t = useTranslations('calculators.upsideDownText');
  const [text, setText] = useState<string>('');
  const [order, setOrder] = useState<TextOrder>('normal');
  const [result, setResult] = useState<string>('');

  // Auto-convert when text or order changes
  useEffect(() => {
    if (text) {
      const converted = convertToUpsideDown(text, order);
      setResult(converted);
    } else {
      setResult('');
    }
  }, [text, order]);

  const handleReset = () => {
    setText('');
    setOrder('normal');
    setResult('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
  };

  return (
    <>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '2rem',
        alignItems: 'start'
      }}
      className="split-view-container"
      >
        {/* Left Column - Input */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card">
              <label htmlFor="text" className="input-label">
                {t('textInput')}
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
                  whiteSpace: 'pre-wrap'
                }}
              />
            </div>

            <div className="input-card">
              <label htmlFor="order" className="input-label" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                {t('textOrder')}
              </label>
              <select
                id="order"
                value={order}
                onChange={(e) => setOrder(e.target.value as TextOrder)}
                className="number-input"
                style={{ padding: '0.75rem', fontSize: '0.875rem' }}
              >
                <option value="normal">{t('orderNormal')}</option>
                <option value="reversed">{t('orderReversed')}</option>
              </select>
            </div>

            <div className="action-buttons" style={{ marginTop: '0.5rem' }}>
              <button onClick={handleReset} className="btn btn-secondary">
                {t('reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Output */}
        <div className="result-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div className="input-card">
            <label className="input-label">
              {t('result')}
            </label>
            {result ? (
              <div className="number-input" style={{ 
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap', 
                minHeight: '200px',
                resize: 'vertical',
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '1.2em',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }} onClick={handleCopy}>
                <span style={{ wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{result}</span>
                <button onClick={(e) => { e.stopPropagation(); handleCopy(); }} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                  {t('copy')}
                </button>
              </div>
            ) : (
              <div className="number-input" style={{ 
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap', 
                minHeight: '200px',
                resize: 'vertical',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontFamily: 'monospace',
                fontSize: '1.2em',
                padding: '1.25rem',
                opacity: 0.5
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {t('textPlaceholder')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
