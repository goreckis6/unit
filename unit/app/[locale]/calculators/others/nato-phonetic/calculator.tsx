'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/CopyButton';

type TranslationDirection = 'text-to-nato' | 'nato-to-text';

// NATO Phonetic Alphabet mapping
const natoAlphabet: Record<string, string> = {
  'A': 'Alfa', 'B': 'Bravo', 'C': 'Charlie', 'D': 'Delta', 'E': 'Echo',
  'F': 'Foxtrot', 'G': 'Golf', 'H': 'Hotel', 'I': 'India', 'J': 'Juliett',
  'K': 'Kilo', 'L': 'Lima', 'M': 'Mike', 'N': 'November', 'O': 'Oscar',
  'P': 'Papa', 'Q': 'Quebec', 'R': 'Romeo', 'S': 'Sierra', 'T': 'Tango',
  'U': 'Uniform', 'V': 'Victor', 'W': 'Whiskey', 'X': 'X-ray', 'Y': 'Yankee',
  'Z': 'Zulu',
  'a': 'Alfa', 'b': 'Bravo', 'c': 'Charlie', 'd': 'Delta', 'e': 'Echo',
  'f': 'Foxtrot', 'g': 'Golf', 'h': 'Hotel', 'i': 'India', 'j': 'Juliett',
  'k': 'Kilo', 'l': 'Lima', 'm': 'Mike', 'n': 'November', 'o': 'Oscar',
  'p': 'Papa', 'q': 'Quebec', 'r': 'Romeo', 's': 'Sierra', 't': 'Tango',
  'u': 'Uniform', 'v': 'Victor', 'w': 'Whiskey', 'x': 'X-ray', 'y': 'Yankee',
  'z': 'Zulu'
};

// Reverse mapping: NATO word to letter
const natoToLetter: Record<string, string> = {
  'alfa': 'A', 'bravo': 'B', 'charlie': 'C', 'delta': 'D', 'echo': 'E',
  'foxtrot': 'F', 'golf': 'G', 'hotel': 'H', 'india': 'I', 'juliett': 'J',
  'kilo': 'K', 'lima': 'L', 'mike': 'M', 'november': 'N', 'oscar': 'O',
  'papa': 'P', 'quebec': 'Q', 'romeo': 'R', 'sierra': 'S', 'tango': 'T',
  'uniform': 'U', 'victor': 'V', 'whiskey': 'W', 'x-ray': 'X', 'yankee': 'Y',
  'zulu': 'Z'
};

function textToNato(text: string): string {
  if (!text) return '';
  
  return text
    .split('')
    .map(char => {
      if (natoAlphabet[char]) {
        return natoAlphabet[char];
      }
      return char; // Keep spaces, numbers, punctuation as-is
    })
    .join(' ');
}

function natoToText(nato: string): string {
  if (!nato) return '';
  
  // Split by spaces and convert each NATO word to letter
  const words = nato.trim().split(/\s+/);
  
  return words
    .map(word => {
      const normalized = word.toLowerCase();
      if (natoToLetter[normalized]) {
        return natoToLetter[normalized];
      }
      // If not a NATO word, keep it as-is (for spaces, punctuation, etc.)
      return word;
    })
    .join('');
}

export function NatoPhoneticCalculator() {
  const t = useTranslations('calculators.natoPhonetic');
  const [direction, setDirection] = useState<TranslationDirection>('text-to-nato');
  const [text, setText] = useState<string>('');
  const [result, setResult] = useState<string>('');

  // Auto-convert when text or direction changes
  useEffect(() => {
    if (text) {
      if (direction === 'text-to-nato') {
        const nato = textToNato(text);
        setResult(nato);
      } else {
        const converted = natoToText(text);
        setResult(converted);
      }
    } else {
      setResult('');
    }
  }, [text, direction]);

  const handleReset = () => {
    setText('');
    setResult('');
  };

  return (
    <>
      <div className="split-view-container">
        {/* Left Column - Input */}
        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="numbers-to-letters-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-card numbers-to-letters-compact">
              <label htmlFor="direction" className="input-label">
                {t('directionLabel')}
              </label>
              <select
                id="direction"
                value={direction}
                onChange={(e) => setDirection(e.target.value as TranslationDirection)}
                className="number-input select-dropdown"
                style={{ cursor: 'pointer' }}
              >
                <option value="text-to-nato">{t('textToNato')}</option>
                <option value="nato-to-text">{t('natoToText')}</option>
              </select>
            </div>

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

            <div className="action-buttons" style={{ marginTop: '0.5rem' }}>
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
              {t('natoOutput')}
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
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontSize: '1.5em',
                fontWeight: '500',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                letterSpacing: '0.05em',
                lineHeight: '1.6'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ flex: 1, minWidth: 0, color: 'var(--text-primary)' }}>{result}</span>
                  <CopyButton text={result} className="btn btn-primary" />
                </div>
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
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontSize: '1.1em',
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
